// Workspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*

    Workspace holds a collection of workpanels. Its data is held in memory during the session
    so as not to interfere with multiple tabs or devices with the same login.
    But its data is saved when workspace is changed

*/

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'

import { useNavigate } from 'react-router-dom'

import {
    Box,
    Grid, GridItem 
} from '@chakra-ui/react'

import {RigsDnd as Scroller} from 'react-infinite-grid-scroller'

import '../../system/panel-variables.css'

import { useWorkspaceHandler } from '../../system/WorkboxesProvider'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import WorkspaceToolbar from '../toolbars/Toolbar_Workspace'
import Workpanel from './Workpanel'

import collectionIcon from '../../../assets/shelves.png'
import notebookIcon from '../../../assets/notebook.png'
import checklistIcon from '../../../assets/checklist.png'
import homeIcon from '../../../assets/home.png'

const Workspace = (props) => {

    // console.log('running Workspace')

    // data
    const 
        navigate = useNavigate(),

        // basics
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        { workspaceRecord, workspaceSelection } = workspaceHandler,
        [workspaceState,setWorkspaceState] = useState('setup'),
        [panelSelection, setPanelSelection] = useState({index:0,id:null, name:null}),

        // resources
        workspaceFrameElementRef = useRef(null), // for resizeObserver
        panelComponentListRef = useRef(null), // workspace children, viewd in workpanel scroller

        // centralized management of workbox resources
        workboxMapRef = useRef(null),
        workboxHandlerMapRef = useRef(null)

        // console.log('Workspace panelSelection', {...panelSelection})

        workspaceHandler.panelSelection = panelSelection

    // ---------------------------[ state change effects ]------------------------

    // init resizeObserver
    useEffect(()=>{
        const observer = new ResizeObserver(resizeCallback)
        observer.observe(workspaceFrameElementRef.current)
        return () => {
            observer.disconnect()
        }
    },[])

    // init workbox resource repositiories
    useEffect(()=>{

        workboxMapRef.current = new Map()
        workboxHandlerMapRef.current = new Map()
        workspaceHandler.setPanelSelection = setPanelSelection

    },[])

    // initialize panels list
    useEffect(()=>{

        if (workspaceHandler.flags.new_workspace_load) {
            // console.log('loading panels for ', workspaceSelection)
            workspaceHandler.flags.new_workspace_load = false
            loadPanels()
            setWorkspaceState('loading')
        } 

    },[workspaceHandler.flags.new_workspace_load])
    // },[workspaceSelection])

    async function updateWorkspacePanel(panelSelection) {

        // console.log('updateWorkspacePanel panelSelection', {...panelSelection})

        const panelRecord = workspaceHandler.panelRecords[panelSelection.index]

        if (!panelRecord) return

        const result = await workspaceHandler.updateWorkspacePanel(
            panelRecord.profile.panel.id , panelRecord.profile.panel.name)

        if (result.error) {
            navigate('/error')
            return
        }

        dispatchWorkspaceHandler('updatepanel')

    }

    // handle scroller effects for panels
    useEffect(()=>{

        const num = panelSelection.index ?? false
        if (num === false) return

        updateWorkspacePanel(panelSelection)

        document.documentElement.style.setProperty('--wb_panel_selection',(-(panelSelection.index)).toString())

    },[panelSelection])

    // --------------------------[ operations ]--------------------------
    const resizeCallback = useCallback((entries)=>{

        const element = entries[0].target
        const width = entries[0].contentRect.width
        document.documentElement.style.setProperty('--wb_panel_width',width + 'px')

        const panelDisplayElement = element.querySelector('#panel-display')
        if (!panelDisplayElement) return
        document.documentElement.style.setProperty('--wb_panel_display_height',(panelDisplayElement.offsetHeight - 10) + 'px')
        // console.log('panelDisplayElement', panelDisplayElement)

    },[])

    // fetch data for all panels, then create components for all panels
    // panel data and components are all kept in memory
    async function loadPanels() {

        const result = await workspaceHandler.loadPanels()

        // console.log('result from loading panels', result)

        if (result.error) {
            navigate('/error')
            return
        }

        const panelRecords = workspaceHandler.panelRecords
        panelComponentListRef.current = []

        // generate panel components, sorted by display_order, ascending
        const selectedPanelID = workspaceRecord.panel.id
        let selectedIndex, defaultIndex
        for (let index = 0; index < panelRecords.length; index++) {

            const panelRecord = panelRecords[index]

            const panelSelector = {index, id:panelRecord.profile.panel.id, name:panelRecord.profile.panel.name}

            if (selectedPanelID && selectedPanelID == panelRecord.profile.panel.id) {
                selectedIndex = index
            }

            if (panelRecord.profile.flags.is_default) {
                defaultIndex = index
            }

            panelComponentListRef.current.push(
                <Workpanel 
                    key = {panelRecord.profile.panel.id} 
                    startingWindowsSpecsList = {null} 
                    workboxMapRef = {workboxMapRef}
                    workboxHandlerMapRef = {workboxHandlerMapRef}
                    panelSelector = {panelSelector}
                />
            )

        }

        // otherwise, set the default as the current panel
        // TODO set and handle workspace changed
        const panelSelection = {index:null, id:null, name:null}
        if (selectedIndex !== undefined) {
            panelSelection.index = selectedIndex
        } else if (defaultIndex !== undefined) {
            panelSelection.index = defaultIndex
            const defaultRecord = panelRecords[defaultIndex]

            const result = await workspaceHandler.updateWorkspacePanel(
                defaultRecord.profile.panel.id , defaultRecord.profile.panel.name)
            if (result.error) {
                navigate('/error')
                return
            }
        } else {
            const fallbackRecord = panelRecords[0]
            panelSelection.index = 0
            const result = await workspaceHandler.updateWorkspacePanel(
                fallbackRecord.profile.panel.id , fallbackRecord.profile.panel.name)
            if (result.error) {
                navigate('/error')
                return
            }
        }

        const panelSelectionRecord = panelRecords[panelSelection.index]
        panelSelection.id = panelSelectionRecord.profile.panel.id
        panelSelection.name = panelSelectionRecord.profile.panel.name

        // console.log('setPanelSelection to', panelSelection)

        setPanelSelection(panelSelection)
        setWorkspaceState('ready')
        dispatchWorkspaceHandler()

    }

    // --------------------------[ render ]----------------------------
    // Scroller supports embeded scroll regions
    const workspaceComponent = useMemo(()=>{
        return <Grid 
          data-type = 'workspace'
          height = '100%'
          gridTemplateAreas={`"body"
                          "footer"`}
          gridTemplateRows={'1fr auto'}
          gridTemplateColumns={'1fr'}
          minWidth = '0'
        >
            <GridItem data-type = 'workspace-body' area={'body'} position = 'relative' minWidth = '0'>
                <Box id = 'wb-panelframe' data-type = 'panel-frame' position = 'absolute' inset = {0}>
                    <Box data-type = 'panel-scroller' height = '100%' display = 'inline-flex' minWidth = {0}
                    transform = 'translate(var(--wb_panel_offset), 0px)' transition = 'transform 0.75s ease'>
                    {(workspaceState != 'setup') && panelComponentListRef.current}
                    </Box>
                 </Box>
            </GridItem>
            <GridItem data-type = 'workspace-footer' area = 'footer' minWidth = '0'>
                <Box borderTop = '1px solid lightgray' width = '100%' >
                    <ToolbarFrame>
                        {(workspaceState != 'setup') && <WorkspaceToolbar panelSelection = {panelSelection} 
                            setPanelSelection = {setPanelSelection} panelComponentListRef = {panelComponentListRef}/>}
                    </ToolbarFrame>
                </Box>
            </GridItem>
        </Grid>
    },[panelComponentListRef.current, panelSelection, workspaceState])

    // the scroller enables scrolling components throughout TODO s/b a provider
    return <Box ref = {workspaceFrameElementRef} data-type = 'workspace-container' position = 'absolute' inset = {0}>
        <Scroller 
            layout = 'static' 
            staticComponent = {workspaceComponent} 
            dndOptions = {{accept:['panel']}} />
    </Box>
} 

