// WorkspaceHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    TODO
    - update generation count
    - updated_by

    - track and update counts
    - implement automatic vs manual mode
    - maintain list of panel IDs in workspaces
    - guarantee database integrity
*/

/*

    methods in this class:

    // utilities
    clearChanged
    setSelection
    getWorkspaceList
    resetWorkspace *

    // database operations
    setupWorkpace
    createWorkspace
    loadWorkspace
    reloadWorkspace
    renameWorkspace
    saveWorkspace
    saveWorkspaceAs *
    deleteWorkspace

    // panels facade
    loadPanels *

*/

import { 
    doc, collection, 
    getDoc, setDoc, updateDoc, // deleteDoc
    query, where, orderBy, getDocs,
    arrayUnion, arrayRemove,
    increment, serverTimestamp,
    runTransaction, writeBatch,
} from 'firebase/firestore'

import { updateDocumentSchema } from '../system/utilities'

import { isMobile } from '../index'

class WorkspaceHandler {

    constructor(db, errorControl) {
        this.db = db
        this.errorControl = errorControl
    }

    // =========================[ DATA ]=======================

    // controls
    db
    errorControl
    // initialized in WorkboxesProvider
    userID
    userName
    usage
    trigger

    // workspace data
    setWorkspaceHandler = null // initialized in WorkboxesProvider
    workspaceSelection = {id:null, name:null}
    workspaceRecord = null
    panelRecords = new Map()
    settings = {mode:'automatic', changed: false}
    changedRecords = {
        setworkspace:null,
        setwindowpositions: new Set(),
        setpanels: new Set(),
        deletepanels: new Set(),
    }
    flags = {
        new_workspace_load:true
    }

    // =========================[ UTILITIES ]========================

    // ---------------------[ clearChanged ]--------------------------

    clearChanged = () => {
        this.settings.changed = false
        this.changedRecords.setworkspace = null
        this.changedRecords.setpanels.clear()
        this.changedRecords.deletepanels.clear()
        this.changedRecords.setwindowpositions.clear()
    }

    // ---------------------[ setSelection ]--------------------------

    async setSelection (id, name) {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        this.workspaceSelection.id = id,
        this.workspaceSelection.name = name
        const updateData = 
                {
                    generation:increment(1),
                    'profile.commits.updated_by':{id:this.userID, name:this.userName},
                    'profile.commits.updated_timestamp':serverTimestamp(),
                }
        const prop = isMobile 
                ? 'workspace.mobile'
                :'workspace.desktop'

        updateData[prop] = {id,name}

        try {

            await updateDoc(doc(collection(this.db,'users'),this.userID),updateData)

        } catch (error) {

            console.log('error updating selection in user record', error)
            this.errorControl.push({description:'error updating selection in user record', error})
            result.error = true
            return result

        }

        this.usage.write(1)
        
        return result
    }

    // ---------------------[ getWorkspaceList ]--------------------------

