// WorkboxesProvider.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

/*
    TODO
    check unsub with error condition
*/
import React, { useEffect, useRef, useState, createContext, useContext } from 'react'
// import { useNavigate } from 'react-router-dom'

import { useToast } from '@chakra-ui/react'

// firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { 
    getFirestore, 
    collection, doc, query, where,
    getDoc, getDocFromServer, getDocs, onSnapshot, setDoc, updateDoc,
    increment, serverTimestamp, 
    writeBatch, runTransaction
} from 'firebase/firestore'
import { getStorage } from "firebase/storage"
import { getFunctions, httpsCallable } from "firebase/functions"

import firebaseConfig from '../firebaseConfig'

// workbox
import { updateDocumentSchema } from './utilities'
import SnapshotControl from '../classes/SnapshotControl'
import WorkspaceHandler from '../classes/WorkspaceHandler'

// =============================[ global ]============================

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
    snapshotControl = new SnapshotControl(),
    errorArray = [],
    ErrorControlContext = createContext(errorArray),
    workspaceHandlerInstance = new WorkspaceHandler(firestore,errorArray),
    SnapshotControlContext = createContext(snapshotControl),

    // for UserProvider
    UserAuthDataContext = createContext(null),
    UserRecordsContext = createContext(null),
    SystemRecordsContext = createContext(null),
    WorkspaceHandlerContext = createContext(null)

// --------------------------------[ usage data collection ]-----------------------

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
    filesave = (number) => {
        this.data.filesave += number
    }
    filedelete = (number) => {
        this.data.filedelete += number
    }
    reset = () => {
        this.data = {
            read:0,
            write:0,
            create:0,
            delete:0,
            login:0,
            filesave:0,
            filedelete:0,
        }
    }
    data = {
        read:0,
        write:0,
        create:0,
        delete:0,
        login:0,
        filesave:0,
        filedelete:0,
    }

}

const usage = new Usage()

const UsageContext = createContext(usage)

// =============================[ master component ]============================
// collection of providers

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

// ===========================[ UserProvider component]============================
// provides much context for app