export default Workspace

// const defaultWorkboxState = {
//     settingsShow:false,
//     settingsDisabled:false,
//     documentShow:true,
//     documentDisabled:false,
//     itemlistShow:true,
//     itemlistDisabled:false,
// }

// const defaultDocumentState = {
//     mode:'view',
// }

// const defaultItemlistState = {

// }

// return 
// // TODO placeholder logic

// const panelWindowsSpecs = [

//     {
//         window:{
//             zOrder: 1,
//             configDefaults: {top:20,left:20, width:610,height:400},
//             view: 'normalized',
//         },
//         workbox: {
//             defaultWorkboxState:{...defaultWorkboxState},
//             defaultDocumentState: {...defaultDocumentState},
//             defaultItemlistState: {...defaultItemlistState},
//             itemTitle: "Base Workbox",
//             itemIcon: homeIcon,
//             domainTitle: displayName,
//             domainIcon: photoURL,
//             typeName: 'Collection',
//             type:'Collection',
//             id:null,
//         }
//     },
//     {
//         window:{
//             zOrder: 2,
//             configDefaults: {top:40,left:40, width:610,height:400},
//             view: 'normalized',
//         },
//         workbox: {
//             defaultWorkboxState:{...defaultWorkboxState},
//             defaultDocumentState: {...defaultDocumentState},
//             defaultItemlistState: {...defaultItemlistState},
//             itemTitle: 'Notebooks',
//             itemIcon: notebookIcon,
//             domainTitle: displayName,
//             domainIcon: photoURL,
//             typeName: 'Collection',
//             type:'Collection',
//             id:null,
//         }
//     },
//     {
//         window:{
//             zOrder: 3,
//             configDefaults: {top:60,left:60, width:610,height:400},
//             view: 'normalized',
//         },
//         workbox: {
//             defaultWorkboxState:{...defaultWorkboxState},
//             defaultDocumentState: {...defaultDocumentState},
//             defaultItemlistState: {...defaultItemlistState},
//             itemTitle: 'Checklists',
//             itemIcon: checklistIcon,
//             domainTitle: displayName,
//             domainIcon: photoURL,
//             typeName: 'Collection',
//             type:'Collection',
//             id:null,
//         }
//     },


