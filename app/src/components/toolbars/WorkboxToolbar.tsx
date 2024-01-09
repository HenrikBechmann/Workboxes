// ToolbarWorkbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'
import { signOut } from "firebase/auth"
import { useNavigate } from 'react-router-dom'
import {
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup,
  Tooltip, Box, Text, VStack,
} from '@chakra-ui/react'

import { useUserData, useAuth } from '../../system/FirebaseProviders'

import { useToggleIcon } from './ToggleIcon'
import ToolbarVerticalDivider from './ToolbarVerticalDivider'

import workboxIcon from '../../../assets/workbox.png'
import helpIcon from '../../../assets/help.png'
import listIcon from '../../../assets/list.png'
import profileIcon from '../../../assets/profile.png'
import swapIcon from '../../../assets/swap.png'
import linkIcon from '../../../assets/link.png'

// ----------------------------- static values -----------------------------
const workboxToolbarStyles = {
    minHeight:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'nowrap',
    whitespace:'nowrap',
    alignItems:'center',
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
    flexDirection:'column',
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
        <Box display = 'flex' flexWrap = 'nowrap' height = '24px' width = '24px' alignItems = 'center'>
            <img style = {workboxIconStyles} src = {workboxIcon} />
            <span style = {downArrowSpanStyles} >▼</span>
        </Box>
        <Box fontSize = 'xs' fontStyle = 'italic'>
            <span>workbox</span>
        </Box>
    </Box> 
}

// --------------------------- component ----------------------------
const WorkboxToolbar = (props) => {

    const 
        { workboxControls, setWorkboxControls, workboxItemIcon, workboxTitle } = props,

        toggleOnProfileRef = useRef(workboxControls.profile),
        disabledProfileRef = useRef(workboxControls.profileDisabled),
        toggleOnLinksRef = useRef(workboxControls.lists),
        disabledLinksRef = useRef(workboxControls.listsDisabled),
        toggleOnSwapRef = useRef(workboxControls.swap),
        disabledSwapRef = useRef(workboxControls.swapDisabled),

        toggleHistoryRef = useRef({
            profile:toggleOnProfileRef.current,
        })

    const 
        currentProfile = toggleOnProfileRef.current,
        previousProfile = toggleHistoryRef.current.profile,
        currentList = toggleOnLinksRef.current

    if (!currentProfile && !currentList) {
        if (previousProfile) {

            toggleOnLinksRef.current = true

        } else {

            toggleOnProfileRef.current = true

        }
    }

    toggleHistoryRef.current = {
        profile:toggleOnProfileRef.current,
    }

    const
        profileToggle = useToggleIcon({
            icon:profileIcon, 
            tooltip:'Toggle profile pane',
            caption:'profile',
            toggleOnRef:toggleOnProfileRef,
            disabledRef:disabledProfileRef, 
        }),

        listToggle = useToggleIcon({
            icon:listIcon, 
            tooltip:'Toggle lists pane',
            caption:'lists',
            toggleOnRef:toggleOnLinksRef,
            disabledRef:disabledLinksRef, 
        }),

        swapToggle = useToggleIcon({
            icon:swapIcon, 
            tooltip:'Toggle swap pane',
            caption:'mirror',
            toggleOnRef:toggleOnSwapRef, 
            disabledRef:disabledSwapRef, 
        })

    // render
    return <Box data-type = 'workbox-toolbar' style = {workboxToolbarStyles}>
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

export default WorkboxToolbar
