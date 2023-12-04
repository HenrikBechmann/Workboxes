// StandardToolbar.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'
import { signOut } from "firebase/auth"
import { useNavigate } from 'react-router-dom'
import {
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup,
  Tooltip
} from '@chakra-ui/react'

import { useUserData, useAuth } from '../system/FirebaseProviders'

import fireIcon from '../../assets/fire.png'
import notificationsIcon from '../../assets/notifications.png'
import chatIcon from '../../assets/chat.png'
import helpIcon from '../../assets/help.png'
import homeIcon from '../../assets/home.png'
import subscriptionsIcon from '../../assets/subscriptions.png'
import appSettingsIcon from '../../assets/app_settings.png'

const standardToolbarStyles = {
    display:'flex',
    flexDirection:'row',
    flexWrap:'nowrap',
    justifyContent:'flex-start',
    alignItems:'center',
    height:'30px',
    boxSizing:'border-box',
    backgroundColor:'#f2f2f2',

} as CSSProperties

const verticalDividerStyles = {
    height:'20px',
    borderLeft:'1px solid gray', 
    width:'0px', 
    marginLeft:'12px',
}

const iconStyles = {
    marginLeft:'12px',
    opacity:0.7,
}

const downArrowStyles = {
    opacity:0.5, 
    fontSize:'small',
}

const fireIconControlStyles = {
    display:'flex',
    padding:'2px',
    borderRadius:'6px',
    marginLeft:'6px',
}

const avatarStyles = {
    width:'24px', 
    height:'24px', 
    borderRadius:'12px'
}

const displayNameStyles = {
    fontSize:'small', 
    marginLeft:'4px',
    marginRight:'3px', 
    whiteSpace:'nowrap'
} as CSSProperties

const VerticalToolbarDivider = (props) => {

    return <div style = {verticalDividerStyles}></div>

}

const FireIconControl = (props) => {
    
    return <div style = {fireIconControlStyles} >
        <img src = {fireIcon} /><span style = {downArrowStyles} >▼</span>
    </div> 
}

const UserControl = (props) => {

    const 
        userData = useUserData(),
        { displayName, photoURL } = userData.authUser

    return <div style = {
        {
            display:'flex',
            alignItems:'center',
            marginLeft:'12px',
            borderRadius:'6px',
        }
    }>
        <img style = {avatarStyles} src = {photoURL} />
        <div style = {displayNameStyles} >{displayName}</div>
        <span style = {downArrowStyles} >▼</span>
    </div>

}

const StandardToolbar = (props) => {

    const 
        navigate = useNavigate(),
        userData = useUserData(),
        auth = useAuth(),
        { displayName, photoURL } = userData.authUser,
        isSuperUser = userData.sysadminStatus.isSuperUser

    const 
        goHome = () => { navigate('/workspace') },
        gotoNotifications = () => { navigate('/notifications') },
        gotoChatrooms = () => { navigate('/chatrooms') },
        gotoNewsflows = () => { navigate('/newsflows') },
        gotoSysadmin = () => { navigate('/sysadmin') },
        gotoAbout = () => { navigate('/about') },
        gotoNotices = () => { navigate('/notices') },
        gotoAccount = () => { navigate('/account') },
        gotoDomains = () => { navigate('/account/domains') },
        gotoMemberships = () => { navigate('/account/memberships') },
        gotoSubscriptions = () => { navigate('/account/subscriptions') },
        logOut = () => {
            signOut(auth).then(() => {
              // Sign-out successful.
            }).catch((error) => {
              // An error happened.
            })
        }

    return <div style = {standardToolbarStyles}>
        <Menu>
            <MenuButton >
                <FireIconControl />
            </MenuButton>
            <MenuList>
                <MenuItem onClick = {gotoAbout}>About</MenuItem>
                <MenuItem onClick = {gotoNotices}>Notices</MenuItem>
            </MenuList>
        </Menu>
        <VerticalToolbarDivider />
        <div style = {iconStyles} onClick = {gotoNotifications} >
            <Tooltip hasArrow label = 'Notifications to this account'>
                <img src = {notificationsIcon} />
            </Tooltip>
        </div> 
        <div style = {iconStyles} onClick = {gotoChatrooms} >
            <Tooltip hasArrow label = 'Chatrooms with this account'>
                <img src = {chatIcon} />
            </Tooltip>
        </div>
        <div style = {iconStyles} onClick = {gotoNewsflows} >
            <Tooltip hasArrow label = 'Subscribed news flows'>
                <img src = {subscriptionsIcon} />
            </Tooltip>
    </div>
        <div style = {iconStyles} >
            <Tooltip hasArrow label = 'Explain this toolbar'>
                <img style = {{height:'18px', width:'18px'}} src = {helpIcon} />
            </Tooltip>
        </div>
        <VerticalToolbarDivider />
        <div style = {iconStyles} onClick = {goHome}>
            <Tooltip hasArrow label = 'Go to the main work page'>
                <img src = {homeIcon} />
            </Tooltip>
        </div>
        <VerticalToolbarDivider />
        <Menu>
            <MenuButton >
                <UserControl />
            </MenuButton>
            <MenuList>
                <MenuItem onClick = {gotoAccount}>Account Settings</MenuItem>
                <MenuDivider />
                <MenuGroup title = 'MANAGE...'>
                    <MenuItem onClick = {gotoSubscriptions}>Newsflow subscriptions</MenuItem>
                    <MenuItem onClick = {gotoMemberships}>Domain memberships</MenuItem>
                    <MenuItem onClick = {gotoDomains}>Account domains</MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuItem onClick = {logOut}>Sign out</MenuItem>
            </MenuList>
        </Menu>
        {isSuperUser && <>
            <VerticalToolbarDivider />
            <div style = {iconStyles} onClick = {gotoSysadmin}>
                <Tooltip hasArrow label = 'System settings'>
                    <img src = {appSettingsIcon} />
                </Tooltip>
            </div>
        </>
        }
    </div>

}

export default StandardToolbar
