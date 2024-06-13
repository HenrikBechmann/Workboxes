// workboxHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

class WorkboxHandler {
    constructor( workboxSessionID, workboxID ) {

        this.workboxSessionID = workboxSessionID
        this.workboxID = workboxID

    }

    workboxID
    workboxSessionID
    workboxRecord
    private _setWorkboxRecord

    set setWorkboxRecord (setRecord) {
        this._setWorkboxRecord = setRecord
        this.loadWorkboxSnapshot()
    }

    get setWorkboxRecord() {
        return this._setWorkboxRecord
    }

    private async loadWorkboxSnapshot() {

    }

    async saveWorkboxRecord() {

    }

}

export default WorkboxHandler