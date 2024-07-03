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
import ContentFrame, {CONTENT_FRAME_PADDING_WIDTH} from './ContentFrame'

export const WorkboxHandlerContext = createContext({current:null})

const 
    MIN_DOCUMENT_FRAME_WIDTH = 250,
    MAX_DOCUMENT_FRAME_RATIO = 0.75

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
        { setWorkboxHandlerContext } = workboxHandler.internal,
        dispatchWorkboxHandler = (trigger?) => {
            workboxHandler.internal.trigger = trigger
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
    // TODO: use of imported CONTENT_FRAME_PADDING_WIDTH for intialization is a sequencing anomaly
    const resizeObserverCallback = useCallback(()=> {

        workboxHandler.dimensions.primaryFrameWidth = workboxFrameElementRef.current.offsetWidth - 
            (workboxHandler.dimensions.CONTENT_FRAME_PADDING_WIDTH || CONTENT_FRAME_PADDING_WIDTH)
        let UIDocumentWidthRatio = 
            workboxHandler.dimensions.UIDocumentWidth/workboxHandler.dimensions.primaryFrameWidth
        if (UIDocumentWidthRatio > MAX_DOCUMENT_FRAME_RATIO) {
            UIDocumentWidthRatio = MAX_DOCUMENT_FRAME_RATIO
            workboxHandler.dimensions.UIDocumentWidth = 
                Math.max(MIN_DOCUMENT_FRAME_WIDTH, 
                    Math.round(workboxHandler.dimensions.primaryFrameWidth * UIDocumentWidthRatio))
            UIDocumentWidthRatio = 
                workboxHandler.dimensions.UIDocumentWidth/workboxHandler.dimensions.primaryFrameWidth
        }
        workboxHandler.dimensions.UIDocumentWidthRatio = UIDocumentWidthRatio

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
        workboxSessionID = workboxSettings.profile.sessionid,

        // parameters for workboxHandler
        db = useFirestore(),
        usage = useUsage(),
        snapshotControl = useSnapshotControl(),
        navigate = useNavigate(),
        errorControl = useErrorControl,

        [workboxHandlerContext, setWorkboxHandlerContext] = useState({ current: null }),
        workboxHandler = workboxHandlerContext.current,
        unsubscribeworkbox = workboxHandler?.internal.unsubscribeworkbox,
        // specialized data connection handling
        onFail = () => {
            console.log('failure to find workbox record')
            alert('failure to find workbox record')
            // TODO
        },
        onError = () => {
            navigate('/error')
        }

    // create workboxHandler
    useEffect(() => {

        const workboxHandler = new WorkboxHandler({workboxID, workboxSessionID, db, usage, snapshotControl, onError, onFail, errorControl})

        workboxHandler.settings = workboxSettings
        workboxHandler.internal.setWorkboxHandlerContext = setWorkboxHandlerContext
        workboxHandler.internal.onError = onError
        workboxHandler.internal.onFail = onFail
        workboxHandlerContext.current = workboxHandler

        const 
            doccontrols = workboxHandler.modecontrol.document,
            listcontrols = workboxHandler.modecontrol.resources

        /*
        doccontrols.insertunit = 
        doccontrols.editunit = 
        doccontrols.removeunit =
        doccontrols.reorderunit =

        listcontrols.drillitem = 
        listcontrols.insertitem =
        listcontrols.edititem =
        listcontrols.removeitem = 
        listcontrols.dragitem =

        */

        setWorkboxHandlerContext({current:workboxHandler})

    },[])

    // store onSnapshot unsubscribe function
    useEffect(()=>{

        if (!unsubscribeworkbox) return

        snapshotControl.registerUnsub(workboxHandler.internal.workboxSnapshotIndex, unsubscribeworkbox)
        return () => {
            snapshotControl.unsub(workboxHandler.internal.workboxSnapshotIndex)
        }

    },[unsubscribeworkbox])


    return <WorkboxHandlerContext.Provider value = {workboxHandlerContext} >
        {workboxHandlerContext.current && <WorkboxFrame />}
    </WorkboxHandlerContext.Provider>

}

export default Workbox

