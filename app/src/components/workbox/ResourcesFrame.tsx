// ResourcesFrame.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { 
    useRef, 
    useEffect, 
    useState, 
    // useCallback, 
    // useContext, 
    CSSProperties, 
    forwardRef 
} from 'react'

import {
    Box,
    Grid, GridItem,
} from '@chakra-ui/react'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import ResourcesToolbar from '../toolbars/Toolbar_Resources'
import { useWorkboxHandler } from './Workbox'

const 
    MIN_ITEMLIST_FRAME_WIDTH = 250,
    MIN_PRIMARY_FRAME_HEIGHT = 300

const resourcesFrameStyles = {
    flex: '1 0 auto',
    width: 'auto',
    minWidth: MIN_ITEMLIST_FRAME_WIDTH + 'px',
    minHeight: MIN_PRIMARY_FRAME_HEIGHT + 'px',
    position: 'relative',
    transition:'none', // set as needed
    transitionDelay:'unset',
    borderRadius:'8px',
    overflow: 'hidden',
} as CSSProperties

const resourcesPanelStyles = {
    height:'100%',
    backgroundColor:'ghostwhite',
    position:'absolute', 
    width: '100%',
    // padding: '3px', 
    border: '5px ridge gray',
    borderRadius:'8px',
    overflow:'auto',
    transition:'box-shadow .3s',
    transitionDelay:'unset',
    boxShadow: 'none',
    boxSizing: 'border-box',
    left: 'auto',
    right: 0,
} as CSSProperties

const resourcesGridStyles = {
    height: '100%',
    width: '100%',
    gridTemplateAreas: `"header"
                          "body"`,
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto 1fr',
    borderRadius: "0 0 0 7px",
}  as CSSProperties

const resourcesHeaderStyles = {
    area: 'header',
    minWidth:0,
    borderRadius:'8px 8px 0 0',
    borderBottom:'1px solid silver',
}

const resourcesBodyStyles = {
    area: 'body',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '0 0 0 7px',
    minWidth: 0,
} as CSSProperties

const ResourcesFrame = forwardRef(function FoldersPanel(props:any, resourcesFrameElementRef:any) {
    const 
        [ workboxHandler, dispatchWorkboxHandler ] = useWorkboxHandler(),
        defaultResourcesState = workboxHandler.settings.configuration.resources,
        displayCode = workboxHandler.settings.configuration.resources.displaycode, // out, over, under
        resourcesPanelElementRef = useRef(null),
        timeoutRef = useRef(null),
        [resourcesConfig, setResourcesState] = useState(defaultResourcesState)

    useEffect(()=>{

        clearTimeout(timeoutRef.current)

        const 
            element = resourcesPanelElementRef.current,
            timeout = 500

        if (displayCode == 'out') {

            timeoutRef.current = setTimeout(()=>{
                element.style.boxShadow = 'none'
            },timeout)

        } else if (displayCode == 'over') {

            element.style.boxShadow = 'none'

        } else { // 'under'

            element.style.boxShadow = '3px 3px 6px 6px inset silver'

        }

    },[displayCode])

    return <Box data-type = 'resources-frame' ref = {resourcesFrameElementRef} style = {resourcesFrameStyles}>
        <Box data-type = 'resources-panel' ref = {resourcesPanelElementRef} style = {resourcesPanelStyles}>
                <Grid
                    data-type = 'resources-grid'
                    style = {resourcesGridStyles}
                >
                    <GridItem data-type = 'resources-header' style = {resourcesHeaderStyles}>
                        <ToolbarFrame>
                            <ResourcesToolbar resourcesConfig = {resourcesConfig} setResourcesState = {setResourcesState} />
                        </ToolbarFrame>
                    </GridItem>
                    <GridItem data-type = 'resources-body' style = {resourcesBodyStyles}>
                        Resource list
                    </GridItem>
                </Grid>
        </Box>
    </Box>
})

export default ResourcesFrame