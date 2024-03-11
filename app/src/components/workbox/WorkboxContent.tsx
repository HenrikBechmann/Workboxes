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
        coverUserWidthRef = useRef( 300 ) // shared with children for configuration

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

    return <Box data-type = 'workbox-content' style = {workboxContentStyles}>
        <SettingsPanel showPanel = {workboxControlStates.settingsShow}>
            Settings
        </SettingsPanel>
        <CentralPanel 
            displayCode = {workboxDisplayCode} 
            coverFrameElementRef = {coverFrameElementRef} 
            contentsFrameElementRef = {contentsFrameElementRef} 
            coverUserWidthRef = {coverUserWidthRef}
        >
            <CoverPanel ref = {coverFrameElementRef} displayCode = {coverDisplayCode} coverUserWidthRef = {coverUserWidthRef}>
            Cover
            </CoverPanel>
            <ContentsPanel ref = {contentsFrameElementRef} displayCode = {contentsDisplayCode} coverUserWidthRef = {coverUserWidthRef}>
            Contents
            </ContentsPanel>
        </CentralPanel>
    </Box>
} 

export default WorkboxContent
