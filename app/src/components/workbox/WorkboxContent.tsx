// WorkboxContent.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import { CentralPanel, CoverPanel, ContentsPanel, SettingsPanel } from './WorkboxPanels'

const workboxContentStyles = {
    display:'flex',
    flexWrap: 'nowrap',
    height:'100%',
    padding:'0 5px 5px 5px',
    position:'relative',
} as CSSProperties

const WorkboxContent = (props) => {

    const 
        { workboxControls } = props,
        { lists, profile } = workboxControls,
        coverFrameElementRef = useRef( null ),
        contentsFrameElementRef = useRef( null ),
        centralPanelElementRef = useRef( null ),
        workboxContentElementRef = useRef( null ),
        [contentState,setContentState] = useState( 'setup' ),
        coverWidthRef = useRef( 300 )

    let workboxDisplayCode, coverDisplayCode, contentsDisplayCode
    if (lists && profile) {
        workboxDisplayCode = 'both'
        coverDisplayCode = 'out'
        contentsDisplayCode = 'out'
    } else if (lists) {
        workboxDisplayCode = 'contents'
        coverDisplayCode = 'under'
        contentsDisplayCode = 'over'
    } else { // profile
        workboxDisplayCode = 'cover'
        coverDisplayCode = 'over'
        contentsDisplayCode = 'under'
    }

    useEffect(()=>{

        setTimeout(() => { // yield for forward reference updates
            setContentState('ready')
        },1)

    },[])

        // <SettingsPanel showPanel = {workboxControls.settings}>
        //     Seettings
        // </SettingsPanel>
        // <MirrorPanel showPanel = {workboxControls.swap} >
        //     Mirror
        // </MirrorPanel>
            // ref = {centralPanelElementRef} 
    return <Box data-type = 'workbox-content' ref = {workboxContentElementRef} style = {workboxContentStyles}>
        <CentralPanel 
            displayCode = {workboxDisplayCode} 
            workboxContentElementRef = {workboxContentElementRef}
            coverFrameElementRef = {coverFrameElementRef} 
            contentsFrameElementRef = {contentsFrameElementRef} 
            coverWidthRef = {coverWidthRef}
        >
            <CoverPanel ref = {coverFrameElementRef} displayCode = {coverDisplayCode} coverWidthRef = {coverWidthRef}>
            Cover
            </CoverPanel>
            <ContentsPanel ref = {contentsFrameElementRef} displayCode = {contentsDisplayCode} coverWidthRef = {coverWidthRef}>
            Contents
            </ContentsPanel>
        </CentralPanel>
    </Box>
} 

export default WorkboxContent
