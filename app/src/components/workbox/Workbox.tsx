// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    Workbox
    WorkboxController
        WorkboxToolbar
        WorkboxContent

*/

import React, { useState, useRef, useEffect, useCallback, createContext, CSSProperties, useContext, lazy } from 'react'

import {
    Box,
    Grid, GridItem,
    useToast
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import { 
    useFirestore, 
    useUsage, 
    useSnapshotControl, 
    useErrorControl, 
    useUserRecords,
    useWorkspaceHandler,
} from '../../system/WorkboxesProvider'
import {cloneDeep as _cloneDeep} from 'lodash'

const ToolbarFrame = lazy(() => import('../toolbars/Toolbar_Frame'))
const WorkboxToolbar = lazy(() => import('../toolbars/Toolbar_Workbox'))
const WorkboxContent = lazy(() => import('./WorkboxContent'))
import {CONTENT_FRAME_PADDING_WIDTH} from './WorkboxContent'

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
const WorkboxController = (props) => {
    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        workboxFrameElementRef = useRef(null), // for resizeObserver
        toast = useToast({duration:4000, isClosable: true})

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

    useEffect(()=> {
        const 
            doccontrols = workboxHandler.session.document,
            resourcecontrols = workboxHandler.session.resources

        doccontrols.createblock = createBlock
        doccontrols.editblock = editBlock
        doccontrols.removeblock = removeBlock
        doccontrols.reorderblock = reorderBlock
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
    },[])

    // async function setWorkboxSnapshot() {
    //     await workboxHandler.setWorkboxSnapshot()
    // }

    // useEffect(()=> {
    //     setWorkboxSnapshot()
    // },[])

    const createBlock = useCallback((sessionID) => { // TODO identify target of insert
        const 
            { session } = workboxHandler,
            { workbox: workboxsession, document: documentsession, resources: resourcessession } = session,
            { modesettings: workboxmodesettings } = workboxsession,
            { modesettings: documentmodesettings } = documentsession,
            { modesettings: resourcesmodesettings } = resourcessession,
            isChanging = ((documentsession.changesessionid ?? false )|| (resourcessession.changesessionid ?? false))

        if (isChanging) {
            toast({description:'save or cancel your current change before beginning another',status:'warning'})
            return false
        }

        // workboxHandler.editRecord = _cloneDeep(workboxHandler.workboxRecord)

        documentsession.changesessionid = sessionID
        workboxmodesettings.resources.disable = true
        documentmodesettings.view.disable = true
        documentmodesettings.create.disable = false
        documentmodesettings.add.disable = true
        documentmodesettings.remove.disable = true
        documentmodesettings.edit.disable = true

        resourcesmodesettings.create.disable = true
        resourcesmodesettings.add.disable = true
        resourcesmodesettings.edit.disable = true
        resourcesmodesettings.remove.disable = true
        resourcesmodesettings.drag.disable = true

        dispatchWorkboxHandler()

        return true
    },[])

    const editBlock = useCallback((sessionID) => {
        const 
            { session } = workboxHandler,
            { workbox: workboxsession, document: documentsession, resources: resourcessession } = session,
            { modesettings: workboxmodesettings } = workboxsession,
            { modesettings: documentmodesettings } = documentsession,
            { modesettings: resourcesmodesettings } = resourcessession,
            isChanging = ((documentsession.changesessionid ?? false )|| (resourcessession.changesessionid ?? false))

        if (isChanging) {
            toast({description:'save or cancel your current change before beginning another',status:'warning'})
            return false
        }

        workboxHandler.editRecord = _cloneDeep(workboxHandler.workboxRecord)

        documentsession.changesessionid = sessionID
        workboxmodesettings.resources.disable = true
        documentmodesettings.view.disable = true
        documentmodesettings.create.disable = true
        documentmodesettings.add.disable = true
        documentmodesettings.remove.disable = true

        resourcesmodesettings.create.disable = true
        resourcesmodesettings.add.disable = true
        resourcesmodesettings.edit.disable = true
        resourcesmodesettings.remove.disable = true
        resourcesmodesettings.drag.disable = true

        dispatchWorkboxHandler()

        return true

    },[])

    const removeBlock = useCallback((sessionID) => {
        
    },[])

    const reorderBlock = useCallback((sessionID) => {
        
    },[])

    const saveChanges = useCallback(async function (sessionID) {
        
        const 
            { session } = workboxHandler,
            { workbox: workboxsession, document: documentsession, resources: resourcessession } = session,
            { modesettings: workboxmodesettings } = workboxsession,
            { modesettings: documentmodesettings } = documentsession,
            { modesettings: resourcesmodesettings } = resourcessession

        if (documentsession.is_change_error) {
            toast({description:'please resolve errors before saving',status:'error'})
            return false
        }

        const result = await workboxHandler.saveWorkboxRecord(workboxHandler.editRecord)

        if (result.error) {
            return false
        }

        toast({description: result.notice})

        documentsession.changesessionid = null
        workboxmodesettings.resources.disable = false
        documentmodesettings.view.disable = false
        documentmodesettings.create.disable = false
        documentmodesettings.add.disable = false
        documentmodesettings.remove.disable = false

        resourcesmodesettings.create.disable = false
        resourcesmodesettings.add.disable = false
        resourcesmodesettings.edit.disable = false
        resourcesmodesettings.remove.disable = false
        resourcesmodesettings.drag.disable = false

        workboxHandler.editRecord = null

        // dispatchWorkboxHandler()

        return true

    },[])

    const cancelChanges = useCallback((sessionID) => {
        const 
            { session } = workboxHandler,
            { workbox: workboxsession, document: documentsession, resources: resourcessession } = session,
            { modesettings: workboxmodesettings } = workboxsession,
            { modesettings: documentmodesettings } = documentsession,
            { modesettings: resourcesmodesettings } = resourcessession

        documentsession.changesessionid = null
        documentsession.is_change_error = false

        workboxmodesettings.resources.disable = false
        documentmodesettings.view.disable = false
        documentmodesettings.create.disable = false
        documentmodesettings.add.disable = false
        documentmodesettings.remove.disable = false
        documentmodesettings.edit.disable = false

        resourcesmodesettings.create.disable = false
        resourcesmodesettings.add.disable = false
        resourcesmodesettings.edit.disable = false
        resourcesmodesettings.remove.disable = false
        resourcesmodesettings.drag.disable = false
        documentmodesettings.edit.disable = false

        workboxHandler.editRecord = null

        dispatchWorkboxHandler()

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
                <WorkboxContent />
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

        [workspaceHandler] = useWorkspaceHandler(),

        // parameters for workboxHandler
        // db = useFirestore(),
        // usage = useUsage(),
        // snapshotControl = useSnapshotControl(),
        // errorControl = useErrorControl,
        navigate = useNavigate(),
        [workboxHandlerState, setWorkboxHandlerState] = useState('setup'),

        userRecords = useUserRecords(),

        [workboxHandlerContext, setWorkboxHandlerContext] = useState({ current: null }),
        workboxHandler = workboxHandlerContext.current,
        // unsubscribeworkbox = workboxHandler?.internal.unsubscribeworkbox,
        // specialized data connection handling
        onFail = () => {
            console.log('System:failure to find workbox record')
            alert('System: failure to find workbox record')
            // TODO
        },
        onError = () => {
            navigate('/error')
        },
        workboxHandlerRef = useRef(null)

    workboxHandlerRef.current = workboxHandler

    // create workboxHandler
    useEffect(() => {

        const workboxHandler = new WorkboxHandler({workboxID, workboxSessionID, 
            workspaceHandler, onError, onFail, })

        workboxHandler.settings = workboxSettings.settings
        workboxHandler.internal.setWorkboxHandlerContext = setWorkboxHandlerContext
        workboxHandler.internal.onError = onError
        workboxHandler.internal.onFail = onFail
        workboxHandler.subscribeToWorkboxRecord()
        setWorkboxHandlerState('ready')

        setWorkboxHandlerContext({current:workboxHandler})

        return () => {
            // console.log('Workbox unmount workboxHandler.unsubscribeFromWorkboxRecord()', workboxID)
            workboxHandler.unsubscribeFromWorkboxRecord()
        }

    },[])

    useEffect(()=>{
        workboxHandler && (workboxHandler.userRecords = userRecords) // fails on initial load; succeeds on workboxHandlerState == 'ready'
    },[userRecords, workboxHandlerState])

    // store onSnapshot unsubscribe function
    // useEffect(()=>{

    //     if (!unsubscribeworkbox) return

    //     snapshotControl.registerUnsub(workboxHandler.internal.workboxSnapshotIndex, unsubscribeworkbox)
    //     return () => {
    //         snapshotControl.unsub(workboxHandler.internal.workboxSnapshotIndex)
    //     }

    // },[unsubscribeworkbox])


    return <WorkboxHandlerContext.Provider value = {workboxHandlerContext} >
        {workboxHandlerContext.current && <WorkboxController />}
    </WorkboxHandlerContext.Provider>

}

export default Workbox

