// Workpanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center
} from '@chakra-ui/react'

const workpanelStyles = {
    position:'absolute',
    inset: 0,
    minWidth:'1000px',
} as CSSProperties

const Workpanel = (props) => {

    const { children } = props

    return <Box data-type = 'workpanel' style = {workpanelStyles}>
        {children}
    </Box>
} 

export default Workpanel