// FirebaseProviders.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, { useEffect, useRef, useState, createContext, useContext } from 'react'

// firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
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

    incrementCallCount = (index, count) => {
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
    const addUserBaseRecords = (userData) => {

        const
            accountDocRef = doc(collection(db, 'accounts')),
            domainDocRef = doc(collection(db, 'domains')),
            workboxDocRef = doc(collection(db, 'workboxes'))

        const {displayName, photoURL, uid} = userData.authUser

        const userRecord = updateDocumentVersion('users','standard',{},{
            profile: {
              is_abandoned: false,
              user: {
                id: uid,
                name: displayName,
                image: {
                  source: photoURL,
                },
              },
              domain: {
                id: domainDocRef.id,
                name: displayName,
              },
              account: {
                id: accountDocRef.id,
                name: displayName,
              },
              commits: {
                created_by: {
                  id: uid,
                  name: displayName,
                },
                created_timestamp: serverTimestamp(),
              },
            },

        })

        const accountRecord = updateDocumentVersion('accounts','standard', {}, {
            profile: {
              account: {
                id: accountDocRef.id,
                name: displayName,
                image: {
                  source: photoURL,
                },
              },
              owner: {
                id: uid,
                name: displayName,
              },
              commits: {
                created_by: {
                  id: uid,
                  name: displayName,
                },
                created_timestamp: serverTimestamp(),
              },
              counts: {
              },
            },
        })

        const domainRecord = updateDocumentVersion('domains','standard',{},{
            profile: {
                is_userdomain: true,
                domain: {
                  id: domainDocRef.id,
                  name: displayName,
                  image: {
                    source: photoURL,
                  },
                },
                workbox: {
                    id: workboxDocRef.id,
                    name: displayName,
                },
                owner: {
                  id: uid,
                  name: displayName,
                },
                commits: {
                  created_by: {
                      id: uid, 
                      name: displayName
                  },
                  created_timestamp: serverTimestamp(),
                },
                counts: {
                  members: 0,
                  workboxes: 0,
                },
            }

        })

        const workboxRecord = updateDocumentVersion('workboxes','collection',{},{
            version: 0,
            generation: 0,
            profile: {
              is_domainworkbox: true,
              workbox: {
                id: workboxDocRef.id,
                name: displayName,
                image: {
                  source: photoURL,
                },
              },
              owner: {
                id: uid,
                name: displayName,
              },
              domain: {
                id: domainDocRef.id,
                name: displayName,
              },
              type: {
                name: "container",
                alias: "Container",
              },
              commits: {
                created_by: {
                  id: uid,
                  name: displayName,
                },
                created_timestamp: serverTimestamp(),
              },
              read_role: "member",
              counts: {
                links: 0,
                references: 0,
              },
            },
            document: {
              sections: [
                {
                  name: "standard",
                  alias: "Standard",
                  position: 0,
                  data: {
                    name: displayName,
                    image: {
                      source: photoURL,
                    },
                  },
                },
              ],
            },
        })

        console.log('base records: users, accounts, domains, workboxes', 
            userRecord, accountRecord, domainRecord, workboxRecord)

        // const docsets = []

        // docsets.push(setDoc(doc(db,'users',uid),userRecord))
        // docsets.push(setDoc(accountDocRef, accountRecord))
        // docsets.push(setDoc(domainDocRef, domainRecord))
        // docsets.push(setDoc(workboxDocRef, workboxRecord))

        // Promise.all(docsets).then((value) => {

        // },(reason) => {

        // })

    }

    useEffect(()=>{

        if (userState == 'useridentified') {

            // console.log('registering user snapshot', userDataRef.current.authUser.uid)
            const snapshotIndex = "UserProvider.users." + userDataRef.current.authUser.uid
            snapshotControl.create(snapshotIndex)
            const userData = userDataRef.current
            const unsubscribe = 
                onSnapshot(doc(db, "users",userData.authUser.uid), (doc) =>{
                    snapshotControl.incrementCallCount(snapshotIndex, 1)
                    const userRecord = doc.data()
                    console.log('userRecord',userRecord)
                    if (!userRecord) {
                        addUserBaseRecords(userData)
                    } else {
                        setUserRecords((previousState) => {
                           previousState.user = userRecord
                           return {...previousState}
                        })
                        setUserState('userrecordcollected')
                    }
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
                        snapshotControl.incrementCallCount(snapshotIndex, 1)
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
                        snapshotControl.incrementCallCount(snapshotIndex, 1)
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

