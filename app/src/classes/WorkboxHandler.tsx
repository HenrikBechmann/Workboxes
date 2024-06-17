// workboxHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

class WorkboxHandler {
    constructor( workboxID ) {

        // this.workboxSessionID = workboxSessionID
        this.workboxID = workboxID

    }

    workboxID
    workboxRecord
    settings
    innerFrameWidth
    trigger

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

    async getItemList(parms) {

    }

    async saveItems(items) {

    }

}

export default WorkboxHandler