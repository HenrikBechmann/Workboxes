// Toolbar_Standard.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef} from 'react'
import { signOut } from "firebase/auth"
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup,
  Tooltip, Box
} from '@chakra-ui/react'

import { useUserAuthData, useUserRecords, useAuth } from '../../system/WorkboxesProvider'

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

// --------------------------- component ----------------------------
const StandardToolbar = (props) => {

    // ------------------------------ hooks ------------------------
    const 
        navigate = useNavigate(),
        location = useLocation(),
        { pathname } = location,
        userAuthData = useUserAuthData(),
        userRecords = useUserRecords(),
        auth = useAuth(),
        { displayName, photoURL } = userAuthData.authUser,
        isSuperUser = userAuthData.sysadminStatus.isSuperUser,
        homepath = '/workspace',
        isHome = (pathname === '/' || pathname.substring(0,homepath.length) === homepath)

    const
        workspaceName = userRecords.user.workspace.desktop.name

    const 
        currentHomeIcon = 
            isHome
            ? homeFillIcon
            : homeIcon,
        toggleOnCartRef = useRef(false),
        disabledCartRef = useRef(false)

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
        gotoSubscriptions = () => { navigate('/account/subscriptions') },
        logOut = () => {
            signOut(auth).then(() => {
              // console.log('Sign-out successful.')
            }).catch((error) => {
                // console.log('signout error', error)
              // An error happened.
            })
        }

    const workboxesmenulist = useMemo(() => {
       return <MenuList>
                <MenuItem isDisabled onClick = {gotoClassifieds} >Classifieds&nbsp;<span style = {{fontStyle:'italic'}}>[pending]</span></MenuItem>
                <MenuDivider />
                <MenuItem onClick = {gotoNotices}>General notices</MenuItem>
                <MenuItem onClick = {gotoAbout}>About</MenuItem>
            </MenuList>
    },[])

    const workspacesmenulist = useMemo(() => {
       return <MenuList>
                <MenuItem >Rename this workspace</MenuItem>
                <MenuItem >Add a workspace</MenuItem>
                <MenuItem >Delete a workspace</MenuItem>
                <MenuDivider />
                <MenuGroup fontSize = 'medium' fontStyle = 'italic' title = 'Select a workspace:'>
                    <MenuItem >One</MenuItem>
                    <MenuItem >Two</MenuItem>
                </MenuGroup>
                </MenuList>
    },[])

    const currentusermenulist = useMemo(() => {

        return <MenuList>
            <MenuItem >User preferences</MenuItem>
            <MenuItem onClick = {gotoAccount}>Account settings</MenuItem>
            <MenuItem onClick = {gotoDomains}>Domain settings</MenuItem>
            <MenuDivider />
            <MenuItem onClick = {gotoMemberships}>Memberships</MenuItem>
            <MenuItem onClick = {gotoSubscriptions}>Subscriptions</MenuItem>
            <MenuDivider />
            <MenuItem onClick = {logOut}>Sign out</MenuItem>
        </MenuList>

    },[])

// <StandardIcon icon = {messageIcon} caption = 'direct' tooltip = 'Direct messages' response = {gotoMessages} />
// <StandardIcon icon = {chatIcon} caption = 'chats' tooltip = 'Chatrooms with this account' response = {gotoChatrooms} />
// <StandardIcon icon  = {subscriptionsIcon} caption = 'newsflows' tooltip = 'Subscribed news flows' response = {gotoNewsflows} />
    // render
    return <Box style = {standardToolbarStyles}>
        <MenuIcon icon = {fireIcon} caption = 'Workboxes' tooltip = 'Workboxes menu' menulist = {workboxesmenulist} />
        <ToolbarVerticalDivider />
        { isHome && <>
            <StandardIcon icon = {notificationsIcon} caption = 'alerts' tooltip = 'Notifications to this account' response = {gotoNotifications} />
            <ToolbarVerticalDivider />
            </>
        }
        <MenuControl 
            displayName = {displayName} 
            icon = {photoURL} 
            tooltip = 'Options for current user' 
            caption = 'user' 
            menulist = {currentusermenulist} 
        />
        { isHome && 
            <>
                <ToolbarVerticalDivider />
                <MenuControl 
                    icon = {workspacesIcon} 
                    displayName = {workspaceName} 
                    tooltip = 'select a workspace'
                    caption = 'workspace'
                    menulist = {workspacesmenulist} 
                />
                <StandardIcon icon = {isMobile?mobileIcon:desktopIcon} caption = {isMobile?'mobile':'desktop'} tooltip = 'some settings may be adapted to device' />
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
    </Box>
}

// <ToolbarVerticalDivider />
// <StandardIcon icon = {moreVerticalIcon} caption = 'more' tooltip = 'More workspace options' />

export default StandardToolbar
