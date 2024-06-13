// workboxHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

class WorkboxHandler {
    constructor(workboxID, workboxSessionID) {

        this.workboxSessionID = workboxSessionID
        this.workboxID = workboxID

    }

    workboxID
    workboxSessionID
    private _workboxRecord

    set setWorkboxRecord (setRecord) {
        this._workboxRecord = setRecord
        this.loadWorkboxSnapshot()
    }

    private async loadWorkboxSnapshot() {

    }

    async saveWorkboxRecord() {

    }

}

export default WorkboxHandler