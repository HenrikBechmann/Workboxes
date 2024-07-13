// Toolbar_Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'
import { signOut } from "firebase/auth"
import {
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup,
  Tooltip, Box, Text, VStack,
} from '@chakra-ui/react'

import { useWorkboxHandler } from '../workbox/Workbox'

import { useToggleIcon } from './controls/ToggleIcon'
import ToolbarVerticalDivider from './controls/VerticalDivider'
import MenuIcon from './controls/MenuIcon'
import MenuControl from './controls/MenuControl'
import LearnIcon from './controls/LearnIcon'
import StandardIcon from './controls/StandardIcon'
import ItemControl from './controls/ItemControl'
import DomainControl from './controls/DomainControl'
import TypeControl from './controls/TypeControl'

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
        modeSettings = workboxHandler.session.workbox.modesettings
        // [toolbarState, setToolbarState] = useState('ready')

    const
        // toggleOnDocumentRef = useRef(settings.document.show),
        // disabledDocumentRef = useRef(settings.document.disabled),
        // toggleOnResourcesRef = useRef(settings.resources.show),
        // disabledResourcesRef = useRef(settings.resources.disabled),
        // toggleOnBothRef = useRef(settings.both.show),
        // disabledBothRef = useRef(settings.both.disabled),

        domainTitle = workboxRecord?.profile.domain.name,
        domainIcon = workboxRecord?.profile.domain.image?.source,
        itemIcon = workboxRecord?.profile.workbox.image.source,
        itemTitle = workboxRecord?.profile.workbox.name,
        typeName = workboxRecord?.profile.type.alias

    // any change of configuration triggers message to workboxcontent
    useEffect(()=> {

        let contentDisplayCode, documentDisplayCode, resourcesDisplayCode // configuration controls for children
        if (modeSettings.both.select) {
            contentDisplayCode = 'both'
            documentDisplayCode = 'out'
            resourcesDisplayCode = 'out'
        } else if (modeSettings.resources.select) {
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

        dispatchWorkboxHandler()

    },[
        modeSettings.document.select,
        modeSettings.resources.select,
        modeSettings.both.select,
    ])

    const callbackDocument = (value) => {

        modeSettings.document.select = true
        modeSettings.resources.select = false
        modeSettings.both.select = false
        dispatchWorkboxHandler()

    }

    const callbackResources = (value) => {

        modeSettings.document.select = false
        modeSettings.resources.select = true
        modeSettings.both.select = false
        dispatchWorkboxHandler()

    }

    const callbackBoth = (value) => {

        modeSettings.document.select = false
        modeSettings.resources.select = false
        modeSettings.both.select = true
        dispatchWorkboxHandler()

    }

    const
        documentToggle = useToggleIcon({
            icon:documentIcon, 
            tooltip:'Show workbox document view',
            caption:'document',
            settings:modeSettings.document,
            callback:callbackDocument,
            is_radio:true,
        }),

        resourcesToggle = useToggleIcon({
            icon:resourcesIcon, 
            tooltip:'Show workbox resources view',
            caption:'resources',
            settings:modeSettings.resources,
            callback:callbackResources,
            is_radio:true,
        }),

        bothToggle = useToggleIcon({
            icon:bothIcon, 
            tooltip:'Show both document and resources views',
            caption:'both',
            settings:modeSettings.both,
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
