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
    setWorkboxHandlerContext
    CONTENT_PADDING_WIDTH = 10

    private _setWorkboxRecord

    set setWorkboxRecord (setRecord) {
        this._setWorkboxRecord = setRecord
        this.setWorkboxSnapshot()
    }

    get setWorkboxRecord() {
        return this._setWorkboxRecord
    }

    private async setWorkboxSnapshot() {

    }

    async saveWorkboxRecord() {

    }

    async getItemList(parms) {

    }

    async saveItems(items) {

    }

}

export default WorkboxHandler