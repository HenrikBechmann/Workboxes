// App.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, { useState, useEffect } from 'react'

// firebase
import { getAuth } from 'firebase/auth'
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// reactfire
import { useFirebaseApp, AuthProvider, useInitFirestore, FirestoreProvider, AppCheckProvider } from 'reactfire'

// chakra
import { ChakraProvider } from '@chakra-ui/react'

const App = () => {

    const APP_CHECK_TOKEN = '6LdJ9gwpAAAAAAbTlVr_PRdMLcwhFSfbSO_AruxN' // for tribalopolis-dev.firebaseapp.com
    const app = useFirebaseApp()
    const auth = getAuth(app)

    const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(APP_CHECK_TOKEN),
        isTokenAutoRefreshEnabled: true,
    });

    const [appState, setAppState] = useState('setup')

    const { status:firestoreStatus, data: firestoreInstance } = useInitFirestore(async (firebaseApp) => {
        const db = initializeFirestore(firebaseApp, {})
        await enableIndexedDbPersistence(db)
        return db
    })

    useEffect(()=>{

        if (firestoreStatus !== 'success') { // 'success', 'loading', 'error'
            setAppState(firestoreStatus)
        } else {
            setAppState('ready')
        }

    },[firestoreStatus])

    return (
      
        <AuthProvider sdk = {auth}>
        <AppCheckProvider sdk={appCheck}>
            {appState == 'ready'
                ? <FirestoreProvider sdk={firestoreInstance}>
                    <ChakraProvider>
                        <div>Hello, world!</div>
                    </ChakraProvider>
                  </FirestoreProvider>
                : <div>Waiting...</div>
            }
        </AppCheckProvider>
        </AuthProvider>

    )
  
}

export default App