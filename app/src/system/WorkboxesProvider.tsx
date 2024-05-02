// WorkboxesProvider.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import React, { useEffect, useRef, useState, createContext, useContext } from 'react'
// import { useNavigate } from 'react-router-dom'

// firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, increment, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { getStorage } from "firebase/storage"
import { getFunctions, httpsCallable } from "firebase/functions"
import firebaseConfig from '../firebaseConfig'

// workbox
import { updateDocumentSchema } from './utilities'
import snapshotControl from './snapshotControlClass'

const 
    firebaseApp = initializeApp(firebaseConfig),

    // initialize firebase resources
    auth = getAuth(firebaseApp),
    firestore = getFirestore(firebaseApp),
    storage = getStorage(firebaseApp),

    // make firebase resources available
    AuthContext = createContext(auth),
    FirestoreContext = createContext(firestore),
    StorageContext = createContext(storage),

    // make workboxes resources available
    SnapshotControlContext = createContext(snapshotControl),
    errorArray = [],
    ErrorControlContext = createContext(errorArray),

    // for UserProvider
    UserAuthDataContext = createContext(null),
    UserRecordsContext = createContext(null),
    SystemRecordsContext = createContext(null),
    WorkspaceSelectionContext = createContext(null)

const WorkboxesProvider = ({children}) => {

    return <AuthContext.Provider value = {auth} >
    <FirestoreContext.Provider value = {firestore}>
    <StorageContext.Provider value = {storage}>
    <UserProvider>
        {children}
    </UserProvider>
    </StorageContext.Provider>
    </FirestoreContext.Provider>
    </AuthContext.Provider>
}

export default WorkboxesProvider

