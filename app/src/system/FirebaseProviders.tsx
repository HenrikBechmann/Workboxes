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

    has = (index) => {
        return this.snapshotData.has(index)
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
        userRecordsRef = useRef(null),
        baseRecordsAvailableRef = useRef(true)

    // console.log('UserProvider: userState, userData, userRecords, snapshotControl.snapshotData\n',userState,'\n' ,userData, userRecords, snapshotControl.snapshotData)

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
                // console.log('acquired userdata', userData)
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
    
    async function addUserBaseRecords(userData) {

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

        // console.log('base records: users, accounts, domains, workboxes', 
        //     userRecord, accountRecord, domainRecord, workboxRecord)

        // const docsets = []

        // console.log('setting user document', uid, userRecord)
        await setDoc(doc(db,'users',uid),userRecord)
        // console.log('setting account document', accountDocRef.id, accountRecord)
        await setDoc(accountDocRef, accountRecord)
        // console.log('setting domain document', domainDocRef.id, domainRecord)
        await setDoc(domainDocRef, domainRecord)
        // console.log('setting workbox document', workboxDocRef.id, workboxRecord)
        await setDoc(workboxDocRef, workboxRecord)

        setUserState('baserecordsavailable')

    }

    useEffect(()=>{

        // console.log('responding to userState', userState)

        if (userState == 'useridentified') {

            // console.log('useEffect userState useridentified, userDataRef.current.authUser.uid', userDataRef.current.authUser.uid)
            const userIndex = "UserProvider.users." + userDataRef.current.authUser.uid
            if (!snapshotControl.has(userIndex)) {
                snapshotControl.create(userIndex)
                const userData = userDataRef.current
                // console.log('subscribing to user document', userData.authUser.uid)
                const unsubscribeuser = 
                    onSnapshot(doc(db, 'users', userData.authUser.uid), (doc) =>{
                        snapshotControl.incrementCallCount(userIndex, 1)
                        const userRecord = doc.data()
                        // console.log('snapshot of userRecord',userRecord)
                        if (!userRecord) {
                            baseRecordsAvailableRef.current = false
                            addUserBaseRecords(userData)
                        } else {
                            setUserRecords((previousState) => {
                               previousState.user = userRecord
                               return {...previousState}
                            })
                            // console.log('acquired userRecord', userRecord)
                            setUserState('userrecordacquired')
                        }
                    })
                snapshotControl.registerUnsub(userIndex, unsubscribeuser)
            }
        }

        if ((userState == 'userrecordacquired' && baseRecordsAvailableRef.current) 
            || userState == 'baserecordsavailable' ) {

            // console.log('useEffect userState userrecordacquired')

            const 
                userRecords = userRecordsRef.current,
                userRecord = userRecords.user,
                accountID = userRecord.profile.account.id,
                domainID = userRecord?.profile.domain.id

            const accountIndex = "UserProvider.accounts." + accountID
            if (!snapshotControl.has(accountIndex)) {
                snapshotControl.create(accountIndex)
                // console.log('subscribing to account document', accountID)
                const unsubscribeaccount = 
                    onSnapshot(doc(db, "accounts",accountID), (doc) =>{
                        snapshotControl.incrementCallCount(accountIndex, 1)
                        const accountRecord = doc.data()
                        // console.log('snapshot of accountRecord',accountRecord)
                        setUserRecords((previousState) => {
                           previousState.account = accountRecord
                           return {...previousState}
                        })
                    })
                snapshotControl.registerUnsub(accountIndex, unsubscribeaccount)
            }

            const domainIndex = "UserProvider.domains." + domainID
            if (!snapshotControl.has(domainIndex)) {
                snapshotControl.create(domainIndex)
                // console.log('subscribing to domain document', domainID)
                const unsubscribedomain = 
                    onSnapshot(doc(db, "domains",domainID), (doc) =>{
                        snapshotControl.incrementCallCount(domainIndex, 1)
                        const domainRecord = doc.data()
                        // console.log('snapshot of domainRecord',domainRecord)
                        setUserRecords((previousState) => {
                           previousState.domain = domainRecord
                           return {...previousState}
                        })
                    })
                snapshotControl.registerUnsub(domainIndex, unsubscribedomain)
             }
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

