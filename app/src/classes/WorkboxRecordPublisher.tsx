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

    constructor(workboxID, workspaceHandler) {

        this.workboxID = workboxID

        this.workspaceHandler = workspaceHandler
        
    }

    workspaceHandler

    subscriptions = new Map()

    workboxID

    workboxSnapshotIndex

    workboxRecord = null

    async openSnapshot() {

        console.log('openSnapshot')

        const workboxSnapshotIndex = 
            await this.setWorkboxSnapshot(this.workspaceHandler, this.workboxID, this.setWorkboxRecord)
        this.workboxSnapshotIndex = workboxSnapshotIndex

    }

    async closeSnapshot() {

        this.workspaceHandler.snapshotControl.unsub(this.workboxSnapshotIndex)

    }

    private setWorkboxRecord = (workboxRecord) => {

        console.log('workboxRecordPublisher.setWorkboxRecord', workboxRecord)

        this.workboxRecord = workboxRecord
        this.subscriptions.forEach((subscription) =>{
            console.log('subscription', subscription, workboxRecord)
            subscription.functions.updateWorkboxData(workboxRecord)
        })

    }

    async subscribe (workboxSubscriptionControlData) {

        this.subscriptions.set(workboxSubscriptionControlData.subscriptionindex, workboxSubscriptionControlData)

        workboxSubscriptionControlData.functions.updateWorkboxData(this.workboxRecord)

        console.log('WorkboxRecordPublisher.subscribe: workboxSubscriptionControlData, this.subscriptions, this.workboxRecord', 
            workboxSubscriptionControlData, this.subscriptions, this.workboxRecord)

    }

    async unSubscribe(workboxSubscriptionControlData) {

        this.subscriptions.delete(workboxSubscriptionControlData.subscriptionindex)

    }

    async unSubscribeAll() {

        this.subscriptions.clear()

    }

    async setWorkboxSnapshot(workspaceHandler, workboxID, setWorkboxRecord) {

        const 
            {snapshotControl } = workspaceHandler,
            workboxCollection = collection(workspaceHandler.db, 'workboxes'),
            workboxSnapshotIndex = 'Workbox.' + this.workboxID

        if (!snapshotControl.has(workboxSnapshotIndex)) { // once only
            snapshotControl.create(workboxSnapshotIndex)

            const unsubscribeworkbox = await onSnapshot(doc(workboxCollection, workboxID), 
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

                                    await setDoc(doc(workspaceHandler.db,'workboxes',workboxID),updatedRecord)
                                    workspaceHandler.usage.write(1)

                                } catch (error) {

                                    const errdesc = 'error updating workbox record version. Check internet'
                                    workspaceHandler.errorControl.push({description:errdesc,error})
                                    console.log(errdesc,error)
                                    workspaceHandler.onError(errdesc)
                                    return

                                }

                                workboxRecord = updatedRecord

                            }
                            snapshotControl.setSchemaChecked(workboxSnapshotIndex)
                        }

                        setWorkboxRecord(workboxRecord)

                    }

                },(error) => {

                    const errdesc = 'error from workbox record listener. Check permissions'
                    workspaceHandler.errorControl.push({description:errdesc,error})
                    console.log(errdesc,error)
                    workspaceHandler.onError(errdesc)
                    return

                }

            )

            snapshotControl.registerUnsub(workboxSnapshotIndex, unsubscribeworkbox)
        }

        return workboxSnapshotIndex

    }

}

export default WorkboxRecordPublisher
