// workboxHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import { 
    getFirestore, 
    collection, doc, query, where,
    getDoc, getDocFromServer, getDocs, onSnapshot, setDoc, updateDoc,
    increment, serverTimestamp, Timestamp,
    writeBatch, runTransaction
} from 'firebase/firestore'

import { cloneDeep as _cloneDeep } from 'lodash'

import { updateDocumentSchema } from '../system/utilities'

class WorkboxHandler {
    constructor( { workboxID, workboxSessionID, db, usage, snapshotControl, onError, onFail, errorControl} ) {

        this.workboxID = workboxID
        this.workboxSessionID = workboxSessionID

        this.internal.db = db
        this.internal.usage = usage
        this.internal.snapshotControl = snapshotControl
        this.internal.onError = onError
        this.internal.onFail = onFail
        this.internal.errorControl = errorControl

    }

    // -----------------------[ data ]--------------------------

    internal = {
        // constructor parameters
        db: null,
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
    }

    userRecords // not static

    workboxID
    workboxSessionID

    workboxRecord = null
    editRecord = null
    resourcesRecords = []

    // --------------------[ process control & tracking ]------------------------

    // for document and resources, transitory mode settings
    session = {
        workbox: {
            modesettings: {
                document: {
                    select:false,
                    disable:false
                },
                resources: {
                    select:false,
                    disable:false
                },
                both: {
                    select:true,
                    disable:false
                }
            }
        },
        document:{
            insertunit: null,
            insertselection: null,
            editunit: null,
            changesessionid: null,
            is_change_error:false,
            removeunit: null,
            reorderunit: null,
            savechanges: null,
            cancelchanges: null,
            modesettings: {
                normal:{
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
                normal:{
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
            mode:'normal', // normal, insert, edit, remove, reorder
            show:false,
        },
        resources: { 
            displaycode:'out', // over, under, out
            mode: 'normal', // normal, drill, insert, edit, remove, drag
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

    // -----------------------------[ operations ]--------------------------
    async setWorkboxSnapshot() {
        const 
            workboxCollection = collection(this.internal.db, 'workboxes'),
            workboxSnapshotIndex = 'Workbox.' + this.workboxID + '.' + this.workboxSessionID

        this.internal.workboxSnapshotIndex = workboxSnapshotIndex

        if (!this.internal.snapshotControl.has(workboxSnapshotIndex)) { // once only
            this.internal.snapshotControl.create(workboxSnapshotIndex)

            this.internal.unsubscribeworkbox = await onSnapshot(doc(workboxCollection, this.workboxID), 
                async (returndoc) =>{
                    this.internal.snapshotControl.incrementCallCount(workboxSnapshotIndex, 1)
                    this.internal.usage.read(1)
                    
                    let workboxRecord = returndoc.data()

                    if (!workboxRecord) {
                        this.internal.onFail()
                        return
                    } else {

                        if (!this.internal.snapshotControl.wasSchemaChecked(workboxSnapshotIndex)) {

                            const updatedRecord = updateDocumentSchema('workboxes', workboxRecord.profile.type.name,workboxRecord)
                            if (!Object.is(workboxRecord, updatedRecord)) {
                                try {

                                    await setDoc(doc(this.internal.db,'workboxes',this.workboxID),updatedRecord)
                                    this.internal.usage.write(1)

                                } catch (error) {

                                    const errdesc = 'error updating workbox record version. Check internet'
                                    this.internal.errorControl.push({description:errdesc,error})
                                    console.log(errdesc,error)
                                    this.internal.onError()
                                    return

                                }

                                workboxRecord = updatedRecord

                            }
                            this.internal.snapshotControl.setSchemaChecked(workboxSnapshotIndex)
                        }

                        this.workboxRecord = workboxRecord

                        // console.log('onSnapshot workboxRecord', workboxRecord)

                        this.internal.trigger = 'updaterecord'
                        this.internal.setWorkboxHandlerContext({current:this})

                    }

                },(error) => {

                    const errdesc = 'error from workbox record listener. Check permissions'
                    this.internal.errorControl.push({description:errdesc,error})
                    console.log(errdesc,error)
                    this.internal.onError()
                    return

                }
            )
            // console.log('1. this.internal, this.internal.unsubscribeworkbox', this.internal, this.internal.unsubscribeworkbox)
            this.internal.trigger = 'unsubscribeworkbox'
            this.internal.setWorkboxHandlerContext({current:this})
        }
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

            // update domain handle domain name
            // const userHandle = userRecord.profile.handle.lower_case
            // writecount++
            // const 
            //     handleSyncCollection = collection(this.internal.db,'handles'),
            //     handleSyncDoc = doc(handleSyncCollection, userHandle),
            //     handleSyncUpdate = {
            //         generation: increment(1),
            //         'profile.domain.name':workboxRecordClone.document.base.name,
            //     }

            //     batch.update(userSyncDoc,userSyncUpdate)

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

        result.notice = 'workbox saved'
        return result

    }

    async getResources(parms) {

    }

    async saveResources(items) {

    }

}

export default WorkboxHandler