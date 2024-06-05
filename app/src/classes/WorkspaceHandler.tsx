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

    - save before switch
    - take userName from most recent user setting (ie userRecord not auth.displayName)
    - try to consilidate some functionality
*/

/*

    methods in this class:

    // utilities
    clearChanged
    setWorkspaceSelection
    getWorkspaceList
    resetWorkspace *
    // database operations
    setupWorkpace
    createWorkspace
    loadWorkspace
    reloadWorkspace
    renameWorkspace
    updateWorkspacePanel
    saveWorkspaceData
    copyWorkspaceAs
    deleteWorkspace

    // panels facade
    loadPanels
    panelRename
    panelReset
    getPanelDomainContext
    duplicatePanelAs
    deletePanel

*/

import { 
    doc, collection, 
    getDoc, setDoc, updateDoc, // deleteDoc
    query, where, orderBy, getDocs,
    arrayUnion, arrayRemove,
    increment, serverTimestamp, Timestamp,
    runTransaction, writeBatch,
} from 'firebase/firestore'

import { cloneDeep as _cloneDeep } from 'lodash'

import PanelHandler from './PanelHandler'

import { updateDocumentSchema } from '../system/utilities'

import { isMobile } from '../index'

class WorkspaceHandler {

    constructor(db, errorControl) {
        this.db = db
        this.errorControl = errorControl
        this.panelHandler = new PanelHandler(this, db, errorControl)
    }

    // =========================[ DATA ]=======================

    // data controls
    db
    errorControl
    panelHandler

    // initialized in WorkboxesProvider through properties below
    private _userID
    private _userName
    private _usage

    trigger // dispatch trigger set by dispatchWorkspaceHandler

    // workspace data
    setWorkspaceHandlerState = null // initialized in WorkboxesProvider, used in useWorkspace

    workspaceSelection = {id:null, name:null}
    workspaceRecord = null
    panelSelectionIndex = null // attempt to set from workspace.profile.panel; cascading fallbacks
    // set on load of all panels
    panelCount = 0 
    panelRecordMap = new Map()
    panelRecords = []
    // set with getPanelDomainContext of toolbarWorkspace
    panelDomainRecord = null
    panelMemberRecord = null
    // maintained by toolbarWorkspace
    settings = {mode:'automatic', changed: false}
    // set by data operations - lists database IDs
    changedRecords = {
        setworkspace:null,
        setwindowpositions: new Set(), // list of panelIDs
        setpanels: new Set(),
        deletepanels: new Set(),
        userworkspace:false,
    }
    flags = {
        new_workspace_load:true // triggers load of panels
    }

    // properties to allow for distribution to panelHandler with consistent interface
    set userName(userName) {
        this._userName = userName
        this.panelHandler.userName = userName
    }
    get userName() {
        return this._userName
    }

    set userID(userID) {
        this._userID = userID
        this.panelHandler.userID = userID
    }
    get userID() {
        return this._userID        
    }

