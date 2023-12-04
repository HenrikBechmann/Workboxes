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
import messageIcon from '../../assets/mail.png'
import helpIcon from '../../assets/help.png'
import homeIcon from '../../assets/home.png'
import subscriptionsIcon from '../../assets/subscriptions.png'
import appSettingsIcon from '../../assets/app_settings.png'

const standardToolbarStyles = {
    minHeight:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'nowrap',
    whitespace:'nowrap',
    alignItems:'center',
    height:'30px',
    boxSizing:'border-box',
    backgroundColor:'#dfecdf', //'#f2f2f2',

} as CSSProperties

const verticalDividerStyles = {
    height:'20px',
    borderLeft:'1px solid gray', 
    width:'0px', 
    marginLeft:'12px',
    // display:'inline-block',
}

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

const VerticalToolbarDivider = (props) => {

    return <div style = {verticalDividerStyles}></div>

}

const FireIconControl = (props) => {
    
    return <div style = {fireIconControlStyles} >
        <img style = {iconStyles} src = {fireIcon} /><span style = {downArrowStyles} >▼</span>
    </div> 
}

const UserControl = (props) => {

    const 
        userData = useUserData(),
        { displayName, photoURL } = userData.authUser

    return <div style = {
        {
            display:'flex',
            flexWrap:'nowrap',
            marginLeft:'12px',
            borderRadius:'6px',
        }
    }>
        <img style = {avatarStyles} src = {photoURL} />
        <div style = {displayNameStyles} >{displayName}</div>
        <div style = {downArrowWrapperStyles} ><span style = {downArrowStyles}>▼</span></div>
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
                <MenuItem onClick = {gotoClassifieds} >Classifieds</MenuItem>
                <MenuDivider />
                <MenuItem onClick = {gotoAbout}>About</MenuItem>
                <MenuItem onClick = {gotoNotices}>Notices</MenuItem>
            </MenuList>
        </Menu>
        <VerticalToolbarDivider />
        <div style = {iconWrapperStyles} onClick = {gotoNotifications} >
            <Tooltip hasArrow label = 'Notifications to this account'>
                <img style = {iconStyles} src = {notificationsIcon} />
            </Tooltip>
        </div> 
        <div style = {iconWrapperStyles} onClick = {gotoMessages} >
            <Tooltip hasArrow label = 'Direct messages'>
                <img style = {iconStyles} src = {messageIcon} />
            </Tooltip>
        </div>
        <div style = {iconWrapperStyles} onClick = {gotoChatrooms} >
            <Tooltip hasArrow label = 'Chatrooms with this account'>
                <img style = {iconStyles} src = {chatIcon} />
            </Tooltip>
        </div>
        <div style = {iconWrapperStyles} onClick = {gotoNewsflows} >
            <Tooltip hasArrow label = 'Subscribed news flows'>
                <img style = {iconStyles} src = {subscriptionsIcon} />
            </Tooltip>
        </div>
        <div style = {iconWrapperStyles} >
            <Tooltip hasArrow label = 'Explain this toolbar'>
                <img style = {smallerIconStyles} src = {helpIcon} />
            </Tooltip>
        </div>
        <VerticalToolbarDivider />
        <div style = {iconWrapperStyles} onClick = {goHome}>
            <Tooltip hasArrow label = 'Go to the main work page'>
                <img style = {iconStyles} src = {homeIcon} />
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
        {!isSuperUser && <span>&nbsp;&nbsp;</span>}
        {isSuperUser && <>
            <VerticalToolbarDivider />
            <div style = {iconWrapperStyles} onClick = {gotoSysadmin}>
                <Tooltip hasArrow label = 'System settings'>
                    <img style = {iconStyles} src = {appSettingsIcon} />
                </Tooltip>
            </div>
            &nbsp;&nbsp;
            </>
        }
    </div>
}

export default StandardToolbar
