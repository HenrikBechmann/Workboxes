// WorkboxContent.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, useContext } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import CentralPanel from './CentralPanel'
import DocumentPanel from './DocumentPanel'
import DataboxPanel from './DataboxPanel'
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
        { workboxConfig, sessionWindowID, viewSelector, documentData, databoxData, profileData } = props,
        { contentsShow, coverShow } = workboxConfig, // boolean - show/ noshow
        // share cover and contents elements with children
        coverFrameElementRef = useRef( null ),
        contentsFrameElementRef = useRef( null ),
        // create delay to obtain forward references
        [contentState,setContentState] = useState( 'setup' ), // create cycle for forward reference updates
        // set by user through drag tab, and possibly by changing window size
        userDocumentWidthRef = useRef( {minimized:300, maximized:300, normalized:300} ), // shared with children for configuration
        workboxContentElementRef = useRef(null)

    let workboxDisplayCode, coverDisplayCode, contentsDisplayCode // configuration controls for children
    if (contentsShow && coverShow) {
        workboxDisplayCode = 'both'
        coverDisplayCode = 'out'
        contentsDisplayCode = 'out'
    } else if (contentsShow) {
        workboxDisplayCode = 'contents'
        coverDisplayCode = 'under'
        contentsDisplayCode = 'over'
    } else { // coverShow
        workboxDisplayCode = 'cover'
        coverDisplayCode = 'over'
        contentsDisplayCode = 'under'
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
        <SettingsPanel showPanel = {workboxConfig.settingsShow}>
            Settings
        </SettingsPanel>
        <CentralPanel 
            sessionWindowID = {sessionWindowID}
            displayConfigCode = {workboxDisplayCode} 
            coverFrameElementRef = {coverFrameElementRef} 
            contentsFrameElementRef = {contentsFrameElementRef} 
            userDocumentWidthRef = {userDocumentWidthRef}
            viewSelector = {viewSelector}
        >
            <DocumentPanel 
                ref = {coverFrameElementRef} 
                displayConfigCode = {coverDisplayCode} 
                userDocumentWidthRef = {userDocumentWidthRef}
                sessionWindowID =  {sessionWindowID}
                viewSelector = {viewSelector}
                documentData = {documentData}
                profileData = {profileData}
            >
            The workbox document ({sessionWindowID})
            </DocumentPanel>
            <DataboxPanel 
                ref = {contentsFrameElementRef} 
                displayConfigCode = {contentsDisplayCode} 
                databoxData = { databoxData }
            >
            The workbox databox - contains workboxes
            </DataboxPanel>
        </CentralPanel>
    </Box>
    
} 

export default WorkboxContent
