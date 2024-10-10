// workboxHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import { 
    getFirestore, 
    collection, doc, query, where,
    getDoc, getDocFromServer, getDocs, onSnapshot, setDoc, updateDoc,
    increment, serverTimestamp, Timestamp,
    writeBatch, runTransaction
} from 'firebase/firestore'

import { ref, deleteObject } from 'firebase/storage'

import { cloneDeep as _cloneDeep } from 'lodash'

import { updateDocumentSchema } from '../system/utilities'

class WorkboxHandler {
    constructor( { workboxID, workboxSessionID, workspaceHandler, onError, onFail} ) {

        const { db, storage, usage, snapshotControl, errorControl } = workspaceHandler
        this.workboxID = workboxID
        this.workboxSessionID = workboxSessionID

        this.internal.db = db
        this.internal.storage = storage
        this.internal.usage = usage
        this.internal.snapshotControl = snapshotControl
        this.internal.onError = onError
        this.internal.onFail = onFail
        this.internal.errorControl = errorControl
        this.internal.workspaceHandler = workspaceHandler

    }

    // -----------------------[ data ]--------------------------

    internal = {
        // constructor parameters
        db: null,
        storage: null,
        usage: null,
        snapshotControl: null,
        onError: null,
        onFail: null,
        errorControl: null,
        
        // internal controls
        workboxSnapshotIndex: null,
        unsubscribeworkbox: null,
        setWorkboxHandlerContext: null, // for consumers
        trigger: null, // for debugging
        workspaceHandler:null,
    }

    userRecords // not static

    workboxID
    workboxSessionID

    workboxRecord = null
    editRecord = null
    editoreditcontent = null
    resourcesRecords = []

    // --------------------[ process control & tracking ]------------------------

    // for document and resources, transitory mode settings
    session = {
        workbox: {
            modesettings: {
                document: {
                    select:true,
                    disable:false
                },
                resources: {
                    select:false,
                    disable:false
                },
                both: {
                    select:false,
                    disable:false
                }
            }
        },
        document:{
            insertblock: null,
            insertselection: null,
            editblock: null,
            changesessionid: null,
            is_change_error:false,
            removeblock: null,
            reorderblock: null,
            savechanges: null,
            cancelchanges: null,
            modesettings: {
                view:{
                    select:true,
                    disable:false,
                },
                insert: {
                    select:false,
                    disable:false,
                },
                edit:{
                    select:false,
                    disable:false,
                }, 
                remove: {
                    select:false,
                    disable:false,
                },
            }
        },
        resources:{
            drillitem: null,
            insertitem: null,
            insertselection: null,
            edititem: null,
            changesessionid: null,
            is_change_error:false,
            removeitem: null,
            savechanges: null,
            cancelchanges: null,
            modesettings: {
                view:{
                    select:true,
                    disable:false,
                },
                drill:{
                    select:false,
                    disable:false,
                },
                insert: {
                    select:false,
                    disable:false,
                },
                edit:{
                    select:false,
                    disable:false,
                }, 
                remove: {
                    select:false,
                    disable:false,
                },
                drag: {
                    select:false,
                    disable:false,
                },
                select: {
                    select:false,
                    disable:false,
                }
            }
        },
    }

    
/*
    persistent Workbox settings, stored with panels
    settings: 
    {
        content: {
            displaycode:'both', // document, resources, both
        },
        document: {
            displaycode:'out', // over, under, out
            mode:'view', // view, insert, edit, remove, reorder
            show:false,
        },
        resources: { 
            displaycode:'out', // over, under, out
            mode: 'view', // view, drill, insert, edit, remove, drag
            show:false,
        },
        both: {
            show: true,
        },
    },
*/    
    settings

    dimensions = {
        UIDocumentWidth:300,
        UIDocumentWidthRatio:null,
        primaryFrameWidth:null,
        CONTENT_FRAME_PADDING_WIDTH:null,
    }

