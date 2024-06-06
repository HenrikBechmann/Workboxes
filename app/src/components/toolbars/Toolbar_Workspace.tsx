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

import PanelRenameDialog from '../dialogs/PanelRenameDialog'
import PanelResetDialog from '../dialogs/PanelResetDialog'
import PanelDuplicateAsDialog from '../dialogs/PanelDuplicateAsDialog'
import PanelDeleteDialog from '../dialogs/PanelDeleteDialog'
import PanelCreateDialog from '../dialogs/PanelCreateDialog'

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
        { panelSelection, setPanelSelection } = props,
        userRecords = useUserRecords(),
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        workspaceRecord = workspaceHandler.workspaceRecord,

        { panelCount } = workspaceHandler,
        panelMenuRef = useRef(null),
        { panelRecords } = workspaceHandler,
        panelRecord = panelRecords[panelSelection.index],
        // panelSelectionData = {id:panelRecord?.profile.panel.id, name: panelRecord?.profile.panel.name},
        panelDomainRecord = workspaceHandler.panelDomainRecord,
        panelMemberRecord = workspaceHandler.panelMemberRecord,

        [panelRenameDialogState, setPanelRenameDialogState] = useState(false),
        [panelResetDialogState, setPanelResetDialogState] = useState(false),
        [panelDuplicateAsDialogState, setPanelDuplicateAsDialogState] = useState(false),
        [panelDeleteDialogState, setPanelDeleteDialogState] = useState(false),
        [panelCreateDialogState, setPanelCreateDialogState] = useState(false),

        navigate = useNavigate(),
        [navState, setNavState] = useState({previousDisabled:false, nextDisabled: false}),
        toast = useToast({duration:4000})        

    useEffect(()=>{

        const navState = {
            previousDisabled: (panelSelection.index ?? 0) == 0,
            nextDisabled: panelSelection.index == Math.max(panelCount ?? 0,1) - 1,
        }
        setNavState(navState)

    },[panelCount, panelSelection])

    async function getPanelDomainContext(panelSelection) {

        const result = await workspaceHandler.getPanelDomainContext(panelSelection, userRecords.user)
        if (!result.success) {
            toast({description:'unable to collect domain context'})
        }
        if (result.error) {
            navigate('/error')
            return
        }
        dispatchWorkspaceHandler('getpanelcontext')
    }

    useEffect(()=>{

        getPanelDomainContext(panelSelection)

    },[panelSelection])

    const renamePanel = () => {
        setPanelRenameDialogState(true)
    }

    const deletePanel = () => {
        setPanelDeleteDialogState(true)
    }

    const resetPanel = () => {
        setPanelResetDialogState(true)
    }

    const duplicateAsPanel = () => {
        setPanelDuplicateAsDialogState(true)
    }

    const createPanel = () => {
        setPanelCreateDialogState(true)
    }

    const reorderPanels = () => {

    }

    const setDefaultPanel = () => {

    }

    const changePanelSelection = (panelID) => {

        let index, panelRecord
        for (index = 0; index < panelRecords.length; index ++) {
            panelRecord = panelRecords[index]
            if (panelRecord.profile.panel.id == panelID) {
                break
            }
        }

        setPanelSelection({
            index,
            id: panelRecord.profile.panel.id,
            name: panelRecord.profile.panel.name
        })

    }

    const nextPanel = () => {
        if (panelSelection.index < (panelCount -1)) {
            const
                index = panelSelection.index + 1,
                panelRecord = panelRecords[index]
            setPanelSelection({
                index,
                id: panelRecord.profile.panel.id,
                name: panelRecord.profile.panel.name
            })
        }
    }

    const previousPanel = () => {
        if (panelSelection.index > 0) {
            const
                index = panelSelection.index - 1,
                panelRecord = panelRecords[index]
            setPanelSelection({
                index,
                id: panelRecord.profile.panel.id,
                name: panelRecord.profile.panel.name
            })
        }
    }

    const getSortedPanels = () => {
        const panelRecordsCopy = [...panelRecords]
        panelRecordsCopy.sort((a,b)=>{
            return a.profile.panel.name < b.profile.panel.name
                ?-1
                :a.profile.panel.name == b.profile.panel.name
                    ?0
                    :1
        })
        return panelRecordsCopy
    }

    const panelmenuList = useMemo(() => {

        // if (workspacesMenu.length === 0) return null
        // const defaultValue = panelSelectionData.id
        const defaultValue = panelSelection.id

        // console.log('defaultValue in useMemo for panelmenulist', defaultValue)

        // key is set for MenuOptionGroup to brute force sync with changed MenuItemOption children set
        return <MenuList 
                lineHeight = '1em' fontSize = 'small' ref = {panelMenuRef}
                maxHeight = 'var(--wb_panel_display_height)' overflowY = 'scroll'
            >
            <MenuGroup title = 'Panel menu'>
            <MenuItem onClick = {renamePanel} >Rename</MenuItem>
            <MenuItem onClick = {resetPanel}>Reset</MenuItem>
            <MenuItem onClick = {deletePanel} >Delete</MenuItem>
            <MenuItem onClick = {duplicateAsPanel} >Duplicate as...</MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuItem onClick = {createPanel} >Add a panel</MenuItem>
            <MenuItem onClick = {reorderPanels} >Re-order panels</MenuItem>
            <MenuItem onClick = {setDefaultPanel}>Set default panel</MenuItem>
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
                    getSortedPanels().map((record) => {
                        return <MenuItemOption 
                            key = {record.profile.panel.id} 
                            data-name = {record.profile.panel.name} 
                            value = {record.profile.panel.id}>
                            {record.profile.panel.name + (record.profile.flags.is_default && '*') + ' (' + (record.profile.display_order + 1) + ')' }
                        </MenuItemOption>
                    })
                }
            </MenuOptionGroup>
        </MenuList>

    //  panelRecords[panelSelection] guaranteed to be updated for change
    },[panelSelection, panelRecords]) //panelSelectionData , panelRecords[panelSelection.index]])

    // console.log('workspaceHandler', workspaceHandler)

    // render
    return <Box style = {standardToolbarStyles}>
        <StandardIcon icon = {navBeforeIcon} caption = 'previous' tooltip = 'change to next left panel'
            numberBadgeCount = {panelSelection.index || null}
            response = {previousPanel} isDisabled = {navState.previousDisabled}/>
        <StandardIcon icon = {navNextIcon} caption = 'next' tooltip = 'change to next right panel' 
            numberBadgeCount = {(panelCount - (panelSelection.index + 1)) || null}
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
        {panelDomainRecord && <DomainControl 
            domainTitle = {panelDomainRecord.profile.domain.name} 
            domainIcon = {panelDomainRecord.profile.domain.image.source} caption = "your personal domain workbox"/>}
        {panelMemberRecord && <MemberControl
            memberTitle = {panelMemberRecord.profile.member.name} 
            memberIcon = {panelMemberRecord.profile.member.image.source} caption = 'your personal workbox'/>}
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'explain this toolbar' />
        <ToolbarVerticalDivider />
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>
        &nbsp; &nbsp;
        {panelRenameDialogState && <PanelRenameDialog 
            setPanelRenameDialogState = {setPanelRenameDialogState} 
            setPanelSelection = {setPanelSelection}
        />}
        {panelResetDialogState && <PanelResetDialog setPanelResetDialogState = {setPanelResetDialogState} />}
        {panelDuplicateAsDialogState && <PanelDuplicateAsDialog 
            setPanelDuplicateAsDialogState = {setPanelDuplicateAsDialogState} 
            setPanelSelection = {setPanelSelection}
        />}
        {panelDeleteDialogState && <PanelDeleteDialog 
            setPanelDeleteDialogState = {setPanelDeleteDialogState} 
            setPanelResetDialogState = {setPanelResetDialogState} 
            setPanelSelection = {setPanelSelection}
        />}
        {panelCreateDialogState && <PanelCreateDialog 
            setPanelCreateDialogState = {setPanelCreateDialogState} 
            setPanelSelection = {setPanelSelection}
        />}
    </Box>
}

export default WorkspaceToolbar

