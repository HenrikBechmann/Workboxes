// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import Toolbar from './Toolbar'
import ToolbarWorkbox from './ToolbarWorkbox'
import WorkboxContent from './WorkboxContent'

const workboxStyle = {
    position:'absolute',
    inset:0,
} as CSSProperties

import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center
} from '@chakra-ui/react'

const Workbox = (props) => {
    const {workboxItemIcon, workboxTitle} = props
    return <Box data-type = 'workbox' style = {workboxStyle} >
        <Toolbar scrollerStyles = {{margin:'auto'}}>
            <ToolbarWorkbox workboxItemIcon = {workboxItemIcon} workboxTitle = {workboxTitle}/>
        </Toolbar>
        <Box data-type = 'content-holder' overflowX = 'auto' position = 'relative' height = 'calc(100% - 40px)' width = '100%'>
            <WorkboxContent />
        </Box>
    </Box>
}

export default Workbox