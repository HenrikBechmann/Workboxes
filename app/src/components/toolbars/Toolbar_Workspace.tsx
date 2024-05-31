// Toolbar_Worspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, useRef, useState, useEffect, CSSProperties} from 'react'

import { useWorkspaceHandler, useUserRecords } from '../../system/WorkboxesProvider'

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

import panelIcon from '../../../assets/panel.png'
import addIcon from '../../../assets/add.png'
import windowSelectIcon from '../../../assets/window_select.png'
import hideIcon from '../../../assets/expand_more.png'
import navNextIcon from '../../../assets/nav_next.png'
import navBeforeIcon from '../../../assets/nav_before.png'

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

// --------------------------- component ----------------------------

let panelMenuIteration = 0

// workspaceToolbar is passive about panel selection - if not present it waits for Workspace to rectify
const WorkspaceToolbar = (props) => {

    const 
        { panelSelectionIndex, setPanelSelectionIndex } = props,
        userRecords = useUserRecords(),
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

        navigate = useNavigate(),
        [navState, setNavState] = useState({previousDisabled:false, nextDisabled: false}),
        toast = useToast({duration:4000})        

    useEffect(()=>{

        const navState = {
            previousDisabled: (panelSelectionIndex ?? 0) == 0,
            nextDisabled: panelSelectionIndex == Math.max(panelCount ?? 0,1) - 1,
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
        dispatchWorkspaceHandler()
    }

    useEffect(()=>{

        if (!domainSelection) return
        getDomainContext(domainSelection)

    },[domainSelection])

    const renamePanel = () => {

    }

    const deletePanel = () => {

    }

    const resetPanel = () => {

    }

    const saveAsPanel = () => {

    }

    const createPanel = () => {

    }

    const reorderPanels = () => {

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
                maxHeight = 'var(--wb_panel_display_height)' overflowY = 'scroll'
            >
            <MenuGroup title = 'Panel menu'>
            <MenuItem onClick = {renamePanel} >Rename</MenuItem>
            <MenuItem onClick = {resetPanel}>Reset</MenuItem>
            <MenuItem onClick = {deletePanel} >Delete</MenuItem>
            <MenuItem onClick = {saveAsPanel} >Duplicate as...</MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuItem onClick = {createPanel} >Add a panel</MenuItem>
            <MenuItem onClick = {reorderPanels} >Re-order panels</MenuItem>
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
                            value = {record.profile.panel.id}>{record.profile.panel.name}
                        </MenuItemOption>
                    })
                }
            </MenuOptionGroup>
        </MenuList>

    },[panelSelectionIndex, panelSelection, panelRecords, panelRecords[panelSelectionIndex]]) 

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
            placement = 'top'
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
            domainIcon = {domainRecord.profile.domain.image.source} caption = "your personal domain workbox"/>}
        {memberRecord && <MemberControl
            memberTitle = {memberRecord.profile.member.name} 
            memberIcon = {memberRecord.profile.member.image.source} caption = 'your personal workbox'/>}
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'explain this toolbar' />
        <ToolbarVerticalDivider />
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>
        &nbsp; &nbsp;
    </Box>
}

export default WorkspaceToolbar

