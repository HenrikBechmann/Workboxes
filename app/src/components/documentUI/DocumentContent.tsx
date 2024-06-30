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
        [contentState, setContentState] = useState('setup'),
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        workboxRecord = workboxHandler.workboxRecord,
        documentConfig = workboxHandler.settings.configuration.document,
        { mode } = documentConfig,
        baseComponentRef = useRef(null),
        is_workboxRecordParameterRef = useRef(false) // set by useEffect for render of baseComponentRef

    console.log('running DocumentContent')

    useEffect(()=>{

        if (!workboxRecord) return

        is_workboxRecordParameterRef.current = true

        const documentBaseData = workboxRecord.document.base

        if (baseComponentRef.current) {
            baseComponentRef.current =
                React.cloneElement(baseComponentRef.current,{documentBaseData, documentConfig, mode})
        } else {
            baseComponentRef.current =
                React.createElement(documentModules.base,{documentBaseData, documentConfig, mode})
        }

        setContentState('update')

    },[workboxRecord, documentConfig, mode])

    useEffect(()=>{

        if (contentState != 'ready' ) setContentState('ready')

    },[contentState])

    return <Box>
        <Suspense>
            {is_workboxRecordParameterRef.current && baseComponentRef.current}
        </Suspense>
    </Box>
}

export default DocumentContent