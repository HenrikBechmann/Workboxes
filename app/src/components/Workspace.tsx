// Workspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Box,
    Grid, GridItem 
} from '@chakra-ui/react'

import { useUserData } from '../system/FirebaseProviders'
import ToolbarFrame from '../components/toolbars/Toolbar_Frame'
import WorkspaceToolbar from '../components/toolbars/Toolbar_Workspace'
import Workpanel from './Workpanel'

const workboxDefaults = {
    settings:false,
    settingsDisabled:false,
    profile:true,
    profileDisabled:false,
    lists:true,
    listsDisabled:false,
    swap:false,
    swapDisabled:false,
}

const Workspace = (props) => {

    const userData = useUserData()
    const { displayName, photoURL } = userData.authUser

    const panelWindowSpecsRef = useRef([

        {
            windowSpecs:{
                zOrder: 1,
                configDefaults: {top:'20px',left:'20px', width:'610px',height:'400px'},
            },
            workboxSpecs: {
                workboxDefaults:{...workboxDefaults},
                workboxItemIcon: photoURL,
                workboxItemTitle: displayName,
                workboxDomainTitle: 'Henrik Bechmann',
                workboxTypeName: 'Domain',
            }
        },
        {
            windowSpecs:{
                zOrder: 2,
                configDefaults: {top:'40px',left:'40px', width:'610px',height:'400px'},
            },
            workboxSpecs: {
                workboxDefaults:{...workboxDefaults},
                workboxItemIcon: photoURL,
                workboxItemTitle: displayName,
                workboxDomainTitle: 'Henrik Bechmann',
                workboxTypeName: 'Domain',
            }
        },
        {
            windowSpecs:{
                zOrder: 3,
                configDefaults: {top:'60px',left:'60px', width:'610px',height:'400px'},
            },
            workboxSpecs: {
                workboxDefaults:{...workboxDefaults},
                workboxItemIcon: photoURL,
                workboxItemTitle: displayName,
                workboxDomainTitle: 'Henrik Bechmann',
                workboxTypeName: 'Domain',
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
            <Box data-type = 'panel-frame' position = 'absolute' inset = {0} overflow = 'auto'>
                <Workpanel panelWindowSpecsList = {panelWindowSpecsRef.current} />
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