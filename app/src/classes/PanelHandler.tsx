// PanelHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import { 
    doc, collection, 
    getDoc, setDoc, updateDoc, // deleteDoc
    query, where, orderBy, getDocs,
    arrayUnion, arrayRemove,
    increment, serverTimestamp,
    runTransaction, writeBatch,
} from 'firebase/firestore'

import { updateDocumentSchema } from '../system/utilities'

class PanelHandler {

    constructor(workspaceHandler, db, errorControl) {
        this.workspaceHandler = workspaceHandler
        this.db = db
        this.errorControl = errorControl
    }

    workspaceHandler
    db
    errorControl

}

export default PanelHandler