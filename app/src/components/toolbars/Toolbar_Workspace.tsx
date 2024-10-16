// Toolbar_Worspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, useRef, useState, useEffect, CSSProperties, Suspense, lazy} from 'react'

import { useWorkspaceHandler, useUserRecords } from '../../system/WorkboxesProvider'

import { useNavigate } from 'react-router-dom'

import {
  Box,
  Tooltip,
  MenuList, MenuGroup, MenuItem, MenuDivider, MenuItemOption, MenuOptionGroup, useToast,
} from '@chakra-ui/react'

const PanelRenameDialog = lazy(() => import('../dialogs/PanelRenameDialog'))
const PanelResetDialog = lazy(() => import('../dialogs/PanelResetDialog'))
const PanelDuplicateAsDialog = lazy(() => import('../dialogs/PanelDuplicateAsDialog'))
const PanelDeleteDialog = lazy(() => import('../dialogs/PanelDeleteDialog'))
const PanelCreateDialog = lazy(() => import('../dialogs/PanelCreateDialog'))
const PanelSetDefaultDialog = lazy(() => import('../dialogs/PanelSetDefaultDialog'))
const PanelReorderDialog = lazy(() => import('../dialogs/PanelReorderDialog'))

import StandardIcon from './controls/StandardIcon'
import DomainControl from './controls/DomainControl'
import MemberControl from './controls/MemberControl'
import MenuControl from './controls/MenuControl'
import LearnIcon from './controls/LearnIcon'
import ToolbarVerticalDivider from './controls/VerticalDivider'

