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
        domainRecordPublishers:new Map(),
        workboxRecordPublishers: new Map(),
    }

    // ============================[ domain record subscriptions ]=========================

    // const subscriptionControlData = {
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


    async subscribeToDomainRecord(subscriptionControlData) { // domain and member records
        const 
            { domainRecordPublishers } = this.publishers,
            domainID = subscriptionControlData.domain.id

        if (!domainRecordPublishers.has(domainID)) {
            const 
                workspaceID = this.workspaceHandler.workspaceRecord.profile.workspace.id,
                userID = this.userID,
                domainRecordPublisher = 
                    new DomainRecordPublisher( domainID, this.workspaceHandler )

            await domainRecordPublisher.openSnapshot()
            domainRecordPublishers.set(domainID, domainRecordPublisher)
        }

        const domainRecordPublisher = domainRecordPublishers.get(domainID)
        domainRecordPublisher.subscribe(subscriptionControlData)
        
    }

    async unsubscribeFromDomainRecord(subscriptionControlData) {
        const { domainRecordPublishers } = this.publishers
        const 
            domainID = subscriptionControlData.domain.id

        if (!domainRecordPublishers.has(domainID)) {
            return
        }

        const domainRecordPublisher = domainRecordPublishers.get(domainID)
        await domainRecordPublisher.unSubscribe(subscriptionControlData)

        if (!domainRecordPublisher.subscriptions.size) {
            await domainRecordPublisher.closeSnapshot()
            domainRecordPublishers.delete(domainID)
        }

    }

    async clearSubscriptionsToDomainRecords() {
        const { domainRecordPublishers } = this.publishers

        const domainList = Array.from(domainRecordPublishers,([index, value]) => index)

        for (let index = 0; index < domainRecordPublishers.size; index++) {
            const domainID = domainList[index]
            const domainRecordPublisher = domainRecordPublishers.get(domainID)
            await domainRecordPublisher.unSubscribeAll()
            await domainRecordPublisher.closeSnapshot()
        }

        domainRecordPublishers.clear()
    }

    // ============================[ workbox record subscriptions ]=========================

    // const subscriptionControlData = {
    //     functions:{ // repository for direct calls
    //         updateWorkboxData: null,
    //     },
    //     workbox: {
    //         id,
    //         name,
    //     },
    //     subscriptionindex: <prefix>.<entityid>
    // }


    async subscribeToWorkboxRecord(subscriptionControlData) { // workbox record
        const 
            { workboxRecordPublishers } = this.publishers,
            workboxID = subscriptionControlData.workbox.id

        if (!workboxRecordPublishers.has(workboxID)) {
            const 
                workspaceID = this.workspaceHandler.workspaceRecord.profile.workspace.id,
                userID = this.userID,
                workboxRecordPublisher = 
                    new WorkboxRecordPublisher( workboxID, this.workspaceHandler )

            await workboxRecordPublisher.openSnapshot()
            workboxRecordPublishers.set(workboxID, workboxRecordPublisher)
        }

        const workboxRecordPublisher = workboxRecordPublishers.get(workboxID)
        workboxRecordPublisher.subscribe(subscriptionControlData)
        
    }

    async unsubscribeFromWorkboxRecord(subscriptionControlData) {
        const { workboxRecordPublishers } = this.publishers
        const 
            workboxID = subscriptionControlData.workbox.id

        if (!workboxRecordPublishers.has(workboxID)) {
            return
        }

        const workboxRecordPublisher = workboxRecordPublishers.get(workboxID)
        await workboxRecordPublisher.unSubscribe(subscriptionControlData)

        if (!workboxRecordPublisher.subscriptions.size) {
            await workboxRecordPublisher.closeSnapshot()
            workboxRecordPublishers.delete(workboxID)
        }

    }

    async clearSubscriptionsToWorkboxRecords() {
        const { workboxRecordPublishers } = this.publishers

        const workboxList = Array.from(workboxRecordPublishers,([index, value]) => index)

        for (let index = 0; index < workboxRecordPublishers.size; index++) {
            const workboxID = workboxList[index]
            const workboxRecordPublisher = workboxRecordPublishers.get(workboxID)
            await workboxRecordPublisher.unSubscribeAll()
            await workboxRecordPublisher.closeSnapshot()
        }

        workboxRecordPublishers.clear()
    }

}

export default SubscriptionHandler