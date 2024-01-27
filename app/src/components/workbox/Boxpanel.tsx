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

export const TogglePanel = (props) => {

    const moreStyles = 
        {
            margin:'auto', 
            border:'initial', 
            backgroundColor:'transparent', 
            width:'250px',
            position:'relative',
        } as CSSProperties

    const { children, targetDisplay } = props
    const localStyles = {...panelStyles, ...moreStyles}
    return <Box data-type = 'toggle-panel' style = {localStyles}>{children}</Box>
} 

export const DocumentPanel = (props) => {
    const { children, targetDisplay } = props
    const moreStyles = {position:'absolute', top:0,left:0, padding: '3px'} as CSSProperties
    const localStyles = {...panelStyles, ...moreStyles}
    return <Box data-type = 'document-panel' style = {localStyles}>{children}</Box>
} 

export const FoldersPanel = (props) => {
    const { children, targetDisplay } = props
    const moreStyles = {position:'absolute',top:0,right:0, padding: '3px'} as CSSProperties
    const localStyles = {...panelStyles, ...moreStyles}
    return <Box data-type = 'folders-panel' style = {localStyles}>{children}</Box>
} 
