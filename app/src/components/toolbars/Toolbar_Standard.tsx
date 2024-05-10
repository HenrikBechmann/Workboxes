// Toolbar_Standard.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef, useState, useEffect} from 'react'
import { signOut } from "firebase/auth"
import { 
    doc, collection, 
    query, where, getDocs, orderBy, 
    getDoc, setDoc, updateDoc, deleteDoc, 
    increment, serverTimestamp,
    writeBatch,
} from 'firebase/firestore'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Button, Text, Input,
    MenuList, MenuItem, MenuDivider, MenuItemOption, MenuOptionGroup,
    Tooltip, Box,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    FormControl, FormLabel, FormErrorMessage, FormHelperText,
    useToast,
} from '@chakra-ui/react'

import { 
    useUserAuthData, 
    useUserRecords, 
    useAuth, 
    useFirestore, 
    useWorkspaceSelection, 
    useSystemRecords,
    useErrorControl,
    useUsage,
} from '../../system/WorkboxesProvider'

import { updateDocumentSchema } from '../../system/utilities'

import WorkspaceWriteDialog from '../dialogs/WorkspaceWriteDialog'

import { isMobile } from '../../index'

import LearnIcon from './LearnIcon'
import MenuIcon from './MenuIcon'
import MenuControl from './MenuControl'
import StandardIcon from './StandardIcon'
import ToolbarVerticalDivider from './VerticalDivider'
import { useToggleIcon } from './ToggleIcon'

import fireIcon from '../../../assets/workbox-logo.png'
import notificationsIcon from '../../../assets/notifications.png'
import chatIcon from '../../../assets/chat.png'
import messageIcon from '../../../assets/mail.png'
import helpIcon from '../../../assets/help.png'
import homeIcon from '../../../assets/home.png'
import homeFillIcon from '../../../assets/home_fill.png'
import subscriptionsIcon from '../../../assets/subscriptions.png'
import appSettingsIcon from '../../../assets/app_settings.png'
import workspacesIcon from '../../../assets/workspaces.png'
import cartIcon from '../../../assets/cart.png'
import moreVerticalIcon from '../../../assets/more_vert.png'
import hideIcon from '../../../assets/expand_less.png'
import mobileIcon from '../../../assets/smartphone.png'
import desktopIcon from '../../../assets/laptop.png'
import downloadCloudIcon from '../../../assets/cloud_download.png'
import uploadCloudIcon from '../../../assets/cloud_upload.png'


// ==============================[ STANDARD TOOLBAR ]==========================

// ----------------------------- static values -----------------------------
const standardToolbarStyles = {
    minHeight:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'nowrap',
    whitespace:'nowrap',
    alignItems:'center',
    // height:'40px',
    boxSizing:'border-box',
    backgroundColor:'#dfecdf', //'#f2f2f2',
    borderRadius:'8px',

} as CSSProperties

const iconWrapperStyles = {
    display:'inline-block',
    marginLeft:'12px',
    opacity:0.7,
}

const iconStyles = {
    height:'20px',
    width:'20px',
}

const smallerIconStyles = {
    height:'18px', 
    width:'18px'
}

const downArrowWrapperStyles = {
    display:'inline-block',
}

const downArrowStyles = {
    opacity:0.5, 
    fontSize:'small',
}

const fireIconControlStyles = {
    display:'flex',
    flexWrap:'nowrap',
    alignItems:'center',
    padding:'2px',
    borderRadius:'6px',
    marginLeft:'6px',
} as CSSProperties

const avatarStyles = {
    width:'24px', 
    height:'24px', 
    borderRadius:'12px',
    // display:'inline-block',
}

const displayNameStyles = {
    display:'flex',
    flexWrap:'nowrap',
    alignItems:'center',
    whiteSpace:'nowrap',
    fontSize:'small', 
    marginLeft:'4px',
    marginRight:'3px', 
} as CSSProperties

let workspaceMenuIteration = 0 // used for key to brute force re-creation to resync MenuOptionItems

// ============================[ StandardToolbar component ]=============================

