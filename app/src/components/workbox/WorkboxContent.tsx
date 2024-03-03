// WorkboxContent.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import { CentralPanel, CoverPanel, ContentsPanel, SettingsPanel, MirrorPanel } from './WorkboxPanels'

const workboxContentStyles = {
    display:'flex',
    flexWrap: 'nowrap',
    flex: '1 0 auto',
    height:'100%',
    padding:'5px',
    position:'relative',
} as CSSProperties

const WorkboxContent = (props) => {

    const 
        { workboxControls } = props,
        {lists, profile} = workboxControls,
        coverElementRef = useRef(null),
        contentsElementRef = useRef(null),
        centralPanelElementRef = useRef(null),
        [contentState,setContentState] = useState('setup')

    let toggleTargetDisplay, coverTargetDisplay, contentsTargetDisplay
    if (lists && profile) {
        toggleTargetDisplay = 'both'
        coverTargetDisplay = 'out'
        contentsTargetDisplay = 'out'
    } else if (lists) {
        toggleTargetDisplay = 'folders'
        coverTargetDisplay = 'under'
        contentsTargetDisplay = 'over'
    } else { // profile
        toggleTargetDisplay = 'document'
        coverTargetDisplay = 'over'
        contentsTargetDisplay = 'under'
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
    return <Box data-type = 'workbox-content' style = {workboxContentStyles}>
        <CentralPanel 
            targetDisplay = {toggleTargetDisplay} 
            coverElementRef = {coverElementRef} 
            contentsElementRef = {contentsElementRef} 
        >
            <CoverPanel ref = {coverElementRef} targetDisplay = {coverTargetDisplay} >
            Cover
            </CoverPanel>
            <ContentsPanel ref = {contentsElementRef} targetDisplay = {contentsTargetDisplay} >
            Contents
            </ContentsPanel>
        </CentralPanel>
    </Box>
} 

export default WorkboxContent
