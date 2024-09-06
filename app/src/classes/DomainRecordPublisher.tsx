// DomainRecordPublisher.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*

    TODO: update all error handling related to this, particularly in WorkboxesProvider

*/

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

class DomainRecordPublisher {

    constructor(domainID, workspaceHandler) {

        this.domainID = domainID

        this.workspaceHandler = workspaceHandler
        
    }

    workspaceHandler

    subscriptions = new Map()

    domainID

    domainSnapshotIndex
    memberSnapshotIndex

    domainRecord = null
    memberRecord = null

    async openSnapshot() {

        const {domainSnapshotIndex, memberSnapshotIndex} = 
            await this.setDomainSnapshots(this.workspaceHandler, this.domainID, this.setDomainRecord, this.setMemberRecord)
        this.domainSnapshotIndex = domainSnapshotIndex
        this.memberSnapshotIndex = memberSnapshotIndex

    }

    async closeSnapshot() {

        const { snapshotControl } = this.workspaceHandler

        snapshotControl.has(this.domainSnapshotIndex) && snapshotControl.unsub(this.domainSnapshotIndex)
        snapshotControl.has(this.memberSnapshotIndex) && snapshotControl.unsub(this.memberSnapshotIndex)

    }

    private setDomainRecord = (domainRecord) => {

        this.domainRecord = domainRecord
        this.subscriptions.forEach((subscription) =>{
            subscription.functions.updateDomainData(domainRecord)
        })

    }

    private setMemberRecord = (memberRecord) => {

        this.memberRecord = memberRecord
        this.subscriptions.forEach((subscription) =>{
            subscription.functions.updateMemberData && subscription.functions.updateMemberData(memberRecord)
        })

    }

    async subscribe (domainSubscriptionControlData) {

        this.subscriptions.set(domainSubscriptionControlData.subscriptionindex, domainSubscriptionControlData)
        domainSubscriptionControlData.functions.updateDomainData(this.domainRecord)
        domainSubscriptionControlData.functions.updateDomainData && 
            domainSubscriptionControlData.functions.updateDomainData(this.domainRecord)

    }

    async unSubscribe(domainSubscriptionControlData) {

        this.subscriptions.delete(domainSubscriptionControlData.subscriptionindex)

    }

    async unSubscribeAll() {

        this.subscriptions.clear()

    }

    async setDomainSnapshots(workspaceHandler, domainID, setDomainRecord, setMemberRecord) {

        const 
            { snapshotControl } = workspaceHandler,
            domainCollection = collection(workspaceHandler.db, 'domains'),
            domainSnapshotIndex = 'Domain.' + domainID

        if (!snapshotControl.has(domainSnapshotIndex)) { // once only
            snapshotControl.create(domainSnapshotIndex)

            const unsubscribedomain = await onSnapshot(doc(domainCollection, domainID), 
                async (returndoc) =>{
                    snapshotControl.incrementCallCount(domainSnapshotIndex, 1)
                    workspaceHandler.usage.read(1)
                    
                    let domainRecord = returndoc.data()

                    if (!domainRecord) {
                        workspaceHandler.onFail('System: domain record not found')
                        return
                    } else {

                        if (!snapshotControl.wasSchemaChecked(domainSnapshotIndex)) {

                            const updatedRecord = updateDocumentSchema('domains', 'standard' ,domainRecord)
                            if (!Object.is(domainRecord, updatedRecord)) {
                                try {

                                    await setDoc(doc(domainCollection, domainID),updatedRecord)
                                    workspaceHandler.usage.write(1)

                                } catch (error) {

                                    const errdesc = 'error updating domain record version. Check internet'
                                    workspaceHandler.errorControl.push({description:errdesc,error})
                                    console.log(errdesc,error)
                                    workspaceHandler.onError(errdesc)
                                    return

                                }

                                domainRecord = updatedRecord

                            }
                            snapshotControl.setSchemaChecked(domainSnapshotIndex)
                        }

                        // set new domain record
                        setDomainRecord(domainRecord)

                    }

                },(error) => {

                    const errdesc = 'error from domain record listener. Check permissions'
                    workspaceHandler.errorControl.push({description:errdesc,error})
                    console.log(errdesc,error)
                    workspaceHandler.onError(errdesc)
                    return

                }
            )

            snapshotControl.registerUnsub(domainSnapshotIndex, unsubscribedomain)

        }
        const 
            memberCollection = collection(workspaceHandler.db, 'domains', domainID, 'members'),
            memberID = workspaceHandler.userRecords.memberships.domains[domainID].memberid,
            memberSnapshotIndex = 'Member.' + memberID

        if (!snapshotControl.has(memberSnapshotIndex)) { // once only
            snapshotControl.create(memberSnapshotIndex)

            const unsubscribemember = await onSnapshot(doc(memberCollection, memberID), 
                async (returndoc) =>{
                    snapshotControl.incrementCallCount(memberSnapshotIndex, 1)
                    workspaceHandler.usage.read(1)
                    
                    let memberRecord = returndoc.data()

                    if (!memberRecord) {
                        workspaceHandler.onFail('System: member record not found')
                        return
                    } else {

                        if (!workspaceHandler.snapshotControl.wasSchemaChecked(memberSnapshotIndex)) {

                            const updatedRecord = updateDocumentSchema('members', 'standard' ,memberRecord)
                            if (!Object.is(memberRecord, updatedRecord)) {
                                try {

                                    await setDoc(doc(memberCollection, memberID),updatedRecord)
                                    workspaceHandler.usage.write(1)

                                } catch (error) {

                                    const errdesc = 'error updating member record version. Check internet'
                                    workspaceHandler.errorControl.push({description:errdesc,error})
                                    console.log(errdesc,error)
                                    workspaceHandler.onError(errdesc)
                                    return

                                }

                                memberRecord = updatedRecord

                            }
                            snapshotControl.setSchemaChecked(memberSnapshotIndex)
                        }

                        // set new membership record
                        setMemberRecord(memberRecord)

                    }

                },(error) => {

                    const errdesc = 'error from member record listener. Check permissions'
                    workspaceHandler.errorControl.push({description:errdesc,error})
                    console.log(errdesc,error)
                    workspaceHandler.onError(errdesc)
                    return

                }
            )

            snapshotControl.registerUnsub(memberSnapshotIndex, unsubscribemember)

        }

        return {domainSnapshotIndex, memberSnapshotIndex}
 
    }

}

export default DomainRecordPublisher
