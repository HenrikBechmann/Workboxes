// DocumentContent.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { 
    useRef, 
    useEffect, 
    useState, 
    useContext, 
    CSSProperties, 
    forwardRef,
    Suspense,
} from 'react'

import {
    Box
} from '@chakra-ui/react'

import documentModules from './documentModules'

import { useWorkboxHandler } from '../workbox/Workbox'

const DocumentContent = (props) => {

    const 
        // { invalidStandardFieldFlagsRef } = props,
        // [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        // { workboxRecord } = workboxHandler,
        // documentConfig = workboxHandler.settings.configuration.document,
        // documentDataRef = useRef(null),
        baseComponentRef = useRef(null)
        // [contentState,setContentState] = useState('setup')
        // contentStateRef = useRef(null) //closure access

    // contentStateRef.current = contentState

    useEffect(()=>{

        baseComponentRef.current =
            React.createElement(documentModules.base)

        // setContentState('ready')

    },[])

    // useEffect(()=>{

    //     if (contentState != 'ready') setContentState('ready')

    // },[contentState])

    return <Box>
        <Suspense>
            {baseComponentRef.current}
        </Suspense>
    </Box>
}

export default DocumentContent