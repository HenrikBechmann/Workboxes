// ContentFrame.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, useContext } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import PrimaryFrame from './PrimaryFrame'
import DocumentFrame from './DocumentFrame'
import ItemlistFrame from './ItemlistFrame'

import { useWorkboxHandler } from './Workbox'

// synchronize this with the total left and right padding of workboxContentStyles
// imported and used by resize observer of Workbox

const workboxContentStyles = {
    display:'flex',
    flexWrap: 'nowrap',
    height:'100%',
    padding:'0 5px 5px 5px',
    position:'relative',
    width:'100%',
    overflow: 'auto',
} as CSSProperties

const ContentFrame = (props) => {

    const 
        // { 
        //     workboxConfig, 
        //     defaultDocumentState,
        //     defaultItemlistState,
        //     viewSetting, 
        //     documentData, 
        //     itemlistData, 
        //     profileData 
        // } = props,
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        { show:itemlistShow } = workboxHandler.settings.configuration.itemlist, // boolean - show/ noshow
        { show:documentShow } = workboxHandler.settings.configuration.document, // boolean - show/ noshow
        { show:bothShow } = workboxHandler.settings.configuration.both, // boolean - show/ noshow
        // share document and itemlist elements with children
        documentFrameElementRef = useRef( null ),
        itemlistFrameElementRef = useRef( null ),
        workboxContentElementRef = useRef(null),
        // create delay to obtain forward references
        [contentState,setContentState] = useState( 'setup' ), // create cycle for forward reference updates
        // set by user through drag tab, and possibly by changing window size
        UIDocumentWidthRef = useRef( {minimized:300, maximized:300, normalized:300} ) // shared with children for configuration

    // console.log('workboxHandler', workboxHandler)
    // console.log('running ContentFrame: contentState', contentState)
    // console.log('workboxHandler.settings.configuration.itemlist.show',workboxHandler.settings.configuration.itemlist.show)

    let workboxDisplayCode, documentDisplayCode, itemlistDisplayCode // configuration controls for children
    if (bothShow) {
        workboxDisplayCode = 'both'
        documentDisplayCode = 'out'
        itemlistDisplayCode = 'out'
    } else if (itemlistShow) {
        workboxDisplayCode = 'itemlist'
        documentDisplayCode = 'under'
        itemlistDisplayCode = 'over'
    } else { // documentShow
        workboxDisplayCode = 'document'
        documentDisplayCode = 'over'
        itemlistDisplayCode = 'under'
    }

    // console.log('bothShow, documentShow, itemlistShow',
    //     bothShow, documentShow, itemlistShow)

    // console.log('workboxDisplayCode, documentDisplayCode, itemlistDisplayCode',
    //     workboxDisplayCode, documentDisplayCode, itemlistDisplayCode)

    useEffect(()=>{

        workboxHandler.dimensions.CONTENT_FRAME_PADDING_WIDTH = 10
        setTimeout(() => { // yield for forward reference updates
            setContentState('yielded')
        },1)

    },[])

    useEffect(()=>{

        if (contentState != 'ready') {
            // console.log('setting contentState to ready')
            setContentState('ready')
        }

    },[contentState])

    return <Box data-type = 'workbox-content' ref = {workboxContentElementRef} style = {workboxContentStyles}>
        <PrimaryFrame 
            displayCode = {workboxDisplayCode} 
            documentFrameElementRef = {documentFrameElementRef} 
            itemlistFrameElementRef = {itemlistFrameElementRef} 
        >
            <DocumentFrame 
                ref = {documentFrameElementRef} 
                displayCode = {documentDisplayCode} 
                defaultDocumentState = {workboxHandler.settings.configuration.document}
                viewSetting = {workboxHandler.settings.configuration.document.mode}
                documentData = {{}}
                profileData = {{}}
            />
            <ItemlistFrame 
                ref = {itemlistFrameElementRef} 
                displayCode = {itemlistDisplayCode} 
                defaultItemlistState = {workboxHandler.settings.configuration.itemlist}
                itemlistData = { {} }
                profileData = { {} }
            />
        </PrimaryFrame>
    </Box>
    
} 

export default ContentFrame
