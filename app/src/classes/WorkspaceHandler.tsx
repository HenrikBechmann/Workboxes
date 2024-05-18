// WorkspaceHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import { 
    doc, collection, 
    query, where, getDocs, // orderBy, 
    getDoc, // deleteDoc, setDoc, updateDoc
    updateDoc,
    increment, // serverTimestamp,
    runTransaction,
} from 'firebase/firestore'

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
    usage


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

    // methods
    async setSelection (id, name) {
        this.workspaceSelection.id = id,
        this.workspaceSelection.name = name
        try {
            await updateDoc(doc(collection(this.db,'users'),this.userID),isMobile
                ? {
                    'workspace.mobile.id':id,
                    'workspace.mobile.name':name,
                }
                : {
                    'workspace.desktop.id':id,
                    'workspace.desktop.name':name,                    
                }
            )
        } catch (error) {
            console.log('signout error from standard toolbar', error)
            this.errorControl.push({description:'signout error from standard toolbar', error})
            return false
        }
        return true
    }

    resetChanged = () => {
        this.settings.changed = false
        this.changedRecords.setworkspace = null
        this.changedRecords.setpanels.clear()
        this.changedRecords.deletepanels.clear()
        this.changedRecords.setwindowpositions.clear()
    }

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
            // navigate('/error')
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
            // navigate('/error')
            return result
        }
        result.success = transactionResult
        if (!transactionResult) {
            // toast({description:'workspace not found, so not deleted'})
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
        // dispatchWorkspaceHandler()

        // toast({
        //     description: 
        //         `deleted [${previousWorkspaceName}] and replaced it with [${defaultWorkspaceName}]`
        // })
        result.description = `deleted [${previousWorkspaceName}] and replaced it with [${defaultWorkspaceName}]`
        return result

        // setDeleteDialogState(false)

    }

}

export default WorkspaceHandler