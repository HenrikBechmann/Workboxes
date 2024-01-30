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
    transition:'box-shadow .5s'
}

const centralPanelStyles = {
    border:'initial', 
    backgroundColor:'transparent', 
    position:'relative',
    transition: 'width .5s ease-in-out',
} as CSSProperties

const propertiesPanelStyles = {
    height: '100%',
    width:'auto',
    overflow:'hidden',
    position:'relative',
} as CSSProperties

const propertiesContentStyles = {
    display:'block', 
    border:'5px solid silver',
    borderRadius:'8px',
    padding:'3px',
    boxSizing:'border-box',
    height: '100%',
    width:'250px',
    position:'relative',
} as CSSProperties

const mirrorPanelStyles = {
    height: '100%',
    width:'auto',
    overflow:'hidden',
    position:'relative',
} as CSSProperties

const mirrorContentStyles = {
    display:'block', 
    border:'5px solid silver',
    borderRadius:'8px',
    padding:'3px',
    boxSizing:'border-box',
    height: '100%',
    width:'250px',
    position:'relative',
} as CSSProperties

export const PropertiesPanel = (props) => {
    const
        {showPanel, children} = props

    return <Box data-type = 'properties-panel' style = {propertiesPanelStyles} >
        <Box data-type = 'properties-content' style = {propertiesContentStyles}>
            {children}
        </Box>
    </Box>
}

export const CentralPanel = forwardRef(function CentralPanel(props:any, ref:any) {

    const 
        { children, targetDisplay, documentElementRef, foldersElementRef } = props,
        displayStateRef = useRef(targetDisplay),
        localStyles = {...panelStyles, ...centralPanelStyles} as CSSProperties

    useEffect(()=>{

        let timeout = 500

        if (targetDisplay == 'both') {

            const width = (documentElementRef.current.offsetWidth + foldersElementRef.current.offsetWidth) + 'px'
            ref.current.style.width = width    

        } else if (targetDisplay == 'document') {

            if (displayStateRef.current == 'folders') {

                timeout = 800

                ref.current.style.width = 
                    (documentElementRef.current.offsetWidth + foldersElementRef.current.offsetWidth) + 'px'

            }

            setTimeout(()=>{
                ref.current.style.width = 
                    documentElementRef.current.offsetWidth + 'px'
            },timeout)

        } else { // 'folders'

            if (displayStateRef.current == 'document') {

                timeout = 800

                ref.current.style.width = 
                    (documentElementRef.current.offsetWidth + foldersElementRef.current.offsetWidth) + 'px'

            }

            setTimeout(()=>{
                ref.current.style.width = 
                    foldersElementRef.current.offsetWidth + 'px'
            },timeout)

        }

        displayStateRef.current = targetDisplay

    },[targetDisplay])

    return <Box data-type = 'central-panel' ref = {ref} style = {localStyles}>{children}</Box>
})

export const DocumentPanel = forwardRef(function DocumentPanel(props:any, ref:any) {
    const 
        { children, targetDisplay } = props,
        moreStyles = {position:'absolute', top:0,left:0, padding: '3px'} as CSSProperties,
        displayStateRef = useRef(targetDisplay),
        localStylesRef = useRef({...panelStyles, ...moreStyles, visibility:'hidden'} as CSSProperties)

    useEffect(()=>{

        let timeout = 500

        if (localStylesRef.current.visibility == 'hidden') {

            const localTimeout = targetDisplay == 'under'?timeout:0

            setTimeout(()=>{
                localStylesRef.current = {...localStylesRef.current, visibility:'visible'}
            },localTimeout)

        }

        if (targetDisplay == 'out') {

            setTimeout(()=>{
                ref.current.style.zIndex = 0
                ref.current.style.boxShadow = 'none'
            },timeout)

        } else if (targetDisplay == 'over') {

            if (displayStateRef.current == 'out') {
                timeout = 0
            }

            setTimeout(()=>{
                ref.current.style.zIndex = 1
                ref.current.style.boxShadow = 'none'
            },timeout)

        } else { // 'under'

            if (displayStateRef.current == 'out') {
                timeout = 0
            }

            setTimeout(()=>{
                ref.current.style.zIndex = 0
                ref.current.style.boxShadow = '3px 3px 6px 6px inset silver'
            },timeout)

        }

        displayStateRef.current = targetDisplay

    },[targetDisplay])

    return <Box ref = {ref} data-type = 'document-panel' style = {localStylesRef.current}>{children}</Box>
})

export const FoldersPanel = forwardRef(function FoldersPanel(props:any, ref:any) {
    const 
        { children, targetDisplay } = props,
        moreStyles = {position:'absolute',top:0,right:0, padding: '3px'} as CSSProperties,
        displayStateRef = useRef(targetDisplay),
        localStylesRef = useRef({...panelStyles, ...moreStyles, visibility:'hidden'} as CSSProperties)

    useEffect(()=>{

        let timeout = 500

        if (localStylesRef.current.visibility == 'hidden') {

            const localTimeout = targetDisplay == 'under'?timeout:0

            setTimeout(()=>{
                localStylesRef.current = {...localStylesRef.current, visibility:'visible'}
            },localTimeout)

        }

        if (targetDisplay == 'out') {

            setTimeout(()=>{
                ref.current.style.zIndex = 0
                ref.current.style.boxShadow = 'none'
            },timeout)

        } else if (targetDisplay == 'over') {

            if (displayStateRef.current == 'out') {
                timeout = 0
            }

            setTimeout(()=>{
                ref.current.style.zIndex = 1
                ref.current.style.boxShadow = 'none'
            },timeout)

        } else { // 'under'

            if (displayStateRef.current == 'out') {
                timeout = 0
            }

            setTimeout(()=>{
                ref.current.style.zIndex = 0
                ref.current.style.boxShadow = '3px 3px 6px 6px inset silver'
            },timeout)

        }

        displayStateRef.current = targetDisplay

    },[targetDisplay])

    return <Box ref = {ref} data-type = 'folders-panel' style = {localStylesRef.current}> {children}</Box>

})

export const MirrorPanel = (props) => {
    const
        {showPanel, children} = props

    return <Box data-type = 'mirror-panel' style = {mirrorPanelStyles} >
        <Box data-type = 'mirror-content' style = {mirrorContentStyles}>
            {children}
        </Box>
    </Box>
}
