// DocumentContent.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {
    lazy,
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

const DocBase = lazy(()=>import('./DocBase'))

import { useWorkboxHandler } from '../workbox/Workbox'

const DocumentContent = (props) => {

    const 
        [contentState, setContentState] = useState('setup'),
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        workboxRecord = workboxHandler.workboxRecord,
        documentConfig = workboxHandler.settings.document,
        { mode } = documentConfig,
        baseComponentRef = useRef(null),
        nextDocumentUnitSessionIDRef = useRef(0),
        is_workboxRecordParameterRef = useRef(false) // set by useEffect for render of baseComponentRef

    useEffect(()=>{

        if (!workboxRecord) return

        is_workboxRecordParameterRef.current = true

        const documentBaseData = {
            base:workboxRecord.document.base,
            data:workboxRecord.document.data,
        }

        if (baseComponentRef.current) {
            baseComponentRef.current =
                React.cloneElement(baseComponentRef.current,{documentBaseData, documentConfig, mode})
        } else {
            const sessionID = nextDocumentUnitSessionIDRef.current++
            baseComponentRef.current = 
                React.createElement(DocBase,{documentBaseData, documentConfig, mode, sessionID})
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