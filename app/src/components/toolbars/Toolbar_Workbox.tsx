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
import itemlistIcon from '../../../assets/package.png'
import documentIcon from '../../../assets/profile.png'
import bothIcon from '../../../assets/both.png'
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

        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        { settings } = workboxHandler,
        [toolbarState, setToolbarState] = useState('ready')

    const
        toggleOnDocumentRef = useRef(settings.configuration.document.show),
        disabledDocumentRef = useRef(settings.configuration.document.disabled),
        toggleOnItemlistRef = useRef(settings.configuration.itemlist.show),
        disabledItemlistRef = useRef(settings.configuration.itemlist.disabled),
        toggleOnBothRef = useRef(settings.configuration.both.show),
        disabledBothRef = useRef(settings.configuration.both.disabled),

        domainTitle = '',
        domainIcon = '',
        itemIcon = '',
        itemTitle = '',
        typeName = ''

    // any change of configuration triggers message to workboxcontent
    useEffect(()=> {

        const documentShow = settings.configuration.document.show = toggleOnDocumentRef.current
        settings.configuration.document.disabled = disabledDocumentRef.current
        const itemlistShow = settings.configuration.itemlist.show = toggleOnItemlistRef.current
        settings.configuration.itemlist.disabled = disabledItemlistRef.current
        const bothShow = settings.configuration.both.show = toggleOnBothRef.current
        settings.configuration.both.disabled = disabledBothRef.current

        let contentDisplayCode, documentDisplayCode, itemlistDisplayCode // configuration controls for children
        if (bothShow) {
            contentDisplayCode = 'both'
            documentDisplayCode = 'out'
            itemlistDisplayCode = 'out'
        } else if (itemlistShow) {
            contentDisplayCode = 'itemlist'
            documentDisplayCode = 'under'
            itemlistDisplayCode = 'over'
        } else { // documentShow
            contentDisplayCode = 'document'
            documentDisplayCode = 'over'
            itemlistDisplayCode = 'under'
        }

        settings.configuration.content.displaycode = contentDisplayCode        
        settings.configuration.document.displaycode = documentDisplayCode
        settings.configuration.itemlist.displaycode = itemlistDisplayCode

        setToolbarState('ready')
        dispatchWorkboxHandler()

    },[
        toggleOnDocumentRef.current,
        disabledDocumentRef.current,
        toggleOnItemlistRef.current,
        disabledItemlistRef.current,
        toggleOnBothRef.current,
        disabledBothRef.current,
    ])

    const callbackDocument = (value) => {
        event.preventDefault()
        if (disabledDocumentRef.current || toggleOnDocumentRef.current) return

        toggleOnDocumentRef.current = true
        toggleOnItemlistRef.current = false
        toggleOnBothRef.current = false

        setToolbarState('radio')
    }

    const callbackItemlist = (value) => {
        event.preventDefault()
        if (disabledItemlistRef.current || toggleOnItemlistRef.current) return

        toggleOnDocumentRef.current = false
        toggleOnItemlistRef.current = true
        toggleOnBothRef.current = false

        setToolbarState('radio')
    }

    const callbackBoth = (value) => {
        event.preventDefault()
        if (disabledBothRef.current || toggleOnBothRef.current) return

        toggleOnDocumentRef.current = false
        toggleOnItemlistRef.current = false
        toggleOnBothRef.current = true

        setToolbarState('radio')
    }

    const
        documentToggle = useToggleIcon({
            icon:documentIcon, 
            tooltip:'Show workbox document pane',
            caption:'document',
            toggleOnRef:toggleOnDocumentRef,
            disabledRef:disabledDocumentRef, 
            callback:callbackDocument,
            is_radio:true,
        }),

        itemlistToggle = useToggleIcon({
            icon:itemlistIcon, 
            tooltip:'Show workbox itemlist pane',
            caption:'item list',
            toggleOnRef:toggleOnItemlistRef,
            disabledRef:disabledItemlistRef, 
            callback:callbackItemlist,
            is_radio:true,
        }),

        bothToggle = useToggleIcon({
            icon:bothIcon, 
            tooltip:'Show both document and itemlist panes',
            caption:'both',
            toggleOnRef:toggleOnBothRef,
            disabledRef:disabledBothRef, 
            callback:callbackBoth,
            is_radio:true,
        })

    const workboxmenulist = <MenuList >
        <MenuItem >Workbox settings</MenuItem>
        <MenuItem >Workbox profile</MenuItem>
    </MenuList>

        // <ToolbarVerticalDivider />
        // <StandardIcon icon = {commentIcon} caption = 'comment' tooltip = 'add a comment to this workbox'/>
        // <StandardIcon icon = {shareIcon} caption = 'share' tooltip = 'share this workbox'/>
        // <ToolbarVerticalDivider />
        // <StandardIcon icon = {lastUpdateIcon} caption = 'last update' tooltip = 'last update of this workbox'/>

    // render
    return <Box data-type = 'workbox-toolbar' style = {workboxToolbarStyles}>
        <MenuIcon icon = {workboxIcon} caption = 'workbox' tooltip = 'Workbox' menulist = {workboxmenulist} />
        <ToolbarVerticalDivider />
        { documentToggle }
        { itemlistToggle }
        { bothToggle }
        <ToolbarVerticalDivider />
        <DomainControl domainTitle = {domainTitle} domainIcon = {domainIcon}/>
        <ItemControl itemIcon = {itemIcon} itemTitle = {itemTitle} />
        <TypeControl typeName = {typeName} />
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
