// WorkboxContent.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

import TogglePanel from './Boxpanel'
import DocumentPanel from './Boxpanel'
import LinkPanel from './Boxpanel'

const workboxContentStyles = {
    display:'block',
    height:'100%',
    backgroundColor:'brown',
    margin:'auto',
}

const WorkboxContent = (props) => {
    const { workboxControls } = props
    console.log('workboxControls',workboxControls)
    return <Box data-type = 'workbox-content' style = {workboxContentStyles}>
        <TogglePanel type = 'toggle-panel' 
            moreStyles = {
                {
                    margin:'auto', 
                    border:'initial', 
                    backgroundColor:'transparent', 
                    width:'250px',
                    position:'relative',
                }
            } >
            <DocumentPanel type = 'document-panel' moreStyles = {{position:'absolute', top:0,left:0}} >
            Document
            </DocumentPanel>
            <LinkPanel type = 'link-panel' moreStyles = {{position:'absolute',top:0,right:0}} >
            Folders
            </LinkPanel>
        </TogglePanel>
    </Box>
} 

export default WorkboxContent