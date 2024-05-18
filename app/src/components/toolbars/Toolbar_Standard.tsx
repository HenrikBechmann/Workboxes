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
    MenuList, MenuGroup, MenuItem, MenuDivider, MenuItemOption, MenuOptionGroup,
    Box,
} from '@chakra-ui/react'

import { 
    useUserAuthData, 
    useUserRecords, 
    useAuth, 
    useFirestore, 
    useWorkspaceConfiguration, 
    useErrorControl,
    useUsage,
} from '../../system/WorkboxesProvider'

import { updateDocumentSchema } from '../../system/utilities'

import WorkspaceWriteDialog from '../dialogs/WorkspaceWriteDialog'
import WorkspaceDeleteDialog from '../dialogs/WorkspaceDeleteDialog'
import WorkspaceSaveDialog from '../dialogs/WorkspaceSaveDialog'

import { isMobile } from '../../index'

import LearnIcon from './LearnIcon'
import MenuIcon from './MenuIcon'
import MenuControl from './MenuControl'
import StandardIcon from './StandardIcon'
import ToolbarVerticalDivider from './VerticalDivider'
// import { useToggleIcon } from './ToggleIcon'

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
import onlineIcon from '../../../assets/online.png'
import offlineIcon from '../../../assets/offline.png'
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
        workspaceHandlerObject = useWorkspaceConfiguration(),
        [workspaceList,setWorkspaceList] = useState([]), // empty array to avoid menu processing error
        [workspaceMenuList, setWorkspaceMenuList] = useState(null),
        // toolbar resources
        currentHomeIcon = 
            isHome
            ? homeFillIcon
            : homeIcon,
        [writeDialogState, setWriteDialogState] = useState({open:false, action:null}),
        [deleteDialogState, setDeleteDialogState] = useState(false),
        [saveDialogState, setSaveDialogState] = useState(false),
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
    },[workspaceHandlerObject])

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

    const renameWorkspaceDialog = () => {
        setWriteDialogState({open:true, action:'changename'})
    }

    const deleteWorkspaceDialog = () => {
        setDeleteDialogState(true)
    }

    const uploadSettingDialog = () => {
        setSaveDialogState(true)
    }

    const createWorkspaceDialog = () => {
        setWriteDialogState({open:true, action:'createworkspace'})
    }

    async function saveWorkspaceConfig() {

        const { settings, changedRecords } = workspaceHandlerObject
        if (!settings.changed && !changedRecords.setworkspace) return

        const workspaceRecord = workspaceHandlerObject.workspaceRecord
        const dbcollection = collection(db, 'users', userRecords.user.profile.user.id, 'workspaces')
        const docRef = doc(dbcollection, workspaceRecord.profile.workspace.id)
        try {
            await setDoc(docRef,workspaceRecord)
        } catch (error) {
            console.log('signout error from standard toolbar', error)
            errorControl.push({description:'signout error from standard toolbar', error})
            navigate('/error')
            return
        }

        usage.write(1)

        const { setWorkspaceConfiguration } = workspaceHandlerObject

        // ---- SAVE workspace config ----
        setWorkspaceConfiguration((previousState)=>{ 
            previousState.settings.changed = false
            previousState.changedRecords.setworkspace = null
            previousState.changedRecords.setwindowpositions.clear(),
            previousState.changedRecords.setpanels.clear()
            previousState.changedRecords.deletepanels.clear()
            return {...previousState}
        })

    }

    // TODO save before switch if in automatic mode
    // ask about save if in manual mode
    const changeWorkspaceSelection = (workspaceID) => {
        const selectionElement = workspaceMenuRef.current.querySelector('[value|="' + workspaceID + '"]')
        const workspaceName = selectionElement.dataset.name
        // console.log('newWorspaceSelection: workspaceID, workspaceName', workspaceID, workspaceName)
        const { setWorkspaceConfiguration } = workspaceHandlerObject
        
        // ---- SWITCH workspace selection ----
        setWorkspaceConfiguration((previousState) => { 
            // console.log('setting workspaceHandlerObject in toolbar_standard')
            previousState.workspaceSelection.id = workspaceID
            previousState.workspaceSelection.name = workspaceName
            return {...previousState}
        })
    }

    const workspacemenuList = useMemo(() => {

        // if (workspacesMenu.length === 0) return null
        const defaultValue = workspaceHandlerObject.workspaceSelection.id

        // key is set for MenuOptionGroup to brute force sync with changed MenuItemOption children set
        return <MenuList fontSize = 'small' lineHeight = '1em' ref = {workspaceMenuRef}
        >
            <MenuGroup title = 'Workspace menu'>
            <MenuItem onClick = {renameWorkspaceDialog} >Rename</MenuItem>
            <MenuItem >Reset</MenuItem>
            <MenuItem onClick = {deleteWorkspaceDialog} >Delete</MenuItem>
            <MenuItem >Save as...</MenuItem>
            <MenuDivider />
            <MenuItem onClick = {createWorkspaceDialog} >Add a workspace</MenuItem>
            </MenuGroup>            
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
        </MenuList>

    },[workspaceList, workspaceHandlerObject])

