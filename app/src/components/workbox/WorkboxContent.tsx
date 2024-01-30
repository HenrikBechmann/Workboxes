// WorkboxContent.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import { CentralPanel, DocumentPanel, FoldersPanel } from './Boxpanel'

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

    return <Box data-type = 'workbox-content' style = {workboxContentStyles}>
        <CentralPanel ref = {centralPanelElementRef} targetDisplay = {toggleTargetDisplay} documentElementRef = {documentElementRef} foldersElementRef = {foldersElementRef} >
            <DocumentPanel ref = {documentElementRef} targetDisplay = {documentTargetDisplay} >
            Document
            </DocumentPanel>
            <FoldersPanel ref = {foldersElementRef} targetDisplay = {foldersTargetDisplay} >
            Folders
            </FoldersPanel>
        </CentralPanel>
    </Box>
} 

export default WorkboxContent