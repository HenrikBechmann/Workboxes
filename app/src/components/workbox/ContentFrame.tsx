// ContentFrame.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, CSSProperties } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import PrimaryFrame from './PrimaryFrame'
import DocumentFrame from './DocumentFrame'
import ItemlistFrame from './ItemlistFrame'

import { useWorkboxHandler } from './Workbox'

const workboxContentStyles = {
    display:'flex',
    flexWrap: 'nowrap',
    height:'100%',
    padding:'0 5px 5px 5px',
    position:'relative',
    width:'100%',
    overflow: 'auto',
} as CSSProperties

const ContentFrame = (props) => { // no props; all in workboxHandler

    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),

        // create delay to obtain forward references
        [contentState,setContentState] = useState( 'setup' ), // create cycle for forward reference updates

        // share document and itemlist elements with PrimaryFrame
        documentFrameElementRef = useRef( null ),
        itemlistFrameElementRef = useRef( null )

    useEffect(()=>{

        setTimeout(() => { // yield to let forwardRefs get set

            // synchronize this with the total left and right padding of workboxContentStyles
            // imported and used by resize observer of Workbox
            workboxHandler.dimensions.CONTENT_FRAME_PADDING_WIDTH = 10 // from workboxContentStyles
            setContentState('yielded')
            
        },1)

    },[])

    useEffect(()=>{

        if (contentState != 'ready') {
            setContentState('ready')
        }

    },[contentState])

    return <Box data-type = 'workbox-content' style = {workboxContentStyles}>
        <PrimaryFrame 
            documentFrameElementRef = {documentFrameElementRef} 
            itemlistFrameElementRef = {itemlistFrameElementRef} 
        >
            <DocumentFrame 
                ref = {documentFrameElementRef} 
            />
            <ItemlistFrame 
                ref = {itemlistFrameElementRef} 
            />
        </PrimaryFrame>
    </Box>
    
} 

export default ContentFrame