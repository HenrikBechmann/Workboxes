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

        // this.workboxSessionID = workboxSessionID
        this.workboxID = workboxID
        this.db = db
        this.usage = usage
        this.snapshotControl = snapshotControl
        this.onError = onError
        this.onFail = onFail
        this.errorControl = errorControl

    }

    // constructor parameters
    workboxID
    db
    usage
    snapshotControl
    errorControl

    // onsnapshot control
    workboxSnapshotIndex
    unsubscribeworkbox
    onError
    onFail

    // data
    workboxRecord
    itemlistRecords = []

    // configuration
    settings
    innerFrameWidth
    CONTENT_FRAME_PADDING_WIDTH

    // process control & tracking
    trigger // for debugging
    setWorkboxHandlerContext // for consumers

    // -----------------------------[ operations ]--------------------------
    async setWorkboxSnapshot() {
        const 
            workboxCollection = collection(this.db, 'workboxes'),
            workboxSnapshotIndex = 'Workbox.' + this.workboxID,
            result = {
                error:false,
                success: true,
                notice: null,
                payload: null,
            }

        this.workboxSnapshotIndex = workboxSnapshotIndex

        if (!this.snapshotControl.has(workboxSnapshotIndex)) { // once only
            this.snapshotControl.create(workboxSnapshotIndex)

            this.unsubscribeworkbox = await onSnapshot(doc(workboxCollection, this.workboxID), 
                async (returndoc) =>{
                    this.snapshotControl.incrementCallCount(workboxSnapshotIndex, 1)
                    this.usage.read(1)
                    
                    let workboxRecord = returndoc.data()

                    if (!workboxRecord) {
                        result.success = false
                        this.onFail()
                    } else {

                        if (!this.snapshotControl.wasSchemaChecked(workboxSnapshotIndex)) {

                            const updatedRecord = updateDocumentSchema('workboxes', workboxRecord.profile.type.name,workboxRecord)
                            if (!Object.is(workboxRecord, updatedRecord)) {
                                try {

                                    await setDoc(doc(this.db,'workboxes',this.workboxID),updatedRecord)
                                    this.usage.write(1)

                                } catch (error) {

                                    const errdesc = 'error updating workbox record version. Check internet'
                                    this.errorControl.push({description:errdesc,error})
                                    console.log(errdesc,error)
                                    this.onError()
                                    return

                                }

                                workboxRecord = updatedRecord

                            }
                            this.snapshotControl.setSchemaChecked(workboxSnapshotIndex)
                        }

                        this.workboxRecord = workboxRecord

                        // console.log('onSnapshot setWorkbodHandlerContext')

                        this.setWorkboxHandlerContext({current:this})

                    }

                },(error) => {

                    const errdesc = 'error from workbox record listener. Check permissions'
                    this.errorControl.push({description:errdesc,error})
                    console.log(errdesc,error)
                    result.error = true
                    this.onError()
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