// WorkboxContent.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, CSSProperties } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import DisplayController from './DisplayController'
import DocumentFrame from './DocumentFrame'
import ResourcesFrame from './ResourcesFrame'

import { useWorkboxHandler } from './Workbox'

// sets workboxHandler value below
export const CONTENT_FRAME_PADDING_WIDTH = 10 // import used by WorkboxController for initialization (a sequencing anomaly)

const workboxContentStyles = {
    display:'flex',
    flexWrap: 'nowrap',
    height:'100%',
    padding:'0 5px 5px 5px',
    position:'relative',
    width:'100%',
    overflow: 'auto',
} as CSSProperties

const WorkboxContent = (props) => { // no props; all in workboxHandler

    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),

        // create delay to obtain forward references
        [contentState,setContentState] = useState( 'setup' ), // create cycle for forward reference updates

        // share document and resources elements with DisplayController
        documentFrameElementRef = useRef( null ),
        resourcesFrameElementRef = useRef( null )

    useEffect(()=>{

        workboxHandler.dimensions.CONTENT_FRAME_PADDING_WIDTH = CONTENT_FRAME_PADDING_WIDTH // from workboxContentStyles
        setTimeout(() => { // yield to let forwardRefs get set

            setContentState('yielded')

        },1)

    },[])

    useEffect(()=>{

        if (contentState != 'ready') {
            setContentState('ready')
        }

    },[contentState])

    return <Box data-type = 'workbox-content' style = {workboxContentStyles}>
        <DisplayController 
            documentFrameElementRef = {documentFrameElementRef} 
            resourcesFrameElementRef = {resourcesFrameElementRef} 
        >
            <DocumentFrame 
                ref = {documentFrameElementRef} 
            />
            <ResourcesFrame 
                ref = {resourcesFrameElementRef} 
            />
        </DisplayController>
    </Box>
    
} 

export default WorkboxContent
