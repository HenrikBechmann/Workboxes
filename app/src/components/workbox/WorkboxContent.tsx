// WorkboxContent.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import { TogglePanel, DocumentPanel, FoldersPanel } from './Boxpanel'

const workboxContentStyles = {
    display:'block',
    height:'100%',
    margin:'auto',
    padding:'5px'
}

const WorkboxContent = (props) => {

    const 
        { workboxControls } = props,
        {lists, profile} = workboxControls,
        documentElementRef = useRef(null),
        foldersElementRef = useRef(null),
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

        setTimeout(() => {
            setContentState('ready')
        },100)

    },[])

    return <Box data-type = 'workbox-content' style = {workboxContentStyles}>
        <TogglePanel targetDisplay = {toggleTargetDisplay} documentElementRef = {documentElementRef} foldersElementRef = {foldersElementRef} >
            <DocumentPanel ref = {documentElementRef} targetDisplay = {documentTargetDisplay} >
            Document
            </DocumentPanel>
            <FoldersPanel ref = {foldersElementRef} targetDisplay = {foldersTargetDisplay} >
            Folders
            </FoldersPanel>
        </TogglePanel>
    </Box>
} 

export default WorkboxContent