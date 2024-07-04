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
import resourcesIcon from '../../../assets/resources.png'
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
    backgroundColor: '#f2f2f2',
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
        { workboxRecord } = workboxHandler,
        { settings } = workboxHandler,
        [toolbarState, setToolbarState] = useState('ready')

    // console.log('toolbarState, workboxRecord', toolbarState, workboxRecord)

    const
        toggleOnDocumentRef = useRef(settings.document.show),
        disabledDocumentRef = useRef(settings.document.disabled),
        toggleOnResourcesRef = useRef(settings.resources.show),
        disabledResourcesRef = useRef(settings.resources.disabled),
        toggleOnBothRef = useRef(settings.both.show),
        disabledBothRef = useRef(settings.both.disabled),

        domainTitle = workboxRecord?.profile.domain.name,
        domainIcon = workboxRecord?.profile.domain.image?.source,
        itemIcon = workboxRecord?.profile.workbox.image.source,
        itemTitle = workboxRecord?.profile.workbox.name,
        typeName = workboxRecord?.profile.type.alias

    // any change of configuration triggers message to workboxcontent
    useEffect(()=> {

        const documentShow = settings.document.show = toggleOnDocumentRef.current
        settings.document.disabled = disabledDocumentRef.current
        const resourcesShow = settings.resources.show = toggleOnResourcesRef.current
        settings.resources.disabled = disabledResourcesRef.current
        const bothShow = settings.both.show = toggleOnBothRef.current
        settings.both.disabled = disabledBothRef.current

        let contentDisplayCode, documentDisplayCode, resourcesDisplayCode // configuration controls for children
        if (bothShow) {
            contentDisplayCode = 'both'
            documentDisplayCode = 'out'
            resourcesDisplayCode = 'out'
        } else if (resourcesShow) {
            contentDisplayCode = 'resources'
            documentDisplayCode = 'under'
            resourcesDisplayCode = 'over'
        } else { // documentShow
            contentDisplayCode = 'document'
            documentDisplayCode = 'over'
            resourcesDisplayCode = 'under'
        }

        settings.content.displaycode = contentDisplayCode        
        settings.document.displaycode = documentDisplayCode
        settings.resources.displaycode = resourcesDisplayCode

        setToolbarState('ready')
        dispatchWorkboxHandler()

    },[
        toggleOnDocumentRef.current,
        disabledDocumentRef.current,
        toggleOnResourcesRef.current,
        disabledResourcesRef.current,
        toggleOnBothRef.current,
        disabledBothRef.current,
    ])

    const callbackDocument = (value) => {
        event.preventDefault()
        if (disabledDocumentRef.current || toggleOnDocumentRef.current) return

        toggleOnDocumentRef.current = true
        toggleOnResourcesRef.current = false
        toggleOnBothRef.current = false

        setToolbarState('radio')
    }

    const callbackResources = (value) => {
        event.preventDefault()
        if (disabledResourcesRef.current || toggleOnResourcesRef.current) return

        toggleOnDocumentRef.current = false
        toggleOnResourcesRef.current = true
        toggleOnBothRef.current = false

        setToolbarState('radio')
    }

    const callbackBoth = (value) => {
        event.preventDefault()
        if (disabledBothRef.current || toggleOnBothRef.current) return

        toggleOnDocumentRef.current = false
        toggleOnResourcesRef.current = false
        toggleOnBothRef.current = true

        setToolbarState('radio')
    }

    const
        documentToggle = useToggleIcon({
            icon:documentIcon, 
            tooltip:'Show workbox document view',
            caption:'document',
            toggleOnRef:toggleOnDocumentRef,
            disabledRef:disabledDocumentRef, 
            callback:callbackDocument,
            is_radio:true,
        }),

        resourcesToggle = useToggleIcon({
            icon:resourcesIcon, 
            tooltip:'Show workbox resources view',
            caption:'resources',
            toggleOnRef:toggleOnResourcesRef,
            disabledRef:disabledResourcesRef, 
            callback:callbackResources,
            is_radio:true,
        }),

        bothToggle = useToggleIcon({
            icon:bothIcon, 
            tooltip:'Show both document and resources views',
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

    // console.log('domainTitle, itemTitle, typeName',domainTitle, itemTitle, typeName)

    // render
    return <Box data-type = 'workbox-toolbar' style = {workboxToolbarStyles}>
        <MenuIcon icon = {workboxIcon} caption = 'workbox' tooltip = 'Workbox' menulist = {workboxmenulist} />
        <ToolbarVerticalDivider />
        { documentToggle }
        { resourcesToggle }
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
