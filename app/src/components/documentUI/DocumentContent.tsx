// DocumentPane.tsx
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

const DocumentController = lazy(()=>import('./DocumentController'))

import { useWorkboxHandler } from '../workbox/Workbox'

const DocumentPane = (props) => {

    const 
        [contentState, setContentState] = useState('setup'),
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        workboxRecord = workboxHandler.workboxRecord,
        documentConfiguration = workboxHandler.configuration.document,
        { mode } = documentConfiguration,
        documentComponentRef = useRef(null),
        nextSessionDocumentSectionIDRef = useRef(0),
        is_workboxRecordParameterRef = useRef(false) // set by useEffect for render of baseComponentRef

    useEffect(()=>{

        if (!workboxRecord) return

        is_workboxRecordParameterRef.current = true

        const documentData = {
            base:workboxRecord.document.base,
            data:workboxRecord.document.data,
        }

        if (documentComponentRef.current) {
            documentComponentRef.current =
                React.cloneElement(documentComponentRef.current,{documentData, mode})
        } else {
            const sessionDocumentSectionID = nextSessionDocumentSectionIDRef.current++
            documentComponentRef.current = 
                React.createElement(DocumentController,{documentData, mode, sessionDocumentSectionID})
        }

        setContentState('update')

    },[workboxRecord, mode])

    useEffect(()=>{

        if (contentState != 'ready' ) setContentState('ready')

    },[contentState])

    return <Box>
        <Suspense>
            {is_workboxRecordParameterRef.current && documentComponentRef.current}
        </Suspense>
    </Box>
}

export default DocumentPane