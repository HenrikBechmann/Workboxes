// WorkboxRecordPublisher.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import { 
    doc, collection, 
    getDoc, setDoc, updateDoc, // deleteDoc
    query, where, orderBy, getDocs,
    arrayUnion, arrayRemove,
    increment, serverTimestamp, Timestamp,
    runTransaction, writeBatch,
    onSnapshot,
} from 'firebase/firestore'

import { updateDocumentSchema } from '../system/utilities'

class WorkboxRecordPublisher {

    constructor(workboxID, snapshotControl, workspaceHandler) {

        this.workboxID = workboxID

        this.snapshotControl = snapshotControl
        this.workspaceHandler = workspaceHandler
        
    }

    workspaceHandler
    snapshotControl

    subscriptions = new Map()

    workboxID

    workboxSnapshotIndex

    workboxRecord = null

    async setWorkboxSnapshot() {
        const 
            { workspaceHandler, snapshotControl } = this,
            workboxCollection = collection(workspaceHandler.db, 'workboxes'),
            workboxSnapshotIndex = 'Workbox.' + this.workboxID

        this.workspaceHandler.workboxSnapshotIndex = workboxSnapshotIndex

        if (!snapshotControl.has(workboxSnapshotIndex)) { // once only
            snapshotControl.create(workboxSnapshotIndex)

            const unsubscribeworkbox = await onSnapshot(doc(workboxCollection, this.workboxID), 
                async (returndoc) =>{
                    snapshotControl.incrementCallCount(workboxSnapshotIndex, 1)
                    workspaceHandler.usage.read(1)
                    
                    let workboxRecord = returndoc.data()

                    if (!workboxRecord) {
                        workspaceHandler.onFail('failed to find workbox record')
                        return
                    } else {

                        if (!snapshotControl.wasSchemaChecked(workboxSnapshotIndex)) {

                            const updatedRecord = updateDocumentSchema('workboxes', workboxRecord.profile.type.name,workboxRecord)
                            if (!Object.is(workboxRecord, updatedRecord)) {
                                try {

                                    await setDoc(doc(workspaceHandler.db,'workboxes',this.workboxID),updatedRecord)
                                    workspaceHandler.usage.write(1)

                                } catch (error) {

                                    const errdesc = 'error updating workbox record version. Check internet'
                                    workspaceHandler.errorControl.push({description:errdesc,error})
                                    console.log(errdesc,error)
                                    workspaceHandler.onError()
                                    return

                                }

                                workboxRecord = updatedRecord

                            }
                            snapshotControl.setSchemaChecked(workboxSnapshotIndex)
                        }

                        workboxRecord = workboxRecord

                        // console.log('onSnapshot workboxRecord', workboxRecord)

                        // workspaceHandler.trigger = 'updaterecord'
                        // this.internal.setWorkboxHandlerContext({current:this})

                    }

                },(error) => {

                    const errdesc = 'error from workbox record listener. Check permissions'
                    workspaceHandler.errorControl.push({description:errdesc,error})
                    console.log(errdesc,error)
                    workspaceHandler.onError()
                    return

                }
            )
            // console.log('1. this.internal, this.internal.unsubscribeworkbox', this.internal, this.internal.unsubscribeworkbox)
            // workspaceHandler.trigger = 'unsubscribeworkbox'
            // this.internal.setWorkboxHandlerContext({current:this})
        }
    }


}