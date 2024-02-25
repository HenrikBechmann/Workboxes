// Workspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center,
    Grid, GridItem 
} from '@chakra-ui/react'

import { useUserData } from '../system/FirebaseProviders'

import ToolbarFrame from '../components/toolbars/Toolbar_Frame'
import WorkspaceToolbar from '../components/toolbars/Toolbar_Workspace'
import Workwindow from './Workwindow'
import Workpanel from './Workpanel'
import Workbox from './workbox/Workbox'

const Workspace = (props) => {

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

    const userData = useUserData()
    const { displayName, photoURL } = userData.authUser

    const [windowState, setWindowState] = useState('ready')

    const setFocus = (zOrder) => {
        const windowsList = windowsListRef.current
        const numberOfWindows = windowsList.length
        for (let i = 0; i < numberOfWindows; i++) {
            const component = windowsList[i]
            const currentZOrder = component.props.zOrder
            if (currentZOrder === zOrder) {
                windowsList[i] = React.cloneElement(component, {zOrder:numberOfWindows})
            } else if (currentZOrder > zOrder) {
                windowsList[i] = React.cloneElement(component, {zOrder:currentZOrder-1})
            }
        }
        setWindowState('resorted')
    }

    useEffect(() => {

        if (windowState == 'resorted') {
            setWindowState('ready')
        }
    },[windowState])

    const windowsListRef = useRef([
            <Workwindow 
                key = {1} 
                sessionID = {1} 
                setFocus = {setFocus} 
                zOrder = {1} 
                defaults = {{top:'20px',left:'20px'}} 
            >
                <Workbox 
                    workboxDefaults = {workboxDefaults} 
                    workboxItemIcon = {photoURL} 
                    workboxItemTitle = {displayName}
                    workboxDomainTitle = 'Henrik Bechmann'
                    workboxTypeName = 'Domain Member'
                />
            </Workwindow>,
            <Workwindow 
                key = {2} 
                sessionID = {2} 
                setFocus = {setFocus} 
                zOrder = {2} 
                defaults = {{top:'40px',left:'40px'}} 
            >
                <Workbox 
                    workboxDefaults = {workboxDefaults} 
                    workboxItemIcon = {photoURL} 
                    workboxItemTitle = {displayName}
                    workboxDomainTitle = 'Henrik Bechmann'
                    workboxTypeName = 'Domain Member'
                />
            </Workwindow>,
            <Workwindow 
                key = {3} 
                sessionID = {3} 
                setFocus = {setFocus} 
                zOrder = {3}  
                defaults = {{top:'60px',left:'60px'}} 
            >
                <Workbox 
                    workboxDefaults = {workboxDefaults} 
                    workboxItemIcon = {photoURL} 
                    workboxItemTitle = {displayName}
                    workboxDomainTitle = 'Henrik Bechmann'
                    workboxTypeName = 'Domain Member'
                />
            </Workwindow>,
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
                <Workpanel>
                    {windowsListRef.current}
                </Workpanel>
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