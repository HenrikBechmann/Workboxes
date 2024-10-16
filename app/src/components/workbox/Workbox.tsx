// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    role: 
    - display requested workbox content - 
        WorkboxPrimary
        WorkboxExtra
        WorkboxListing
    - create workboxHandler

*/

/*
    TODO:
    - Workbox Controller should direct processing to various workbox configurations:
        window
        document extra
        resource listing versions

*/

import React, { useState, useRef, useEffect, useCallback, createContext, CSSProperties, useContext, Suspense, lazy } from 'react'

import {
    Box,
    Grid, GridItem,
    useToast
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import { 
    // useFirestore, 
    // useUsage, 
    // useSnapshotControl, 
    // useErrorControl, 
    useUserRecords,
    useWorkspaceHandler,
} from '../../system/WorkboxesProvider'
// import {cloneDeep as _cloneDeep} from 'lodash'

const WorkboxPrimary = lazy(() => import('./WorkboxPrimary'))
const WorkboxExtra = lazy(() => import('./WorkboxExtra'))
const WorkboxListing = lazy(() => import('./WorkboxListing'))

// const ToolbarFrame = lazy(() => import('../toolbars/Toolbar_Frame'))
// const WorkboxToolbar = lazy(() => import('../toolbars/Toolbar_Workbox'))
// const WorkboxContent = lazy(() => import('./WorkboxContent'))
// import {CONTENT_FRAME_PADDING_WIDTH} from './WorkboxContent'

export const WorkboxHandlerContext = createContext({current:null})

import WorkboxHandler from '../../classes/WorkboxHandler'

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

// function wrapper to initialize workboxHandler, and direct to requested renderer
const Workbox = (props) => {

    const
        { workboxSpecification, version } = props,

        { id:workboxID, sessionid: workboxSessionID} = workboxSpecification.identity,

        [workspaceHandler] = useWorkspaceHandler(),

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

        workboxHandler.configuration = workboxSpecification.configuration
        workboxHandler.version = version
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
        {workboxHandlerContext.current && 
            <>
                {(version == 'primary') && <Suspense><WorkboxPrimary /></Suspense>}
                {(version == 'extra') && <Suspense><WorkboxExtra /></Suspense>}
                {(version == 'listing') && <Suspense><WorkboxListing /></Suspense>}
            </>
        }
    </WorkboxHandlerContext.Provider>

}

export default Workbox
