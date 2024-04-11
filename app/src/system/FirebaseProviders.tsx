// FirebaseProviders.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, { useContext, useEffect, useRef, useState } from 'react'

// firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'
import { getStorage } from "firebase/storage"
import firebaseConfig from '../firebaseConfig'
import { getFunctions, httpsCallable } from "firebase/functions"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// FirebaseProvider

const 
    firebaseApp = initializeApp(firebaseConfig),
    FirebaseAppContext = React.createContext(firebaseApp),

    auth = getAuth(firebaseApp),
    AuthContext = React.createContext(auth),

    UserDataContext = React.createContext(null),

    UserRecordsContext = React.createContext(null),

    firestore = getFirestore(firebaseApp),
    FirestoreContext = React.createContext(firestore),

    storage = getStorage(firebaseApp),
    StorageContext = React.createContext(storage)

const FirebaseProviders = ({children}) => {

    return <FirebaseAppContext.Provider value = {firebaseApp}>
    <AuthContext.Provider value = {auth} >
    <UserProvider>
    <FirestoreContext.Provider value = {firestore}>
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

    const 
        [userState, setUserState] = useState('setup'),
        [userData, setUserData] = useState(undefined),
        [userRecords, setUserRecords] = useState({user:null, account:null, domain:null}),
        authStateUnsubscribeRef = useRef(null),
        isMountedRef = useRef(true),
        db = useFirestore(),
        userDataRef = useRef(null),
        unsubscribeUserRecordRef = useRef(null),
        unsubscribeAccountRecordRef = useRef(null),
        unsubscribeDomainRecordRef = useRef(null)

    // console.log('UserProvider: userState',userState)

    userDataRef.current = userData

    useEffect(()=>{
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }

    },[])

    useEffect(()=>{

        isMountedRef.current = true
        // console.log('subscribing to onAuthStateChanged')
        authStateUnsubscribeRef.current = onAuthStateChanged(auth, async (user) => {

            // console.log('call to onAuthStateChanged',user)

            let userData = null

            if (user) {
                const 
                    superUser = {
                        isSuperUser:false,
                        errorCondition:false,
                    },
                    functions = getFunctions(),
                    isAdminUser = httpsCallable(functions, 'isAdminUser')

                try {
                    const result:any = await isAdminUser()
                    superUser.isSuperUser = result.data.status
                } catch (error) {
                    superUser.errorCondition = true
                }

                userData = {
                    authUser:user,
                    sysadminStatus:superUser,
                    // userRecords,
                }
                // console.log('identified userdata', userData)
                setUserState('useridentified')
    
            } else {
                const unsubUserRecord = unsubscribeUserRecordRef.current
                unsubUserRecord && unsubUserRecord()
            }

            setUserData(userData)

        })

        return () => {
            if (!isMountedRef.current) {
                authStateUnsubscribeRef.current()
            }
        }

    },[])

    useEffect(()=>{

        if (userState == 'useridentified') {

            // console.log('registering user snapshot', userDataRef.current.authUser.uid)

            unsubscribeUserRecordRef.current = onSnapshot(doc(db, "users",userDataRef.current.authUser.uid), (doc) =>{
                const userRecord = doc.data()
                // console.log('updated userRecord', userRecord)
                setUserRecords((previousState) => {
                   previousState.user = userRecord
                   return {...previousState}
                })
            })

            setUserState('ready')
        }

    },[userState])

    return (
        <UserDataContext.Provider value = {userData} >
        <UserRecordsContext.Provider value = {userRecords}>
            {children}
        </UserRecordsContext.Provider>
        </UserDataContext.Provider>
    )

}

// context access

const useFirebaseApp = () => {
    return useContext(FirebaseAppContext)
}

const useAuth = () => {
    return useContext(AuthContext)
}

const useUserData = () => {
    return useContext(UserDataContext)
}

const useUserRecords = () => {
    return useContext(UserRecordsContext)
}

const useFirestore = () => {
    return useContext(FirestoreContext)
}

const useStorage = () => {
    return useContext(StorageContext)
}

export {
    useFirebaseApp,
    useAuth,
    useUserData,
    useUserRecords,
    useFirestore,
    useStorage,
}

