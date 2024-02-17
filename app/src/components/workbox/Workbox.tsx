// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import WorkboxToolbar from '../toolbars/Toolbar_Workbox'
import WorkboxContent from './WorkboxContent'

const workboxStyle = {
    position:'absolute',
    inset:0,
    display:'flex',
    overflow:'auto',
} as CSSProperties

import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center,
    Grid, GridItem
} from '@chakra-ui/react'

const Workbox = (props) => {
    const {workboxDefaults, workboxItemIcon, workboxItemTitle, workboxDomainTitle} = props
    const [workboxControls, setWorkboxControls] = useState(workboxDefaults)
    
    return <Grid
        data-type = 'workbox-grid'
        height = '100%'
        width = '100%'
        gridTemplateAreas = {`"header"
                              "body"`}
        gridTemplateColumns = '1fr' 
        gridTemplateRows = 'auto 1fr'
    >
        <GridItem data-type = 'workbox-header' area = 'header' overflow = 'hidden'>
        <Box position = 'relative' width = '100%'>
        <ToolbarFrame scrollerStyles = {{margin:'auto'}}>
            <WorkboxToolbar 
                workboxControls = {workboxControls} 
                setWorkboxControls = {setWorkboxControls} 
                workboxItemIcon = {workboxItemIcon} 
                workboxItemTitle = {workboxItemTitle}
                workboxDomainTitle = {workboxDomainTitle}
            />
        </ToolbarFrame>
        </Box>
        </GridItem>
        <GridItem data-type = 'workbox-body' area = 'body' position = 'relative' overflow = 'hidden'>
            <Box data-type = 'workbox' style = {workboxStyle} >
                <WorkboxContent workboxControls = {workboxControls} />
            </Box>
        </GridItem>
    </Grid>
}

// <Box data-type = 'content-holder' display = 'flex' overflowX = 'auto' position = 'relative' height = '100%' width = '100%'>
//     <WorkboxContent workboxControls = {workboxControls} />
// </Box>


export default Workbox