    // const workboxSubscriptionControlData = {
    //     functions:{ // repository for direct calls
    //         updateWorkboxData: null,
    //     },
    //     workbox: {
    //         id,
    //         name,
    //     },
    //     subscriptionindex: <prefix>.<entityid>
    // }

    workboxSubscriptionControlData

    // -----------------------------[ operations ]--------------------------

    // -- sync files - start
    getEditorFiles = (editorDocument) => {
        const editorFiles = []
        editorDocument.forEach((block) => {
            if (['image','video','audio','file'].includes(block.type)) {
                editorFiles.push(block.props.name)
            }
        })
        return editorFiles
    }

    // deletes storage files not in editor files, before firestore save of edited document
    reconcileUploadedFiles = (uploadedFiles, editorFiles) => {

        // avoid duplicates
        const uploadedFileSet = new Set(uploadedFiles)
        const editorFileSet = new Set(editorFiles)

        this.removeOrphans(uploadedFileSet, editorFileSet, this)

        // refreshes firestore document files list to match editor files, in place
        uploadedFiles.length = 0
        editorFileSet.forEach((filename) => {
            uploadedFiles.push(filename)
        })

    }

    // takes edited file list and compares with pre-edit editor.content
    revertUploadedFiles = (uploadedFiles, editorFiles) => {

        // avoid duplicates
        const uploadedFileSet = new Set(uploadedFiles)
        const editorFileSet = new Set(editorFiles)

        this.removeOrphans(uploadedFileSet, editorFileSet, this)

    }

    private removeOrphans = (uploadedFileSet, editorFileSet, self) => {
        // delete storage files not referenced in editor files
        uploadedFileSet.forEach(async function (filename) {
            if (!editorFileSet.has(filename)) {
                const fileRef = ref(self.internal.storage,self.workboxRecord.profile.workbox.id + '/document/' + filename )
                try {
                    await deleteObject(fileRef)
                } catch (error) {
                    console.log('error deleting file for revert', filename, error.message)
                }
            }
        })
    }
    // -- sync files - end

    async subscribeToWorkboxRecord() {

        // console.log('subscribing workboxRecord for workbox')

        const workboxSubscriptionControlData = {
            functions:{ // repository for direct calls
                updateWorkboxData:this.updateWorkboxData
            },
            workbox: {
                id:this.workboxID,
                name,
            },
            subscriptionindex: 'workbox.' + this.workboxID + '.' + this.workboxSessionID
        }

        this.workboxSubscriptionControlData = workboxSubscriptionControlData

        await this.internal.workspaceHandler.subscribeToWorkboxRecord(workboxSubscriptionControlData)

    }

    async unsubscribeFromWorkboxRecord() {

        // console.log('WorkboxHandler unsubscribeFromWorkboxRecord',this.workboxSubscriptionControlData)

        await this.internal.workspaceHandler.unsubscribeFromWorkboxRecord(this.workboxSubscriptionControlData)

    }

    updateWorkboxData = (workboxRecord) => {

        // console.log('updating workboxRecord for workbox', workboxRecord)

        this.workboxRecord = workboxRecord
        this.internal.setWorkboxHandlerContext({current:this})

    }

    async getWorkboxRecord() {


    }

