// StandardToolbar.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'
import { signOut } from "firebase/auth"
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
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

const VerticalToolbarDivider = (props) => {

    return <div style = {{height:'20px',borderLeft:'1px solid gray', width:'0px', marginLeft:'12px'}}></div>

}

const FireIconControl = (props) => {
    
    return <div style = {
        {
            display:'flex',
            // backgroundColor:'lightgray',
            padding:'2px',
            borderRadius:'6px',
            marginLeft:'6px',
        }
    } ><img src = {fireIcon} /><span style = {{opacity:0.5}} >▼</span></div> 

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
            // opacity:0.7,
            // border:'1px solid gray',
        }
    }>
        <img style = {{width:'24px', height:'24px', borderRadius:'12px'}} src = {photoURL} />
        <div style = {{fontSize:'small', marginLeft:'4px',marginRight:'3px', whiteSpace:'nowrap'}} >{displayName}</div>
        <span style = {{opacity:0.5}} >▼</span>
    </div>

}

const StandardToolbar = (props) => {

    const 
        navigate = useNavigate(),
        userData = useUserData(),
        auth = useAuth(),
        { displayName, photoURL } = userData.authUser,
        isSuperUser = userData.sysadminStatus.isSuperUser

    const goHome = () => {
        navigate('/')
    }

    const gotoSysadmin = () => {
        navigate('/sysadmin')
    }

    const gotoAbout = () => {
        navigate('/about')
    }

    const gotoAccount = () => {
        navigate('/account')
    }

    const logOut = () => {

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
            </MenuList>
        </Menu>
        <div style = {{marginLeft:'12px',opacity:0.7}} >
            <img src = {notificationsIcon} />
        </div> 
        <div style = {{marginLeft:'12px',opacity:0.7}} >
            <img src = {chatIcon} />
        </div>
        <div style = {{marginLeft:'12px',opacity:0.7}} >
            <img src = {subscriptionsIcon} />
        </div>
        <div style = {{marginLeft:'12px',opacity:0.7}} >
            <img src = {helpIcon} />
        </div>
        <VerticalToolbarDivider />
        <div style = {{marginLeft:'12px',opacity:0.7}} onClick = {goHome}>
            <img src = {homeIcon} />
        </div>
        <Menu>
            <MenuButton >
                <UserControl />
            </MenuButton>
            <MenuList>
                <MenuItem onClick = {gotoAccount}>My account</MenuItem>
                <MenuItem onClick = {logOut}>Sign out</MenuItem>
            </MenuList>
        </Menu>
        {isSuperUser && <>
            <VerticalToolbarDivider />
            <div style = {{marginLeft:'12px',opacity:0.7}} onClick = {gotoSysadmin}>
                <img src = {appSettingsIcon} />
            </div>
        </>
        }
    </div>

}

export default StandardToolbar