// special requirements for onAuthStateChanged
export const UserProvider = ({children}) => {

    const 
        [userState, setUserState] = useState('setup'),
        // for contexts...
        [userAuthData, setUserData] = useState(undefined), // undefined before call; null after logout
        [userRecords, setUserRecords] = useState({user:null, account:null, domain:null}),
        [systemRecords, setSystemRecords] = useState({settings:null}),
        [workspaceSelection, setWorkspaceSelection] = useState({workspace:{id:null, name:null},setWorkspaceSelection:null}),

        // bootstrap resources
        db = useFirestore(),
        userAuthDataRef = useRef(null),
        userRecordsRef = useRef(null),

        // bootstrap control
        authStateUnsubscribeRef = useRef(null),
        isMountedRef = useRef(true),
        baseRecordsAvailableRef = useRef(true),
        errorControl = useErrorControl(),
        errorControlRef = useRef(null)

    userAuthDataRef.current = userAuthData
    userRecordsRef.current = userRecords
    errorControlRef.current = errorControl

    useEffect(()=>{
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }

    },[])

    useEffect(()=>{
        setWorkspaceSelection((previousState) => {
            previousState.setWorkspaceSelection = setWorkspaceSelection
            return previousState
        })
    },[])

    async function updateLogins() {
        try {
            await updateDoc(doc(db, 'system','usage'),
                {
                    'logins':increment(1)
                }
            )
        } catch(error) {
            console.log('error incrementing logins', error)
            errorControl.push({description:'error incrementing logins',error})
        }
    }

    async function getSystemRecords() {

        if (!systemRecords.settings) {
            try {
                const systemSettings = await getDoc(doc(db, 'system','settings'))
                const systemSettingsData = systemSettings.data()
                setSystemRecords({settings:systemSettingsData})
            } catch (error) {
                console.log('error getting system settings', error)
                errorControl.push({description:'error getting system settings',error})
            }
        }

    }

    useEffect(()=>{

        isMountedRef.current = true

        // console.log('subscribing to onAuthStateChanged')
        authStateUnsubscribeRef.current = onAuthStateChanged(auth, async (user) => {

            let userAuthData = null

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
                    console.log('error getting isAdmin', error)
                    superUser.errorCondition = true
                    errorControlRef.current.push({description:'error getting isAdmin',error})
                }

                userAuthData = {
                    authUser:user,
                    sysadminStatus:superUser,
                }
                updateLogins()
                setUserState('useridentified')
    
            } else { // unsubscribe firestore listeners
                snapshotControl.unsubAll()
            }

            setUserData(userAuthData)

        })

        return () => {
            if (!isMountedRef.current) {
                authStateUnsubscribeRef.current()
            }
        }

    },[])
    
    async function addUserBaseRecords(userAuthData) {

        const
            accountDocRef = doc(collection(db, 'accounts')),
            domainDocRef = doc(collection(db, 'domains')),
            workboxDocRef = doc(collection(db, 'workboxes'))

        const {displayName, photoURL, uid} = userAuthData.authUser

        const userRecord = updateDocumentSchema('users','standard',{},{
            profile: {
              user: {
                id: uid,
                name: displayName,
                email_name: displayName,
                image: {
                  source: photoURL,
                },
                date_joined: serverTimestamp(),
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

        const accountRecord = updateDocumentSchema('accounts','standard', {}, {
            profile: {
              account: {
                id: accountDocRef.id,
                name: displayName,
                image: {
                  source: photoURL,
                },
                date_joined: serverTimestamp(),
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

        const domainRecord = updateDocumentSchema('domains','standard',{},{
            profile: {
                roles: {
                    is_userdomain: true,
                },
                domain: {
                  id: domainDocRef.id,
                  name: displayName,
                  image: {
                    source: photoURL,
                  },
                  date_joined: serverTimestamp(),
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

        const workboxRecord = updateDocumentSchema('workboxes','collection',{},{
            version: 0,
            generation: 0,
            profile: {
              workbox: {
                id: workboxDocRef.id,
                name: displayName,
                image: {
                  source: photoURL,
                },
              },
              roles: {
                  read: "member",
                  is_domainworkbox: true,
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

        try {
            await setDoc(doc(db,'users',uid),userRecord)
            await setDoc(accountDocRef, accountRecord)
            await setDoc(domainDocRef, domainRecord)
            await setDoc(workboxDocRef, workboxRecord)
        } catch(error) {
            console.log('error getting setting initial userRecords', error)
            errorControl.push({description:'error getting setting initial userRecords',error})
        }

        setUserState('baserecordsavailable')

    }

    // open base listeners for user: user, account, and domain records
    useEffect(()=>{

        if (userState == 'useridentified') {

            getSystemRecords()

            const userIndex = "UserProvider.users." + userAuthDataRef.current.authUser.uid
            if (!snapshotControl.has(userIndex)) {
                snapshotControl.create(userIndex)
                const userAuthData = userAuthDataRef.current
                // console.log('subscribing to user document', userAuthData.authUser.uid)
                const unsubscribeuser = 
                    onSnapshot(doc(db, 'users', userAuthData.authUser.uid), (returndoc) =>{
                        snapshotControl.incrementCallCount(userIndex, 1)
                        const userRecord = returndoc.data()

                        if (!userRecord) {

                            baseRecordsAvailableRef.current = false
                            addUserBaseRecords(userAuthData)
                        } else {

                            setUserRecords((previousState) => {
                               previousState.user = userRecord
                               return {...previousState}
                            })
                            if (!snapshotControl.getSchemaChecked(userIndex)) {
                                snapshotControl.setSchemaChecked(userIndex)
                                const updatedRecord = updateDocumentSchema('users', 'standard',userRecord)
                                if (!Object.is(userRecord, updatedRecord)) {

                                    setDoc(doc(db,'users',userAuthData.authUser.uid),updatedRecord)

                                }
                            }
                            setUserState('userrecordacquired')
                        }
                    })

                snapshotControl.registerUnsub(userIndex, unsubscribeuser)
            }
        }

        if ((userState == 'userrecordacquired' && baseRecordsAvailableRef.current) 
            || userState == 'baserecordsavailable' ) {

            const 
                userRecords = userRecordsRef.current,
                userRecord = userRecords.user,
                accountID = userRecord.profile.account.id,
                domainID = userRecord.profile.domain.id

            const accountIndex = "UserProvider.accounts." + accountID
            if (!snapshotControl.has(accountIndex)) {
                snapshotControl.create(accountIndex)

                const unsubscribeaccount = 
                    onSnapshot(doc(db, "accounts",accountID), (returndoc) =>{
                        snapshotControl.incrementCallCount(accountIndex, 1)
                        const accountRecord = returndoc.data()
                        // console.log('snapshot of accountRecord',accountRecord)
                        setUserRecords((previousState) => {
                           previousState.account = accountRecord
                           return {...previousState}
                        })
                        if (!snapshotControl.getSchemaChecked(accountIndex)) {
                            snapshotControl.setSchemaChecked(accountIndex)
                            const updatedRecord = updateDocumentSchema('accounts', 'standard',accountRecord)
                            if (!Object.is(accountRecord, updatedRecord)) {

                                setDoc(doc(db,'accounts',accountID),updatedRecord)

                            }
                        }
                    })

                snapshotControl.registerUnsub(accountIndex, unsubscribeaccount)
            }

            const domainIndex = "UserProvider.domains." + domainID
            if (!snapshotControl.has(domainIndex)) {
                snapshotControl.create(domainIndex)

                const unsubscribedomain = 
                    onSnapshot(doc(db, "domains",domainID), (returndoc) =>{
                        snapshotControl.incrementCallCount(domainIndex, 1)
                        const domainRecord = returndoc.data()
                        // console.log('snapshot of domainRecord',domainRecord)
                        setUserRecords((previousState) => {
                           previousState.domain = domainRecord
                           return {...previousState}
                        })
                        if (!snapshotControl.getSchemaChecked(domainIndex)) {
                            snapshotControl.setSchemaChecked(domainIndex)
                            const updatedRecord = updateDocumentSchema('domains', 'standard',domainRecord)
                            if (!Object.is(domainRecord, updatedRecord)) {

                                setDoc(doc(db,'domains',domainID),updatedRecord)

                            }
                        }
                    })

                snapshotControl.registerUnsub(domainIndex, unsubscribedomain)
             }
        }

        setUserState('ready')

    },[userState])

    return (
        <ErrorControlContext.Provider value = {errorArray}>
        <SnapshotControlContext.Provider value = {snapshotControl}>
        <SystemRecordsContext.Provider value = {systemRecords} >
        <WorkspaceSelectionContext.Provider value = {workspaceSelection} >
        <UserAuthDataContext.Provider value = {userAuthData} >
        <UserRecordsContext.Provider value = {userRecords}>
            {children}
        </UserRecordsContext.Provider>
        </UserAuthDataContext.Provider>
        </WorkspaceSelectionContext.Provider>
        </SystemRecordsContext.Provider>
        </SnapshotControlContext.Provider>
        </ErrorControlContext.Provider>
    )

} // UserProvider

// context access

const useAuth = () => {
    return useContext(AuthContext)
}

const useFirestore = () => {
    return useContext(FirestoreContext)
}

const useStorage = () => {
    return useContext(StorageContext)
}

const useSnapshotControl = () => {
    return useContext(SnapshotControlContext)
}

const useUserAuthData = () => {
    return useContext(UserAuthDataContext)
}

const useUserRecords = () => { // dynamic listeners
    return useContext(UserRecordsContext)
}

const useSystemRecords = () => { // static
    return useContext(SystemRecordsContext)
}

const useWorkspaceSelection = () => { // static
    return useContext(WorkspaceSelectionContext)
}

const useErrorControl = () => {
    return useContext(ErrorControlContext)
}

export {
    // firebase resources
    useAuth,
    useFirestore,
    useStorage,

    // workboxes resources
    useSnapshotControl,
    useErrorControl,
    useSystemRecords,
    useUserAuthData,
    useUserRecords,
    useWorkspaceSelection,
}