    async saveWorkboxRecord(workboxRecord) {

        const result = {
            error: false,
            success: true,
            notice: null,
            payload: null,
        }

        const 
            workboxRecordClone = _cloneDeep(workboxRecord),
            userRecord = this.userRecords.user,
            workboxCollection = collection(this.internal.db, 'workboxes'),
            batch = writeBatch(this.internal.db)

        let writecount = 1
        workboxRecordClone.generation = increment(1)
        workboxRecordClone.profile.commits.updated_by = {id:userRecord.profile.user.id, name:userRecord.profile.user.name}
        workboxRecordClone.profile.commits.updated_timestamp = Timestamp.now()
        workboxRecordClone.profile.workbox.name = workboxRecordClone.document.base.name


        let memberSyncCollection, memberSyncDoc, memberSyncUpdate, domainSyncCollection, domainSyncDoc, domainSyncUpdate
        if (workboxRecordClone.profile.type.name == 'member') {
            // update member data
            workboxRecordClone.profile.member.name = workboxRecordClone.document.base.name
            writecount++
            memberSyncCollection = collection(this.internal.db,'domains',workboxRecordClone.profile.domain.id,'members')
            memberSyncDoc = doc(memberSyncCollection, workboxRecordClone.profile.member.id)
            memberSyncUpdate = {
                generation: increment(1),
                'profile.member.name':workboxRecordClone.document.base.name,
                'profile.member.image.source':workboxRecordClone.document.base.image.source,
                'profile.member.description':workboxRecordClone.document.base.description,
                'profile.workbox.name':workboxRecordClone.document.base.name
            }
            batch.update(memberSyncDoc,memberSyncUpdate)
        } else if (workboxRecordClone.profile.type.name == 'domain') {
            // update domain data
            workboxRecordClone.profile.domain.name = workboxRecordClone.document.base.name
            writecount++
            domainSyncCollection = collection(this.internal.db,'domains')
            domainSyncDoc = doc(domainSyncCollection, workboxRecordClone.profile.domain.id)
            domainSyncUpdate = {
                generation: increment(1),
                'profile.domain.name':workboxRecordClone.document.base.name,
                'profile.domain.image.source':workboxRecordClone.document.base.image.source,
                'profile.domain.description':workboxRecordClone.document.base.description,
                'profile.workbox.name':workboxRecordClone.document.base.name
            }
            batch.update(domainSyncDoc,domainSyncUpdate)

            // update member domain name
            writecount++
            memberSyncCollection = collection(this.internal.db,'domains',workboxRecordClone.profile.domain.id,'members')
            const memberID = this.userRecords.memberships.domains[workboxRecordClone.profile.domain.id].memberid
            memberSyncDoc = doc(memberSyncCollection, memberID)
            memberSyncUpdate = {
                generation: increment(1),
                'profile.domain.name':workboxRecordClone.document.base.name,
            }
            batch.update(memberSyncDoc,memberSyncUpdate)

            // update user domain name
            const userDomainID = userRecord.profile.domain.id
            const workboxDomainID = workboxRecordClone.profile.domain.id
            if (userDomainID === workboxDomainID) {

                writecount++
                const 
                    userID = userRecord.profile.user.id,
                    userSyncCollection = collection(this.internal.db,'users'),
                    userSyncDoc = doc(userSyncCollection, userID),
                    userSyncUpdate = {
                        generation: increment(1),
                        'profile.domain.name':workboxRecordClone.document.base.name,
                    }

                batch.update(userSyncDoc,userSyncUpdate)

            }

            // TODO UPDATE DATABASE
            // update domain handle domain name
            // const domainDoc = await getDoc(doc(domainSyncCollection, workboxRecordClone.profile.domain.id))
            // const domainRecord = domainDoc.data()
            // const domainHandle = domainRecord.profile.handle

            // writecount++
            // const 
            //     handleSyncCollection = collection(this.internal.db,'handles'),
            //     handleSyncDoc = doc(handleSyncCollection, domainHandle),
            //     handleSyncUpdate = {
            //         generation: increment(1),
            //         'profile.domain.name':workboxRecordClone.document.base.name,
            //     }

            // batch.update(handleSyncDoc,handleSyncUpdate)

        }

        try {

            batch.set(doc(workboxCollection,this.workboxID),workboxRecordClone)
            // await setDoc(doc(workboxCollection,this.workboxID),workboxRecordClone)
            await batch.commit()
            this.internal.usage.write(writecount)

        } catch (error) {

            const errdesc = 'error saving workbox record or related updates. Check internet'
            this.internal.errorControl.push({description:errdesc,error})
            console.log(errdesc,error)
            this.internal.onError()
            result.error = true
            return result

        }

        result.notice = 'Workbox document saved'
        return result

    }

    async getResources(parms) {

    }

    async saveResources(items) {

    }

}

export default WorkboxHandler