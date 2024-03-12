// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, createContext, CSSProperties } from 'react'

import {
    Box,
    Grid, GridItem
} from '@chakra-ui/react'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import WorkboxToolbar from '../toolbars/Toolbar_Workbox'
import WorkboxContent from './WorkboxContent'

export const WorkboxFrameWidthContext = createContext(null)

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
    minWidth:0,
}

const workboxBodyStyles = {
    area: 'body',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '0 0 0 7px',
    minWidth: 0,
} as CSSProperties

const Workbox = (props) => {
    const 
        {
            defaultStates, 
            itemIcon, 
            itemTitle, 
            typeName, 
            domainTitle 
        } = props,
        [workboxControlStates, setWorkboxControls] = useState(defaultStates),
        workboxFrameElementRef = useRef(null),
        [workboxFrameWidth, setWorkboxFrameWidth] = useState(0)

    // update the recorded with of this panel on resize
    const resizeObserverCallback = useCallback(()=> {

        const workboxFrameWidth = workboxFrameElementRef.current.offsetWidth

        setWorkboxFrameWidth(workboxFrameWidth)

    },[])

    // setup and shutdown resizeObserver
    useEffect(()=>{

        const observer = new ResizeObserver(resizeObserverCallback)
        observer.observe(workboxFrameElementRef.current)

        return () => {
            observer.disconnect()
        }

    },[])


    return <WorkboxFrameWidthContext.Provider value = {workboxFrameWidth} >
    <Grid
        data-type = 'workbox-grid'
        style = {workboxGridStyles}
    >
        <GridItem data-type = 'workbox-header' style = {workboxHeaderStyles}>
            <ToolbarFrame scrollerStyles = {{margin:'auto'}}>
                <WorkboxToolbar 
                    workboxControlStates = {workboxControlStates} 
                    setWorkboxControls = {setWorkboxControls} 
                    itemIcon = {itemIcon} 
                    itemTitle = {itemTitle}
                    domainTitle = {domainTitle}
                    typeName = {typeName}
                />
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'workbox-body' style = {workboxBodyStyles}>
            <Box data-type = 'workbox-frame' ref = {workboxFrameElementRef} style = {workboxFrameStyles} >
                <WorkboxContent workboxControlStates = {workboxControlStates} />
            </Box>
        </GridItem>
    </Grid>
    </WorkboxFrameWidthContext.Provider>
}

export default Workbox