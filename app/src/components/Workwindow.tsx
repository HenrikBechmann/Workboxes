// workwindow.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Grid, GridItem,
    Box
} from '@chakra-ui/react'

import dragCornerIcon from '../../assets/drag-corner.png'
import windowMinimalIcon from '../../assets/window-minimal.png'
import windowFloatIcon from '../../assets/window-float.png'
import windowFullIcon from '../../assets/window-full.png'
import moreVertIcon from '../../assets/more_vert_light.png'

const windowStyles = {
    position: 'absolute',
    height:'300px',
    width:'300px',
    top:'20px',
    left: '20px',
    border: '2px solid silver',
    borderRadius: '8px 8px 0 8px',
} as CSSProperties

const titleStyles = {
    width: '100%',
    borderBottom:'2px solid silver',
    borderRadius: '7px 7px 0 0',
    padding: '3px',
    backgroundColor:'lightgray',
    display:'flex',
} as CSSProperties

const contentStyles = {
    position: 'absolute',
    inset: 0, 
    padding: '3px', 
    backgroundColor: 'ghostwhite',
    borderRadius: '0 0 7px 7px',
} as CSSProperties

const handleStyles = {
    position:'absolute',
    bottom:0,
    right:0,
    borderRadius:'0 0 7px 0',
    display:'flex',
    justifyContent: 'right',
    alignItems: 'end',
    padding:'2px',
    height:'24px',
    width: '24px',
} as CSSProperties

const windowIconGroupStyles = {
    marginLeft:'auto',
    borderRadius: '0 7px 0 0',
    display:'flex',
} as CSSProperties

const handleIconStyles = {
    opacity:0.5, 
    height:'12px', 
    width:'12px',
}

const Workwindow = (props) => {

    const {children, defaults:windowDefaults, sessionID, zOrder, setFocus} = props

    const windowElementRef = useRef(null)
    const titleElementRef = useRef(null)
    const zOrderRef = useRef(null)
    zOrderRef.current = zOrder

    const localWindowStyles = {...windowStyles,...windowDefaults}

    const localTitleStylesRef = useRef(titleStyles)

    useEffect(()=>{

        const element = windowElementRef.current

        const onFocus = (event) => {
            setFocus(zOrderRef.current)
            titleElementRef.current.style.backgroundColor = 'lightskyblue'
        }

        const onBlur = (event) => {
            titleElementRef.current.style.backgroundColor = 'lightgray'
        }

        element.addEventListener('focus',onFocus)

        element.addEventListener('blur',onBlur)

        return () => {
            element.removeEventListener('focus', onFocus)
            element.removeEventListener('blur', onBlur)
        }

    },[])

    return <Box tabIndex = {0} ref = {windowElementRef} data-type = 'window-frame' style = {localWindowStyles}>
        <Grid 
            data-type = 'window-grid'
            height = '100%' 
            gridTemplateColumns = '1fr' 
            gridTemplateRows = 'auto 1fr'
            gridTemplateAreas = {`"header"
                                  "body"`}
        >
            <GridItem data-type = 'window-header' gridArea = 'header' width = '100%' position = 'relative'>
                <Box ref = {titleElementRef} data-type = 'window-title' style = {titleStyles}><Box data-type = 'text-block'>Title</Box>
                    <Box data-type = 'window-icon-group' style = {windowIconGroupStyles}>
                        <img src = {windowMinimalIcon} />
                        <img src = {windowFloatIcon} />
                        <img src = {windowFullIcon} />
                        <img src = {moreVertIcon} />
                    </Box>
                </Box>
            </GridItem>
            <GridItem data-type = 'window-body' gridArea = 'body' width = '100%' position = 'relative'>
                <Box 
                    data-type = 'window-content' 
                    style = {contentStyles}
                >{children}</Box>
                <Box data-type = 'resize-handle' style = {handleStyles}>
                    <img src = {dragCornerIcon} style = {handleIconStyles} />
                </Box>
            </GridItem>
        </Grid>
    </Box>

} 

export default Workwindow