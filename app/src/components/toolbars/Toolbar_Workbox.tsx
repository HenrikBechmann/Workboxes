// Toolbar_Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'
import { signOut } from "firebase/auth"
import {
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup,
  Tooltip, Box, Text, VStack,
} from '@chakra-ui/react'

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
// import listIcon from '../../../assets/list.png'
import packageIcon from '../../../assets/package.png'
import profileIcon from '../../../assets/profile.png'
import swapIcon from '../../../assets/swap.png'
// import linkIcon from '../../../assets/link.png'
import settingsIcon from '../../../assets/settings.png'
import expandMoreIcon from '../../../assets/expand_more.png'
import shareIcon from '../../../assets/share.png'
import commentIcon from '../../../assets/comment.png'
import likeIcon from '../../../assets/like.png'
import viewsIcon from '../../../assets/views.png'
import commentsIcon from '../../../assets/comments.png'
import hideIcon from '../../../assets/expand_less.png'

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
        { 
            workboxConfig, 
            setWorkboxConfig, 
            itemTitle, 
            itemIcon, 
            domainTitle, 
            domainIcon, 
            typeName 
        } = props,

        toggleOnDocumentRef = useRef(workboxConfig.coverShow),
        disabledDocumentRef = useRef(workboxConfig.coverDisabled),
        toggleOnDataboxRef = useRef(workboxConfig.contentsShow),
        disabledDataboxRef = useRef(workboxConfig.contentsDisabled),
        toggleOnSettingsRef = useRef(workboxConfig.settingsShow),
        disabledSettingsRef = useRef(workboxConfig.settingsDisabled),
        toggleOnCommentsRef = useRef(workboxConfig.settingsShow),
        disabledCommentsRef = useRef(workboxConfig.settingsDisabled),

        toggleHistoryRef = useRef({
            coverShow:toggleOnDocumentRef.current,
        })

    const 
        currentIsDocument = toggleOnDocumentRef.current,
        previousIsDocument = toggleHistoryRef.current.coverShow,
        currentIsDatabox = toggleOnDataboxRef.current

    if (!currentIsDocument && !currentIsDatabox) {
        if (previousIsDocument) {

            toggleOnDataboxRef.current = true

        } else {

            toggleOnDocumentRef.current = true

        }
    }

    // any change of configuration triggers message to workboxcontent
    useEffect(()=> {

        workboxConfig.coverShow = toggleOnDocumentRef.current
        workboxConfig.coverDisabled = disabledDocumentRef.current
        workboxConfig.contentsShow = toggleOnDataboxRef.current
        workboxConfig.contentsDisabled = disabledDataboxRef.current
        workboxConfig.settingsShow = toggleOnSettingsRef.current
        workboxConfig.settingsDisabled = disabledSettingsRef.current

        setWorkboxConfig({...workboxConfig}) // trigger render

    },[
        toggleOnDocumentRef.current,
        disabledDocumentRef.current,
        toggleOnDataboxRef.current,
        disabledDataboxRef.current,
        toggleOnSettingsRef.current,
        disabledSettingsRef.current,
    ])

    toggleHistoryRef.current = {
        coverShow:toggleOnDocumentRef.current,
    }

    const
        coverToggle = useToggleIcon({
            icon:profileIcon, 
            tooltip:'Toggle workbox document pane',
            caption:'document',
            toggleOnRef:toggleOnDocumentRef,
            disabledRef:disabledDocumentRef, 
        }),

        contentsToggle = useToggleIcon({
            icon:packageIcon, 
            tooltip:'Toggle workbox databox pane',
            caption:'databox',
            toggleOnRef:toggleOnDataboxRef,
            disabledRef:disabledDataboxRef, 
        }),

        settingsToggle = useToggleIcon({
            icon:settingsIcon, 
            tooltip:'Toggle settings pane',
            caption:'settings',
            toggleOnRef:toggleOnSettingsRef, 
            disabledRef:disabledSettingsRef, 
        }),

        commentsToggle = useToggleIcon({
            icon:commentsIcon, 
            tooltip:'Show comments',
            caption:'see comments',
            toggleOnRef:toggleOnCommentsRef, 
            disabledRef:disabledCommentsRef, 
        })

    const workboxmenulist = <MenuList >
        <MenuItem >Workbox settings</MenuItem>
        <MenuItem >Workbox profile</MenuItem>
    </MenuList>


    // render
    return <Box data-type = 'workbox-toolbar' style = {workboxToolbarStyles}>
        <MenuIcon icon = {workboxIcon} caption = 'workbox' tooltip = 'Workbox' menulist = {workboxmenulist} />
        <ToolbarVerticalDivider />
        { coverToggle }
        { contentsToggle }
        <ToolbarVerticalDivider />
        <DomainControl domainTitle = {domainTitle} domainIcon = {domainIcon}/>
        <ItemControl itemIcon = {itemIcon} itemTitle = {itemTitle} />
        <TypeControl typeName = {typeName} />
        <ToolbarVerticalDivider />
        <StandardIcon icon = {commentIcon} caption = 'comment' tooltip = 'add a comment to this workbox'/>
        { commentsToggle }
        <StandardIcon icon = {shareIcon} caption = 'share' tooltip = 'share this workbox'/>
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'Explain this toolbar'/>
        <ToolbarVerticalDivider />
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>
        <span>&nbsp;&nbsp;</span>
    </Box>
}

        // <StandardIcon icon = {likeIcon} caption = 'like' tooltip = 'like this workbox'/>
        // <StandardIcon icon = {viewsIcon} caption = 'views' tooltip = 'views of this workbox'/>

export default WorkboxToolbar

        // <ToolbarVerticalDivider />
        // { settingsToggle }
