// workboxHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import { 
    getFirestore, 
    collection, doc, query, where,
    getDoc, getDocFromServer, getDocs, onSnapshot, setDoc, updateDoc,
    increment, serverTimestamp, 
    writeBatch, runTransaction
} from 'firebase/firestore'

import { updateDocumentSchema } from '../system/utilities'

class WorkboxHandler {
    constructor( {workboxID, db, usage, snapshotControl, onError, onFail, errorControl} ) {

        this.workboxID = workboxID

        this.internal.db = db
        this.internal.usage = usage
        this.internal.snapshotControl = snapshotControl
        this.internal.onError = onError
        this.internal.onFail = onFail
        this.internal.errorControl = errorControl

    }

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

    workboxID

    // data
    workboxRecord
    itemlistRecords = []

    // process control & tracking

    // configuration
    settings
    dimensions = {
        innerFrameWidth:null,
        CONTENT_FRAME_PADDING_WIDTH:null,
    }

    // -----------------------------[ operations ]--------------------------
    async setWorkboxSnapshot() {
        const 
            workboxCollection = collection(this.internal.db, 'workboxes'),
            workboxSnapshotIndex = 'Workbox.' + this.workboxID

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

                        // console.log('onSnapshot setWorkbodHandlerContext')

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
        }
    }

    async getWorkboxRecord() {

    }

    async saveWorkboxRecord(workboxRecord) {

    }

    async getItemList(parms) {

    }

    async saveItems(items) {

    }

}

export default WorkboxHandler