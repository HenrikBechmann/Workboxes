// contexts.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, { useContext, useEffect, useRef, useState } from 'react'

// firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from "firebase/storage"

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

export const FirebaseAppProvider = ({children}) => {
    return (
        <FirebaseAppContext.Provider value = {firebaseApp}>
            {children}
        </FirebaseAppContext.Provider>
    )
}

export const useFirebaseApp = () => {
    return useContext(FirebaseAppContext)
}

// AuthProvider

const auth = getAuth(firebaseApp)

const AuthContext = React.createContext(auth)

export const AuthProvider = ({children}) => {
    return (
        <AuthContext.Provider value = {auth} >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}

// UserProvider

const UserContext = React.createContext(null)

export const UserProvider = ({children}) => {

    const [user, setUser] = useState(null)
    const authStateUnsubscribeRef = useRef(null)
    const isMountedRef = useRef(true)

    useEffect(()=>{

        return () => {
            isMountedRef.current = false
        }

    },[])

    useEffect(()=>{

        isMountedRef.current = true
        authStateUnsubscribeRef.current = onAuthStateChanged(auth, (user) => {
            // https://firebase.google.com/docs/reference/js/auth.user
            setUser(user)
        })

        return () => {
            if (!isMountedRef.current) {
                authStateUnsubscribeRef.current()
            }
        }

    },[])

    return (
        <UserContext.Provider value = {user} >
            {children}
        </UserContext.Provider>
    )

}

export const useUser = () => {
    return useContext(UserContext)
}

// FirestoreProvider

const firestoreDb = getFirestore(firebaseApp)

const FirestoreContext = React.createContext(firestoreDb)

export const FirestoreProvider = ({children}) => {
    return (
        <FirestoreContext.Provider value = {firestoreDb}>
            {children}
        </FirestoreContext.Provider>
    )
}

export const useFirestoreDb = () => {
    return useContext(FirestoreContext)
}

// StorageProvider

const storage = getStorage(firebaseApp)

const StorageContext = React.createContext(storage)

export const StorageProvider = ({children}) => {
    return (
        <StorageContext.Provider value = {storage}>
            {children}
        </StorageContext.Provider>
    )
}

export const useStorage = () => {
    return useContext(StorageContext)
}

// CloudFunctionsProvider ?