    set usage(usage) {
        this._usage = usage
        this.panelHandler.usage = usage
    }
    get usage() {
        return this._usage
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

    // ---------------------[ setWorkspyaceSelection ]--------------------------

    // sets the selection only in memor workspaceHandler, and db userRecors
    async setWorkspaceSelection (id, name) {

        // save before switch
        if (this.settings.mode == 'automatic' && this.settings.changed) {
            const result = await this.saveWorkspaceData()
            if (result.error) {
                return result
            }
        }

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        this.workspaceSelection.id = id,
        this.workspaceSelection.name = name

        if (this.settings.mode == 'manual') {
            this.changedRecords.userworkspace = true
            this.settings.changed = true
            return result
        }

        const updateData = 
                {
                    generation:increment(1),
                    'profile.commits.updated_by':{id:this.userID, name:this.userName},
                    'profile.commits.updated_timestamp':serverTimestamp(),
                }
        const prop = isMobile 
                ? 'workspace.mobile'
                : 'workspace.desktop'

        updateData[prop] = {name:name,id:id}

        try {

            await updateDoc(doc(collection(this.db,'users'),this.userID),updateData)

        } catch (error) {

            const errdesc = 'error updating selection in user record'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            result.error = true
            return result

        }

        this.usage.write(1)
        
        return result
    }

    // ---------------------[ getWorkspaceList ]--------------------------

    async getWorkspaceList() { // fetches the basic workspace profiles (id, name)

        const result = {
            error: false,
            success: true,
            notice: null,
            payload: null,
        }

        const workspaceList = []
        const dbQuerySpec = query(collection(this.db, 'users', this.userID, 'workspaces'), orderBy('profile.workspace.name'))
        let queryDocs
        try {
            queryDocs = await getDocs(dbQuerySpec)
        } catch (error) {
            const errdesc = 'error getting workspace list on standard toolbar'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            result.error = true
            return result
        }
        queryDocs.forEach((doc) => {
            const data = doc.data()
            workspaceList.push(data.profile.workspace) // selection, not record
        })
        this.usage.read(queryDocs.size)
        result.payload = workspaceList
        return result

    }

    async resetWorkspace() {

        const result = {
            error: false,
            success: true,
            notice: null,
        }


        result.notice = 'workspace has been reset'

        return result

    }

    // =============================[ WORKSPACE DATABASE OPERATIONS ]===========================

    // ---------------------[ setupWorkspace ]--------------------------

    // sets both the selection and the workspaceRecord
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
            userWorkspaceSelections = userRecord.workspace,
            mobileID = userWorkspaceSelections.mobile.id,
            desktopID = userWorkspaceSelections.desktop.id,
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
                : isMobile 
                    ? (mobileID === workspaceID)
                        ? 'mobile'
                        : 'desktop'
                    : (desktopID === workspaceID)
                        ?'desktop'
                        :'mobile'

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

                const errdesc = 'error getting starting workspace data in Main'
                console.log(errdesc, error)
                this.errorControl.push({description:errdesc, error})
                result.error = true
                return result
            }
            this.usage.read(1)

        }

        // ---------------------[ 3. but if no previous workspace specified, or not found ]---------------
        // look for other existing workspace - default, or (as the last resort) first found
        if (!workspaceID) { 
            const workspaceDocs = []
            const querySpec = query(workspaceCollection)
            try {

                const queryPayload = await getDocs(querySpec)
                let found_default = false
                if (queryPayload.size) { // at least one found
                    this.usage.read(queryPayload.size)
                    const dbDocs = queryPayload.docs
                    // collect data, and look for default
                    for (let index = 0; index < queryPayload.size; index++) {
                        const dbDoc = dbDocs[index]
                        const docRecord = dbDoc.data()
                        workspaceDocs.push(docRecord)
                        if (docRecord.profile.flags.is_default) {
                            found_default = true
                            workspaceID = docRecord.profile.workspace.id
                            workspaceSelectionRecord = docRecord
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

                            updatedWorkspaceRecord.generation = increment(1)
                            updatedWorkspaceRecord.profile.commits.updated_by = {id:this.userID, name:this.userName}
                            updatedWorkspaceRecord.profile.commits.updted_timestamp = serverTimestamp()

                            const workspaceDocRef = doc(collection(this.db,'users',this.userID,'workspaces'),workspaceID)
                            
                            await setDoc(workspaceDocRef, updatedWorkspaceRecord)
                            const newDoc = await getDoc(workspaceDocRef) // get updated increment and timestamp

                            workspaceSelectionRecord = newDoc.data()

                        } catch (error) {

                            const errdesc = 'error updating workspace version in Main'
                            console.log(errdesc, error)
                            this.errorControl.push({description:errdesc, error})
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

                        const errdesc = 'error updating workspace selection for user in Main'
                        console.log(errdesc, error)
                        this.errorControl.push({description:errdesc, error})
                        result.error = true
                        return result

                    }
                    this.usage.write(1)

                } else {

                    this.usage.read(1) // for fail

                }

            } catch(error) {

                const errdesc = 'error getting workspace list in Main'
                console.log(errdesc, error)
                this.errorControl.push({description:errdesc, error})
                result.error = true
                return result

            }
        }

        // ---------------------[ 4. if no workspaces exist, create first workspace record ]---------------
        if (!workspaceID) { 

            const 
                workspaceDocRef = doc(collection(this.db,'users',this.userID,'workspaces')),
                workspaceID = workspaceDocRef.id,
                workspaceRecord = updateDocumentSchema('workspaces','standard',{},{
                    profile: {
                        workspace:{
                            name: 'Main workspace (default)',
                            id: workspaceID,
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

                const errdesc = 'error saving new workspace data'
                console.log(errdesc, error)
                this.errorControl.push({description:errdesc, error})
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
        
        this.workspaceSelection = {id, name}
        this.workspaceRecord = workspaceSelectionRecord
        this.flags.new_workspace_load = true
 
        return result

    }

    // ---------------------[ createWorkspace ]--------------------------

    // TODO in memory only for mode == 'manual'
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

            const errdesc = 'error creating new workspace record (or updating count) from standard toolbar'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            result.error = false
            return result
        }
        this.usage.write(1)
        this.usage.create(1)

        this.workspaceSelection = {name,id:newWorkspaceDocRef.id}

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

            const errdesc = 'error getting new workspace data'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
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
            workspaceData = dbdoc.data()

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
            const errdesc = 'error in reload workspace'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            return result
        }
        this.usage.read(1)
        if (dbdoc.exists()) {
            const 
                workspaceData = dbdoc.data(),
                workspaceName = workspaceData.profile.workspace.name
            // ---- set RELOAD workspace data ----
            this.workspaceRecord = workspaceData
            this.workspaceSelection = {id:workspaceID,name:workspaceName}
            this.clearChanged()
            this.flags.new_workspace_load = true
            result.notice = `reloaded workspace [${workspaceName}]`
            return result

        } else {
            result.success = false
            result.notice = 'this workspace record no longer exists'
            return result
        }

    }

    // ---------------------[ renameWorkspace ]--------------------------

    async renameWorkspace(name) {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        let newWorkspaceRecord

        if (this.settings.mode == 'automatic') {
            // changename user workspace data
            const 
                userDocRef = doc(collection(this.db, 'users'), this.userID),
                workspaceID = this.workspaceSelection.id,
                workspaceDocRef = doc(collection(this.db, 'users',this.userID, 'workspaces'), workspaceID)

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
                const batch = writeBatch(this.db)

                batch.update(userDocRef,userUpdateData)

                batch.update(workspaceDocRef, {
                    'profile.workspace.name':name,
                    generation:increment(1),
                    'profile.commits.updated_by': {id:this.userID, name:this.userName},
                    'profile.commits.updated_timestamp':serverTimestamp()
                })

                await batch.commit()
                const newDoc = await getDoc(workspaceDocRef)
                newWorkspaceRecord = newDoc.data()

            } catch (error) {
                const errdesc = 'error updating workspace name from standard toolbar'
                console.log(errdesc, error)
                this.errorControl.push({description:errdesc, error})
                result.error = true
                return result
            }
            this.usage.write(2)
            this.usage.read(1)
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

        if (this.settings.mode == 'automatic') {
            this.workspaceRecord = newWorkspaceRecord
        } else {
            this.workspaceRecord.profile.workspace.name = name
        }

        return result

    }

    // ---------------------[ updateWorkspacePanel ]--------------------------

    async updateWorkspacePanel(id, name) {

        // console.log('updating panel: id, name', id, name)

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        this.workspaceRecord.panel = {id, name}

        if (this.settings.mode == 'manual') {
            this.changedRecords.setworkspace = this.workspaceSelection.id
            this.settings.changed = true
            return result
        }

        const 
            workspaceID = this.workspaceSelection.id,
            workspaceDocRef = doc(collection(this.db, 'users',this.userID, 'workspaces'), workspaceID),
            updateData = {
                'panel':this.workspaceRecord.panel
            }

        try {

            await updateDoc(workspaceDocRef,updateData)

        } catch (error) {
            const errdesc = 'error update panel'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            result.error = true
            return result            
        }

        this.usage.write(1)

        return result

    }

    // ---------------------[ saveWorkspaceData ]--------------------------

    // TODO update generation, timestamp etc for panel records
    async saveWorkspaceData() {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        // console.log('workspaceHandler.settings', this.settings)

        if (!this.settings.changed) return

        const 
            batch = writeBatch(this.db),
            { changedRecords } = this

        const 
            workspaceRecord = _cloneDeep(this.workspaceRecord),
            workspaceCollection = collection(this.db, 'users', this.userID, 'workspaces'),
            workspaceDocRef = doc(workspaceCollection, workspaceRecord.profile.workspace.id)

        workspaceRecord.generation = increment(1)
        workspaceRecord.profile.commits.updated_by = {id:this.userID, name:this.userName}
        workspaceRecord.profile.commits.updated_timestamp = serverTimestamp()

        batch.set(workspaceDocRef, workspaceRecord)
                
        const 
            { deletepanels, setpanels, setwindowpositions } = changedRecords

        let deleteCount = 0, writeCount = 0

        if ((deletepanels.size || setpanels.size || setwindowpositions.size )) {

            const panelCollection = 
                    collection(this.db,'users',this.userID, 'workspaces', this.workspaceRecord.profile.workspace.id,'panels')

            if (deletepanels.size) { // set of panel IDs

                deletepanels.forEach((item:string) => {

                    setpanels.delete(item)
                    setwindowpositions.delete(item)
                    const docRef = doc(panelCollection, item)
                    batch.delete(docRef)
                    deleteCount++

                })

            }

            if (setwindowpositions.size) { // set of panel IDs
                setwindowpositions.forEach((item) => {
                    setpanels.add(item)
                })
            }
            
            if (setpanels.size) { // set of panelIDs
                const { panelRecords } = this

                for (const record of panelRecords) {
                    const panelID = record.profile.panel.id
                    if (setpanels.has(panelID)) {
                        const docRef = doc(panelCollection, panelID)
                        batch.set(docRef, record)
                        writeCount++
                    }
                }
            }


        }

        if (changedRecords.userworkspace) {

            const 
                updateData = 
                    {
                        generation:increment(1),
                        'profile.commits.updated_by':{id:this.userID, name:this.userName},
                        'profile.commits.updated_timestamp':serverTimestamp(),
                    },
                workspaceID = workspaceRecord.profile.workspace.id,
                workspaceName = workspaceRecord.profile.workspace.name

            const prop = isMobile 
                    ? 'workspace.mobile'
                    : 'workspace.desktop'

            updateData[prop] = {name:workspaceName,id:workspaceID}

                batch.update(doc(collection(this.db,'users'),this.userID),updateData)
                writeCount++

        }

        try {

            batch.commit()
            // for workspace
            this.usage.write(writeCount + 1) // +1 for workspace
            this.usage.delete(deleteCount)

        } catch (error) {

                const errdesc = 'error saveing workspace data records'
                console.log(errdesc, error)
                this.errorControl.push({description:errdesc, error})
                result.error = true
                return result

        }

        this.clearChanged()

        return result

    }

    // ---------------------[ copyWorkspaceAs ]--------------------------

    async copyWorkspaceAs(name) {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        const workspaceCollection = collection(this.db,'users',this.userID,'workspaces')
        const newWorkspaceRef = doc(workspaceCollection)
        const panelsCollection = collection(this.db,'users',this.userID,'workspaces',newWorkspaceRef.id,'panels')

        const newWorkspace = _cloneDeep(this.workspaceRecord)
        const newPanels = _cloneDeep(this.panelRecords)
        const newPanelRefsMap = new Map()

        newWorkspace.profile.workspace = {id: newWorkspaceRef.id, name}
        newWorkspace.profile.owner = {id:this.userID,name:this.userName}
        newWorkspace.profile.commits.created_by = {id:this.userID,name:this.userName}
        newWorkspace.profile.commits.created_timestamp = serverTimestamp()
        newWorkspace.profile.commits.updated_by = {id:this.userID,name:this.userName}
        newWorkspace.profile.commits.updated_timestamp = serverTimestamp()
        newWorkspace.profile.flags.is_default = false
        newWorkspace.generation = 0
        newWorkspace.panels = []
        const oldSelectedPanel = newWorkspace.panel
        newWorkspace.panel = {id:null, name: null}
        const oldSelectedPanelID = oldSelectedPanel.id

        for (const panelData of newPanels) {
            const newPanelRef = doc(panelsCollection)
            const newPanelID = newPanelRef.id
            if (panelData.profile.panel.id == oldSelectedPanelID) {
                newWorkspace.panel = {...panelData.profile.panel}
            }
            newWorkspace.panels.push(newPanelID)
            panelData.profile.panel.id = newPanelID
            panelData.profile.owner = {id:this.userID,name:this.userName}
            panelData.profile.commits.created_by = {id:this.userID,name:this.userName}
            panelData.profile.commits.created_timestamp = serverTimestamp()
            panelData.profile.commits.updated_by = {id:this.userID,name:this.userName}
            panelData.profile.commits.updated_timestamp = serverTimestamp()
            panelData.generation = 0
            newPanelRefsMap.set(newPanelID,newPanelRef)
        }

        const panelsCount = newWorkspace.panels.length
        newWorkspace.profile.counts.panels = panelsCount

        try {

            const batch = writeBatch(this.db)
            batch.set(newWorkspaceRef,newWorkspace)
            for (const panelData of newPanels) {
                batch.set(newPanelRefsMap.get(panelData.profile.panel.id),panelData)
            }
            batch.commit()

        } catch (error) {

            const errdesc = 'error saving workspace copy'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            result.error = true
            return result
            
        }

        this.usage.write(panelsCount + 1)

        result.notice = `the current workspace has been copied to [${name}]`

        return result

    }

    // ---------------------[ deleteWorkspace ]--------------------------

    async deleteWorkspace(userRecord) {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        // get default workspace
        const 
            dbWorkspaceCollection = collection(this.db,'users',this.userID, 'workspaces'),
            dbWorkspaceQuery = query(dbWorkspaceCollection, where('profile.flags.is_default','==',true))

        let dbDefaultWorkspaceDoc
        try {
            dbDefaultWorkspaceDoc = await getDocs(dbWorkspaceQuery)
        } catch (error) {
            result.error = true
            const errdesc = 'error fetching default workspace'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            return result
        }
        this.usage.read(1)
        let dbDefaultDoc, defaultWorkspaceRecord
        if (dbDefaultWorkspaceDoc.size == 1) {

            dbDefaultDoc = dbDefaultWorkspaceDoc.docs[0]
            defaultWorkspaceRecord = dbDefaultDoc.data()

        } else {

            const setupResult = await this.setupWorkspace(userRecord)
            return setupResult

        }

        const 
            previousWorkspaceName = this.workspaceSelection.name,
            defaultWorkspaceName = defaultWorkspaceRecord.profile.workspace.name,
            defaultWorkspaceID = defaultWorkspaceRecord.profile.workspace.id

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
                const prop = 
                    isMobile
                        ? 'workspace.mobile'
                        : 'workspace.desktop'

                const userUpdateData = 
                        {
                            generation:increment(1),
                            'profile.commits.updated_by':{id:this.userID, name:this.userName},
                            'profile.commits.updated_timestamp':serverTimestamp(),
                            'profile.counts.workspaces':increment(-1),
                        }

                userUpdateData[prop] = {id:defaultWorkspaceID,name:defaultWorkspaceName}
                transaction.update(doc(collection(this.db,'users'),this.userID),userUpdateData)
                return true
            })

        } catch (error) {
            result.error = true
            const errdesc = 'error deleting workspace or incrementing workspace count'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            return result
        }
        result.success = transactionResult
        if (!transactionResult) {
            result.notice = 'workspace not found, so not deleted'
            this.usage.read(panelCount + 1)
            return result
        }

        // TODO check for panel sub-docs in case there was a concurrency issue

        this.usage.read(panelCount + 1)
        this.usage.delete(panelCount + 1)
        this.usage.write(1)

        // set current workspace to default
        const { id, name } = defaultWorkspaceRecord.profile.workspace
        // ---- set NEW workspace ----
        const selectionresult = await this.setWorkspaceSelection( id, name )
        if (selectionresult.error) {
            result.error = true
            return result
        } else {
            result.notice = `deleted [${previousWorkspaceName}] and replaced it with [${defaultWorkspaceName}]`
            return result
        }
    }

    // =============================[ PANELS FACADE ]===========================

    async loadPanels() {
        return await this.panelHandler.loadPanels()
    }

    async panelRename(panelSelectionIndex, newname){
        return await this.panelHandler.panelRename(panelSelectionIndex, newname)
    }

    async panelReset(panelSelectionIndex){
        return await this.panelHandler.panelReset(panelSelectionIndex)
    }

    async getPanelDomainContext(panelSelectionIndex, userRecord) {
        return await this.panelHandler.getPanelDomainContext(panelSelectionIndex, userRecord)
    }

    async duplicatePanelAs(panelSelectionIndex, newname) {
        return await this.panelHandler.duplicatePanelAs(panelSelectionIndex, newname)
    }

    async deletePanel() {
        return await this.panelHandler.deletePanel()
    }

}

export default WorkspaceHandler
