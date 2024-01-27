// Boxpanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, forwardRef } from 'react'

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

    const 
        { children, targetDisplay, documentElementRef, foldersElementRef } = props,
        [displayState, setDisplayState ] = useState('document'),

    // console.log('documentElementRef, foldersElementRef', documentElementRef, foldersElementRef)

        documentElement = documentElementRef.current,
        foldersElement = foldersElementRef.current,

        moreStyles = 
            {
                margin:'auto', 
                border:'initial', 
                backgroundColor:'transparent', 
                width:'250px',
                position:'relative',
            } as CSSProperties,

        localStyles = {...panelStyles, ...moreStyles}

    return <Box data-type = 'toggle-panel' style = {localStyles}>{children}</Box>
} 

export const DocumentPanel = forwardRef(function DocumentPanel(props:any, ref:any) {
    const 
        { children, targetDisplay } = props,
        moreStyles = {position:'absolute', top:0,left:0, padding: '3px'} as CSSProperties,
        localStyles = {...panelStyles, ...moreStyles},
        [displayState, setDisplayState ] = useState('over')

    return <div ref = {ref} data-type = 'document-panel' style = {localStyles}>{children}</div>
})

export const FoldersPanel = forwardRef(function FoldersPanel(props:any, ref:any) {
    const 
        { children, targetDisplay } = props,
        moreStyles = {position:'absolute',top:0,right:0, padding: '3px'} as CSSProperties,
        localStyles = {...panelStyles, ...moreStyles},
        [displayState, setDisplayState ] = useState('under')

    return <div ref = {ref} data-type = 'folders-panel' style = {localStyles}>{children}</div>
})
