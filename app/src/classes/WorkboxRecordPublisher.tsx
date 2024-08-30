// WorkboxRecordPublisher.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

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

}