// Toolbar_Standard.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef, useState, useEffect} from 'react'
import { signOut } from "firebase/auth"
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
    useWorkspaceHandler, 
    useErrorControl,
    useUsage,
} from '../../system/WorkboxesProvider'

import WorkspaceWriteDialog from '../dialogs/WorkspaceWriteDialog'
import WorkspaceDeleteDialog from '../dialogs/WorkspaceDeleteDialog'
import WorkspaceSaveDialog from '../dialogs/WorkspaceSaveDialog'
import WorkspaceSaveAsDialog from '../dialogs/WorkspaceSaveAsDialog'
import WorkspaceResetDialog from '../dialogs/WorkspaceResetDialog'
import WorkspaceSetDefaultDialog from '../dialogs/WorkspaceSetDefaultDialog'

import { isMobile } from '../../index'

import LearnIcon from './controls/LearnIcon'
import MenuIcon from './controls/MenuIcon'
import MenuControl from './controls/MenuControl'
import UserControl from './controls/UserControl'
import StandardIcon from './controls/StandardIcon'
import ToolbarVerticalDivider from './controls/VerticalDivider'

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
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        [workspaceList,setWorkspaceList] = useState([]), // empty array to avoid menu processing error
        [workspaceMenuList, setWorkspaceMenuList] = useState(null),
        // toolbar resources
        currentHomeIcon = 
            isHome
            ? homeFillIcon
            : homeIcon,
        [workspaceWriteDialogState, setWorkspaceWriteDialogState] = useState({open:false, action:null}),
        [workspaceDeleteDialogState, setWorkspaceDeleteDialogState] = useState(false),
        [saveDialogState, setSaveDialogState] = useState(false),
        [workspaceResetDialogState, setWorkspaceResetDialogState] = useState(false),
        [workspaceSaveAsDialogState, setWorkspaceSaveAsDialogState] = useState(false),
        [workspaceSetDefaultDialogState, setWorkspaceSetDefaultDialogState] = useState(false),
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
            <MenuItem onClick = {gotoDomains}>Account domains</MenuItem>
            <MenuDivider />
            <MenuItem onClick = {gotoMemberships}>Domain memberships</MenuItem>
            <MenuItem onClick = {gotoSubscriptions}>Newsflow subscriptions</MenuItem>
            <MenuItem >Discussion forums</MenuItem>
            <MenuDivider />
            <MenuItem onClick = {logOut}>Sign out</MenuItem>
        </MenuList>

    },[])

    async function getWorkspaceList() {

        const result = await workspaceHandler.getWorkspaceList()
        if (result.error) {
            navigate('/error')
            return
        } else {
            setWorkspaceList(result.payload)
        }

    }

    const renameWorkspaceDialog = () => {
        setWorkspaceWriteDialogState({open:true, action:'changename'})
    }

    const deleteWorkspaceDialog = () => {
        setWorkspaceDeleteDialogState(true)
    }

    const saveAsWorkspaceDialog = () => {
        setWorkspaceSaveAsDialogState(true)
    }

    const uploadSettingDialog = () => {
        setSaveDialogState(true)
    }

    const createWorkspaceDialog = () => {
        setWorkspaceWriteDialogState({open:true, action:'createworkspace'})
    }

    async function saveWorkspaceData() {

        const result = await workspaceHandler.saveWorkspaceData()
        
        if (result.error) {

            navigate('/error')
            return

        } else {

            dispatchWorkspaceHandler('save')

        }

    }

    // TODO save before switch if in automatic mode
    // ask about save if in manual mode
    async function setWorkspaceSelection (workspaceID) {
        const selectionElement = workspaceMenuRef.current.querySelector('[value|="' + workspaceID + '"]')
        const workspaceName = selectionElement.dataset.name
        
        // ---- SWITCH workspace selection ----
        const result = await workspaceHandler.setWorkspaceSelection(workspaceID, workspaceName)
        if (result.error) {
            navigate('/error')
            return
        }
        dispatchWorkspaceHandler('selection')
    }

    const doResetWorkspace = () => {

        setWorkspaceResetDialogState(true)

    }

    const setWorkspaceDefault = () => {
        setWorkspaceSetDefaultDialogState(true)
    }

    const workspacemenuList = useMemo(() => {

        const defaultValue = workspaceHandler.workspaceSelection.id

        // key is set for MenuOptionGroup to brute force sync with changed MenuItemOption children set
        return <MenuList fontSize = 'small' lineHeight = '1em' ref = {workspaceMenuRef}
            maxHeight = 'var(--wb_panel_display_height)' overflowY = 'scroll'
        >
            <MenuGroup title = 'Workspace menu'>
            <MenuItem onClick = {renameWorkspaceDialog} >Rename</MenuItem>
            <MenuItem onClick = {doResetWorkspace} >Reset</MenuItem>
            <MenuItem onClick = {deleteWorkspaceDialog} >Delete</MenuItem>
            <MenuItem onClick = {saveAsWorkspaceDialog} >Make a copy as...</MenuItem>
            <MenuDivider />
            <MenuItem onClick = {createWorkspaceDialog} >Add a new workspace</MenuItem>
            <MenuItem onClick = {setWorkspaceDefault}>Set default workspace</MenuItem>
            </MenuGroup>            
            <MenuDivider />
            <MenuOptionGroup 
                key = {workspaceMenuIteration++} 
                defaultValue = {defaultValue} 
                onChange = {setWorkspaceSelection} 
                fontSize = 'small' 
                fontStyle = 'italic' 
                title = 'Select a workspace:'
            >
                {
                    workspaceList.map((item) => {
                        return <MenuItemOption key = {item.id} data-name = {item.name} value = {item.id}>
                            {item.name + (item.is_default? '*': '')}
                        </MenuItemOption>
                    })
                }
            </MenuOptionGroup>
        </MenuList>

    },[workspaceList]) //, workspacePayload])

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
        <UserControl 
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
                    onCall = {getWorkspaceList}
                    icon = {workspacesIcon} 
                    displayName = {workspaceHandler.workspaceSelection.name} 
                    tooltip = 'select a workspace'
                    caption = 'workspace'
                    menulist = {workspacemenuList} 
                />
                <StandardIcon response = {uploadSettingDialog} isDialog = {true} icon = {uploadCloudIcon} 
                    caption = {workspaceHandler.settings.mode} tooltip = 'set saving behaviour' />
                <StandardIcon response = {saveWorkspaceData} icon = {uploadCloudIcon}
                    emphasis = {workspaceHandler.settings.changed?'true':false} 
                    highlight = {workspaceHandler.settings.mode == 'automatic'?false:true}
                    caption = {workspaceHandler.settings.changed?'save*':'saved'} tooltip = 'save workspace configuration' />
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
        {false && <><ToolbarVerticalDivider />
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} 
            caption = 'hide' tooltip = 'hide toolbar'/></>}
        <span>&nbsp;&nbsp;</span>
        {workspaceWriteDialogState.open && <WorkspaceWriteDialog 
            workspaceWriteDialogState = {workspaceWriteDialogState} setWorkspaceWriteDialogState = {setWorkspaceWriteDialogState}/>}
        {workspaceDeleteDialogState && <WorkspaceDeleteDialog 
            setWorkspaceDeleteDialogState = {setWorkspaceDeleteDialogState} setWorkspaceResetDialogState = {setWorkspaceResetDialogState}/>}
        {workspaceSaveAsDialogState && <WorkspaceSaveAsDialog setWorkspaceSaveAsDialogState = {setWorkspaceSaveAsDialogState} />}
        {saveDialogState && <WorkspaceSaveDialog setSaveDialogState = {setSaveDialogState} />}
        {workspaceResetDialogState && <WorkspaceResetDialog setWorkspaceResetDialogState = {setWorkspaceResetDialogState} />}
        {workspaceSetDefaultDialogState && <WorkspaceSetDefaultDialog setWorkspaceSetDefaultDialogState = {setWorkspaceSetDefaultDialogState} />}
    </Box>
}

export default StandardToolbar

