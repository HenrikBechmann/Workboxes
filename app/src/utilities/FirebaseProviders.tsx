// contexts.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, { useContext, useEffect, useRef, useState } from 'react'

// firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from "firebase/storage"
import firebaseConfig from '../firebaseConfig'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// FirebaseProvider

const firebaseApp = initializeApp(firebaseConfig);
const FirebaseAppContext = React.createContext(firebaseApp)

const auth = getAuth(firebaseApp)
const AuthContext = React.createContext(auth)

const UserContext = React.createContext(null)

const firestoreDb = getFirestore(firebaseApp)
const FirestoreContext = React.createContext(firestoreDb)

const storage = getStorage(firebaseApp)
const StorageContext = React.createContext(storage)

const FirebaseProviders = ({children}) => {

    return <FirebaseAppContext.Provider value = {firebaseApp}>
    <AuthContext.Provider value = {auth} >
    <UserProvider>
    <FirestoreContext.Provider value = {firestoreDb}>
    <StorageContext.Provider value = {storage}>
        {children}
    </StorageContext.Provider>
    </FirestoreContext.Provider>
    </UserProvider>
    </AuthContext.Provider>
    </FirebaseAppContext.Provider>
}

export default FirebaseProviders

// special requirements for onAuthStateChanged
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
            console.log('user in FirebaseProviders', user)
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

// context access

const useFirebaseApp = () => {
    return useContext(FirebaseAppContext)
}

const useAuth = () => {
    return useContext(AuthContext)
}

const useUser = () => {
    return useContext(UserContext)
}

const useFirestoreDb = () => {
    return useContext(FirestoreContext)
}

const useStorage = () => {
    return useContext(StorageContext)
}

export {
    useFirebaseApp,
    useAuth,
    useUser,
    useFirestoreDb,
    useStorage,
}

