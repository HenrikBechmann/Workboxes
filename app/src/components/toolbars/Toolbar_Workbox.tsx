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
import StandardIcon from './StandardIcon'
import ItemControl from './ItemControl'
import DomainControl from './DomainControl'
import TypeControl from './TypeControl'

import workboxIcon from '../../../assets/workbox.png'
import helpIcon from '../../../assets/help.png'
import listIcon from '../../../assets/list.png'
import profileIcon from '../../../assets/profile.png'
import swapIcon from '../../../assets/swap.png'
// import linkIcon from '../../../assets/link.png'
import settingsIcon from '../../../assets/settings.png'
import expandMoreIcon from '../../../assets/expand_more.png'
import shareIcon from '../../../assets/share.png'
import commentIcon from '../../../assets/comment.png'
import likeIcon from '../../../assets/like.png'

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
    border:'3px solid silver',

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
        { workboxControls, setWorkboxControls, workboxItemIcon, workboxItemTitle, workboxDomainTitle, workboxTypeName } = props,

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
        currentIsProfile = toggleOnProfileRef.current,
        previousIsProfile = toggleHistoryRef.current.profile,
        currentIsList = toggleOnLinksRef.current

    if (!currentIsProfile && !currentIsList) {
        if (previousIsProfile) {

            toggleOnLinksRef.current = true

        } else {

            toggleOnProfileRef.current = true

        }
    }

    // any change of configuration triggers message to workboxcontent
    useEffect(()=> {

        workboxControls.profile = toggleOnProfileRef.current
        workboxControls.profileDisabled = disabledProfileRef.current
        workboxControls.lists = toggleOnLinksRef.current
        workboxControls.listsDisabled = disabledLinksRef.current
        workboxControls.swap = toggleOnSwapRef.current
        workboxControls.swapDisabled = disabledSwapRef.current
        workboxControls.settings = toggleOnSettingsRef.current
        workboxControls.settingsDisabled = disabledSettingsRef.current

        setWorkboxControls({...workboxControls})

    },[
        toggleOnProfileRef.current,
        disabledProfileRef.current,
        toggleOnLinksRef.current,
        disabledLinksRef.current,
        toggleOnSwapRef.current,
        disabledSwapRef.current,
        toggleOnSettingsRef.current,
        disabledSettingsRef.current,
    ])

    toggleHistoryRef.current = {
        profile:toggleOnProfileRef.current,
    }

    const
        profileToggle = useToggleIcon({
            icon:profileIcon, 
            tooltip:'Toggle workbox cover pane',
            caption:'cover',
            toggleOnRef:toggleOnProfileRef,
            disabledRef:disabledProfileRef, 
        }),

        listToggle = useToggleIcon({
            icon:listIcon, 
            tooltip:'Toggle workbox contents pane',
            caption:'contents',
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
            tooltip:'Toggle settings pane',
            caption:'settings',
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
        <ToolbarVerticalDivider />
        { profileToggle }
        { listToggle }
        <ToolbarVerticalDivider />
        {swapToggle}
        <ToolbarVerticalDivider />
        <ItemControl workboxItemIcon = {workboxItemIcon} workboxItemTitle = {workboxItemTitle} />
        <TypeControl workboxTypeName = {workboxTypeName} />
        <DomainControl workboxDomainTitle = {workboxDomainTitle} />
        <ToolbarVerticalDivider />
        <StandardIcon icon = {commentIcon} caption = 'comment' tooltip = 'add a comment to this workbox'/>
        <StandardIcon icon = {likeIcon} caption = 'like' tooltip = 'like this workbox'/>
        <StandardIcon icon = {shareIcon} caption = 'share' tooltip = 'share this workbox'/>
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'Explain this toolbar'/>
        <span>&nbsp;&nbsp;</span>
    </Box>
}

export default WorkboxToolbar