// <StandardIcon icon = {messageIcon} caption = 'direct' tooltip = 'Direct messages' response = {gotoMessages} />
// <StandardIcon icon = {chatIcon} caption = 'chats' tooltip = 'Chatrooms with this account' response = {gotoChatrooms} />
// <StandardIcon icon  = {subscriptionsIcon} caption = 'newsflows' tooltip = 'Subscribed news flows' response = {gotoNewsflows} />
// <StandardIcon icon = {notificationsIcon} caption = 'alerts' tooltip = 'Notifications to this account' response = {gotoNotifications} />
// <StandardIcon icon = {downloadCloudIcon} caption = 'download' tooltip = 'download user workspace settings from another tab or device' />
// <StandardIcon icon = {uploadCloudIcon} caption = 'status' tooltip = 'upload user workspace settings for another tab or device' />
// <StandardIcon isInfo = {true} icon = {onlineIcon} 
//     caption = 'online' tooltip = 'Workboxes functions best when online' />
// <StandardIcon isInfo = {true} icon = {isMobile?mobileIcon:desktopIcon} 
//     caption = {isMobile?'(mobile)':'(desktop)'} tooltip = 'some settings may be adapted to device' />
// <ToolbarVerticalDivider />
// <StandardIcon icon = {moreVerticalIcon} caption = 'more' tooltip = 'More workspace options' />

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
                    displayName = {workspaceHandlerObject.workspaceSelection.name} 
                    tooltip = 'select a workspace'
                    caption = 'workspace'
                    menulist = {workspacemenuList} 
                />
                <StandardIcon response = {uploadSettingDialog} isDialog = {true} icon = {uploadCloudIcon} 
                    caption = {workspaceHandlerObject.settings.mode} tooltip = 'set saving behaviour' />
                <StandardIcon response = {saveWorkspaceConfig} icon = {uploadCloudIcon}
                    emphasis = {workspaceHandlerObject.settings.changed?'true':false} 
                    highlight = {workspaceHandlerObject.settings.mode == 'automatic'?false:true}
                    caption = {workspaceHandlerObject.settings.changed?'save*':'saved'} tooltip = 'save workspace configuration' />
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
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} 
            caption = 'hide' tooltip = 'hide toolbar'/>
        <span>&nbsp;&nbsp;</span>
        {writeDialogState.open && <WorkspaceWriteDialog 
            writeDialogState = {writeDialogState} setWriteDialogState = {setWriteDialogState}/>}
        {deleteDialogState && <WorkspaceDeleteDialog setDeleteDialogState = {setDeleteDialogState} />}
        {saveDialogState && <WorkspaceSaveDialog setSaveDialogState = {setSaveDialogState} 
            workspaceHandlerObject = {workspaceHandlerObject} />}
    </Box>
}

export default StandardToolbar

