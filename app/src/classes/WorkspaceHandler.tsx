// WorkspaceHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*

    methods in this class:

    // utilities
    clearChanged
    setSelection
    getWorkspaceList *
    resetWorkspace *

    // data operations
    setupWorkpace *
    createWorkspace
    loadWorkspace *
    reloadWorkspace
    renameWorkspace
    saveWorkspace *
    saveWorkspaceAs *
    deleteWorkspace

*/

import { 
    doc, collection, 
    query, where, getDocs, // orderBy, 
    getDoc, // deleteDoc, setDoc, updateDoc
    updateDoc,
    increment, // serverTimestamp,
    runTransaction,
    writeBatch,
    serverTimestamp,
} from 'firebase/firestore'

import { updateDocumentSchema } from '../system/utilities'

import { isMobile } from '../index'

class WorkspaceHandler {

    constructor(db, errorControl) {
        this.db = db
        this.errorControl = errorControl
    }

    // database
    db
    errorControl
    userID
    userName
    usage
    trigger

    // data
    setWorkspaceHandler = null
    workspaceSelection = {id:null, name:null}
    workspaceRecord = null
    panelRecords = new Map()
    settings = {mode:'automatic', changed: false}
    changedRecords = {
        setworkspace:null,
        setwindowpositions: new Set(),
        setpanels: new Set(),
        deletepanels: new Set()
    }
    flags = {
        new_workspace:true
    }

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
        this.workspaceSelection.id = id,
        this.workspaceSelection.name = name
        const updateData = 
            isMobile
                ? {
                    'workspace.mobile.id':id,
                    'workspace.mobile.name':name,
                }
                : {
                    'workspace.desktop.id':id,
                    'workspace.desktop.name':name,                    
                }
        try {

            await updateDoc(doc(collection(this.db,'users'),this.userID),updateData)

        } catch (error) {

            console.log('signout error from standard toolbar', error)
            this.errorControl.push({description:'signout error from standard toolbar', error})
            return false

        }
        
        return true
    }

    // ---------------------[ createWorkspace ]--------------------------

    async createWorkspace(name) {

        const result = {
            error: false,
            success: true,
            description: null,
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
                        device: {
                            name:isMobile?'mobile':'desktop',
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
            const batch = writeBatch(this.db)
            batch.set(newWorkspaceDocRef, newWorkspaceRecord)
            batch.update(doc(collection(this.db,'users'),this.userID),{'profile.counts.workspaces':increment(1)})
            await batch.commit()
        } catch (error) {
            console.log('error creating new workspace record (or updating count) from standard toolbar', error)
            this.errorControl.push({description:'error creating new workspace record (or updating count) from standard toolbar', error})
            result.error = false
            return result
        }
        this.usage.write(1)
        this.usage.create(1)

        // ---- create NEW workspace ----
        this.workspaceSelection.name = name
        this.workspaceSelection.id = newWorkspaceDocRef.id

        return result

    }

    // ---------------------[ reloadWorkspace ]--------------------------

    async reloadWorkspace() {

        const result = {
            error: false,
            success: true,
            description: null,
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
                dbuserDocRef = doc(this.db,'users',this.userID),
                updateData = 
                    isMobile
                        ? {
                            'workspace.mobile.id':workspaceID,
                            'workspace.mobile.name':workspaceName,
                          }
                        : {
                            'workspace.desktop.id':workspaceID,
                            'workspace.desktop.name':workspaceName,
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
            this.flags.new_workspace = true
            return result

        } else {
            result.success = false
            result.description = 'this workspace record no longer exists'
            return result
        }

    }

    // ---------------------[ renameWorkspace ]--------------------------

    async renameWorkspace(name, userRecord) {

        const result = {
            error: false,
            success: true,
            description: null,
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

    // ---------------------[ deleteWorkspace ]--------------------------

    async deleteWorkspace() {

        const result = {
            error: false,
            success: true,
            description: null,
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
            result.description = 'workspace not found, so not deleted'
            this.usage.read(panelCount + 1)
            // setDeleteDialogState(false)
            return result
        }
        // TODO check for panel sub-docs in case there was a concurrency issue

        this.usage.read(panelCount + 1)
        this.usage.delete(panelCount + 1)
        this.usage.write(1)

        // set current workspace to default
        // ---- set NEW workspace ----
        await this.setSelection(
            defaultWorkspace.profile.workspace.id,
            defaultWorkspace.profile.workspace.name
        )
        result.description = `deleted [${previousWorkspaceName}] and replaced it with [${defaultWorkspaceName}]`
        return result

    }

}

export default WorkspaceHandler