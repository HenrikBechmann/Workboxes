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
    // flexBasis: 'auto',
    // flexShrink: 0,
    height:'100%',
    padding:'5px',
    position:'relative',
} as CSSProperties

const WorkboxContent = (props) => {

    const 
        { workboxControls } = props,
        {lists, profile} = workboxControls,
        documentElementRef = useRef(null),
        foldersElementRef = useRef(null),
        centralPanelElementRef = useRef(null),
        [contentState,setContentState] = useState('setup')

    let toggleTargetDisplay, documentTargetDisplay, foldersTargetDisplay
    if (lists && profile) {
        toggleTargetDisplay = 'both'
        documentTargetDisplay = 'out'
        foldersTargetDisplay = 'out'
    } else if (lists) {
        toggleTargetDisplay = 'folders'
        documentTargetDisplay = 'under'
        foldersTargetDisplay = 'over'
    } else { // profile
        toggleTargetDisplay = 'document'
        documentTargetDisplay = 'over'
        foldersTargetDisplay = 'under'
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
            documentElementRef = {documentElementRef} 
            foldersElementRef = {foldersElementRef} 
        >
            <CoverPanel ref = {documentElementRef} targetDisplay = {documentTargetDisplay} >
            Cover
            </CoverPanel>
            <ContentsPanel ref = {foldersElementRef} targetDisplay = {foldersTargetDisplay} >
            Contents
            </ContentsPanel>
        </CentralPanel>
    </Box>
} 

export default WorkboxContent