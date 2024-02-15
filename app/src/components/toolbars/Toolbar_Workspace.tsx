// Toolbar_Worspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'

import {
  Box,
  Tooltip,
} from '@chakra-ui/react'

import StandardIcon from './StandardIcon'
import MenuControl from './MenuControl'
import LearnIcon from './LearnIcon'
import ToolbarVerticalDivider from './VerticalDivider'

import panelIcon from '../../../assets/panel.png'
import helpIcon from '../../../assets/help.png'
import uploadIcon from '../../../assets/upload.png'
import databaseIcon from '../../../assets/database.png'
import moreVertIcon from '../../../assets/more_vert.png'
import expandMoreIcon from '../../../assets/expand_more.png'
import menuIcon from '../../../assets/menu.png'
import addIcon from '../../../assets/add.png'

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
// bottom toolbar
const WorkspaceToolbar = (props) => {

    // render
    return <Box style = {standardToolbarStyles}>
        <StandardIcon icon = {menuIcon} tooltip = 'select panel'/>
        <StandardIcon icon = {addIcon} tooltip = 'add a panel'/>
        <ToolbarVerticalDivider />
        <MenuControl 
            icon = {panelIcon} 
            moreStyles = {{transform:'rotate(-90deg)'}}
            displayName = 'main panel' 
            tooltip = 'select a panel'
            arrowdirection = 'up'
        />
        &nbsp; &nbsp;
    </Box>
}

// <LearnIcon tooltip = 'Explain this toolbar'/>
// <ToolbarVerticalDivider />
// <StandardIcon icon = {databaseIcon} caption = 'local' tooltip = 'save workspace config to local'/>
// <StandardIcon icon = {uploadIcon} caption = 'cloud' tooltip = 'save workspace config to the cloud' />
// <StandardIcon icon = {moreVertIcon} caption = 'more' tooltip = 'more options' />

export default WorkspaceToolbar

