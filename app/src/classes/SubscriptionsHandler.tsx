// SubscriptionHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*

    domain name edited in domain workbox is updated in
        - domain.profile
        - user members.profile
        - users.profile
        - handles.domain.profile

    for synchronization, domain name exists in
        multiples:
        - all domain workboxes.profile
        - selected panels.profile
        - all domain members.profile

*/

import DomainRecordPublisher from './DomainRecordPublisher'
import WorkboxRecordPublisher from './WorkboxRecordPublisher'

class SubscriptionHandler {

    constructor(workspaceHandler) {

        this.workspaceHandler = workspaceHandler
        this.panelsHandler = workspaceHandler.panelsHandler
        this.userID = workspaceHandler.userID

    }

    workspaceHandler
    panelsHandler
    userID

    publishers = {
        domainRecordPublishers: new Map(),
        workboxRecordPublishers: new Map(),
    }

    // ============================[ domain record subscriptions ]=========================

    // const domainSubscriptionControlData = {
    //     functions:{ // repository for direct calls
    //         updateDomainData: null,
    //         updateMemberData: null,
    //     },
    //     domain: {
    //         id,
    //         name,
    //     },
    //     subscriptionindex: <prefix>.<entityid>
    // }


    // only called from workspaceHandler
    async subscribeToDomainRecord(domainSubscriptionControlData, source) { // domain and member records
        const 
            { domainRecordPublishers } = this.publishers,
            domainID = domainSubscriptionControlData.domain.id

        if (!domainRecordPublishers.has(domainID)) {
            const 
                domainRecordPublisher = 
                    new DomainRecordPublisher( domainID, this.workspaceHandler )

            domainRecordPublishers.set(domainID, domainRecordPublisher)

        }

        // console.log('subscribing to domain snapshot, source', source, domainSubscriptionControlData)
        const domainRecordPublisher = domainRecordPublishers.get(domainID)
        domainRecordPublisher.subscribe(domainSubscriptionControlData)
        
    }

    // only called from workspaceHandler
    async unsubscribeFromDomainRecord(domainSubscriptionControlData, source = 'indeterminate') {
        
        const { domainRecordPublishers } = this.publishers
        const 
            domainID = domainSubscriptionControlData.domain.id

        if (!domainRecordPublishers.has(domainID)) {
            console.log('domain not found for domain record publishers unsubscribe')
            return
        }

        const domainRecordPublisher = domainRecordPublishers.get(domainID)
        // console.log('unsubscribing from domain snapshot, source', source, domainSubscriptionControlData)
        await domainRecordPublisher.unSubscribe(domainSubscriptionControlData)

        if (!domainRecordPublisher.subscriptions.size) {
            domainRecordPublishers.delete(domainID)
        }

    }

    async clearSubscriptionsToDomainRecords(source) {

        // console.log('clearing subscriptions to domain records', source)
        const { domainRecordPublishers } = this.publishers

        const domainList = Array.from(domainRecordPublishers,([index, value]) => index)

        for (let index = 0; index < domainRecordPublishers.size; index++) {
            const domainID = domainList[index]
            const domainRecordPublisher = domainRecordPublishers.get(domainID)
            await domainRecordPublisher.unSubscribeAll()
            await domainRecordPublisher.closeDomainSnapshot()
        }

        domainRecordPublishers.clear()
    }

    // ============================[ workbox record subscriptions ]=========================

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


    async subscribeToWorkboxRecord(workboxSubscriptionControlData) { // workbox record

        const 
            { workboxRecordPublishers } = this.publishers,
            workboxID = workboxSubscriptionControlData.workbox.id

        if (!workboxRecordPublishers.has(workboxID)) {

            const 
                userID = this.userID,
                workboxRecordPublisher = 
                    new WorkboxRecordPublisher( workboxID, this.workspaceHandler )

            workboxRecordPublishers.set(workboxID, workboxRecordPublisher)

            // console.log('opening workbox snapshot')
            await workboxRecordPublisher.openWorkboxSnapshot()
        }

        const workboxRecordPublisher = workboxRecordPublishers.get(workboxID)
        // console.log('subscribing to workbox snapshot')
        workboxRecordPublisher.subscribe(workboxSubscriptionControlData)
        
    }

    async unsubscribeFromWorkboxRecord(workboxSubscriptionControlData, source) {

        // console.log('-------------------------------\n','SubscriptionHandler unsubscribeFromWorkboxRecord',
        //     workboxSubscriptionControlData)

        // console.log('unsubscribeFronWorkboxRecord', source, workboxSubscriptionControlData)

        const { workboxRecordPublishers } = this.publishers
        const 
            workboxID = workboxSubscriptionControlData.workbox.id

        // console.log('ONE workboxID, workboxRecordPublishers', 
        //     workboxID, workboxRecordPublishers)
        if (!workboxRecordPublishers.has(workboxID)) {
            return
        }

        const workboxRecordPublisher = workboxRecordPublishers.get(workboxID)
        await workboxRecordPublisher.unSubscribe(workboxSubscriptionControlData, source)

        // console.log('TWO workboxID, workboxRecordPublishers', 
        //     workboxID, workboxRecordPublishers)

        // console.log('workboxRecordPublisher.subscriptions', workboxRecordPublisher.subscriptions)

        if (!workboxRecordPublisher.subscriptions.size) {
            // console.log('closeSnapshot from SubscriptionHandler.unsubscribeFromWorkboxRecord', workboxID)
            // console.log('deleting workboxRecordPublishers workboxID')
            workboxRecordPublishers.delete(workboxID)
            // await workboxRecordPublisher.closeWorkboxSnapshot()
        }

    }

    // async clearSubscriptionsToWorkboxRecords() {
    //     const { workboxRecordPublishers } = this.publishers

    //     const workboxList = Array.from(workboxRecordPublishers,([index, value]) => index)

    //     for (let index = 0; index < workboxRecordPublishers.size; index++) {
    //         const workboxID = workboxList[index]
    //         const workboxRecordPublisher = workboxRecordPublishers.get(workboxID)
    //         await workboxRecordPublisher.unSubscribeAll()
    //         // console.log('closeSnapshot from clearSubscriptionsToWorkboxRecords', workboxRecordPublishers)
    //         await workboxRecordPublisher.closeSnapshot()
    //     }

    //     workboxRecordPublishers.clear()
    // }

}

export default SubscriptionHandler