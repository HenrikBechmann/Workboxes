// Toolbar_Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'
import { signOut } from "firebase/auth"
import {
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup,
  Tooltip, Box, Text, VStack,
} from '@chakra-ui/react'

import { useWorkboxHandler } from '../workbox/Workbox'

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
import lastUpdateIcon from '../../../assets/last_update.png'

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
        // { 
        //     workboxConfig, 
        //     setWorkboxState, 
        //     itemTitle, 
        //     itemIcon, 
        //     domainTitle, 
        //     domainIcon, 
        //     typeName 
        // } = props,

        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        { settings, setWorkboxState } = workboxHandler

    console.log('workboxHandler',workboxHandler)

    const
        toggleOnDocumentRef = useRef(settings.configuration.document.show),
        disabledDocumentRef = useRef(settings.configuration.document.disabled),
        toggleOnItemlistRef = useRef(settings.configuration.itemlist.show),
        disabledItemlistRef = useRef(settings.configuration.itemlist.sisabled),
        toggleOnSettingsRef = useRef(settings.configuration.settings.show),
        disabledSettingsRef = useRef(settings.configuration.settings.disabled),

        toggleHistoryRef = useRef({
            documentShow:toggleOnDocumentRef.current,
        }),
        domainTitle = '',
        domainIcon = '',
        itemIcon = '',
        itemTitle = '',
        typeName = ''

    const 
        currentIsDocument = toggleOnDocumentRef.current,
        previousIsDocument = toggleHistoryRef.current.documentShow,
        currentIsItemlist = toggleOnItemlistRef.current

    if (!currentIsDocument && !currentIsItemlist) {
        if (previousIsDocument) {

            toggleOnItemlistRef.current = true

        } else {

            toggleOnDocumentRef.current = true

        }
    }

    // any change of configuration triggers message to workboxcontent
    useEffect(()=> {

        console.log('SETTINGS', settings)

        settings.configuration.document.show = toggleOnDocumentRef.current
        settings.configuration.document.disabled = disabledDocumentRef.current
        settings.configuration.itemlist.show = toggleOnItemlistRef.current
        settings.configuration.itemlist.disabled = disabledItemlistRef.current
        settings.configuration.settings.show = toggleOnSettingsRef.current
        settings.configuration.settings.disabled = disabledSettingsRef.current

        setWorkboxState('reconfig') // trigger render

    },[
        toggleOnDocumentRef.current,
        disabledDocumentRef.current,
        toggleOnItemlistRef.current,
        disabledItemlistRef.current,
        toggleOnSettingsRef.current,
        disabledSettingsRef.current,
    ])

    toggleHistoryRef.current = {
        documentShow:toggleOnDocumentRef.current,
    }

    const
        documentToggle = useToggleIcon({
            icon:profileIcon, 
            tooltip:'Toggle workbox document pane',
            caption:'document',
            toggleOnRef:toggleOnDocumentRef,
            disabledRef:disabledDocumentRef, 
        }),

        itemlistToggle = useToggleIcon({
            icon:packageIcon, 
            tooltip:'Toggle workbox itembox pane',
            caption:'itembox',
            toggleOnRef:toggleOnItemlistRef,
            disabledRef:disabledItemlistRef, 
        }),

        settingsToggle = useToggleIcon({
            icon:settingsIcon, 
            tooltip:'Toggle settings pane',
            caption:'settings',
            toggleOnRef:toggleOnSettingsRef, 
            disabledRef:disabledSettingsRef, 
        })

        // commentsToggle = useToggleIcon({
        //     icon:commentsIcon, 
        //     tooltip:'Show comments',
        //     caption:'see comments',
        //     toggleOnRef:toggleOnCommentsRef, 
        //     disabledRef:disabledCommentsRef, 
        // })

    const workboxmenulist = <MenuList >
        <MenuItem >Workbox settings</MenuItem>
        <MenuItem >Workbox profile</MenuItem>
    </MenuList>


    // render
    return <Box data-type = 'workbox-toolbar' style = {workboxToolbarStyles}>
        <MenuIcon icon = {workboxIcon} caption = 'workbox' tooltip = 'Workbox' menulist = {workboxmenulist} />
        <ToolbarVerticalDivider />
        { documentToggle }
        { itemlistToggle }
        <ToolbarVerticalDivider />
        <DomainControl domainTitle = {domainTitle} domainIcon = {domainIcon}/>
        <ItemControl itemIcon = {itemIcon} itemTitle = {itemTitle} />
        <TypeControl typeName = {typeName} />
        <ToolbarVerticalDivider />
        <StandardIcon icon = {commentIcon} caption = 'comment' tooltip = 'add a comment to this workbox'/>
        <StandardIcon icon = {shareIcon} caption = 'share' tooltip = 'share this workbox'/>
        <ToolbarVerticalDivider />
        <StandardIcon icon = {lastUpdateIcon} caption = 'last update' tooltip = 'last update of this workbox'/>
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'Explain this toolbar'/>
        {false && (<><ToolbarVerticalDivider />
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/></>)}
        <span>&nbsp;&nbsp;</span>
    </Box>
}

        // <StandardIcon icon = {likeIcon} caption = 'like' tooltip = 'like this workbox'/>
        // <StandardIcon icon = {viewsIcon} caption = 'views' tooltip = 'views of this workbox'/>

export default WorkboxToolbar

        // <ToolbarVerticalDivider />
        // { settingsToggle }
