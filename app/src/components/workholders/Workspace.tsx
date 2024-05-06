// Workspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*

    Workspace holds a collection of workpanels. Its entire confiuratoin is saved to the device database (and optionally to the 
    cloud database)

*/

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Box,
    Grid, GridItem 
} from '@chakra-ui/react'

import Scroller from 'react-infinite-grid-scroller'

import '../../system/panel-variables.css'

import { useUserAuthData } from '../../system/WorkboxesProvider'
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
        { workspaceData } = props,
        [workspaceState,setWorkspaceState] = useState('setup'),
        [panelSelectionNumber, setPanelSelectionNumber] = useState(3),
        userAuthData = useUserAuthData(),
        { displayName, photoURL } = userAuthData.authUser,
        panelsListRef = useRef([]),
        workboxMapRef = useRef(null),
        workboxGatewayMapRef = useRef(null),
        workspaceElementRef = useRef(null)

    workspaceData.profile.counts.panels = 5

    console.log('workspaceData', workspaceData)

    useEffect(()=>{
        // TODO placeholder logic

        workboxMapRef.current = new Map()
        workboxGatewayMapRef.current = new Map()

        const panelWindowsSpecs = [

            {
                window:{
                    zOrder: 1,
                    configDefaults: {top:20,left:20, width:610,height:400},
                    view: 'normalized',
                },
                workbox: {
                    defaultWorkboxState:{...defaultWorkboxState},
                    defaultDocumentState: {...defaultDocumentState},
                    defaultDataboxState: {...defaultDataboxState},
                    itemTitle: "Base Workbox",
                    itemIcon: homeIcon,
                    domainTitle: displayName,
                    domainIcon: photoURL,
                    typeName: 'Collection',
                    type:'Collection',
                    id:null,
                }
            },
            {
                window:{
                    zOrder: 2,
                    configDefaults: {top:40,left:40, width:610,height:400},
                    view: 'normalized',
                },
                workbox: {
                    defaultWorkboxState:{...defaultWorkboxState},
                    defaultDocumentState: {...defaultDocumentState},
                    defaultDataboxState: {...defaultDataboxState},
                    itemTitle: 'Notebooks',
                    itemIcon: notebookIcon,
                    domainTitle: displayName,
                    domainIcon: photoURL,
                    typeName: 'Collection',
                    type:'Collection',
                    id:null,
                }
            },
            {
                window:{
                    zOrder: 3,
                    configDefaults: {top:60,left:60, width:610,height:400},
                    view: 'normalized',
                },
                workbox: {
                    defaultWorkboxState:{...defaultWorkboxState},
                    defaultDocumentState: {...defaultDocumentState},
                    defaultDataboxState: {...defaultDataboxState},
                    itemTitle: 'Checklists',
                    itemIcon: checklistIcon,
                    domainTitle: displayName,
                    domainIcon: photoURL,
                    typeName: 'Collection',
                    type:'Collection',
                    id:null,
                }
            },

        ]
        panelsListRef.current = [<Workpanel 
            key = {0} 
            startingWindowsSpecsList = {panelWindowsSpecs} 
            workboxMapRef = {workboxMapRef}
            workboxGatewayMapRef = {workboxGatewayMapRef}
            panelNumber = {0}
        />,
        <Workpanel 
            key = {1} 
            startingWindowsSpecsList = {panelWindowsSpecs} 
            workboxMapRef = {workboxMapRef}
            workboxGatewayMapRef = {workboxGatewayMapRef}
            panelNumber = {1}
        />,
        <Workpanel 
            key = {2} 
            startingWindowsSpecsList = {panelWindowsSpecs} 
            workboxMapRef = {workboxMapRef}
            workboxGatewayMapRef = {workboxGatewayMapRef}
            panelNumber = {2}
        />,
        <Workpanel 
            key = {3} 
            startingWindowsSpecsList = {panelWindowsSpecs} 
            workboxMapRef = {workboxMapRef}
            workboxGatewayMapRef = {workboxGatewayMapRef}
            panelNumber = {3}
        />,
        <Workpanel 
            key = {4} 
            startingWindowsSpecsList = {panelWindowsSpecs} 
            workboxMapRef = {workboxMapRef}
            workboxGatewayMapRef = {workboxGatewayMapRef}
            panelNumber = {4}
        />,
        ]

    },[])

    const resizeCallback = useCallback((entries)=>{

        const width = entries[0].contentRect.width
        document.documentElement.style.setProperty('--wb_panel_width',width + 'px')

    },[])

    useEffect(()=>{

        document.documentElement.style.setProperty('--wb_panel_selection',(-panelSelectionNumber).toString())

    },[panelSelectionNumber])

    useEffect(()=>{
        const observer = new ResizeObserver(resizeCallback)
        observer.observe(workspaceElementRef.current)
        return () => {
            observer.disconnect()
        }
    },[])

    useEffect(()=>{

        if (workspaceState != 'ready') setWorkspaceState('ready')

    },[workspaceState])

    const workspaceComponent = <Grid 
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
                {(workspaceState != 'setup') && panelsListRef.current}
                </Box>
            </Box>
        </GridItem>
        <GridItem data-type = 'workspace-footer' area = 'footer'>
            <Box borderTop = '1px solid lightgray' width = '100%' >
                <ToolbarFrame>
                    <WorkspaceToolbar panelSelectionNumber = {panelSelectionNumber} setPanelSelectionNumber = {setPanelSelectionNumber} workspaceData = {workspaceData}/>
                </ToolbarFrame>
            </Box>
        </GridItem>
    </Grid>

    // workspace-container to get workspaceElementRef

    return <Box ref = {workspaceElementRef} data-type = 'workspace-container' position = 'absolute' inset = {0}>
        <Scroller layout = 'static' staticComponent = {workspaceComponent}></Scroller>
    </Box>
} 

export default Workspace