export const UserProvider = ({children}) => {

    // --------------------------------[ data definitions ]-----------------------
    const 
        [userState, setUserState] = useState('setup'),
        // for contexts...
        [userAuthData, setUserAuthData] = useState(undefined), // undefined before call; null after logout
        [userRecords, setUserRecords] = useState({user:null, account:null, domain:null}),
        [systemRecords, setSystemRecords] = useState({settings:null}),
        [workspaceHandler, setWorkspaceHandler] = useState({ current: workspaceHandlerInstance }),
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
        toast = useToast({duration:4000})

    userAuthDataRef.current = userAuthData
    userRecordsRef.current = userRecords
    errorControlRef.current = errorControl

    // console.log('userState',userState, userRecordsRef.current)

    // --------------------------------[ initialization effects ]------------------------

    // isMounted
    useEffect(()=>{

        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
            errorArray.length = 0
        }

    },[])

    // event listener
    useEffect(()=>{

        window.addEventListener('visibilitychange',saveOnVisibilityChange, true)

        return () => {

            document.removeEventListener('visibilitychange',saveOnVisibilityChange)

        }

    },[])

    // local storage catch up
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

    },[])

    // initialize workspaceHandler with dispatchWorkspaceHandler function
    useEffect(()=>{
        setWorkspaceHandler((previousState) => {
            previousState.current.setWorkspaceHandler = setWorkspaceHandler
            previousState.current.usage = usage
            return {...previousState}
        })
    },[])

    // set up onAuthStateChanged event capture
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
                    // throw('test error on isAdminUser')
                    superUser.isSuperUser = result.data.status

                } catch (error) {

                    superUser.errorCondition = true
                    errorControlRef.current.push({description:'error verifying user rights. Check internet',error})
                    console.log('error verifying user rights. Check internet', error, errorControlRef.current)
                    setUserAuthData({...userAuthData})
                    setUserState('error')
                    return

                }

                userAuthData = {
                    authUser:user,
                    sysadminStatus:superUser,
                }
                workspaceHandler.current.userID = user.uid
                workspaceHandler.current.userName = user.displayName
                usage.login(1)
                setUserState('useridentified')
    
            } else { // unsubscribe firestore listeners
                snapshotControl.unsubAll()
                errorArray.length = 0
            }

            userAuthDataRef.current = userAuthData // in case visibilitychange needs it in a hurry
            setUserAuthData(userAuthData)

        })

        return () => {
            if (!isMountedRef.current) {
                authStateUnsubscribeRef.current()
            }
        }

    },[])
   
    // ---------------------------------[ state change effects ]----------------------------

    // set up automatic usage collection based on system settings
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

    // open base listeners for user, in sequence: user, account, and domain records
    useEffect(()=>{

        if (userState == 'useridentified') { // collect user record

            getSystemRecords() // asynchronous

            // open listener for user record
            const userIndex = "UserProvider.users." + userAuthDataRef.current.authUser.uid
            if (!snapshotControl.has(userIndex)) { // once only
                snapshotControl.create(userIndex)
                const userAuthData = userAuthDataRef.current
                const unsubscribeuser = 
                    onSnapshot(doc(collection(db, 'users'), userAuthData.authUser.uid), 
                        async (returndoc) =>{
                            snapshotControl.incrementCallCount(userIndex, 1)
                            usage.read(1)
                            const userRecord = returndoc.data()
                            if (!userRecord) { // new user, needs to be registered

                                baseRecordsAvailableRef.current = false // prevent premature listeners for account & domain
                                createUserBaseRecords(userAuthData) // this always looks for a connection failure

                            } else {

                                setUserRecords((previousState) => {

                                   previousState.user = userRecord
                                   return {...previousState}

                                })
                                if (!snapshotControl.wasSchemaChecked(userIndex)) {

                                    const updatedRecord = updateDocumentSchema('users', 'standard',userRecord)
                                    if (!Object.is(userRecord, updatedRecord)) {
                                        try {

                                            await setDoc(doc(db,'users',userAuthData.authUser.uid),updatedRecord)

                                        } catch (error) {

                                            errorControlRef.current.push({description:'error updating user record version. Check internet',error})
                                            console.log('error updating user record version. Check internet',error)
                                            setUserAuthData({...userAuthData})
                                            setUserState('error')
                                            return

                                        }

                                    }
                                    snapshotControl.setSchemaChecked(userIndex)
                                }

                                setUserState('userrecordacquired')
                                
                            }
                        },(error) => {

                            console.log('error for user record listener. Check permissions', error)
                            errorControl.push({description:'error for user record listener. Check permissions', error})
                            setUserAuthData({...userAuthData})
                            setUserState('error')
                            return

                        }
                    )

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
                    onSnapshot(doc(db, "accounts",accountID), 
                        async (returndoc) =>{
                            snapshotControl.incrementCallCount(accountIndex, 1)
                            usage.read(1)
                            const accountRecord = returndoc.data()
                            if (!accountRecord) { // error
                                errorControlRef.current.push({description:'error getting user account record.',error:null})
                                console.log('error getting user account record.')
                                setUserAuthData({...userAuthData})
                                setUserState('error')
                                return
                            }
                            setUserRecords((previousState) => {
                               previousState.account = accountRecord
                               return {...previousState}
                            })
                            if (!snapshotControl.wasSchemaChecked(accountIndex)) {
                                const updatedRecord = updateDocumentSchema('accounts', 'standard',accountRecord)
                                if (!Object.is(accountRecord, updatedRecord)) {

                                    try {
                                        await setDoc(doc(db,'accounts',accountID),updatedRecord)
                                    } catch (error) {

                                        errorControlRef.current.push({description:'error updating user account version. Check internet',error})
                                        console.log('error updating account record version. Check internet',error)
                                        setUserAuthData({...userAuthData})
                                        setUserState('error')
                                        return

                                    }

                                }
                                snapshotControl.setSchemaChecked(accountIndex)
                            }
                        }, (error) =>{

                            console.log('onSnapshot error for user account', error)
                            errorControl.push({description:'onSnapshot error for user account', error})
                            setUserAuthData({...userAuthData})
                            setUserState('error')
                            return

                        }
                    )

                snapshotControl.registerUnsub(accountIndex, unsubscribeaccount)
            }

            const domainIndex = "UserProvider.domains." + domainID
            if (!snapshotControl.has(domainIndex)) {
                snapshotControl.create(domainIndex)

                const unsubscribedomain = 
                    onSnapshot(doc(db, "domains",domainID), 
                        async (returndoc) =>{
                            snapshotControl.incrementCallCount(domainIndex, 1)
                            usage.read(1)
                            const domainRecord = returndoc.data()
                            if (!domainRecord) { // error
                                errorControlRef.current.push({description:'error getting user domain record.',error:null})
                                console.log('error getting user domain record.')
                                setUserAuthData({...userAuthData})
                                setUserState('error')
                                return
                            }
                            setUserRecords((previousState) => {
                               previousState.domain = domainRecord
                               return {...previousState}
                            })
                            if (!snapshotControl.wasSchemaChecked(domainIndex)) {
                                const updatedRecord = updateDocumentSchema('domains', 'standard',domainRecord)
                                if (!Object.is(domainRecord, updatedRecord)) {
                                    try {
                                        await setDoc(doc(db,'domains',domainID),updatedRecord)
                                    } catch(error) {

                                        errorControlRef.current.push({description:'error updating user domain version. Check internet',error})
                                        console.log('error updating account domain version. Check internet',error)
                                        setUserAuthData({...userAuthData})
                                        setUserState('error')
                                        return

                                    }

                                }
                                snapshotControl.setSchemaChecked(domainIndex)
                            }
                        }, (error) => {

                            console.log('onSnapshot error for user domain',error)
                            errorControl.push({description:'onSnapshot error for user domain',error})
                            setUserAuthData({...userAuthData})
                            setUserState('error')
                            return

                        }
                    )

                snapshotControl.registerUnsub(domainIndex, unsubscribedomain)
            }
            setUserState('ready')

        }

    },[userState])

    // -------------------------------[ actions ]----------------------

    const saveOnVisibilityChange = () => {

        if (document.visibilityState == 'hidden') {
            const data = {...usage.data}
            usage.reset()
            saveUsageData(data)
        }

    }

    async function saveUsageData(data) {

        // TODO check for existence of previous record. If found, merge that with the incoming

        // see if any data needs to be saved
        let dataToSave = false
        for (let prop in data) {
            if (data[prop]) {
                dataToSave = true
                break
            }
        }
        if (!dataToSave) return
        
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

        if (!user?.profile.flags.fully_registered) return

        // save workspace and panels to firestore
        // console.log('accountID, account', account?.profile.account.id, {...account})
        if (account?.profile.account.id) {
            // console.log('running saveUsageData')
            const 
                accountID = account.profile.account.id,
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

    async function getSystemRecords() {

        if (!systemRecords.settings) {
            try {

                const 
                    systemSettings = await getDoc(doc(db, 'system','settings')),
                    systemSettingsData = systemSettings.data()

                setSystemRecords({settings:systemSettingsData})

            } catch (error) {

                console.log('error getting system settings', error)
                errorControl.push({description:'error getting system settings',error})
                setUserAuthData({...userAuthData})
                setUserState('error')
                return
            }

            usage.read(1)
        }

    }
 
    // first time login only....
    async function createUserBaseRecords(userAuthData) {

        const 
            {displayName, photoURL, uid} = userAuthData.authUser,
            accountDocRef = doc(collection(db, 'accounts')),
            domainDocRef = doc(collection(db, 'domains')),
            workboxDocRef = doc(collection(db, 'workboxes')),
            userDocRef = doc(collection(db, 'users'),uid)

        // confirm absence of user record
        let userDoc
        try {

            userDoc = await getDocFromServer(userDocRef) // must come from server directly

        } catch (error) { // no internet connection

            errorControlRef.current.push({description:'error verifying user record. Check internet',error})
            console.log('error verifying user record. Check internet', error, errorControlRef.current)
            setUserAuthData({...userAuthData})
            setUserState('error')
            return

        }

        if (userDoc.exists()) { // problem -- should be empty

            errorControlRef.current.push({description:'inconsistent finding of user record. Check internet',error:null})
            console.log('inconsistent finding of user record. Check internet', errorControlRef.current)
            setUserAuthData({...userAuthData})
            setUserState('error')
            return

        }

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

            batch.set(userDocRef, userRecord)
            batch.set(accountDocRef, accountRecord)
            batch.set(domainDocRef, domainRecord)
            batch.set(workboxDocRef, workboxRecord)
            await batch.commit()

        } catch(error) {

            console.log('error getting setting initial userRecords', error)
            errorControl.push({description:'error getting setting initial userRecords',error})
            setUserAuthData({...userAuthData})
            setUserState('error')
            return

        }

        usage.create(4)
        setUserState('baserecordscreated')

    }

    return (
        <UsageContext.Provider value = {usage}>
        <ErrorControlContext.Provider value = {errorArray}>
        <SnapshotControlContext.Provider value = {snapshotControl}>
        <SystemRecordsContext.Provider value = {systemRecords} >
        <WorkspaceHandlerContext.Provider value = {workspaceHandler} >
        <UserAuthDataContext.Provider value = {userAuthData} >
        <UserRecordsContext.Provider value = {userRecords}>
            {children}
        </UserRecordsContext.Provider>
        </UserAuthDataContext.Provider>
        </WorkspaceHandlerContext.Provider>
        </SystemRecordsContext.Provider>
        </SnapshotControlContext.Provider>
        </ErrorControlContext.Provider>
        </UsageContext.Provider>
    )

} // UserProvider

// --------------------[ context access ]----------------

const useAuth = () => {
    return useContext(AuthContext)
}

const useFirestore = () => {
    return useContext(FirestoreContext)
}

const useStorage = () => {
    return useContext(StorageContext)
}

const useUsage = () => {
    return useContext(UsageContext)
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

const useWorkspaceHandler = () => {

    const 
        workspaceHandlerContext = useContext(WorkspaceHandlerContext),
        workspaceHandler = workspaceHandlerContext.current,
        { setWorkspaceHandler } = workspaceHandler,
        workspacePayload = {...workspaceHandlerContext}, // coerce dispatch
        dispatchWorkspaceHandler = (trigger) => {
            workspaceHandler.trigger = trigger
            setWorkspaceHandler(workspacePayload)
        }

    return [workspaceHandler, dispatchWorkspaceHandler] //, workspacePayload]

}

const useErrorControl = () => {
    return useContext(ErrorControlContext)
}

export {
    // firebase resources
    useAuth,
    useFirestore,
    useStorage,
    useUsage,

    // workboxes resources
    useSnapshotControl,
    useUserAuthData,
    useUserRecords,
    useSystemRecords,
    useWorkspaceHandler,
    useErrorControl,
}