const StandardToolbar = (props) => {

    // ------------------------------ hooks ------------------------
    const 
        // system resources
        navigate = useNavigate(),
        location = useLocation(),
        auth = useAuth(),
        db = useFirestore(),
        // user resources
        userAuthData = useUserAuthData(),
        { displayName:userDisplayName, photoURL:userPhotoURL } = userAuthData.authUser,
        isSuperUser = userAuthData.sysadminStatus.isSuperUser,
        userRecords = useUserRecords(),
        // router data
        { pathname } = location,
        homepath = '/workspace',
        isHome = (pathname === '/' || pathname.substring(0,homepath.length) === homepath),
        // workspace data
        workspaceSelection = useWorkspaceSelection(),
        [workspaceList,setWorkspaceList] = useState([]), // empty array to avoid menu processing error
        [workspaceMenuList, setWorkspaceMenuList] = useState(null),
        // toolbar resources
        currentHomeIcon = 
            isHome
            ? homeFillIcon
            : homeIcon,
        [writeDialogState, setWriteDialogState] = useState({open:false, action:null}),
        [deleteDialogState, setDeleteDialogState] = useState(false),
        workspaceMenuRef = useRef(null),
        errorControl = useErrorControl(),
        usage = useUsage()

    // --------------------- navigation functions ------------------
    const 
        goHome = () => { navigate('/workspace') },
        gotoNotifications = () => { navigate('/workspace/notifications') },
        gotoMessages = () => { navigate('/workspace/messages') },
        gotoChatrooms = () => { navigate('/workspace/chatrooms') },
        gotoNewsflows = () => { navigate('/workspace/newsflows') },
        gotoSysadmin = () => { navigate('/sysadmin') },
        gotoAbout = () => { navigate('/about') },
        gotoNotices = () => { navigate('/notices') },
        gotoClassifieds = () => { navigate('/classifieds') },
        gotoAccount = () => { navigate('/account') },
        gotoDomains = () => { navigate('/account/domains') },
        gotoMemberships = () => { navigate('/account/memberships') },
        gotoSubscriptions = () => { navigate('/account/subscriptions') }

    async function logOut() {
        try {
            await signOut(auth)
        } catch (error) {
            console.log('signout error from standard toolbar', error)
            errorControl.push({description:'signout error from standard toolbar', error})
            navigate('/error')            
        }
    }

    // initialize
    useEffect(()=>{
        getWorkspaceList()
    },[workspaceSelection])

    const workboxesmenulist = useMemo(() => {
       return <MenuList>
                <MenuItem isDisabled onClick = {gotoClassifieds} >Classifieds&nbsp;<span style = {{fontStyle:'italic'}}>[pending]</span></MenuItem>
                <MenuDivider />
                <MenuItem onClick = {gotoNotices}>General notices</MenuItem>
                <MenuItem onClick = {gotoAbout}>About</MenuItem>
            </MenuList>
    },[])

    const currentusermenulist = useMemo(() => {

        return <MenuList>
            <MenuItem >User preferences</MenuItem>
            <MenuItem onClick = {gotoAccount}>Account settings</MenuItem>
            <MenuItem onClick = {gotoDomains}>Domain settings</MenuItem>
            <MenuDivider />
            <MenuItem onClick = {gotoMemberships}>Workgroup memberships</MenuItem>
            <MenuItem onClick = {gotoSubscriptions}>Newsflow subscriptions</MenuItem>
            <MenuItem >Forum memberships</MenuItem>
            <MenuDivider />
            <MenuItem onClick = {logOut}>Sign out</MenuItem>
        </MenuList>

    },[])

    async function getWorkspaceList() {
        const workingWorkspaceList = []
        const q = query(collection(db, 'users', userRecords.user.profile.user.id, 'workspaces'), orderBy('profile.workspace.name'))
        let querySnapshot
        try {
            querySnapshot = await getDocs(q)
        } catch (error) {
            console.log('error getting workspace list on standard toolbar', error)
            errorControl.push({description:'error getting workspace list on standard toolbar', error})
            navigate('/error')
            return
        }
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            workingWorkspaceList.push(data.profile.workspace)
        })
        usage.read(querySnapshot.size)
        setWorkspaceList(workingWorkspaceList)
    }

    const renameWorkspace = () => {
        setWriteDialogState({open:true, action:'changename'})
    }

    const deleteWorkspace = () => {
        setDeleteDialogState(true)
    }

    const createWorkspace = () => {
        setWriteDialogState({open:true, action:'createworkspace'})
    }

    const changeWorkspaceSelection = (workspaceID) => {
        const selection = workspaceMenuRef.current.querySelector('[value|="' + workspaceID + '"]')
        const workspaceName = selection.dataset.name
        // console.log('newWorspaceSelection: workspaceID, workspaceName', workspaceID, workspaceName)
        const { setWorkspaceSelection } = workspaceSelection
        setWorkspaceSelection((previousState) => {
            previousState.id = workspaceID
            previousState.name = workspaceName
            return {...previousState}
        })
    }

    const workspacemenuList = useMemo(() => {

        // if (workspacesMenu.length === 0) return null
        const defaultValue = workspaceSelection.id

        // key is set for MenuOptionGroup to brute force sync with changed MenuItemOption children set
        return <MenuList fontSize = 'small' lineHeight = '1em' ref = {workspaceMenuRef}>
            <MenuItem onClick = {renameWorkspace} >Rename this workspace</MenuItem>
            <MenuItem >Reset this workspace</MenuItem>
            <MenuItem onClick = {deleteWorkspace} >Delete this workspace</MenuItem>
            <MenuItem >Save this workspace as...</MenuItem>
            <MenuItem onClick = {createWorkspace} >Add a workspace</MenuItem>
            <MenuDivider />
            <MenuOptionGroup 
                key = {workspaceMenuIteration++} 
                defaultValue = {defaultValue} 
                onChange = {changeWorkspaceSelection} 
                fontSize = 'small' 
                fontStyle = 'italic' 
                title = 'Select a workspace:'
            >
                {
                    workspaceList.map((item) => {
                        return <MenuItemOption key = {item.id} data-name = {item.name} value = {item.id}>{item.name}</MenuItemOption>
                    })
                }
            </MenuOptionGroup>
            <MenuDivider />
        </MenuList>

    },[workspaceList, workspaceSelection])

    const uploadConfig = () => {

    }

