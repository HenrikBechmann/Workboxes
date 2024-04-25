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

import { useUserAuthData } from '../../system/WorkboxProviders'
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
        [workspaceState,setWorkspaceState] = useState('setup'),
        userAuthData = useUserAuthData(),
        { displayName, photoURL } = userAuthData.authUser,
        panelsListRef = useRef([]),
        workboxMapRef = useRef(null),
        workboxGatewayMapRef = useRef(null)

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
                    itemTitle: "[Henrik Bechmann]",
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
        />]

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
            <Box id = 'panelframe' data-type = 'panel-frame' position = 'absolute' inset = {0} overflow = 'auto'>
                {(workspaceState != 'setup') && panelsListRef.current}
            </Box>
        </GridItem>
        <GridItem data-type = 'workspace-footer' area = 'footer'>
            <Box borderTop = '1px solid lightgray' width = '100%' >
                <ToolbarFrame>
                    <WorkspaceToolbar />
                </ToolbarFrame>
            </Box>
        </GridItem>
    </Grid>

    return <Scroller layout = 'static' staticComponent = {workspaceComponent}></Scroller>
} 

export default Workspace