// Toolbar_Worspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, useRef, useState, useEffect, CSSProperties} from 'react'

import { useUserAuthData } from '../../system/WorkboxesProvider'

import {
  Box,
  Tooltip,
  MenuList, MenuGroup, MenuItem, MenuDivider, MenuItemOption, MenuOptionGroup,
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
import navNextIcon from '../../../assets/nav_next.png'
import navBeforeIcon from '../../../assets/nav_before.png'
import downloadCloudIcon from '../../../assets/cloud_download.png'
import uploadCloudIcon from '../../../assets/cloud_upload.png'

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
        // <ToolbarVerticalDivider />
        // <StandardIcon icon = {resetIcon} caption = 'panel reset' tooltip = 'reset panel to base domain workbox'/>

let panelMenuIteration = 0

const WorkspaceToolbar = (props) => {

    const 
        userAuthData = useUserAuthData(),
        { displayName, photoURL, uid } = userAuthData.authUser,
        { workspaceData, panelSelectionNumber, setPanelSelectionNumber } = props,
        panelSelection = workspaceData.panel,
        panelCount = workspaceData.profile.counts.panels,
        panelMenuRef = useRef(null),
        [ panelList, setPanelList] = useState([]),
        [navState, setNavState] = useState({previousDisabled:false, nextDisabled: false})

    useEffect(()=>{

        const navState = {
            previousDisabled: panelSelectionNumber == 0,
            nextDisabled: panelSelectionNumber == panelCount - 1,
        }
        setNavState(navState)

    },[panelCount, panelSelectionNumber])

    const renamePanel = () => {

    }

    const deletePanel = () => {

    }

    const saveAsPanel = () => {

    }

    const createPanel = () => {

    }

    const reOrderPanels = () => {

    }

    const changePanelSelection = () => {

    }

    const nextPanel = () => {
        if (panelSelectionNumber < (panelCount -1)) {
            setPanelSelectionNumber(panelSelectionNumber + 1)
        }
    }

    const previousPanel = () => {
        if (panelSelectionNumber > 0) {
            setPanelSelectionNumber(panelSelectionNumber - 1)
        }
    }

    const panelmenuList = useMemo(() => {

        // if (workspacesMenu.length === 0) return null
        const defaultValue = panelSelection.id

        // key is set for MenuOptionGroup to brute force sync with changed MenuItemOption children set
        return <MenuList 
                lineHeight = '1em' fontSize = 'small' ref = {panelMenuRef}
                maxHeight = '200px' overflowY = 'scroll'
            >
            <MenuGroup title = 'Panel menu'>
            <MenuItem onClick = {renamePanel} >Rename</MenuItem>
            <MenuItem >Reset</MenuItem>
            <MenuItem onClick = {deletePanel} >Delete</MenuItem>
            <MenuItem onClick = {saveAsPanel} >Save as... </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuItem onClick = {createPanel} >Add a panel</MenuItem>
            <MenuItem onClick = {reOrderPanels} >Re-order panels</MenuItem>
            <MenuDivider />
            <MenuOptionGroup 
                key = {panelMenuIteration++} 
                defaultValue = {defaultValue} 
                onChange = {changePanelSelection} 
                fontSize = 'small' 
                fontStyle = 'italic' 
                title = 'Select a panel:'
            >
                {
                    panelList.map((item) => {
                        return <MenuItemOption key = {item.id} data-name = {item.name} value = {item.id}>{item.name}</MenuItemOption>
                    })
                }
            </MenuOptionGroup>
        </MenuList>

    },[panelList, panelSelection])

    // TODO hide user identity in user domain panel
// <StandardIcon icon = {downloadCloudIcon} caption = 'download' tooltip = 'download to synchronize with other tabs or devices' />

    // render
    return <Box style = {standardToolbarStyles}>
        <StandardIcon icon = {navBeforeIcon} caption = 'previous' tooltip = 'change to next left panel'
            numberBadgeCount = {panelSelectionNumber || null}
            response = {previousPanel} isDisabled = {navState.previousDisabled}/>
        <StandardIcon icon = {navNextIcon} caption = 'next' tooltip = 'change to next right panel' 
            numberBadgeCount = {(panelCount - (panelSelectionNumber + 1)) || null}
            response = {nextPanel} isDisabled = {navState.nextDisabled}/>
        <ToolbarVerticalDivider />
        <MenuControl 
            displayName = 'Main panel' 
            tooltip = 'select a panel'
            arrowdirection = 'up'
            icon = {panelIcon}
            caption = 'workspace panel'
            menulist = {panelmenuList}
        />
        <ToolbarVerticalDivider />
        <MenuControl 
            tooltip = 'select a window'
            arrowdirection = 'up'
            icon = {windowSelectIcon}
            caption = 'windows'
        />
        <ToolbarVerticalDivider />
        <DomainControl domainTitle = {displayName} domainIcon = {photoURL} caption = 'show domain workbox'/>
        <DomainControl domainTitle = {displayName} domainIcon = {photoURL} caption = 'show member workbox'/>
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'explain this toolbar' />
        <ToolbarVerticalDivider />
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>
        &nbsp; &nbsp;
    </Box>
}

export default WorkspaceToolbar

