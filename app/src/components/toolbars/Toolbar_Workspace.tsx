// Toolbar_Worspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'

import { useUserAuthData } from '../../system/WorkboxesProvider'

import {
  Box,
  Tooltip,
} from '@chakra-ui/react'

import StandardIcon from './StandardIcon'
import DomainControl from './DomainControl'
import MenuControl from './MenuControl'
import LearnIcon from './LearnIcon'
import ToolbarVerticalDivider from './VerticalDivider'
import DomainBase from './DomainBase'

import { useToggleIcon } from './ToggleIcon'

import panelIcon from '../../../assets/panel.png'
import helpIcon from '../../../assets/help.png'
import uploadIcon from '../../../assets/upload.png'
import databaseIcon from '../../../assets/database.png'
import moreVertIcon from '../../../assets/more_vert.png'
import expandMoreIcon from '../../../assets/expand_more.png'
import menuIcon from '../../../assets/menu.png'
import addIcon from '../../../assets/add.png'
import windowSelectIcon from '../../../assets/window_select.png'
import cartIcon from '../../../assets/cart.png'
import hideIcon from '../../../assets/expand_more.png'
import resetIcon from '../../../assets/restart.png'

const standardToolbarStyles = {
    minHeight:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'nowrap',
    whitespace:'nowrap',
    alignItems:'center',
    // height:'40px',
    boxSizing:'border-box',
    backgroundColor:'#dfecdf', //'#f2f2f2',
    borderRadius:'8px',
} as CSSProperties

const iconWrapperStyles = {
    display:'inline-block',
    // marginLeft:'12px',
    opacity:0.7,
}

const iconStyles = {
    height:'20px',
    width:'20px',
}

const panelIconStyles = {
    height:'20px',
    width:'20px',
    transform:'rotate(-90deg)'
}

const smallerIconStyles = {
    height:'18px', 
    width:'18px'
}

const upArrowWrapperStyles = {
    display:'flex',
    transform:'rotate(180deg)'

}

const arrowStyles = {
    opacity:0.5, 
    fontSize:'small',
    alignItems:'center',
}

const displayNameStyles = {
    display:'flex',
    flexWrap:'nowrap',
    alignItems:'center',
    whiteSpace:'nowrap',
    fontSize:'small', 
    marginLeft:'6px',
    marginRight:'3px', 
} as CSSProperties

// --------------------------- component ----------------------------

        // <StandardIcon icon = {menuIcon} caption = 'panels' tooltip = 'select a panel'/>
        // <StandardIcon icon = {addIcon} caption = 'new panel' tooltip = 'add a panel'/>

const WorkspaceToolbar = (props) => {

    const userAuthData = useUserAuthData()

    const {displayName, photoURL, uid} = userAuthData.authUser

    // render
    return <Box style = {standardToolbarStyles}>
        <MenuControl 
            displayName = 'Main panel' 
            tooltip = 'select a panel'
            arrowdirection = 'up'
            icon = {panelIcon}
            caption = 'workspace panel'
        />
        <DomainControl domainTitle = {displayName} domainIcon = {photoURL} caption = 'panel: base domain (user)'/>
        <StandardIcon icon = {resetIcon} caption = 'panel: reset' tooltip = 'reset panel to base domain workbox'/>
        <ToolbarVerticalDivider />
        <MenuControl 
            tooltip = 'select a window'
            arrowdirection = 'up'
            icon = {windowSelectIcon}
            caption = 'panel: windows'
        />
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'explain this toolbar' />
        <ToolbarVerticalDivider />
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>
        &nbsp; &nbsp;
    </Box>
}

export default WorkspaceToolbar

