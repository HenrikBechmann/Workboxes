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
import viewsIcon from '../../../assets/views.png'

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
    borderRadius:'8px',
    border:'3px ridge silver',

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
        { workboxConfig, setWorkboxConfig, itemIcon, itemTitle, domainTitle, typeName } = props,

        toggleOnCoverRef = useRef(workboxConfig.coverShow),
        disabledCoverRef = useRef(workboxConfig.coverDisabled),
        toggleOnContentsRef = useRef(workboxConfig.contentsShow),
        disabledContentsRef = useRef(workboxConfig.contentsDisabled),
        toggleOnSettingsRef = useRef(workboxConfig.settingsShow),
        disabledSettingsRef = useRef(workboxConfig.settingsDisabled),

        toggleHistoryRef = useRef({
            coverShow:toggleOnCoverRef.current,
        })

    const 
        currentIsCover = toggleOnCoverRef.current,
        previousIsCover = toggleHistoryRef.current.coverShow,
        currentIsContents = toggleOnContentsRef.current

    if (!currentIsCover && !currentIsContents) {
        if (previousIsCover) {

            toggleOnContentsRef.current = true

        } else {

            toggleOnCoverRef.current = true

        }
    }

    // any change of configuration triggers message to workboxcontent
    useEffect(()=> {

        workboxConfig.coverShow = toggleOnCoverRef.current
        workboxConfig.coverDisabled = disabledCoverRef.current
        workboxConfig.contentsShow = toggleOnContentsRef.current
        workboxConfig.contentsDisabled = disabledContentsRef.current
        workboxConfig.settingsShow = toggleOnSettingsRef.current
        workboxConfig.settingsDisabled = disabledSettingsRef.current

        setWorkboxConfig({...workboxConfig}) // trigger render

    },[
        toggleOnCoverRef.current,
        disabledCoverRef.current,
        toggleOnContentsRef.current,
        disabledContentsRef.current,
        toggleOnSettingsRef.current,
        disabledSettingsRef.current,
    ])

    toggleHistoryRef.current = {
        coverShow:toggleOnCoverRef.current,
    }

    const
        coverToggle = useToggleIcon({
            icon:profileIcon, 
            tooltip:'Toggle workbox cover pane',
            caption:'cover',
            toggleOnRef:toggleOnCoverRef,
            disabledRef:disabledCoverRef, 
        }),

        contentsToggle = useToggleIcon({
            icon:listIcon, 
            tooltip:'Toggle workbox contents pane',
            caption:'contents',
            toggleOnRef:toggleOnContentsRef,
            disabledRef:disabledContentsRef, 
        }),

        settingsToggle = useToggleIcon({
            icon:settingsIcon, 
            tooltip:'Toggle settings pane',
            caption:'settings',
            toggleOnRef:toggleOnSettingsRef, 
            disabledRef:disabledSettingsRef, 
        })

    const workboxmenulist = <MenuList >
        <MenuItem >Workbox settings</MenuItem>
    </MenuList>


    // render
    return <Box data-type = 'workbox-toolbar' style = {workboxToolbarStyles}>
        <MenuIcon icon = {workboxIcon} caption = 'workbox' tooltip = 'Workbox' menulist = {workboxmenulist} />
        <ToolbarVerticalDivider />
        { settingsToggle }
        <ToolbarVerticalDivider />
        { coverToggle }
        { contentsToggle }
        <ToolbarVerticalDivider />
        <ItemControl itemIcon = {itemIcon} itemTitle = {itemTitle} />
        <TypeControl typeName = {typeName} />
        <DomainControl domainTitle = {domainTitle} />
        <ToolbarVerticalDivider />
        <StandardIcon icon = {likeIcon} caption = 'like' tooltip = 'like this workbox'/>
        <StandardIcon icon = {commentIcon} caption = 'comment' tooltip = 'add a comment to this workbox'/>
        <StandardIcon icon = {viewsIcon} caption = 'views' tooltip = 'views of this workbox'/>
        <StandardIcon icon = {shareIcon} caption = 'share' tooltip = 'share this workbox'/>
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'Explain this toolbar'/>
        <span>&nbsp;&nbsp;</span>
    </Box>
}

export default WorkboxToolbar
