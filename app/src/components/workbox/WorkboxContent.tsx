// WorkboxContent.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, useContext } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import CentralPanel from './CentralPanel'
import DocumentPanel from './DocumentPanel'
import ItemlistPanel from './ItemlistPanel'
import SettingsPanel from './SettingsPanel'

// synchronize this with the total left and right padding of workboxContentStyles
// imported and used by resize observer of Workbox
export const WORKBOX_CONTENT_TOTAL_PADDING_WIDTH = 10

const workboxContentStyles = {
    display:'flex',
    flexWrap: 'nowrap',
    height:'100%',
    padding:'0 5px 5px 5px',
    position:'relative',
    width:'100%',
    overflow: 'auto',
} as CSSProperties

const WorkboxContent = (props) => {

    const 
        { 
            workboxState, 
            defaultDocumentState,
            defaultItemlistState,
            windowSessionID, 
            viewSelector, 
            documentData, 
            itemlistData, 
            profileData 
        } = props,
        { itemlistShow, documentShow } = workboxState, // boolean - show/ noshow
        // share document and itembox elements with children
        documentFrameElementRef = useRef( null ),
        itemlistFrameElementRef = useRef( null ),
        // create delay to obtain forward references
        [contentState,setContentState] = useState( 'setup' ), // create cycle for forward reference updates
        // set by user through drag tab, and possibly by changing window size
        userDocumentWidthRef = useRef( {minimized:300, maximized:300, normalized:300} ), // shared with children for configuration
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

        setTimeout(() => { // yield for forward reference updates
            setContentState('ready')
        },1)

    },[])

    useEffect(()=>{

        if (contentState != 'ready') setContentState('ready')

    },[contentState])

    return <Box data-type = 'workbox-content' ref = {workboxContentElementRef} style = {workboxContentStyles}>
        <SettingsPanel showPanel = {workboxState.settingsShow}>
            Settings
        </SettingsPanel>
        <CentralPanel 
            windowSessionID = {windowSessionID}
            displayConfigCode = {workboxDisplayCode} 
            documentFrameElementRef = {documentFrameElementRef} 
            itemlistFrameElementRef = {itemlistFrameElementRef} 
            userDocumentWidthRef = {userDocumentWidthRef}
            viewSelector = {viewSelector}
        >
            <DocumentPanel 
                ref = {documentFrameElementRef} 
                displayConfigCode = {documentDisplayCode} 
                defaultDocumentState = {defaultDocumentState}
                userDocumentWidthRef = {userDocumentWidthRef}
                windowSessionID =  {windowSessionID}
                viewSelector = {viewSelector}
                documentData = {documentData}
                profileData = {profileData}
            />
            <ItemlistPanel 
                ref = {itemlistFrameElementRef} 
                displayConfigCode = {itemlistDisplayCode} 
                defaultItemlistState = {defaultItemlistState}
                itemlistData = { itemlistData }
                profileData = { profileData }
            />
        </CentralPanel>
    </Box>
    
} 

export default WorkboxContent
