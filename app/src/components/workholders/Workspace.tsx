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

import Scroller from 'react-infinite-grid-scroller'

import '../../system/panel-variables.css'

import { useUserAuthData, useWorkspaceHandler } from '../../system/WorkboxesProvider'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import WorkspaceToolbar from '../toolbars/Toolbar_Workspace'
import Workpanel from './Workpanel'

import collectionIcon from '../../../assets/shelves.png'
import notebookIcon from '../../../assets/notebook.png'
import checklistIcon from '../../../assets/checklist.png'
import homeIcon from '../../../assets/home.png'

const defaultWorkboxState = {
    settingsShow:false,
    settingsDisabled:false,
    documentShow:true,
    documentDisabled:false,
    databoxShow:true,
    databoxDisabled:false,
}

const defaultDocumentState = {
    mode:'view',
}

const defaultDataboxState = {

}

const Workspace = (props) => {

    const 
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        { workspaceRecord } = workspaceHandler,
        [workspaceState,setWorkspaceState] = useState('setup'),
        [panelSelectionIndex, setPanelSelectionIndex] = useState(null),
        workboxMapRef = useRef(null),
        workboxHandlerMapRef = useRef(null),
        workspaceFrameElementRef = useRef(null),
        navigate = useNavigate(),
        panelComponentList = []

    console.log('Workspace panelSelectionIndex',panelSelectionIndex)

    async function loadPanels() {

        const result = await workspaceHandler.loadPanels()

        if (result.error) {
            navigate('/error')
            return
        }

        const panelRecords = workspaceHandler.panelRecords
        panelComponentList.length = 0

        // generate panel components, sorted by display_order, ascending

        const selectedID = workspaceRecord.panel.id
        let selectedIndex, defaultIndex
        for (let index = 0; index < panelRecords.length; index++) {

            const panelRecord = panelRecords[index]

            if (selectedID && selectedID == panelRecord.profile.panel.id) {
                selectedIndex = index
            }

            if (panelRecord.profile.flags.is_default) {
                defaultIndex = index
            }

            panelComponentList.push(
                <Workpanel 
                    key = {panelRecord.profile.panel.id} 
                    startingWindowsSpecsList = {null} 
                    workboxMapRef = {workboxMapRef}
                    workboxHandlerMapRef = {workboxHandlerMapRef}
                    panelSelectionIndex = {index}
                />
            )

        }

        // otherwise, set the default as the current panel

        if (selectedIndex !== undefined) {
            setPanelSelectionIndex(selectedIndex)            
        } else if (defaultIndex !== undefined) {
            const defaultData = panelRecords[defaultIndex]
            workspaceRecord.panel = {id:defaultData.profile.panel.id , name: defaultData.profile.panel.name}
            setPanelSelectionIndex(defaultIndex)
        } else {
            setPanelSelectionIndex(0)
        }

        setWorkspaceState('ready')
        console.log('selectedIndex, defaultIndex',selectedIndex, defaultIndex)

    }

    // set up panels
    useEffect(()=>{

        if (workspaceHandler.flags.new_workspace_load) {
            workspaceHandler.flags.new_workspace_load = false
            loadPanels()  
        } 

    },[workspaceHandler.flags.new_workspace_load])

    const resizeCallback = useCallback((entries)=>{

        const width = entries[0].contentRect.width
        document.documentElement.style.setProperty('--wb_panel_width',width + 'px')

    },[])

    useEffect(()=>{

        const num = panelSelectionIndex ?? false
        if (num === false) return
        document.documentElement.style.setProperty('--wb_panel_selection',(-panelSelectionIndex).toString())

    },[panelSelectionIndex])

    useEffect(()=>{
        const observer = new ResizeObserver(resizeCallback)
        observer.observe(workspaceFrameElementRef.current)
        return () => {
            observer.disconnect()
        }
    },[])

    const workspaceComponent = useMemo(()=>{
        return <Grid 
          date-type = 'workspace'
          height = '100%'
          gridTemplateAreas={`"body"
                          "footer"`}
          gridTemplateRows={'1fr auto'}
          gridTemplateColumns={'1fr'}
        >
            <GridItem data-type = 'workspace-body' area={'body'} position = 'relative'>
                <Box id = 'wb-panelframe' data-type = 'panel-frame' position = 'absolute' inset = {0}>
                    <Box data-type = 'panel-scroller' height = '100%' display = 'inline-flex' minWidth = {0}
                    transform = 'translate(var(--wb_panel_offset), 0px)' transition = 'transform 0.75s ease'>
                    {(workspaceState != 'setup') && panelComponentList}
                    </Box>
                </Box>
            </GridItem>
            <GridItem data-type = 'workspace-footer' area = 'footer'>
                <Box borderTop = '1px solid lightgray' width = '100%' >
                    <ToolbarFrame>
                        {(workspaceState != 'setup') && <WorkspaceToolbar panelSelectionIndex = {panelSelectionIndex} 
                            setPanelSelectionIndex = {setPanelSelectionIndex}/>}
                    </ToolbarFrame>
                </Box>
            </GridItem>
        </Grid>
    },[panelComponentList, panelSelectionIndex, workspaceState])

    return <Box ref = {workspaceFrameElementRef} data-type = 'workspace-container' position = 'absolute' inset = {0}>
        <Scroller layout = 'static' staticComponent = {workspaceComponent}></Scroller>
    </Box>
} 

export default Workspace

// return 
// // TODO placeholder logic

// workboxMapRef.current = new Map()
// workboxHandlerMapRef.current = new Map()

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
//             defaultDataboxState: {...defaultDataboxState},
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
//             defaultDataboxState: {...defaultDataboxState},
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
//             defaultDataboxState: {...defaultDataboxState},
//             itemTitle: 'Checklists',
//             itemIcon: checklistIcon,
//             domainTitle: displayName,
//             domainIcon: photoURL,
//             typeName: 'Collection',
//             type:'Collection',
//             id:null,
//         }
//     },


