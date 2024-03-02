// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import WorkboxToolbar from '../toolbars/Toolbar_Workbox'
import WorkboxContent from './WorkboxContent'

const workboxFrameStyle = {
    position:'absolute',
    inset:0,
    overflow:'auto',
    display:'flex',
    borderRadius: '0 0 0 7px'
} as CSSProperties

import {
    Box,
    Grid, GridItem
} from '@chakra-ui/react'

const Workbox = (props) => {
    const {workboxDefaults, workboxItemIcon, workboxItemTitle, workboxDomainTitle, workboxTypeName} = props
    const [workboxControls, setWorkboxControls] = useState(workboxDefaults)
    
    return <Grid
        data-type = 'workbox-grid'
        height = '100%'
        width = '100%'
        gridTemplateAreas = {`"header"
                              "body"`}
        gridTemplateColumns = '1fr' 
        gridTemplateRows = 'auto 1fr'
        borderRadius = "0 0 0 7px"
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
                workboxTypeName = {workboxTypeName}
            />
        </ToolbarFrame>
        </Box>
        </GridItem>
        <GridItem data-type = 'workbox-body' area = 'body' position = 'relative' overflow = 'hidden' borderRadius = '0 0 0 7px'>
            <Box data-type = 'workbox-frame' style = {workboxFrameStyle} >
                <WorkboxContent workboxControls = {workboxControls} />
            </Box>
        </GridItem>
    </Grid>
}

export default Workbox