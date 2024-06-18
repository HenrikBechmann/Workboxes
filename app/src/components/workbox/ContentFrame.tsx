// ContentFrame.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, useContext } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import PrimaryFrame from './PrimaryFrame'
import DocumentFrame from './DocumentFrame'
import ItemlistFrame from './ItemlistFrame'
import SettingsFrame from './SettingsFrame'

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
        { 
            workboxConfig, 
            defaultDocumentState,
            defaultItemlistState,
            viewSetting, 
            documentData, 
            itemlistData, 
            profileData 
        } = props,
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        { itemlistShow, documentShow } = workboxConfig, // boolean - show/ noshow
        // share document and itembox elements with children
        documentFrameElementRef = useRef( null ),
        itemlistFrameElementRef = useRef( null ),
        // create delay to obtain forward references
        [contentState,setContentState] = useState( 'setup' ), // create cycle for forward reference updates
        // set by user through drag tab, and possibly by changing window size
        UIDocumentWidthRef = useRef( {minimized:300, maximized:300, normalized:300} ), // shared with children for configuration
        workboxContentElementRef = useRef(null)

    let workboxDisplayCode, documentDisplayCode, itemlistDisplayCode // configuration controls for children
    if (itemlistShow && documentShow) {
        workboxDisplayCode = 'both'
        documentDisplayCode = 'out'
        itemlistDisplayCode = 'out'
    } else if (itemlistShow) {
        workboxDisplayCode = 'itembox'
        documentDisplayCode = 'under'
        itemlistDisplayCode = 'over'
    } else { // documentShow
        workboxDisplayCode = 'document'
        documentDisplayCode = 'over'
        itemlistDisplayCode = 'under'
    }

    useEffect(()=>{

        workboxHandler.CONTENT_PADDING_WIDTH = 10
        setTimeout(() => { // yield for forward reference updates
            setContentState('ready')
        },1)

    },[])

    useEffect(()=>{

        if (contentState != 'ready') setContentState('ready')

    },[contentState])

    return <Box data-type = 'workbox-content' ref = {workboxContentElementRef} style = {workboxContentStyles}>
        <SettingsFrame showPanel = {workboxConfig.settingsShow}>
            Settings
        </SettingsFrame>
        <PrimaryFrame 
            displayConfigCode = {workboxDisplayCode} 
            documentFrameElementRef = {documentFrameElementRef} 
            itemlistFrameElementRef = {itemlistFrameElementRef} 
            UIDocumentWidthRef = {UIDocumentWidthRef}
            viewSetting = {viewSetting}
        >
            <DocumentFrame 
                ref = {documentFrameElementRef} 
                displayConfigCode = {documentDisplayCode} 
                defaultDocumentState = {defaultDocumentState}
                UIDocumentWidthRef = {UIDocumentWidthRef}
                viewSetting = {viewSetting}
                documentData = {documentData}
                profileData = {profileData}
            />
            <ItemlistFrame 
                ref = {itemlistFrameElementRef} 
                displayConfigCode = {itemlistDisplayCode} 
                defaultItemlistState = {defaultItemlistState}
                itemlistData = { itemlistData }
                profileData = { profileData }
            />
        </PrimaryFrame>
    </Box>
    
} 

export default ContentFrame
