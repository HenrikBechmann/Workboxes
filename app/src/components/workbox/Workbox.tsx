// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, createContext, CSSProperties, useContext } from 'react'

import {
    Box,
    Grid, GridItem
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import { useFirestore, useUsage, useSnapshotControl, useErrorControl } from '../../system/WorkboxesProvider'
import ToolbarFrame from '../toolbars/Toolbar_Frame'
import WorkboxToolbar from '../toolbars/Toolbar_Workbox'
import ContentFrame from './ContentFrame'

export const WorkboxHandlerContext = createContext({current:null})

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

export const useWorkboxHandler = (parms?) => {

    const 
        workboxHandlerContext = useContext(WorkboxHandlerContext)

    let
        workboxHandler = workboxHandlerContext.current
        if (!workboxHandler) {
            workboxHandler = new WorkboxHandler(parms)
            workboxHandlerContext.current = workboxHandler
        }

    const
        setWorkboxHandlerContext = workboxHandler.setWorkboxHandlerContext,
        dispatchWorkboxHandler = (trigger?) => {
            workboxHandler.trigger = trigger
            const newWorkboxHandlerContext = {...workboxHandlerContext} // coerce dispatch
            setWorkboxHandlerContext && setWorkboxHandlerContext(newWorkboxHandlerContext)
        }

    console.log('workboxHandler, dispatchWorkboxHandler',workboxHandler, dispatchWorkboxHandler )

    return [workboxHandler, dispatchWorkboxHandler]

}

const Workbox = (props) => {
    const 
        { workboxSettings } = props,
        workboxID = workboxSettings.id,

        // parameters for workboxHandler
        db = useFirestore(),
        usage = useUsage(),
        snapshotControl = useSnapshotControl(),
        navigate = useNavigate(),
        errorControl = useErrorControl,

        [workboxState, setWorkboxState] = useState('setup'),

        onFail = () => {
            // TODO
        },

        onError = () => {
            navigate('/error')
        },

        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler({workboxID, db, usage, snapshotControl, onError, onFail, errorControl}),
        { workboxRecord, unsubscribeworkbox } = workboxHandler,

        [workboxHandlerContext, setWorkboxHandlerContext] = useState({ current: null }),
        
        workboxFrameElementRef = useRef(null)

    useEffect(() => {

        // const workboxHandler = new WorkboxHandler({workboxID, db, usage, snapshotControl, onError, onFail, errorControl})
        workboxHandler.settings = workboxSettings
        workboxHandler.setWorkboxHandlerContext = setWorkboxHandlerContext
        workboxHandler.setWorkboxState = setWorkboxState
        workboxHandlerContext.current = workboxHandler
        
        // setWorkboxHandlerContext({current:workboxHandler})
        setWorkboxState('ready')

    },[])

    useEffect(()=>{
        if (workboxState != 'ready') {
            setWorkboxState('ready')
        }
    },[workboxState])

    useEffect(()=>{
        dispatchWorkboxHandler('workrecord')
    },[workboxRecord])

    useEffect(()=>{

        if (unsubscribeworkbox) {
            return () => {
                snapshotControl.registerUnsub(workboxHandler.workboxIndex, unsubscribeworkbox)
            }
        }

    },[unsubscribeworkbox])

    // update the width of this panel on resize
    const resizeObserverCallback = useCallback(()=> {

        workboxHandler.innerFrameWidth = workboxFrameElementRef.current.offsetWidth - 
            workboxHandler.CONTENT_FRAME_PADDING_WIDTH
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
                {(workboxState == 'ready') && <ContentFrame />}
            </Box>
        </GridItem>
    </Grid>
    </WorkboxHandlerContext.Provider>
}

export default Workbox