import panelIcon from '../../../assets/panel.png'
import addIcon from '../../../assets/add.png'
import windowSelectIcon from '../../../assets/window_select.png'
import hideIcon from '../../../assets/expand_more.png'
import navNextIcon from '../../../assets/nav_next.png'
import navBeforeIcon from '../../../assets/nav_before.png'
import tileIcon from '../../../assets/grid_view.png'

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
        // panel context
        { panelComponentListRef } = props, // used by panelReorderListDialog
        // userRecords = useUserRecords(),
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        {     
            workspaceRecord, 
            panelRecords, panelCount, 
            panelDomainRecord, panelMemberRecord,
            panelSelection, setPanelSelection,
            panelControlMap,
        } = workspaceHandler,
        panelRecord = panelRecords[panelSelection.index],

        // dialog invocations
        [panelRenameDialogState, setPanelRenameDialogState] = useState(false),
        [panelResetDialogState, setPanelResetDialogState] = useState(false),
        [panelDuplicateAsDialogState, setPanelDuplicateAsDialogState] = useState(false),
        [panelDeleteDialogState, setPanelDeleteDialogState] = useState(false),
        [panelCreateDialogState, setPanelCreateDialogState] = useState(false),
        [panelSetDefaultDialogState, setPanelSetDefaultDialogState] = useState(false),
        [panelReorderDialogState, setPanelReorderDialogState] = useState(false),

        previousSubscriptionControlDataRef = useRef(null),

        // navigation
        navigate = useNavigate(),
        [navState, setNavState] = useState({previousDisabled:false, nextDisabled: false}),

        // messaging
        toast = useToast({duration:4000, isClosable:true}) 

        // console.log('panelDomainRecord, panelMemberRecord', panelDomainRecord, panelMemberRecord)

   // ----------------------[ state changes ]---------------------

    // update previous/next
    useEffect(()=>{

        const navState = {
            previousDisabled: (panelSelection.index ?? 0) == 0,
            nextDisabled: panelSelection.index == Math.max(panelCount ?? 0,1) - 1,
        }
        setNavState(navState)

    },[panelCount, panelSelection])

    // update domain context
    useEffect(()=>{

        if (panelSelection.id) {
            setPanelDomainContext(panelSelection)
        }

    },[panelSelection])

    // -----------------------[ operations ]------------------------

    const userPanelSelection = (panelID) => {

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

    // from subscribeToDomainRecord
    const updateDomainData = (panelDomainRecord) => {

        workspaceHandler.panelDomainRecord = panelDomainRecord
        dispatchWorkspaceHandler('getpaneldomaincontext')

    }

    const updateMemberData = (panelMemberRecord) => {

        workspaceHandler.panelMemberRecord = panelMemberRecord
        dispatchWorkspaceHandler('getpanelmembercontext')

    }

    const setPanelDomainContext = (panelSelection) => {

        const 
            panelDomainID = panelRecord.profile.domain.id,
            domainSubscriptionControlData = {
                domain: panelRecord.profile.domain,
                functions: {
                    updateDomainData,
                    updateMemberData,
                },
                subscriptionindex:'workspacemenu.' + panelSelection.id
            },
            previousSubscriptionControlData = previousSubscriptionControlDataRef.current

            // subscribe to new domainRecord to avoid closing domain snapshot by unsubscribing previous, in case the same
            workspaceHandler.subscribeToDomainRecord(domainSubscriptionControlData)

            if (previousSubscriptionControlData) {
                workspaceHandler.unsubscribeFromDomainRecord(previousSubscriptionControlData)
            }
            previousSubscriptionControlDataRef.current = domainSubscriptionControlData

    }

    // ------------------------[ dialog calls ]-----------------------

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
        setPanelReorderDialogState(true)
    }

    const setDefaultPanel = () => {
        setPanelSetDefaultDialogState(true)
    }

    const showDomainWorkbox = () => {
        panelControlMap.get(panelSelection.id).functions.showDomainWorkbox()
    } 

    const showMemberWorkbox = () => {
        panelControlMap.get(panelSelection.id).functions.showMemberWorkbox()
    } 

    // windows menu
    const windowsmenuList = useMemo(() => {

        return <MenuList 
                lineHeight = '1em' fontSize = 'small'
                maxHeight = 'var(--wb_panel_display_height)' overflowY = 'scroll'
            >
            <MenuGroup title = 'Windows menu'>
            <MenuItem icon = {<img style = {{width:'24px', height: '24px'}} src = {tileIcon} />}>Tile windows</MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuOptionGroup title = 'Select a window'>
            </MenuOptionGroup>
        </MenuList>

    },[panelSelection, panelRecords])

    // update panel selection menu
    const panelmenuList = useMemo(() => {

        // if (workspacesMenu.length === 0) return null
        // const defaultValue = panelSelectionData.id
        const defaultValue = panelSelection.id

        // console.log('defaultValue in useMemo for panelmenulist', defaultValue)

        // key is set for MenuOptionGroup to brute force sync with changed MenuItemOption children set
        return <MenuList 
                lineHeight = '1em' fontSize = 'small'
                maxHeight = 'var(--wb_panel_display_height)' overflowY = 'scroll'
            >
            <MenuGroup title = 'Panel menu'>
            <MenuItem onClick = {renamePanel} >Rename</MenuItem>
            <MenuItem onClick = {resetPanel}>Reset</MenuItem>
            <MenuItem onClick = {deletePanel} >Delete</MenuItem>
            <MenuItem onClick = {duplicateAsPanel} >Duplicate as...</MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuItem onClick = {createPanel} >Add a new panel</MenuItem>
            <MenuItem onClick = {setDefaultPanel}>Set default panel</MenuItem>
            <MenuItem onClick = {reorderPanels} >Re-order the panels</MenuItem>
            <MenuDivider />
            <MenuOptionGroup 
                key = {panelMenuIteration++} 
                defaultValue = {defaultValue} 
                onChange = {userPanelSelection} 
                fontSize = 'small' 
                fontStyle = 'italic' 
                title = 'Select a panel:'
            >
                {
                    panelRecords.map((record) => {
                        return <MenuItemOption 
                            key = {record.profile.panel.id} 
                            data-name = {record.profile.panel.name} 
                            value = {record.profile.panel.id}>
                            {record.profile.panel.name + (record.profile.flags.is_default? '*':'')}
                        </MenuItemOption>
                    })
                }
            </MenuOptionGroup>
        </MenuList>

    //  panelRecords[panelSelection] guaranteed to be updated for change
    },[panelSelection, panelRecords]) //panelSelectionData , panelRecords[panelSelection.index]])

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
            caption = 'panels'
            menulist = {panelmenuList}
        />
        <ToolbarVerticalDivider />
        <MenuControl 
            tooltip = 'select a window'
            arrowdirection = 'up'
            icon = {windowSelectIcon}
            placement = 'top'
            caption = 'windows'
            menulist = {windowsmenuList}
        />
        <ToolbarVerticalDivider />
        {panelDomainRecord && <DomainControl 
            domainTitle = {panelDomainRecord.profile.domain.name} 
            domainIcon = {panelDomainRecord.profile.domain.image.source} caption = "domain workbox"
            response = {showDomainWorkbox}
        />}
        {panelMemberRecord && <MemberControl
            memberTitle = {panelMemberRecord.profile.member.name} 
            memberIcon = {panelMemberRecord.profile.member.image.source} caption = 'domain member workbox'
            response = {showMemberWorkbox}
        />}
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'explain this toolbar' />
        {false && <><ToolbarVerticalDivider />
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/></>}
        &nbsp; &nbsp;
        {panelCreateDialogState && <Suspense><PanelCreateDialog 
            setPanelCreateDialogState = {setPanelCreateDialogState} 
            panelComponentListRef = {panelComponentListRef}
        /></Suspense>}
        {panelDuplicateAsDialogState && <Suspense><PanelDuplicateAsDialog 
            setPanelDuplicateAsDialogState = {setPanelDuplicateAsDialogState} 
            panelComponentListRef = {panelComponentListRef}
        /></Suspense>}
        {panelDeleteDialogState && <Suspense><PanelDeleteDialog 
            setPanelDeleteDialogState = {setPanelDeleteDialogState} 
            setPanelResetDialogState = {setPanelResetDialogState} 
            panelComponentListRef = {panelComponentListRef}
        /></Suspense>}
        {panelRenameDialogState && <Suspense><PanelRenameDialog 
            setPanelRenameDialogState = {setPanelRenameDialogState} 
        /></Suspense>}
        {panelResetDialogState && <Suspense><PanelResetDialog 
            setPanelResetDialogState = {setPanelResetDialogState} 
        /></Suspense>}
        {panelSetDefaultDialogState && <PanelSetDefaultDialog 
            setPanelSetDefaultDialogState = {setPanelSetDefaultDialogState} 
        />}
        {panelReorderDialogState && <Suspense><PanelReorderDialog 
            setPanelReorderDialogState = {setPanelReorderDialogState} 
            panelComponentListRef = {panelComponentListRef}
        /></Suspense>}
    </Box>
}

export default WorkspaceToolbar