    async getWorkspaceList() { // fetches the basic workspace profile (id, name)

        const result = {
            error: false,
            success: true,
            notice: null,
            payload: null,
        }

        const workspaceList = []
        const q = query(collection(this.db, 'users', this.userID, 'workspaces'), orderBy('profile.workspace.name'))
        let querySnapshot
        try {
            querySnapshot = await getDocs(q)
        } catch (error) {
            console.log('error getting workspace list on standard toolbar', error)
            this.errorControl.push({description:'error getting workspace list on standard toolbar', error})
            result.error = true
            return result
        }
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            workspaceList.push(data.profile.workspace)
        })
        this.usage.read(querySnapshot.size)
        result.payload = workspaceList
        return result

    }

    // =============================[ DATABASE OPERATIONS ]===========================

    // ---------------------[ setupWorkspace ]--------------------------

    async setupWorkspace(userRecord) { // userRecord passed to get current workspace selection

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        let workspaceSelectionRecord

        // --------------[ 1. try to get workspaceID from most recent usage ]-----------
        let workspaceID, workspaceIDtype, workspaceDoc
        const 
            userWorkspaceData = userRecord.workspace,
            mobileID = userWorkspaceData.mobile.id,
            desktopID = userWorkspaceData.desktop.id,
            workspaceCollection = collection(this.db,'users',this.userID,'workspaces')

        workspaceID = 
            isMobile
                ? mobileID || desktopID
                : desktopID || mobileID

        workspaceIDtype = 
            !workspaceID // neither mobile nor desktop workspaceID was found
                ? isMobile
                    ? 'mobile'
                    : 'desktop'
                : mobileID === workspaceID
                    ? 'mobile'
                    : 'desktop'

        // ----------------[ 2. verify found workspaceID existence, and load if found ]---------------
        if (workspaceID) { 

            const workspaceDocRef = doc(workspaceCollection,workspaceID)

            try {

                workspaceDoc = await getDoc(workspaceDocRef)

                if (!workspaceDoc.exists()) {
                    workspaceID = null
                } else {
                    workspaceSelectionRecord = workspaceDoc.data()
                    result.notice = `loaded workspace last used on ${workspaceIDtype}`
                }

            } catch (error) {

                console.log('error getting starting workspace data in Main', error)
                this.errorControl.push({description:'error getting starting workspace data in Main', error})
                result.error = true
                return result
            }
            this.usage.read(1)

        }

        // ---------------------[ 3. but if no previous workspace specified, or not found ]---------------
        // look for other existing workspace - default, or (as the last resort) first found
        if (!workspaceID) { 
            const workspaceDocs = []
            const q = query(workspaceCollection)
            try {

                const dbDocs = await getDocs(q)
                let found_default = false
                if (dbDocs.size) { // at least one found
                    this.usage.read(dbDocs.size)
                    const docs = dbDocs.docs
                    // collect data, and look for default
                    for (let index = 0; index < dbDocs.size; index++) {
                        const dbdoc = docs[index]
                        const data = dbdoc.data()
                        workspaceDocs.push(data)
                        if (data.profile.flags.is_default) {
                            found_default = true
                            workspaceID = data.profile.workspace.id
                            workspaceSelectionRecord = data
                            break
                        }
                    }
                    if (!workspaceID) { // grab the first item, set it to default (edge case)
    
                        workspaceSelectionRecord = workspaceDocs[0]
                        workspaceID = workspaceSelectionRecord.profile.workspace.id
                        workspaceSelectionRecord.profile.flags.is_default = true
                        result.notice = 'default not found; loaded first found workspace, and set it to default'

                    } else {

                        result.notice = 'loaded default workspace'

                    }
                    // update version, or default flag
                    const updatedWorkspaceRecord = updateDocumentSchema('workspaces','standard',workspaceSelectionRecord)

                    if ((!Object.is(workspaceSelectionRecord, updatedWorkspaceRecord)) || !found_default) {
                        try {

                            updatedWorkspaceRecord.profile.commits.updated_by = {id:this.userID, name:this.userName}

                            updatedWorkspaceRecord.generation = increment(1)
                            updatedWorkspaceRecord.profile.commits.updted_timestamp = serverTimestamp()

                            const workspaceDocRef = doc(collection(this.db,'users',this.userID,'workspaces'),workspaceID)
                            
                            await setDoc(workspaceDocRef, updatedWorkspaceRecord)
                            const newDoc = await getDoc(workspaceDocRef) // get updated increment and timestamp

                            workspaceSelectionRecord = newDoc.data()

                        } catch (error) {

                            console.log('error updating workspace version in Main', error)
                            this.errorControl.push({description:'error updating workspace versoin in Main', error})
                            result.error = true
                            return result

                        }
                        this.usage.write(1)
                        this.usage.read(1)
                    }

                    // update user record with new workspaceID
                    const name = workspaceSelectionRecord.profile.workspace.name
                    const prop = 
                        isMobile
                            ? 'workspace.mobile'
                            : 'workspace.desktop'

                    const userUpdateData = 
                            {
                                generation:increment(1),
                                'profile.commits.updated_by':{id:this.userID, name:this.userName},
                                'profile.commits.updated_timestamp':serverTimestamp()
                            }

                    userUpdateData[prop] = {id:workspaceID,name}

                    try {

                        await updateDoc(doc(collection(this.db,'users'),this.userID),userUpdateData)

                    } catch (error) {

                        console.log('error updating workspace count for user in Main', error)
                        this.errorControl.push({description:'error updating workspace count for user in Main', error})
                        result.error = true
                        return result

                    }
                    this.usage.write(1)

                } else {

                    this.usage.read(1) // for fail

                }

            } catch(error) {

                console.log('error getting workspace list in Main', error)
                this.errorControl.push({description:'error getting workspace list in Main', error})
                result.error = true
                return result

            }
        }

        // ---------------------[ 4. if no workspaces exist, create first workspace record ]---------------
        if (!workspaceID) { 

            const 
                workspaceDocRef = doc(collection(this.db,'users',this.userID,'workspaces')),
                workspaceRecord = updateDocumentSchema('workspaces','standard',{},{
                    profile: {
                        workspace:{
                            name: 'Main workspace (default)',
                            id: workspaceDocRef.id,
                        },
                        owner: {
                            id: this.userID,
                            name: this.userName,
                        },
                        commits: {
                            created_by: {
                                id: this.userID, 
                                name: this.userName
                            },
                            created_timestamp: serverTimestamp(),
                            updated_by: {
                                id: this.userID, 
                                name: this.userName
                            },
                            updated_timestamp: serverTimestamp(),
                        },
                        flags: {
                            is_default: true,
                        }
                    }
                })

            try {
                const batch = writeBatch(this.db)
                batch.set(workspaceDocRef,workspaceRecord)

                const prop = 
                    isMobile
                        ? 'workspace.mobile'
                        : 'workspace.desktop'

                const userUpdateData = 
                        {
                            generation:increment(1),
                            'profile.commits.updated_by':{id:this.userID, name:this.userName},
                            'profile.commits.updated_timestamp':serverTimestamp(),
                            'profile.counts.workspaces': increment(1)
                        }

                userUpdateData[prop] = {id:workspaceID,name:'Main workspace (default)'}

                batch.update(doc(collection(this.db,'users'),this.userID),userUpdateData)
                
                await batch.commit()
                const newDoc = await getDoc(workspaceDocRef)
                workspaceSelectionRecord = newDoc.data()

            } catch (error) {

                console.log('error saving new workspace data', error)
                this.errorControl.push({description:'error saving new workspace data in Main', error})
                result.error = true
                return result
            }
            this.usage.create(1)
            this.usage.write(1)
            this.usage.read(1)
            
            result.notice = 'created new workspace'

        }

        // ------------[ 5. by this time a workspaceSelectionRecord is guaranteed ]-------------

        // ---- DISTRIBUTE first workspace record ----
        const {id, name} = workspaceSelectionRecord.profile.workspace
        
        this.workspaceSelection.id = id,
        this.workspaceSelection.name = name        
        this.workspaceRecord = workspaceSelectionRecord
        this.flags.new_workspace_load = true
 
        return result

    }

    // ---------------------[ createWorkspace ]--------------------------

    async createWorkspace(name) {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        const 
            userDocRef = doc(collection(this.db, 'users'), this.userID),
            newWorkspaceDocRef = doc(collection(this.db, 'users',this.userID, 'workspaces')),
            newWorkspaceRecord = updateDocumentSchema('workspaces','standard',{},{
                    profile: {
                        workspace:{
                            name: name,
                            id: newWorkspaceDocRef.id,
                        },
                        owner: {
                            id: this.userID,
                            name: this.userName,
                        },
                        commits: {
                            created_by: {
                                id: this.userID,
                                name: this.userName,
                            },
                            created_timestamp: serverTimestamp(),
                            updated_by: {
                                id: this.userID,
                                name: this.userName,
                            },
                            updated_timestamp: serverTimestamp(),
                        },
                    }
                })
        try {
            const prop = 
                isMobile
                    ? 'workspace.mobile'
                    : 'workspace.desktop'

            const userUpdateData = 
                    {
                        generation:increment(1),
                        'profile.commits.updated_by':{id:this.userID, name:this.userName},
                        'profile.commits.updated_timestamp':serverTimestamp(),
                        'profile.counts.workspaces': increment(1)
                    }

            userUpdateData[prop] = {id:newWorkspaceDocRef.id,name}

            const batch = writeBatch(this.db)
            batch.set(newWorkspaceDocRef, newWorkspaceRecord)
            batch.update(userDocRef,userUpdateData)
            await batch.commit()
        } catch (error) {
            console.log('error creating new workspace record (or updating count) from standard toolbar', error)
            this.errorControl.push({description:'error creating new workspace record (or updating count) from standard toolbar', error})
            result.error = false
            return result
        }
        this.usage.write(1)
        this.usage.create(1)

        this.workspaceSelection.name = name
        this.workspaceSelection.id = newWorkspaceDocRef.id

        return result

    }

    // ---------------------[ loadWorkspace ]--------------------------

    async loadWorkspace(workspaceID, userRecord) {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        const 
            dbWorkspaceRecordRef = doc(collection(this.db,'users',this.userID,'workspaces'),workspaceID)

        let dbdoc 
        try {

            dbdoc = await getDoc(dbWorkspaceRecordRef)

        } catch (error) {

            console.log('error getting new workspace data', error)
            this.errorControl.push({description:'error getting new workspace data in Main', error})
            result.error = true
            return result
        }
        this.usage.read(1)
        if (!dbdoc.exists()) {
            result.notice = 'requested workspace record does not exist. Reloading...'
            const setupResult = await this.setupWorkspace(userRecord)
            if (setupResult.error) result.error = true // TODO there could be multiple notices here
            return result
        }
        const
            workspaceData = dbdoc.data(),
            workspaceName = workspaceData.profile.workspace.name

        const prop = 
            isMobile
                ? 'workspace.mobile'
                : 'workspace.desktop'

        const userUpdateData = 
                {
                    generation:increment(1),
                    'profile.commits.updated_by':{id:this.userID, name:this.userName},
                    'profile.commits.updated_timestamp':serverTimestamp(),
                }

            userUpdateData[prop] = {id:workspaceID,name}

        try {
            await updateDoc(doc(collection(this.db,'users'),this.userID),userUpdateData)
        } catch (error) {
            console.log('error in update user doc for workspace', error)
            this.errorControl.push({description:'error in update user doc for workspace in Main', error})
            result.error = true
            return result
        }
        this.usage.write(1)

        // ---- DISTRIBUTE loaded workspace record ----
        this.workspaceRecord = workspaceData
        this.clearChanged()
        this.flags.new_workspace_load = true

        return result

    }

    // ---------------------[ reloadWorkspace ]--------------------------

    async reloadWorkspace() {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        const 
            dbcollection = collection(this.db, 'users', this.userID,'workspaces'),
            workspaceID = this.workspaceRecord.profile.workspace.id,
            dbdocRef = doc(dbcollection,workspaceID)

        let dbdoc
        try {
            dbdoc = await getDoc(dbdocRef)
        } catch(error) {
            result.error = true
            console.log('error in reload workspace', error)
            this.errorControl.push({description:'error in reload workspace', error})
            return result
        }
        this.usage.read(1)
        if (dbdoc.exists()) {
            const 
                workspaceData = dbdoc.data(),
                workspaceName = workspaceData.profile.workspace.name,
                dbuserDocRef = doc(collection(this.db,'users'),this.userID),
                updateData = 
                    isMobile
                        ? {
                            'workspace.mobile':{id:workspaceID,name:workspaceName},
                            generation: increment(1),
                          }
                        : {
                            'workspace.desktop':{id:workspaceID,name:workspaceName},
                            generation: increment(1),
                          }

            try {
                await updateDoc(dbuserDocRef,updateData)
            } catch(error) {
                result.error = true
                console.log('error in update user workspace after reload', error)
                this.errorControl.push({description:'error in update user workspace after reload', error})
                return result
            }
            this.usage.write(1)

            // ---- set RELOAD workspace data ----
            this.workspaceRecord = workspaceData
            this.workspaceSelection.id = workspaceID
            this.workspaceSelection.name = workspaceName
            this.clearChanged()
            this.flags.new_workspace_load = true
            return result

        } else {
            result.success = false
            result.notice = 'this workspace record no longer exists'
            return result
        }

    }

    // ---------------------[ renameWorkspace ]--------------------------

    async renameWorkspace(name, userRecord) {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        if (this.settings.mode == 'automatic') {
            // changename user workspace data
            const 
                userDocRef = doc(collection(this.db, 'users'), this.userID),
                workspaceID = this.workspaceSelection.id,
                workspaceDocRef = doc(collection(this.db, 'users',this.userID, 'workspaces'), workspaceID),
                updateBlock = {}

            let fieldsToUpdateCount = 0

            if (workspaceID == userRecord.workspace.mobile.id) {
                updateBlock['workspace.mobile.name'] = name
                fieldsToUpdateCount++
            }
            if (workspaceID == userRecord.workspace.desktop.id) {
                updateBlock['workspace.desktop.name'] = name
                fieldsToUpdateCount++
            }
            try {
                const batch = writeBatch(this.db)

                if (fieldsToUpdateCount) {
                    batch.update(userDocRef,updateBlock)
                }

                batch.update(workspaceDocRef, {
                    'profile.workspace.name':name
                })

                await batch.commit()

            } catch (error) {
                console.log('error updating workspace name from standard toolbar', error)
                this.errorControl.push({description:'error updating workspace name from standard toolbar', error})
                result.error = true
                // navigate('/error')   
                return result
            }
            this.usage.write(fieldsToUpdateCount?2:1)
        }

        // changename workspaceHandler
        // ---- UPDATE workspace name ----
        if (this.settings.mode == 'manual') {
            if (!this.settings.changed) {
                this.settings.changed = true
            }
            if (!this.changedRecords.setworkspace) {
                this.changedRecords.setworkspace = this.workspaceSelection.id
            }
        }
        this.workspaceSelection.name = name
        this.workspaceRecord.profile.workspace.name = name

        return result

    }

    // ---------------------[ saveWorkspace ]--------------------------

    async saveWorkspace() {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        if (!this.settings.changed && !this.changedRecords.setworkspace) return

        const workspaceRecord = this.workspaceRecord
        const dbcollection = collection(this.db, 'users', this.userID, 'workspaces')
        const docRef = doc(dbcollection, workspaceRecord.profile.workspace.id)
        try {
            workspaceRecord.generation += 1
            await setDoc(docRef,workspaceRecord)
        } catch (error) {
            console.log('error saving workspace record', error)
            this.errorControl.push({description:'error saving workspace record', error})
            result.error = true
            return result
        }

        this.usage.write(1)

        // ---- SAVE workspace config ----
        this.clearChanged()

        return result

    }

    // ---------------------[ deleteWorkspace ]--------------------------

    async deleteWorkspace() {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        // get default workspace
        const 
            dbWorkspaceCollection = collection(this.db,'users',this.userID, 'workspaces'),
            dbWorkspaceQuery = query(dbWorkspaceCollection, where('profile.flags.is_default','==',true))

        let dbDefaultWorkspace
        try {
            dbDefaultWorkspace = await getDocs(dbWorkspaceQuery)
        } catch (error) {
            result.error = true
            console.log('error fetching user workspace collection')
            this.errorControl.push({description:'error fetching user workspace collection from standard toolbar', error:'N/A'})
            // navigate('/error')
            return result
        }
        this.usage.read(1)
        let dbDefaultDoc, defaultWorkspace
        if (dbDefaultWorkspace.size == 1) {
            dbDefaultDoc = dbDefaultWorkspace.docs[0]
            defaultWorkspace = dbDefaultDoc.data()
        } else {
            // TODO should try to recover from this
            result.error = true
            console.log('error fetching default workspace for delete workspace')
            this.errorControl.push({description:'error no default workspace record found to deleted workspace from standard toolbar', error:'N/A'})
            return result
        }

        const 
            previousWorkspaceName = this.workspaceSelection.name,
            defaultWorkspaceName = defaultWorkspace.profile.workspace.name

        // delete current workspace
        let panelCount, transactionResult
        try {
            const
                workspaceID = this.workspaceSelection.id,
                dbWorkspacePanelCollection = 
                    collection(this.db,'users',this.userID, 'workspaces',workspaceID,'panels'),
                dbWorkspacePanelsQuery = query(dbWorkspacePanelCollection),
                dbPanelQueryResult = await getDocs(dbWorkspacePanelsQuery),
                dbPanelDocs = dbPanelQueryResult.docs

            panelCount = dbPanelQueryResult.size

            transactionResult = await runTransaction(this.db, async (transaction) => {

                const workspaceDocRef = doc(collection(this.db,'users',this.userID, 'workspaces'),workspaceID)
                const dbWorkspaceDoc = await transaction.get(workspaceDocRef)
                if (!dbWorkspaceDoc.exists()) return false

                for (const dbdoc of dbPanelDocs) {
                    transaction.delete(dbdoc.ref)
                }
                transaction.delete(workspaceDocRef)
                // update count
                transaction.update(doc(collection(this.db,'users'),this.userID),{'profile.counts.workspaces':increment(-1)})
                return true
            })

        } catch (error) {
            // TODO should try to recover from this
            result.error = true
            console.log('error deleting workspace or incrementing workspace count')
            this.errorControl.push({description:'error deleting workspace or incrementing workspace count from standard toolbar', error})
            return result
        }
        result.success = transactionResult
        if (!transactionResult) {
            result.notice = 'workspace not found, so not deleted'
            this.usage.read(panelCount + 1)
            // setDeleteDialogState(false)
            return result
        }
        // TODO check for panel sub-docs in case there was a concurrency issue

        this.usage.read(panelCount + 1)
        this.usage.delete(panelCount + 1)
        this.usage.write(1)

        // set current workspace to default
        const { id, name } = defaultWorkspace.profile.workspace
        // ---- set NEW workspace ----
        const selectionresult = await this.setSelection( id, name )
        if (selectionresult.error) {
            result.error = true
            return result
        } else {
            result.notice = `deleted [${previousWorkspaceName}] and replaced it with [${defaultWorkspaceName}]`
            return result
        }
    }

}

export default WorkspaceHandler
