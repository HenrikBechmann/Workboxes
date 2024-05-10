// WorkboxesProvider.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import React, { useEffect, useRef, useState, createContext, useContext } from 'react'
// import { useNavigate } from 'react-router-dom'

import { useToast } from '@chakra-ui/react'

// firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { 
    getFirestore, collection, doc, getDoc, getDocs, setDoc, query, where,
    updateDoc, increment, onSnapshot, serverTimestamp, writeBatch, runTransaction
} from 'firebase/firestore'
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

// TODO for save make sure account exists first
class Usage {

    read = (number) => {
        this.data.read += number
    }
    write = (number) => {
        this.data.write += number
    }
    create = (number) => {
        this.data.create += number
    }
    delete = (number) => {
        this.data.delete += number
    }
    login = (number) => {
        this.data.login += number
    }
    save = () => {
        // write to database
    }
    reset = () => {
        this.data = {
            read:0,
            write:0,
            create:0,
            delete:0,
            login:0,
        }
    }
    data = {
        read:0,
        write:0,
        create:0,
        delete:0,
        login:0,
    }

}

const usage = new Usage()

const UsageContext = createContext(usage)

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
        errorControlRef = useRef(null),
        usage = useUsage(),
        toast = useToast({duration:3000})

    userAuthDataRef.current = userAuthData
    userRecordsRef.current = userRecords
    errorControlRef.current = errorControl

    // console.log('userState',userState, userRecordsRef.current)

    useEffect(()=>{

        const localStorageData = localStorage.getItem('usagedata')
        if (localStorageData) {
            // alert('updating usage.data: ' + localStorageData)
            localStorage.removeItem('usagedata')
            const data = JSON.parse(localStorageData)
            for (let prop in data) {
                usage[prop](data[prop])                
            }
        }
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }

    },[])

    useEffect(()=>{

        let intervalID
        if (systemRecords.settings) {
            setTimeout(()=>{
                const data = {...usage.data}
                usage.reset()
                saveUsageData(data)
            },60000) // 1 minute after load, to catch up
            intervalID = setInterval(()=>{
                const data = {...usage.data}
                usage.reset()
                saveUsageData(data)
            },systemRecords.settings.timers.update_usage) // currently set to 6 minutes
        }

        return () => {
            clearInterval(intervalID)
        }

    },[systemRecords])

    useEffect(()=>{

        window.addEventListener('visibilitychange',saveOnVisibilityChange, true)

        return () => {

            document.removeEventListener('visibilitychange',saveOnVisibilityChange)

        }

    },[])

    const saveOnVisibilityChange = () => {

        // console.log('document.visibilityState',document.visibilityState)

        // TODO look for a way to determine how many apps are loaded (visibilityState is more about being active)

        // if (document.visibilityState == 'visible') {

        //     const visibilityInstances = localStorage.getItem('visibilityinstances')
        //     if (visibilityInstances) {
        //         let visibilityNumber = parseInt(visibilityInstances)
        //         visibilityNumber++
        //         localStorage.setItem('visibilityinstances', visibilityNumber.toString())
        //         if (visibilityNumber > 1) {
        //             toast({description:'more than one tab has an open Workboxes.app'})
        //         }
        //     } else {
        //         localStorage.setItem('visibilityinstances', '1')
        //     }

        // } else if (document.visibilityState == 'hidden') {

        //     const visibilityInstances = localStorage.getItem('visibilityinstances')
        //     if (visibilityInstances) {
        //         let visibilityNumber = parseInt(visibilityInstances)
        //         visibilityNumber--
        //         if (visibilityNumber >= 1) {
        //             localStorage.setItem('visibilityinstances', visibilityNumber.toString())
        //         } else {
        //             localStorage.removeItem('visibilityinstances')
        //         }
        //     } // else leave it alone
        // }

        if (document.visibilityState == 'hidden') {
            const data = {...usage.data}
            usage.reset()
            saveUsageData(data)
        }

    }
    async function saveUsageData(data) {

        // TODO check for existence of previous record. If found, merge that with the incoming
        localStorage.setItem('usagedata',JSON.stringify(data))
        if (!userAuthDataRef.current) return
        const 
            db = firestore,
            // data = usage.data,
            account = userRecordsRef.current.account,
            user = userRecordsRef.current.user,
            date = new Date(),
            month = date.getMonth() + 1,
            year = date.getFullYear(),
            monthStr = month.toString().padStart(2,'0'),
            yearStr = year.toString()

        if (!user.profile.flags.fully_registered) return

        // save workspace and panels to firestore
        // console.log('accountID, account', account?.profile.account.id, {...account})
        if (account?.profile.account.id) {
            // console.log('running saveUsageData')
            const 
                accountID = account?.profile.account.id,
                usageID = yearStr + '.' + monthStr,
                dbUsageCollection = collection(db, 'accounts', accountID, 'usage'),
                dbUsageDocRef = doc(dbUsageCollection, usageID)
            try {
                await runTransaction(db, async (transaction) => {

                    const dbusageDoc = await transaction.get(dbUsageDocRef)

                    if (dbusageDoc.exists()) { // update record

                        transaction.update(dbUsageDocRef,{
                            'usage.read':increment(data.read + 1),
                            'usage.write':increment(data.write + 1),
                            'usage.create':increment(data.create),
                            'usage.delete':increment(data.delete),
                            'usage.login':increment(data.login)
                        })

                    } else { // create new record
                        // console.log('creating new record')
                        transaction.set(dbUsageDocRef,{
                            year,
                            month,
                            usage: {
                                read:data.read + 1, 
                                write:data.write,
                                create:data.create + 1,
                                delete:data.delete,
                                login:data.login,
                            }
                        })
                    }
                })
            } catch (error) {
                console.log('transaction error saving usage data')
                return
                // nothing
            }
            localStorage.removeItem('usagedata') // has been successfully set
        }
    } 

    async function saveWorkspaceData() {
        // save workspace and panels to firestore
    } 

    useEffect(()=>{
        setWorkspaceSelection((previousState) => {
            previousState.setWorkspaceSelection = setWorkspaceSelection
            return previousState
        })
    },[])

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
            usage.read(1)
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
                usage.login(1)
                setUserState('useridentified')
    
            } else { // unsubscribe firestore listeners
                snapshotControl.unsubAll()
            }

            userAuthDataRef.current = userAuthData // in case visibilitychange needs it in a hurry
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
                updated_by: {
                  id: uid,
                  name: displayName,
                },
                updated_timestamp: serverTimestamp(),
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
                updated_by: {
                  id: uid,
                  name: displayName,
                },
                updated_timestamp: serverTimestamp(),
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
                  updated_by: {
                      id: uid, 
                      name: displayName
                  },
                  updated_timestamp: serverTimestamp(),
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
                name: "appuser",
                alias: "App User",
              },
              commits: {
                created_by: {
                  id: uid,
                  name: displayName,
                },
                created_timestamp: serverTimestamp(),
                updated_by: {
                  id: uid,
                  name: displayName,
                },
                updated_timestamp: serverTimestamp(),
              },
              counts: {
                connectors: 0,
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
            const batch = writeBatch(db)
            batch.set(doc(db,'users',uid),userRecord)
            batch.set(accountDocRef, accountRecord)
            batch.set(domainDocRef, domainRecord)
            batch.set(workboxDocRef, workboxRecord)
            await batch.commit()
        } catch(error) {
            console.log('error getting setting initial userRecords', error)
            errorControl.push({description:'error getting setting initial userRecords',error})
        }
        usage.create(4)
        setUserState('baserecordscreated')

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
            || userState == 'baserecordscreated' ) {

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
        <UsageContext.Provider value = {usage}>
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
        </UsageContext.Provider>
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

const useUsage = () => {
    return useContext(UsageContext)
}

export {
    // firebase resources
    useAuth,
    useFirestore,
    useStorage,
    useUsage,

    // workboxes resources
    useSnapshotControl,
    useErrorControl,
    useSystemRecords,
    useUserAuthData,
    useUserRecords,
    useWorkspaceSelection,
}

