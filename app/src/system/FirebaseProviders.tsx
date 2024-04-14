// FirebaseProviders.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, { useEffect, useRef, useState, createContext, useContext } from 'react'

// firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'
import { getStorage } from "firebase/storage"
import firebaseConfig from '../firebaseConfig'
import { getFunctions, httpsCallable } from "firebase/functions"

import { updateDocumentVersion } from './utilities'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// FirebaseProvider

class snapshotControlClass {

    snapshotData = new Map()

    count = 0

    create = (index) => {
        this.snapshotData.set(index,{unsub:null, count:0, doccheck:false})
    }

    registerUnsub = (index, unsub) => {
        this.snapshotData.get(index).unsub = unsub
    }

    incrementCount = (index, count) => {
        this.snapshotData.get(index).count += count
    }

    unsub = (index) => {
        const 
            record = this.snapshotData.get(index),
            unsubscribe = record.unsub

        this.count += record.count

        unsubscribe && unsubscribe()

        this.snapshotData.delete(index)

    }

    getDoccheck = (index) => {
        return this.snapshotData.get(index).doccheck
    }

    setDoccheck = (index) => {
        this.snapshotData.get(index).doccheck = true
    }

    unsubAll = () => {

        // TODO: collect and save counts
        this.snapshotData.forEach((record) => {
            const unsubscribe = record.unsub
            this.count += record.count
            unsubscribe && unsubscribe()
        })

        this.snapshotData.clear()
    }

}

const snapshotControl = new snapshotControlClass() // singleton

const 
    // snapshotControl = new Map(),
    SnapshotControlContext = createContext(snapshotControl),
    firebaseApp = initializeApp(firebaseConfig),
    FirebaseAppContext = createContext(firebaseApp),

    auth = getAuth(firebaseApp),
    AuthContext = createContext(auth),

    UserDataContext = createContext(null),

    UserRecordsContext = createContext(null),

    firestore = getFirestore(firebaseApp),
    FirestoreContext = createContext(firestore),

    storage = getStorage(firebaseApp),
    StorageContext = createContext(storage)

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
        [userData, setUserData] = useState(undefined), // undefined before call; null after logout
        [userRecords, setUserRecords] = useState({user:null, account:null, domain:null}),
        authStateUnsubscribeRef = useRef(null),
        isMountedRef = useRef(true),
        db = useFirestore(),
        userDataRef = useRef(null),
        userRecordsRef = useRef(null)

    // console.log('UserProvider: userState',userState)

    userDataRef.current = userData
    userRecordsRef.current = userRecords

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
                }
                // console.log('identified userdata', userData)
                setUserState('useridentified')
    
            } else { // unsubscribe firestore listeners
                snapshotControl.unsubAll()
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
            const snapshotIndex = "UserProvider.users." + userDataRef.current.authUser.uid
            snapshotControl.create(snapshotIndex)
            const unsubscribe = 
                onSnapshot(doc(db, "users",userDataRef.current.authUser.uid), (doc) =>{
                    snapshotControl.incrementCount(snapshotIndex, 1)
                    const userRecord = doc.data()
                    setUserRecords((previousState) => {
                       previousState.user = userRecord
                       return {...previousState}
                    })
                    setUserState('userrecordcollected')
                })
            snapshotControl.registerUnsub(snapshotIndex, unsubscribe)
        }

        if (userState == 'userrecordcollected') {

            const 
                userRecords = userRecordsRef.current,
                userRecord = userRecords.user,
                accountID = userRecord?.profile?.account?.id,
                domainID = userRecord?.profile?.domain?.id


            // console.log('userrecordcollected: userRecords, accountID, domainID', 
            //     userRecords, accountID, domainID)

            if (accountID) { 
                const snapshotIndex = "UserProvider.accounts." + accountID
                snapshotControl.create(snapshotIndex)
                // console.log('subscribing to account', accountID)
                const unsubscribe = 
                    onSnapshot(doc(db, "accounts",accountID), (doc) =>{
                        snapshotControl.incrementCount(snapshotIndex, 1)
                        const accountRecord = doc.data()
                        setUserRecords((previousState) => {
                           previousState.account = accountRecord
                           return {...previousState}
                        })
                        setUserState('userrecordscompleted')
                    })
                snapshotControl.registerUnsub(snapshotIndex, unsubscribe)

            } else {

                // create record
            }

            if (domainID) {
                // console.log('subscribing to domain', domainID)
                const snapshotIndex = "UserProvider.domains." + domainID
                snapshotControl.create(snapshotIndex)
                const unsubscribe = 
                    onSnapshot(doc(db, "domains",domainID), (doc) =>{
                        snapshotControl.incrementCount(snapshotIndex, 1)
                        const domainRecord = doc.data()
                        // console.log('received domainRecord',domainRecord)
                        setUserRecords((previousState) => {
                           previousState.domain = domainRecord
                           return {...previousState}
                        })
                        setUserState('userrecordscompleted')
                    })
                snapshotControl.registerUnsub(snapshotIndex, unsubscribe)
                
            } else {

                // create record

            }

        }

        if (userState == 'userrecordscompleted') {

            // console.log('completed userRecords', userRecordsRef.current)

        }

        setUserState('ready')

    },[userState])

    return (
        <SnapshotControlContext.Provider value = {snapshotControl}>
        <UserDataContext.Provider value = {userData} >
        <UserRecordsContext.Provider value = {userRecords}>
            {children}
        </UserRecordsContext.Provider>
        </UserDataContext.Provider>
        </SnapshotControlContext.Provider>
    )

}

// context access

const useSnapshotControl = () => {
    return useContext(SnapshotControlContext)
}

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
    useSnapshotControl,
    useFirebaseApp,
    useAuth,
    useUserData,
    useUserRecords,
    useFirestore,
    useStorage,
}

