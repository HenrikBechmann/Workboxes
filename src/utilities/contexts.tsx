// contexts.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, {useContext} from 'react'

// firebase
import { getAuth } from 'firebase/auth'
// TODO implement firestore
import { initializeApp } from "firebase/app";
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// FirebaseProvider
const firebaseConfig = {
    apiKey: "AIzaSyAno9l7uKUR6SSI5M_cGqonZhw6JUQfrAk",
    authDomain: "tribalopolis-dev.firebaseapp.com",
    projectId: "tribalopolis-dev",
    storageBucket: "tribalopolis-dev.appspot.com",
    messagingSenderId: "79911740938",
    appId: "1:79911740938:web:5821518cb4c8bb76caa1f3",
    measurementId: "G-D58TT5J5J2"
};

const firebaseApp = initializeApp(firebaseConfig);

const FirebaseAppContext = React.createContext(firebaseApp)

export const FirebaseProvider = ({children}) => {
    return (
        <FirebaseAppContext.Provider value = {firebaseApp}>
            {children}
        </FirebaseAppContext.Provider>
    )
}

export const useFirebaseApp = () => {
    return useContext(FirebaseAppContext)
}

// UserProvider


// FirestoreProvider


// StorageProvider


// CloudFunctionsProvider

