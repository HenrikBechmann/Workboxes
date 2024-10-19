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
    domainRecord = null
    memberRecord = null

    domainSubscriptionControlData

    async openWorkboxSnapshot() {

        // console.log('openSnapshot')

        const workboxSnapshotIndex = 
            await this.setWorkboxSnapshot(this.workspaceHandler, this.workboxID, this.setWorkboxRecord)
        this.workboxSnapshotIndex = workboxSnapshotIndex

    }

    updateDomainData = (domainRecord) => {

        // console.log('update domain data', domainRecord)
        this.domainRecord = domainRecord

        if (this.workboxRecord && domainRecord) {
            if (this.workboxRecord.profile.domain.name !== domainRecord.profile.domain.name) {
                this.workboxRecord.profile.domain.name = domainRecord.profile.domain.name
                this.subscriptions.forEach((subscription) =>{
                    // console.log('subscription', subscription)
                    subscription.functions.updateWorkboxData(this.workboxRecord)
                })
            }
        }

    }

    updateMemberData = (memberRecord) => {
        this.memberRecord = memberRecord
    }

    subscribeToDomainRecord() {

        const { workboxRecord, workspaceHandler } = this

        const 
            domainID = workboxRecord.profile.domain.id,
            domainSubscriptionControlData = {
                domain: workboxRecord.profile.domain,
                functions: {
                    updateDomainData:this.updateDomainData,
                    updateMemberData:this.updateMemberData,
                },
                subscriptionindex:'workbox.' + workboxRecord.profile.workbox.id
            }

        this.domainSubscriptionControlData = domainSubscriptionControlData
        
        // subscribe to new domainRecord to avoid closing domain snapshot by unsubscribing previous, in case the same
        workspaceHandler.subscribeToDomainRecord(domainSubscriptionControlData, 'workboxRecordPublisher')

    }

    private async unsubscribeFromDomainRecord() {

        const {workspaceHandler} = this

        await workspaceHandler.unsubscribeFromDomainRecord(this.domainSubscriptionControlData, 'workbox record publisher')

    }

    async closeWorkboxSnapshot() {

        this.unsubscribeFromDomainRecord()

        // console.log('WorkboxRecordPublisher.closeSnapshot', this.workboxSnapshotIndex)

        // TODO try to remove race condition
        if (this.workspaceHandler.snapshotControl.has(this.workboxSnapshotIndex)) { // race condition possible

            this.workspaceHandler.snapshotControl.unsub(this.workboxSnapshotIndex)

        }

    }

    private setWorkboxRecord = (workboxRecord) => {

        // console.log('workboxRecordPublisher.setWorkboxRecord: workboxID, workboxRecod, subscriptions', 
        //     this.workboxID, workboxRecord, this.subscriptions)

        // console.log('setWorkboxRecord for workboxID, domainRecord, workboxRecord', 
        //     this.workboxID, this.domainRecord, workboxRecord)

        const initialization = (!this.workboxRecord)

        this.workboxRecord = workboxRecord

        if (this.domainRecord) {
            if (workboxRecord.profile.domain.name !== this.domainRecord.profile.domain.name) {
                workboxRecord.profile.domain.name = this.domainRecord.profile.domain.name
            }
        }
        this.subscriptions.forEach((subscription) =>{
            // console.log('subscription', subscription)
            subscription.functions.updateWorkboxData(workboxRecord)
        })

        if (initialization) {
            this.subscribeToDomainRecord()
        }

    }

    async subscribe (workboxSubscriptionControlData) {

        this.subscriptions.set(workboxSubscriptionControlData.subscriptionindex, workboxSubscriptionControlData)

        this.workboxRecord && workboxSubscriptionControlData.functions.updateWorkboxData(this.workboxRecord)

    }

    async unSubscribe(workboxSubscriptionControlData, source) {

        // console.log('unsubscribe from workbox data', source)
        this.subscriptions.delete(workboxSubscriptionControlData.subscriptionindex)

        if (!this.subscriptions.size) {
            await this.closeWorkboxSnapshot()
        }

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

            // console.log('create snapshotControl',workboxSnapshotIndex)

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

            // console.log('registerUnsub', workboxSnapshotIndex)

            snapshotControl.registerUnsub(workboxSnapshotIndex, unsubscribeworkbox)
        }

        return workboxSnapshotIndex

    }

}

export default WorkboxRecordPublisher
