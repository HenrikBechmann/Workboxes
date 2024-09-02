// SubscriptionHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import DomainRecordPublisher from './DomainRecordPublisher'

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
        domainRecordPublishers:new Map()
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
                    new DomainRecordPublisher( domainID, this.workspaceHandler.snapshotControl, this.workspaceHandler )

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


}

export default SubscriptionHandler