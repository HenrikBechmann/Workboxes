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

// provide access to all workbox components of current workbox state
export const useWorkboxHandler = () => {

    const 
        workboxHandlerContext = useContext(WorkboxHandlerContext),
        workboxHandler = workboxHandlerContext.current,
        setWorkboxHandlerContext = workboxHandler.setWorkboxHandlerContext,
        dispatchWorkboxHandler = (trigger?) => {
            workboxHandler.trigger = trigger
            const newWorkboxHandlerContext = {...workboxHandlerContext} // coerce dispatch
            setWorkboxHandlerContext(newWorkboxHandlerContext)
        }

    return [workboxHandler, dispatchWorkboxHandler]

}

// show the main toolbar and the workbox content area
const WorkboxFrame = (props) => {
    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        workboxFrameElementRef = useRef(null) // for resizeObserver

    // console.log('running WorkboxFrame workboxRecord', workboxHandler.workboxRecord)

    // update the width record of this panel on resize
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

    async function setWorkboxSnapshot() {
        await workboxHandler.setWorkboxSnapshot()
    }

    useEffect(()=> {
        setWorkboxSnapshot()
    },[])

    return <Grid
        data-type = 'workbox-grid'
        style = {workboxGridStyles}
    >
        <GridItem data-type = 'workbox-header' style = {workboxHeaderStyles}>
            <ToolbarFrame scrollerStyles = {{margin:'auto'}}>
                <WorkboxToolbar />
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'workbox-body' style = {workboxBodyStyles}>
            <Box data-type = 'workbox-frame' ref = {workboxFrameElementRef} style = {workboxFrameStyles} >
                <ContentFrame />
            </Box>
        </GridItem>
    </Grid>
}

// function wrapper to initialize workboxHandler
const Workbox = (props) => {

    const
        { workboxSettings } = props,

        workboxID = workboxSettings.profile.id,

        // parameters for workboxHandler
        db = useFirestore(),
        usage = useUsage(),
        snapshotControl = useSnapshotControl(),
        navigate = useNavigate(),
        errorControl = useErrorControl,

        [workboxHandlerContext, setWorkboxHandlerContext] = useState({ current: null }),
        workboxHandler = workboxHandlerContext.current,
        unsubscribeworkbox = workboxHandler?.unsubscribeWorkbox,
        // specialized data connection handling
        onFail = () => {
            console.log('failure to find workbox record')
            alert('failure to find workbox record')
            // TODO
        },
        onError = () => {
            navigate('/error')
        }

        // console.log('Workbox: workboxID, workboxSettings', workboxID, workboxSettings)

    // create workboxHandler
    useEffect(() => {

        const workboxHandler = new WorkboxHandler({workboxID, db, usage, snapshotControl, onError, onFail, errorControl})
        workboxHandler.settings = workboxSettings
        workboxHandler.setWorkboxHandlerContext = setWorkboxHandlerContext
        workboxHandler.onError = onError
        workboxHandler.onFail = onFail
        workboxHandlerContext.current = workboxHandler

        setWorkboxHandlerContext({current:workboxHandler})

    },[])

    // store onSnapshot unsubscribe function
    useEffect(()=>{

        if (unsubscribeworkbox) {
            return () => {
                snapshotControl.registerUnsub(workboxHandler.workboxSnapshotIndex, unsubscribeworkbox)
            }
        }

    },[unsubscribeworkbox])


    return <WorkboxHandlerContext.Provider value = {workboxHandlerContext} >
        {workboxHandlerContext.current && <WorkboxFrame />}
    </WorkboxHandlerContext.Provider>

}

export default Workbox

