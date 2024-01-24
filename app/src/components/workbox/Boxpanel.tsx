// Boxpanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center
} from '@chakra-ui/react'

const panelStyles = {
    height:'100%',
    width: '250px',
    border: '5px ridge gray',
    backgroundColor:'ghostwhite',
    borderRadius:'8px',
}

const Boxpanel = (props) => {
    const { moreStyles, children, type } = props
    const localStyles = {...panelStyles, ...moreStyles}
    return <Box data-type = {type} style = {localStyles}>{children}</Box>
} 

export default Boxpanel