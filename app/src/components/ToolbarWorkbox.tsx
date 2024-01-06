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

const workboxIconStyles = {
    height:'20px',
    width:'20px',
}

const smallerIconStyles = {
    height:'18px', 
    width:'18px'
}

const iconWrapperStyles = {
    display:'inline-block',
    marginLeft:'12px',
    opacity:0.7,
}

const downArrowSpanStyles = {
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

const workboxItemIconStyles = {
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
        <img style = {workboxIconStyles} src = {workboxIcon} /><span style = {downArrowSpanStyles} >▼</span>
    </Box> 
}

// --------------------------- component ----------------------------
const ToolbarWorkbox = (props) => {

    const 
        { workboxItemIcon, workboxTitle } = props,
        [toggleValues, setToggleValues] = useState({profile:false, list:false, swap:false}),

        toggleOnProfileRef = useRef(false),
        disabledProfileRef = useRef(false),
        profileToggle = useToggleIcon({
            icon:profileIcon, 
            tooltip:'Toggle lists pane',
            toggleOnRef:toggleOnProfileRef, 
            disabled:disabledProfileRef.current 
        }),

        toggleOnListRef = useRef(false),
        disabledListRef = useRef(false),
        listToggle = useToggleIcon({
            icon:listIcon, 
            tooltip:'Toggle lists pane',
            toggleOnRef:toggleOnListRef, 
            disabled:disabledListRef.current 
        }),

        toggleOnSwapRef = useRef(false),
        disabledSwapRef = useRef(false),
        swapToggle = useToggleIcon({
            icon:swapIcon, 
            tooltip:'Toggle lists pane',
            toggleOnRef:toggleOnSwapRef, 
            disabled:disabledSwapRef.current 
        })

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
        {profileToggle}
        {listToggle}
        <ToolbarVerticalDivider />
        <span>&nbsp;&nbsp;</span>
        <img style = {workboxItemIconStyles} src = {workboxItemIcon} />
        <span>&nbsp;&nbsp;</span>
        <Text fontSize = 'sm'>{workboxTitle}</Text>
        <ToolbarVerticalDivider />
        {swapToggle}
        <Box style = {iconWrapperStyles} >
            <Tooltip hasArrow label = 'Explain this toolbar'>
                <img style = {smallerIconStyles} src = {helpIcon} />
            </Tooltip>
        </Box>
        <span>&nbsp;&nbsp;</span>
    </Box>
}

export default ToolbarWorkbox
