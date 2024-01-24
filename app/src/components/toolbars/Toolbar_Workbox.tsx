// Toolbar_Workbox.tsx
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
import ToolbarVerticalDivider from './VerticalDivider'
import MenuIcon from './MenuIcon'
import MenuControl from './MenuControl'
import LearnIcon from './LearnIcon'
import ItemControl from './ItemControl'

import workboxIcon from '../../../assets/workbox.png'
import helpIcon from '../../../assets/help.png'
import listIcon from '../../../assets/list.png'
import profileIcon from '../../../assets/profile.png'
import swapIcon from '../../../assets/swap.png'
// import linkIcon from '../../../assets/link.png'
import settingsIcon from '../../../assets/settings.png'

// ----------------------------- static values -----------------------------
const workboxToolbarStyles = {
    padding:'2px',
    minHeight:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'nowrap',
    whitespace:'nowrap',
    alignItems:'center',
    boxSizing:'border-box',
    backgroundColor:'#f2f2f2',
    borderRadius:'8px 8px 0 0',
    border:'3px solid gray',

} as CSSProperties

const smallerIconStyles = {
    height:'18px', 
    width:'18px'
}

const iconWrapperStyles = {
    height: '24px',
    // display:'inline-block',
    opacity:0.7,
    padding:'4px',
}

// --------------------------- component ----------------------------
const WorkboxToolbar = (props) => {

    const 
        { workboxControls, setWorkboxControls, workboxItemIcon, workboxItemTitle } = props,

        toggleOnProfileRef = useRef(workboxControls.profile),
        disabledProfileRef = useRef(workboxControls.profileDisabled),
        toggleOnLinksRef = useRef(workboxControls.lists),
        disabledLinksRef = useRef(workboxControls.listsDisabled),
        toggleOnSwapRef = useRef(workboxControls.swap),
        disabledSwapRef = useRef(workboxControls.swapDisabled),
        toggleOnSettingsRef = useRef(workboxControls.settings),
        disabledSettingsRef = useRef(workboxControls.settingsDisabled),

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
            tooltip:'Toggle document pane',
            caption:'document',
            toggleOnRef:toggleOnProfileRef,
            disabledRef:disabledProfileRef, 
        }),

        listToggle = useToggleIcon({
            icon:listIcon, 
            tooltip:'Toggle links pane',
            caption:'links',
            toggleOnRef:toggleOnLinksRef,
            disabledRef:disabledLinksRef, 
        }),

        swapToggle = useToggleIcon({
            icon:swapIcon, 
            tooltip:'Toggle swap pane',
            caption:'mirror',
            toggleOnRef:toggleOnSwapRef, 
            disabledRef:disabledSwapRef, 
        }),

        settingsToggle = useToggleIcon({
            icon:settingsIcon, 
            tooltip:'Toggle properties pane',
            caption:'properties',
            toggleOnRef:toggleOnSettingsRef, 
            disabledRef:disabledSettingsRef, 
        })

    const workboxmenulist = <MenuList>
        <MenuItem >Workbox settings</MenuItem>
    </MenuList>


    // render
    return <Box data-type = 'workbox-toolbar' style = {workboxToolbarStyles}>
        <MenuIcon icon = {workboxIcon} caption = 'workbox' tooltip = 'Workbox' menulist = {workboxmenulist} />
        <ToolbarVerticalDivider />
        { settingsToggle }
        { profileToggle }
        { listToggle }
        <ToolbarVerticalDivider />
        <ItemControl workboxItemIcon = {workboxItemIcon} workboxItemTitle = {workboxItemTitle} />
        <ToolbarVerticalDivider />
        {swapToggle}
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'Explain this toolbar'/>
        <span>&nbsp;&nbsp;</span>
    </Box>
}

export default WorkboxToolbar