// <StandardIcon icon = {messageIcon} caption = 'direct' tooltip = 'Direct messages' response = {gotoMessages} />
// <StandardIcon icon = {chatIcon} caption = 'chats' tooltip = 'Chatrooms with this account' response = {gotoChatrooms} />
// <StandardIcon icon  = {subscriptionsIcon} caption = 'newsflows' tooltip = 'Subscribed news flows' response = {gotoNewsflows} />
// <StandardIcon icon = {notificationsIcon} caption = 'alerts' tooltip = 'Notifications to this account' response = {gotoNotifications} />
// <StandardIcon icon = {downloadCloudIcon} caption = 'download' tooltip = 'download user workspace settings from another tab or device' />
// <StandardIcon icon = {uploadCloudIcon} caption = 'status' tooltip = 'upload user workspace settings for another tab or device' />

    // render
    return <Box style = {standardToolbarStyles}>
        <MenuIcon icon = {fireIcon} caption = 'Workboxes' tooltip = 'Workboxes menu' menulist = {workboxesmenulist} />
        <ToolbarVerticalDivider />
        { isHome && <>
            <MenuControl 
                tooltip = 'Notifications to this user'
                icon = {notificationsIcon}
                caption = 'alerts'
            />
            <ToolbarVerticalDivider />
            </>
        }
        <MenuControl 
            displayName = {userDisplayName} 
            icon = {userPhotoURL} 
            tooltip = 'Options for current user' 
            caption = 'user' 
            menulist = {currentusermenulist} 
        />
        { isHome && 
            <>
                <ToolbarVerticalDivider />
                <MenuControl 
                    icon = {workspacesIcon} 
                    displayName = {workspaceSelection.name} 
                    tooltip = 'select a workspace'
                    caption = 'workspace'
                    menulist = {workspacemenuList} 
                />
                <StandardIcon isDisabled = {true} icon = {isMobile?mobileIcon:desktopIcon} caption = {isMobile?'(mobile)':'(desktop)'} tooltip = 'some settings may be adapted to device' />
                <StandardIcon response = {uploadConfig} isDialog = {true} icon = {uploadCloudIcon} caption = 'automatic' tooltip = 'changes are automatically saved' />
            </>
        } 
        <ToolbarVerticalDivider />
        {!isHome && <StandardIcon icon = {currentHomeIcon} caption = 'home' tooltip = 'Go to the main workspace' response = {goHome} />}
        {isSuperUser && <>
                <StandardIcon icon = {appSettingsIcon} caption = 'system' tooltip = 'System settings' response = {gotoSysadmin} />
                <ToolbarVerticalDivider />
            </>
        }
        <LearnIcon tooltip = 'Explain this toolbar'/>
        <ToolbarVerticalDivider />
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>
        <span>&nbsp;&nbsp;</span>
        {writeDialogState.open && <WorkspaceWriteDialog writeDialogState = {writeDialogState} setWriteDialogState = {setWriteDialogState}/>}
        {deleteDialogState && <WorkspaceDeleteDialog setDeleteDialogState = {setDeleteDialogState} />}
    </Box>
}

// <ToolbarVerticalDivider />
// <StandardIcon icon = {moreVerticalIcon} caption = 'more' tooltip = 'More workspace options' />

export default StandardToolbar

// ===================================[ WORKSPACE SAVEAS DIALOG ]===================================


// ===================================[ WORKSPACE DELETE DIALOG ]===================================

