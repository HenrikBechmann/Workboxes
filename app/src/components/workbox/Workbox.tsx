// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, createContext, CSSProperties, useContext } from 'react'

import {
    Box,
    Grid, GridItem
} from '@chakra-ui/react'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import WorkboxToolbar from '../toolbars/Toolbar_Workbox'
import WorkboxContent from './WorkboxContent'

export const WorkboxHandlerContext = createContext(null)
import { WORKBOX_CONTENT_TOTAL_PADDING_WIDTH } from './WorkboxContent'

import WorkboxHandler from '../../classes/WorkboxHandler'

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

export const useWorkboxHandler = () => {

    const 
        workboxHandlerContext = useContext(WorkboxHandlerContext),
        workboxHandler = workboxHandlerContext.current,
        { setWorkboxHandlerContext } = workboxHandler,
        dispatchWorkboxHandler = (trigger?) => {
            workboxHandler.trigger = trigger
            const newWorkboxHandlerContext = {...workboxHandlerContext} // coerce dispatch
            setWorkboxHandlerContext(newWorkboxHandlerContext)
        }

    console.log('workboxHandler, dispatchWorkboxHandler',workboxHandler, dispatchWorkboxHandler )

    return [workboxHandler, dispatchWorkboxHandler]

}

const Workbox = (props) => {
    const 
        { workboxSettings } = props,
        workboxID = workboxSettings.id,

        [workboxState, setWorkboxState] = useState('setup'),
        [workboxConfig, setWorkboxConfig] = useState(null),

        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),

        [workboxHandlerContext, setWorkboxHandlerContext] = useState({ current: null }),
        
        workboxFrameElementRef = useRef(null),
        [workboxInnerFrameWidth, setWorkboxInnerFrameWidth] = useState(0)

    useEffect(()=>{

        const workboxHandler = new WorkboxHandler(workboxID)
        workboxHandler.settings = workboxSettings
        workboxHandler.setWorkboxHandlerContext = setWorkboxHandlerContext
        setWorkboxHandlerContext({current:workboxHandler})
        setWorkboxState('ready')

    },[])

    // update the width of this panel on resize
    const resizeObserverCallback = useCallback(()=> {

        workboxHandler.innerFrameWidth = workboxFrameElementRef.current.offsetWidth - WORKBOX_CONTENT_TOTAL_PADDING_WIDTH
        dispatchWorkboxHandler('framewidth')

    },[])

    // setup and shutdown resizeObserver
    useEffect(()=>{

        const observer = new ResizeObserver(resizeObserverCallback)
        observer.observe(workboxFrameElementRef.current)

        return () => {
            observer.disconnect()
        }

    },[])


    return <WorkboxHandlerContext.Provider value = {workboxHandlerContext} >
    <Grid
        data-type = 'workbox-grid'
        style = {workboxGridStyles}
    >
        <GridItem data-type = 'workbox-header' style = {workboxHeaderStyles}>
            <ToolbarFrame scrollerStyles = {{margin:'auto'}}>
                {(workboxState == 'ready') && <WorkboxToolbar />}
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'workbox-body' style = {workboxBodyStyles}>
            <Box data-type = 'workbox-frame' ref = {workboxFrameElementRef} style = {workboxFrameStyles} >
                {(workboxState == 'ready') && <WorkboxContent />}
            </Box>
        </GridItem>
    </Grid>
    </WorkboxHandlerContext.Provider>
}

export default Workbox