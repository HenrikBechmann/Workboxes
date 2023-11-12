// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// App.tsx
import React, { useState, useEffect } from 'react'

import { getAuth } from 'firebase/auth'

import { initializeFirestore } from 'firebase/firestore'

import { useFirebaseApp, AuthProvider, useInitFirestore, FirestoreProvider } from 'reactfire'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { ChakraProvider, Button } from '@chakra-ui/react'

const App = () => {

    const [appState, setAppState] = useState('setup')

    const app = useFirebaseApp()
    const auth = getAuth(app)

    // TODO consider persitent database
    const { status:firestoreStatus, data: firestoreInstance } = useInitFirestore(async (firebaseApp) => {
        const db = initializeFirestore(firebaseApp, {})
        return db;
    })

    useEffect(()=>{

        if (firestoreStatus !== 'success') { // 'success', 'loading', 'error'
            setAppState(firestoreStatus)
        } else {
            setAppState('ready')
        }

    },[appState, firestoreStatus])

    return (
      
        <AuthProvider sdk = {auth}>
            {appState == 'ready'
                ? <FirestoreProvider sdk={firestoreInstance}>
                    <ChakraProvider>
                        <div>Hello, world!</div>
                    </ChakraProvider>
                  </FirestoreProvider>
                : <div>Waiting...</div>
            }
        </AuthProvider>

    )
  
}

export default App