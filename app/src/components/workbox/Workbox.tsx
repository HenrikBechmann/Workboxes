// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, createContext, CSSProperties, useContext } from 'react'

import {
    Box,
    Grid, GridItem
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import { useFirestore, useUsage, useSnapshotControl, useErrorControl } from '../../system/WorkboxesProvider'
import {cloneDeep as _cloneDeep} from 'lodash'

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

        workboxID = workboxSettings.workbox.id,
        workboxSessionID = workboxSettings.workbox.sessionid,

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
        },
        workboxHandlerRef = useRef(null)

    workboxHandlerRef.current = workboxHandler

    const insertUnit = useCallback((sessionID) => { // TODO identify target of insert
        const workboxHandler = workboxHandlerRef.current
        alert('workbox insertUnit ' + sessionID)
    },[])

    const editUnit = useCallback((sessionID) => {
        const 
            workboxHandler = workboxHandlerRef.current,
            { session } = workboxHandler,
            { workbox: workboxsession, document: documentsession, resources: resourcessession } = session,
            { modesettings: workboxmodesettings } = workboxsession,
            { modesettings: documentmodesettings } = documentsession,
            { modesettings: resourcesmodesettings } = resourcessession,
            isChanging = ((documentsession.changesessionid ?? false )|| (resourcessession.changesessionid ?? false))

        if (isChanging) return false

        workboxHandler.editRecord = _cloneDeep(workboxHandler.workboxRecord)

        documentsession.changesessionid = sessionID
        workboxmodesettings.resources.disable = true
        documentmodesettings.normal.disable = true
        documentmodesettings.insert.disable = true
        documentmodesettings.remove.disable = true
        documentmodesettings.drag.disable = true

        resourcesmodesettings.insert.disable = true
        resourcesmodesettings.edit.disable = true
        resourcesmodesettings.remove.disable = true
        resourcesmodesettings.drag.disable = true

        setWorkboxHandlerContext({current:workboxHandler})

        return true

    },[])

    const removeUnit = useCallback((sessionID) => {
        const workboxHandler = workboxHandlerRef.current
        
    },[])

    const reorderUnit = useCallback((sessionID) => {
        const workboxHandler = workboxHandlerRef.current
        
    },[])

    const saveChanges = useCallback((sessionID) => {
        const 
            workboxHandler = workboxHandlerRef.current,
            { session } = workboxHandler,
            { workbox: workboxsession, document: documentsession, resources: resourcessession } = session,
            { modesettings: workboxmodesettings } = workboxsession,
            { modesettings: documentmodesettings } = documentsession,
            { modesettings: resourcesmodesettings } = resourcessession

        documentsession.changesessionid = null
        workboxmodesettings.resources.disable = false
        documentmodesettings.normal.disable = false
        documentmodesettings.insert.disable = false
        documentmodesettings.remove.disable = false
        documentmodesettings.drag.disable = false

        resourcesmodesettings.insert.disable = false
        resourcesmodesettings.edit.disable = false
        resourcesmodesettings.remove.disable = false
        resourcesmodesettings.drag.disable = false

        workboxHandler.editRecord = null

        setWorkboxHandlerContext({current:workboxHandler})

    },[])

    const cancelChanges = useCallback((sessionID) => {
        const 
            workboxHandler = workboxHandlerRef.current,
            { session } = workboxHandler,
            { workbox: workboxsession, document: documentsession, resources: resourcessession } = session,
            { modesettings: workboxmodesettings } = workboxsession,
            { modesettings: documentmodesettings } = documentsession,
            { modesettings: resourcesmodesettings } = resourcessession

        documentsession.changesessionid = null
        workboxmodesettings.resources.disable = false
        documentmodesettings.normal.disable = false
        documentmodesettings.insert.disable = false
        documentmodesettings.remove.disable = false
        documentmodesettings.drag.disable = false

        resourcesmodesettings.insert.disable = false
        resourcesmodesettings.edit.disable = false
        resourcesmodesettings.remove.disable = false
        resourcesmodesettings.drag.disable = false

        workboxHandler.editRecord = null

        setWorkboxHandlerContext({current:workboxHandler})

    },[])

    // create workboxHandler
    useEffect(() => {

        const workboxHandler = new WorkboxHandler({workboxID, workboxSessionID, db, usage, snapshotControl, onError, onFail, errorControl})

        workboxHandler.settings = workboxSettings.settings
        workboxHandler.internal.setWorkboxHandlerContext = setWorkboxHandlerContext
        workboxHandler.internal.onError = onError
        workboxHandler.internal.onFail = onFail
        // workboxHandlerContext.current = workboxHandler

        const 
            doccontrols = workboxHandler.session.document,
            resourcecontrols = workboxHandler.session.resources

        doccontrols.insertunit = insertUnit
        doccontrols.editunit = editUnit
        doccontrols.removeunit = removeUnit
        doccontrols.reorderunit = reorderUnit
        doccontrols.savechanges = saveChanges
        doccontrols.cancelchanges = cancelChanges

        /*
        resourcecontrols.drillitem = 
        resourcecontrols.insertitem =
        resourcecontrols.edititem =
        resourcecontrols.removeitem = 
        resourcecontrols.dragitem =
        resourcecontrols.savechanges = 
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

