// TibalopolisProvider.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, { useContext, useEffect, useRef, useState } from 'react'

import { useFirestore } from './FirebaseProviders'
import { doc, getDoc } from "firebase/firestore"

const types = new class {
    typeMap = new Map()
    async getType (type) {
        const 
            db = useFirestore(),
            { typeMap } = this,
            dataPack = {
                status:false,
                error:false,
                message:'',
                payload:null,
            }

        if (typeMap.has(type)) {

            const data = typeMap.get(type)

            dataPack.status = true
            dataPack.message = 'requested type has been retrieved'
            dataPack.payload = data

            return dataPack
            
        } else {
            let docRef
            if (type == 'metatype') {
                docRef = doc(db, "system", "metatype")
            } else {
                docRef = doc(db, "types", type)
            }

            let docSnap
            try {

                docSnap = await getDoc(docRef);

            } catch(e) {

                dataPack.message = e.message
                dataPack.error = true

                return dataPack
            }

            if (docSnap.exists()) {
                const data = docSnap.data()
                typeMap.set(type, data)

                dataPack.status = true
                dataPack.message = 'requested type has been retrieved'
                dataPack.payload = data

                return dataPack
            } else {
                dataPack.message = 'requested type not found'

                return dataPack
            }
        }
    }
}

