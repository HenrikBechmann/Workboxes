// App.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, { useState, useEffect } from 'react'

// firebase
import { getAuth } from 'firebase/auth'
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
// import FirestoreSettings from 'firebase-admin' // fail

// reactfire
import { useFirebaseApp, AuthProvider, useInitFirestore, FirestoreProvider, AppCheckProvider } from 'reactfire'

// local
import Tribalopolis from './Tribalopolis'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// chakra
import { ChakraProvider } from '@chakra-ui/react'

const App = () => {

    const app = useFirebaseApp()

    // ------------- TODO failed appcheck attempts --------------
    // self['FIREBASE_APPCHECK_DEBUG_TOKEN'] = true;
    // for AppCheck debug: 005B512D-5DE0-4D2C-A2E5-0878A53A514A??
    // const APP_CHECK_TOKEN = '005B512D-5DE0-4D2C-A2E5-0878A53A514A' // for debug??
    // const APP_CHECK_TOKEN = 'B2A3D5A5-0F86-49D5-88BD-F7D66622468F' // debug
    // error: App Check debug token: bf1e4747-fb4a-4d04-8a0c-2b53cb1b63b7. // not entered
    // You will need to add it to your app's App Check settings in the Firebase console for it to work.
    // const APP_CHECK_TOKEN = "6LdJ9gwpAAAAAAbTlVr_PRdMLcwhFSfbSO_AruxN" // for tribalopolis-dev.firebaseapp.com
    // const appCheck = initializeAppCheck(app, {
    //     provider: new ReCaptchaV3Provider(APP_CHECK_TOKEN), // generates 400 error
    //     isTokenAutoRefreshEnabled: true,
    // })

    const auth = getAuth(app)

    const [appState, setAppState] = useState('setup')

    const { status:firestoreStatus, data: firestoreInstance } = useInitFirestore(async (firebaseApp) => {
        const db = initializeFirestore(firebaseApp, {})
        await enableIndexedDbPersistence(db) // TODO console message says this is to be deprecated...
            // use `FirestoreSettings.cache` instead -- firebase-admin? source and specs not apparent
            // FirestoreSettings.firestore // failed attempt
        return db
    })

    useEffect(()=>{ // TODO revise for all possibilities; add SDKs

        if (firestoreStatus !== 'success') { // 'success', 'loading', 'error'
            setAppState(firestoreStatus)
        } else {
            setAppState('ready')
        }

    },[firestoreStatus])

    return (
      
        // <AppCheckProvider sdk={appCheck}>
        <AuthProvider sdk = {auth}>
            {appState == 'ready'
                ? <FirestoreProvider sdk={firestoreInstance}>
                    <ChakraProvider>
                        <Tribalopolis />
                    </ChakraProvider>
                  </FirestoreProvider>
                : <div>Waiting...</div>
            }
        </AuthProvider>
        // </AppCheckProvider>

    )
  
}

export default App