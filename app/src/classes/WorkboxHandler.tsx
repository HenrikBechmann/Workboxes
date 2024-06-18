// workboxHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import { 
    getFirestore, 
    collection, doc, query, where,
    getDoc, getDocFromServer, getDocs, onSnapshot, setDoc, updateDoc,
    increment, serverTimestamp, 
    writeBatch, runTransaction
} from 'firebase/firestore'

import { updateDocumentSchema } from '../system/utilities'

class WorkboxHandler {
    constructor( {workboxID, db, usage, snapshotControl, onError, onFail, errorControl} ) {

        // this.workboxSessionID = workboxSessionID
        this.workboxID = workboxID
        this.db = db
        this.usage = usage
        this.snapshotControl = snapshotControl
        this.onError = onError
        this.onFail = onFail
        this.errorControl = errorControl

    }

    // constructor parameters
    workboxID
    db
    usage
    snapshotControl
    onError
    onFail
    errorControl
    unsubscribeworkbox

    // ongoing resources
    workboxRecord
    itemlistRecords = []
    settings
    innerFrameWidth
    trigger
    setWorkboxHandlerContext
    CONTENT_PADDING_WIDTH = 10

    private _setWorkboxState

    set setWorkboxState (setState) {
        this._setWorkboxState = setState
        this.setWorkboxSnapshot()
    }

    get setWorkboxState() {
        return this._setWorkboxState
    }

    private async setWorkboxSnapshot() {
        const 
            workboxCollection = collection(this.db, 'workboxes'),
            workboxIndex = 'Workbox.' + this.workboxID
    this.unsubscribeworkbox = 
        onSnapshot(doc(workboxCollection, this.workboxID), 
            async (returndoc) =>{
                this.snapshotControl.incrementCallCount(workboxIndex, 1)
                this.usage.read(1)
                
                let workboxRecord = returndoc.data()

                if (!workboxRecord) {
                    this.onFail()
                } else {

                    if (!this.snapshotControl.wasSchemaChecked(workboxIndex)) {

                        const updatedRecord = updateDocumentSchema('workboxes', workboxRecord.profile.type.name,workboxRecord)
                        if (!Object.is(workboxRecord, updatedRecord)) {
                            try {

                                await setDoc(doc(this.db,'workboxes',this.workboxID),updatedRecord)
                                this.usage.write(1)

                            } catch (error) {

                                const errdesc = 'error updating workbox record version. Check internet'
                                this.errorControl.push({description:errdesc,error})
                                console.log(errdesc,error)
                                this.onError()
                                return

                            }

                            workboxRecord = updatedRecord

                        }
                        this.snapshotControl.setSchemaChecked(workboxIndex)
                    }

                    this.workboxRecord = workboxRecord
                    this._setWorkboxState('updaterecord')

                }

            },(error) => {

                const errdesc = 'error for workbox record listener. Check permissions'
                this.errorControl.push({description:errdesc,error})
                console.log(errdesc,error)
                this.onError()
                return

            }
        )

    }

    async saveWorkboxRecord(workboxRecord) {

    }

    async getItemList(parms) {

    }

    async saveItems(items) {

    }

}

export default WorkboxHandler