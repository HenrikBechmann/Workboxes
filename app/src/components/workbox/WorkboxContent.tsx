// WorkboxContent.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import { CentralPanel, CoverPanel, ContentsPanel, SettingsPanel } from './WorkboxPanels'

export const WORKBOX_CONTENT_PADDING_WIDTH = 10

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
        { workboxControlStates } = props,
        { contentsShow, coverShow } = workboxControlStates, // boolean - show/ noshow
        // share cover and contents elements with children
        coverFrameElementRef = useRef( null ),
        contentsFrameElementRef = useRef( null ),
        // create delay to obtain forward references
        [contentState,setContentState] = useState( 'setup' ), // create cycle for forward reference updates
        // set by user through drag tab, and possibly by changing window size
        userCoverWidthRef = useRef( 300 ), // shared with children for configuration
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

    return <Box data-type = 'workbox-content' ref = {workboxContentElementRef} style = {workboxContentStyles}>
        <SettingsPanel showPanel = {workboxControlStates.settingsShow}>
            Settings
        </SettingsPanel>
        <CentralPanel 
            displayConfigCode = {workboxDisplayCode} 
            coverFrameElementRef = {coverFrameElementRef} 
            contentsFrameElementRef = {contentsFrameElementRef} 
            userCoverWidthRef = {userCoverWidthRef}
        >
            <CoverPanel ref = {coverFrameElementRef} displayConfigCode = {coverDisplayCode} userCoverWidthRef = {userCoverWidthRef}>
            Cover
            </CoverPanel>
            <ContentsPanel ref = {contentsFrameElementRef} displayConfigCode = {contentsDisplayCode} userCoverWidthRef = {userCoverWidthRef}>
            Contents
            </ContentsPanel>
        </CentralPanel>
    </Box>
    
} 

export default WorkboxContent
