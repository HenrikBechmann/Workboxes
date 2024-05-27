// Toolbar_Worspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, useRef, useState, useEffect, CSSProperties} from 'react'

import { useUserAuthData, useWorkspaceHandler, useUserRecords } from '../../system/WorkboxesProvider'

import { useNavigate } from 'react-router-dom'

import {
  Box,
  Tooltip,
  MenuList, MenuGroup, MenuItem, MenuDivider, MenuItemOption, MenuOptionGroup, useToast,
} from '@chakra-ui/react'

import StandardIcon from './StandardIcon'
import DomainControl from './DomainControl'
import MemberControl from './MemberControl'
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

// workspaceToolbar is passive about panel selection - if not present it waits for Workspace to rectify
const WorkspaceToolbar = (props) => {

    const 
        { panelSelectionIndex, setPanelSelectionIndex } = props,
        [toolbarState,setToolbarState] = useState('ready'),
        userRecords = useUserRecords(),
        userAuthData = useUserAuthData(),
        navigate = useNavigate(),
        // { displayName, photoURL, uid } = userAuthData.authUser,
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        workspaceRecord = workspaceHandler.workspaceRecord,
        panelSelection = workspaceRecord.panel,
        panelCount = workspaceRecord.profile.counts.panels,
        panelMenuRef = useRef(null),
        panelRecords = workspaceHandler.panelRecords,
        panelRecord = panelRecords[panelSelectionIndex],
        domainSelection = panelRecord?.profile.domain, // TODO investigate requirement of ? here
        domainRecord = workspaceHandler.domainRecord,
        memberSelection = workspaceHandler.memberSelection,
        memberRecord = workspaceHandler.memberRecord,
        [navState, setNavState] = useState({previousDisabled:false, nextDisabled: false}),
        toast = useToast({duration:4000})        

    // console.log('domainSelection, panelSelection, panelRecord',!domainSelection ? null: {...domainSelection}, {...panelSelection}, {...panelRecord})

    // console.log('panelSelectionIndex, panelRecord',panelSelectionIndex, panelRecord)

    // console.log('domainRecord, memberRecord', {...workspaceHandler.domainRecord}, {...workspaceHandler.memberRecord})

    useEffect(()=>{

        const navState = {
            previousDisabled: (panelSelectionIndex ?? 0) == 0,
            nextDisabled: panelSelectionIndex == Math.max(panelCount??0,1) - 1,
        }
        setNavState(navState)

    },[panelCount, panelSelectionIndex])

    async function getDomainContext(domainSelection) {

        const result = await workspaceHandler.getDomainContext(domainSelection, userRecords.user)
        if (!result.success) {
            toast({description:'unable to collect domain context'})
        }
        if (result.error) {
            navigate('/error')
            return
        }
        // console.log('workspaceHandler after getDomainContext', workspaceHandler)
        dispatchWorkspaceHandler()
        // setToolbarState('domaincontextreceived')
    }

    useEffect(()=>{

        if (toolbarState != 'ready') setToolbarState('ready') 

    },[toolbarState])    

    useEffect(()=>{

        if (!domainSelection) return
        getDomainContext(domainSelection)

    },[domainSelection])

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
        if (panelSelectionIndex < (panelCount -1)) {
            setPanelSelectionIndex(panelSelectionIndex + 1)
        }
    }

    const previousPanel = () => {
        if (panelSelectionIndex > 0) {
            setPanelSelectionIndex(panelSelectionIndex - 1)
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
            <MenuItem onClick = {saveAsPanel} >Duplicate as...</MenuItem>
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
                    panelRecords.map((record) => {
                        return <MenuItemOption 
                            key = {record.profile.panel.id} 
                            data-name = {record.profile.panel.name} 
                            value = {record.profile.panel.id}>{record.profile.panel.name}</MenuItemOption>
                    })
                }
            </MenuOptionGroup>
        </MenuList>

    },[panelRecords, panelSelection])

    // TODO hide user identity in user domain panel
// <StandardIcon icon = {downloadCloudIcon} caption = 'download' tooltip = 'download to synchronize with other tabs or devices' />

    // render
    return <Box style = {standardToolbarStyles}>
        <StandardIcon icon = {navBeforeIcon} caption = 'previous' tooltip = 'change to next left panel'
            numberBadgeCount = {panelSelectionIndex || null}
            response = {previousPanel} isDisabled = {navState.previousDisabled}/>
        <StandardIcon icon = {navNextIcon} caption = 'next' tooltip = 'change to next right panel' 
            numberBadgeCount = {(panelCount - (panelSelectionIndex + 1)) || null}
            response = {nextPanel} isDisabled = {navState.nextDisabled}/>
        <ToolbarVerticalDivider />
        <MenuControl 
            displayName = {panelSelection.name}
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
        {domainRecord && <DomainControl 
            domainTitle = {domainRecord.profile.domain.name} 
            domainIcon = {domainRecord.profile.domain.image.source} caption = "this panel's domain workbox"/>}
        {memberRecord && <MemberControl
            memberTitle = {memberRecord.profile.member.name} 
            memberIcon = {memberRecord.profile.member.image.source} caption = 'your membership workbox'/>}
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'explain this toolbar' />
        <ToolbarVerticalDivider />
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>
        &nbsp; &nbsp;
    </Box>
}

export default WorkspaceToolbar

