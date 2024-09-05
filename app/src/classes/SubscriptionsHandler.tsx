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


    async subscribeToDomainRecord(domainSubscriptionControlData) { // domain and member records
        const 
            { domainRecordPublishers } = this.publishers,
            domainID = domainSubscriptionControlData.domain.id

        if (!domainRecordPublishers.has(domainID)) {
            const 
                workspaceID = this.workspaceHandler.workspaceRecord.profile.workspace.id,
                userID = this.userID,
                domainRecordPublisher = 
                    new DomainRecordPublisher( domainID, this.workspaceHandler )

            domainRecordPublishers.set(domainID, domainRecordPublisher)

            await domainRecordPublisher.openSnapshot()
        }

        const domainRecordPublisher = domainRecordPublishers.get(domainID)
        domainRecordPublisher.subscribe(domainSubscriptionControlData)
        
    }

    async unsubscribeFromDomainRecord(domainSubscriptionControlData) {
        
        const { domainRecordPublishers } = this.publishers
        const 
            domainID = domainSubscriptionControlData.domain.id

        if (!domainRecordPublishers.has(domainID)) {
            return
        }

        const domainRecordPublisher = domainRecordPublishers.get(domainID)
        await domainRecordPublisher.unSubscribe(domainSubscriptionControlData)

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

        console.log('subscribeToWorkboxRecord', workboxSubscriptionControlData)

        const 
            { workboxRecordPublishers } = this.publishers,
            workboxID = workboxSubscriptionControlData.workbox.id

        if (!workboxRecordPublishers.has(workboxID)) {

            console.log('setting up WorkboxRecordPublisher')
            const 
                userID = this.userID,
                workboxRecordPublisher = 
                    new WorkboxRecordPublisher( workboxID, this.workspaceHandler )

            workboxRecordPublishers.set(workboxID, workboxRecordPublisher)

            await workboxRecordPublisher.openSnapshot()
        }

        const workboxRecordPublisher = workboxRecordPublishers.get(workboxID)
        workboxRecordPublisher.subscribe(workboxSubscriptionControlData)
        
    }

    async unsubscribeFromWorkboxRecord(workboxSubscriptionControlData) {
        const { workboxRecordPublishers } = this.publishers
        const 
            workboxID = workboxSubscriptionControlData.workbox.id

        if (!workboxRecordPublishers.has(workboxID)) {
            return
        }

        const workboxRecordPublisher = workboxRecordPublishers.get(workboxID)
        await workboxRecordPublisher.unSubscribe(workboxSubscriptionControlData)

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