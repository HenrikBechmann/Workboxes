// WorkboxContent.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Box, VStack, Center
} from '@chakra-ui/react'

const workboxContentStyles = {
    display:'block',
    height:'100%',
    backgroundColor:'brown',
    margin:'auto',
    width:'fit-content',
}

const WorkboxContent = (props) => {
    return <Box data-type = 'workbox-content' style = {workboxContentStyles}>Content</Box>
} 

export default WorkboxContent