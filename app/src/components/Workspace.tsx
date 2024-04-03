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

import { useUserData } from '../system/FirebaseProviders'
import ToolbarFrame from '../components/toolbars/Toolbar_Frame'
import WorkspaceToolbar from '../components/toolbars/Toolbar_Workspace'
import Workpanel from './Workpanel'

import collectionIcon from '../../assets/shelves.png'
import notebookIcon from '../../assets/notebook.png'
import checklistIcon from '../../assets/checklist.png'
import homeIcon from '../../assets/home.png'

const workboxDefaultConfig = {
    settingsShow:false,
    settingsDisabled:false,
    coverShow:true,
    coverDisabled:false,
    contentsShow:true,
    contentsDisabled:false,
}

const Workspace = (props) => {

    const userData = useUserData()
    const { displayName, photoURL } = userData.authUser

    const panelWindowsSpecsRef = useRef([

        {
            window:{
                zOrder: 1,
                configDefaults: {top:20,left:20, width:610,height:400},
                view: 'normalized',
                title:"Domain base",
                type: 'Collection',
            },
            workbox: {
                defaultConfig:{...workboxDefaultConfig},
                itemIcon: homeIcon,
                itemTitle: "Domain base",
                domainTitle: displayName,
                typeName: 'Collection',
            }
        },
        {
            window:{
                zOrder: 2,
                configDefaults: {top:40,left:40, width:610,height:400},
                view: 'normalized',
                title:'Notebooks',
                type: 'Collection',
            },
            workbox: {
                defaultConfig:{...workboxDefaultConfig},
                itemIcon: notebookIcon,
                itemTitle: 'Notebooks',
                domainTitle: displayName,
                typeName: 'Collection',
            }
        },
        {
            window:{
                zOrder: 3,
                configDefaults: {top:60,left:60, width:610,height:400},
                view: 'normalized',
                title:'Checklists',
                type: 'Collection',
            },
            workbox: {
                defaultConfig:{...workboxDefaultConfig},
                itemIcon: checklistIcon,
                itemTitle: 'Checklists',
                domainTitle: displayName,
                typeName: 'Collection',
            }
        },

    ])

    return <Grid 
          date-type = 'workspace'
          height = '100%'
          gridTemplateAreas={`"body"
                          "footer"`}
          gridTemplateRows={'1fr auto'}
          gridTemplateColumns={'1fr'}
        >
        <GridItem data-type = 'workspace-body' area={'body'} position = 'relative'>
            <Box id = 'panelframe' data-type = 'panel-frame' position = 'absolute' inset = {0} overflow = 'auto'>
                <Workpanel startingWindowsSpecsList = {panelWindowsSpecsRef.current} />
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
} 

export default Workspace