const WorkspaceDeleteDialog = (props) => {

    const 
        { setDeleteDialogState } = props,
        dialogStateRef = useRef(null),
        userRecords = useUserRecords(),
        db = useFirestore(),
        cancelRef = useRef(null),
        newInvocationRef = useRef(true),
        workspaceSelection = useWorkspaceSelection(),
        [alertState, setAlertState] = useState('ready'),
        [isDefaultState, setIsDefaultState] = useState(false),
        workspaceRecordRef = useRef(null),
        toast = useToast({duration:3000}),
        errorControl = useErrorControl(),
        navigate = useNavigate(),
        usage = useUsage()

    useEffect(()=>{
        checkIsDefaultWorkspace()
    },[])

    const doClose = () => {

        // isOpen = false
        setDeleteDialogState(false)

    }

    async function checkIsDefaultWorkspace() {
        const dbWorkspaceRef = doc(collection(db, 'users', userRecords.user.profile.user.id,'workspaces'),workspaceSelection.id)
        let dbWorkspaceRecord 
        try {
            dbWorkspaceRecord = await getDoc(dbWorkspaceRef)
        } catch (error) {
            console.log('error getting workspace record to check for default status from standard toolbar', error)
            errorControl.push({description:'error getting workspace record to check for default status from standard toolbar', error})
            navigate('/error')
            return
        }
        usage.read(1)
        if (dbWorkspaceRecord.exists()) {
            const workspaceRecord = dbWorkspaceRecord.data()
            workspaceRecordRef.current = workspaceRecord
            setIsDefaultState(workspaceRecord.profile.flags.is_default)
        } else {
            // TODO should try to recover from this
            console.log('error no workspace record found to check for default status from standard toolbar')
            errorControl.push({description:'error no workspace record found to check for default status from standard toolbar', error:'N/A'})
            navigate('/error')
            return
        }
    }

    async function doDeleteWorkspace() {

        // get default workspace
        const 
            dbWorkspaceCollection = collection(db,'users',userRecords.user.profile.user.id, 'workspaces'),
            dbQuery = query(dbWorkspaceCollection, where('profile.flags.is_default','==',true))

        let dbDefaultWorkspace
        try {
            dbDefaultWorkspace = await getDocs(dbQuery)
        } catch (error) {
            console.log('error fetching user workspace collection')
            errorControl.push({description:'error fetching user workspace collection from standard toolbar', error:'N/A'})
            navigate('/error')
            return
        }
        usage.read(1)
        let dbdoc, defaultWorkspace
        if (dbDefaultWorkspace.size == 1) {
            dbdoc = dbDefaultWorkspace.docs[0]
            defaultWorkspace = dbdoc.data()
        } else {
            // TODO should try to recover from this
            console.log('error fetching default workspace for delete workspace')
            errorControl.push({description:'error no default workspace record found to deleted workspace from standard toolbar', error:'N/A'})
            navigate('/error')
            return
        }

        const 
            previousWorkspaceName = workspaceSelection.name,
            defaultWorkspaceName = defaultWorkspace.profile.workspace.name

        // delete current workspace
        try {
            const batch = writeBatch(db)
            batch.delete(doc(dbWorkspaceCollection, workspaceSelection.id))
            batch.update(doc(collection(db,'users'),userRecords.user.profile.user.id),{'profile.counts.workspaces':increment(-1)})
            await batch.commit()
        } catch (error) {
            // TODO should try to recover from this
            console.log('error deleting workspace or incrementing workspace count')
            errorControl.push({description:'error deleting workspace or incrementing workspace count from standard toolbar', error})
            navigate('/error')
            return
        }
        usage.delete(1)
        usage.write(1)
        // set current workspace to default
        const {setWorkspaceSelection} = workspaceSelection
        setWorkspaceSelection((previousState)=>{
            previousState.id = defaultWorkspace.profile.workspace.id
            previousState.name = defaultWorkspace.profile.workspace.name
            return {...previousState}
        })

        toast({
            description: 
                `deleted [${previousWorkspaceName}] and replaced it with [${defaultWorkspaceName}]`
        })

        setDeleteDialogState(false)

    }

    // TODO to come
    async function doResetWorkspace() {

        setDeleteDialogState(false)
    }

    return (<>
        <AlertDialog
            isOpen={true}
            leastDestructiveRef={cancelRef}
            onClose={doClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Delete the current workspace
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {alertState == 'processing' && <Text>Processing...</Text>}
                        {!isDefaultState && <Text>
                            Continue? The current workspace (<span style = {{fontStyle:'italic'}}>{workspaceSelection.name}</span>) will be deleted, 
                            and replaced by the default workspace.
                        </Text>}
                        {isDefaultState && <><Text>The workspace <span style = {{fontStyle:'italic'}}>{workspaceSelection.name}</span> cannot
                        be deleted because it is the default workspace. </Text>
                        <Text mt = '6px'>But it can be reset, which would remove all of its panels other than
                        the default panel.</Text></>}
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button isDisabled = {alertState == 'processing'} ref={cancelRef} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'red'
                            onClick = {!isDefaultState? doDeleteWorkspace: doResetWorkspace}
                        >
                          {!isDefaultState && 'Delete'}
                          {isDefaultState && 'Reset'}

                        </Button>
                    </AlertDialogFooter>


                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}
