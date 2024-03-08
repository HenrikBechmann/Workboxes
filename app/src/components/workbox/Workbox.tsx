// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Box,
    Grid, GridItem
} from '@chakra-ui/react'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import WorkboxToolbar from '../toolbars/Toolbar_Workbox'
import WorkboxContent from './WorkboxContent'

const workboxFrameStyles = {
    position:'absolute',
    inset:0,
    overflow:'auto',
    borderRadius: '0 0 0 7px'
} as CSSProperties

const workboxGridStyles = {
    height: '100%',
    width: '100%',
    gridTemplateAreas: `"header"
                          "body"`,
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto 1fr',
    borderRadius: "0 0 0 7px",
}  as CSSProperties

const workboxHeaderStyles = {
    area: 'header',
    overflow: 'hidden',
}

const workboxBodyStyles = {
    area: 'body',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '0 0 0 7px',
} as CSSProperties

const Workbox = (props) => {
    const 
        {workboxDefaults, itemIcon, itemTitle, typeName, domainTitle } = props,
        [workboxControls, setWorkboxControls] = useState(workboxDefaults)
    
    return <Grid
        data-type = 'workbox-grid'
        style = {workboxGridStyles}
    >
        <GridItem data-type = 'workbox-header' style = {workboxHeaderStyles}>
            <ToolbarFrame scrollerStyles = {{margin:'auto'}}>
                <WorkboxToolbar 
                    workboxControls = {workboxControls} 
                    setWorkboxControls = {setWorkboxControls} 
                    itemIcon = {itemIcon} 
                    itemTitle = {itemTitle}
                    domainTitle = {domainTitle}
                    typeName = {typeName}
                />
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'workbox-body' style = {workboxBodyStyles}>
            <Box data-type = 'workbox-frame' style = {workboxFrameStyles} >
                <WorkboxContent workboxControls = {workboxControls} />
            </Box>
        </GridItem>
    </Grid>
}

export default Workbox