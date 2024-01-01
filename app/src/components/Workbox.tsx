// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import Toolbar from '../components/Toolbar'
import ToolbarWorkbox from '../components/ToolbarWorkbox'

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
    return <Box data-type = 'workbox' style = {workboxStyle} >
        <Toolbar>
            <ToolbarWorkbox />
        </Toolbar>
    </Box>
}

export default Workbox