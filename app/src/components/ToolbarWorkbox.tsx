// ToolbarWorkbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, CSSProperties} from 'react'
import { signOut } from "firebase/auth"
import { useNavigate } from 'react-router-dom'
import {
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup,
  Tooltip, Box, Text
} from '@chakra-ui/react'

import { useUserData, useAuth } from '../system/FirebaseProviders'

import ToolbarVerticalDivider from '../components/ToolbarVerticalDivider'
import { useToggleIcon } from './ToggleIcon'

import workboxIcon from '../../assets/workbox.png'
import helpIcon from '../../assets/help.png'
import listIcon from '../../assets/list.png'
import profileIcon from '../../assets/profile.png'
import swapIcon from '../../assets/swap.png'

// ----------------------------- static values -----------------------------
const workboxToolbarStyles = {
    minHeight:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'nowrap',
    whitespace:'nowrap',
    alignItems:'center',
    height:'40px',
    boxSizing:'border-box',
    backgroundColor:'#f2f2f2',
    borderRadius:'8px 8px 0 0',

} as CSSProperties

const iconWrapperStyles = {
    display:'inline-block',
    marginLeft:'12px',
    opacity:0.7,
}

const iconToggleStyles = {
    width:'24px',
    height:'24px',
    display:'inline-block',
    marginLeft:'12px',
    opacity:0.7,
    border: '1px solid black',
    borderRadius: '12px',
    padding:'3px',
    boxShadow:'none',
    transition: 'box-shadow 0.2s, backgroundColor 0.2s',
}

const iconStyles = {
    height:'20px',
    width:'20px',
}

const toggleIconStyles = {
    height:'16px',
    width:'16px',

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

const workboxIconControlStyles = {
    display:'flex',
    flexWrap:'nowrap',
    alignItems:'center',
    padding:'2px',
    borderRadius:'6px',
    marginLeft:'6px',
} as CSSProperties

const itemIconStyles = {
    width:'24px', 
    height:'24px', 
    borderRadius:'12px',
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

// ---------------------------- embedded components ----------------------------
const WorkboxControl = (props) => {
    
    return <Box style = {workboxIconControlStyles} >
        <img style = {iconStyles} src = {workboxIcon} /><span style = {downArrowStyles} >▼</span>
    </Box> 
}

// --------------------------- component ----------------------------
const ToolbarWorkbox = (props) => {

    console.log('running ToolbarWorkbox')
    // ------------------------------ hooks ------------------------
    const 
        navigate = useNavigate(),
        userData = useUserData(),
        auth = useAuth(),
        { displayName, photoURL } = userData.authUser,
        isSuperUser = userData.sysadminStatus.isSuperUser

    // --------------------- navigation functions ------------------

    const [toggleValues, setToggleValues] = useState({profile:false, list:false, swap:false})
    const 
        profileIconRef = useRef(null),
        listIconRef = useRef(null),
        swapIconRef = useRef(null)


    const toggleIcon = (event) => {
        event.preventDefault()
        const target = event.target
        const id = target.id
        switch (id) {
            case 'profileicon':{
                if (toggleValues.profile) {
                    profileIconRef.current.style.backgroundColor = 'transparent'
                    profileIconRef.current.style.boxShadow = 'none'
                } else {
                    profileIconRef.current.style.backgroundColor = 'chartreuse'
                    profileIconRef.current.style.boxShadow = 'inset 3px 3px 3px gray'
                }
                toggleValues.profile = !toggleValues.profile
                break
            }
            case 'listicon': {
                if (toggleValues.list) {
                    listIconRef.current.style.backgroundColor = 'transparent'
                    listIconRef.current.style.boxShadow = 'none'
                } else {
                    listIconRef.current.style.backgroundColor = 'chartreuse'
                    listIconRef.current.style.boxShadow = 'inset 3px 3px 3px gray'
                }
                toggleValues.list = !toggleValues.list
                break
            }
            case 'swapicon': {
                if (toggleValues.swap) {
                    swapIconRef.current.style.backgroundColor = 'transparent'
                    swapIconRef.current.style.boxShadow = 'none'
                } else {
                    swapIconRef.current.style.backgroundColor = 'chartreuse'
                    swapIconRef.current.style.boxShadow = 'inset 3px 3px 3px gray'
                }
                toggleValues.swap = !toggleValues.swap
                break
            }
        }
        setToggleValues({...toggleValues})
    }

    const toggleOnRef = useRef(false)
    const listToggle = useToggleIcon({icon:listIcon, tooltip:'Toggle lists pane',toggleOnRef, disabled:false })

    // render
    return <Box style = {workboxToolbarStyles}>
        <Menu>
            <MenuButton >
                <WorkboxControl />
            </MenuButton>
            <MenuList>
                <MenuItem >Workbox settings</MenuItem>
            </MenuList>
        </Menu>
        <ToolbarVerticalDivider />
        <Box onClick = {toggleIcon} ref = {profileIconRef} style = {iconToggleStyles} >
            <Tooltip hasArrow label = 'Toggle profile pane'>
                <img id = 'profileicon' style = {toggleIconStyles} src = {profileIcon} />
            </Tooltip>
        </Box>
        <Box onClick = {toggleIcon} ref = {listIconRef} style = {iconToggleStyles}>
            <Tooltip hasArrow label = 'Toggle lists pane'>
                <img id = 'listicon' style = {toggleIconStyles} src = {listIcon} />
            </Tooltip>
        </Box> 
        {listToggle}
        <ToolbarVerticalDivider />
        <span>&nbsp;&nbsp;</span>
        <img style = {itemIconStyles} src = {photoURL} />
        <span>&nbsp;&nbsp;</span>
        <Text fontSize = 'sm'>Henrik Bechmann</Text>
        <ToolbarVerticalDivider />
        <Box onClick = {toggleIcon} ref = {swapIconRef} style = {iconToggleStyles} >
            <Tooltip hasArrow label = 'Toggle swap box'>
                <img id = 'swapicon' style = {toggleIconStyles} src = {swapIcon} />
            </Tooltip>
        </Box>
        <Box style = {iconWrapperStyles} >
            <Tooltip hasArrow label = 'Explain this toolbar'>
                <img style = {smallerIconStyles} src = {helpIcon} />
            </Tooltip>
        </Box>
        <span>&nbsp;&nbsp;</span>
    </Box>
}

export default ToolbarWorkbox
