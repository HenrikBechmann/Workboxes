// DomainRecordPublisher.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*

    TODO: update all error handling related to this, particularly in WorkboxesProvider

*/

class DomainRecordPublisher {

    constructor(domainID, snapshotControl) {

        // TODO next 3 may not be needed
        this.domainID = domainID

        this.snapshotControl = snapshotControl
        
    }

    snapshotControl

    subscriptions = new Map()

    domainID

    domainSnapshotIndex
    memberSnapshotIndex

    domainRecord
    memberRecord

    async openSnapshot(setDomainSnapshots) {

        const {domainSnapshotIndex, memberSnapshotIndex} = await setDomainSnapshots(this.domainID, this.setDomainRecord, this.setMemberRecord)
        this.domainSnapshotIndex = domainSnapshotIndex
        this.memberSnapshotIndex = memberSnapshotIndex

    }

    async closeSnapshot() {

    }

    setDomainRecord = (domainRecord) => {

        this.domainRecord = domainRecord

    }

    setMemberRecord = (memberRecord) => {

        this.memberRecord = memberRecord

    }

    async subscribe (panelID, panelControlData) {

    }

    async unSubscribe(panelID) {

    }

    async unSubscribeAll() {

    }

}

export default DomainRecordPublisher
