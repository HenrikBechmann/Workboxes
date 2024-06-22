// WindowTitle.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { forwardRef, CSSProperties } from 'react'

import {
    Box
} from '@chakra-ui/react'

import windowMinimalIcon from '../../../assets/window-minimal.png'
import windowFloatIcon from '../../../assets/window-float.png'
import windowFullIcon from '../../../assets/window-full.png'
import moreVertIcon from '../../../assets/more_vert_light.png'
import closeLightIcon from '../../../assets/close_light.png'

const windowTitleStyles = {
    width: '100%',
    borderBottom:'2px solid silver',
    borderRadius: '7px 7px 0 0',
    padding: '3px',
    backgroundColor:'gainsboro',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flexFlow: 'row nowrap'
} as CSSProperties

const titleTextBlockStyles = {
    minWidth:0,
    flex: '1 0 0%',  
} as CSSProperties

const titleContentStyles = {
    fontSize:'small', 
    overflow:'hidden',
    textWrap:'nowrap', 
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis', 
} as CSSProperties

const iconBoxStyles = {
    width: '24px',
    height: '24px',
} as CSSProperties

const titleIconGroupStyles = {
    marginLeft:'auto',
    borderRadius: '0 7px 0 0',
    display:'flex',
    flex:'0 0 auto',
} as CSSProperties

const leftIconBoxStyles = {
    display:'flex',
    flex:'0 0 auto',
    width: '24px',
    height: '24px',
    alignItems: 'center',
} as CSSProperties

const WindowTitle = forwardRef( function WindowTitle (props:any, titleElementRef:any) {

    const { windowCallbacks, windowSessionID, type, title } = props

    const closeWindow = (e) => {
        e.preventDefault()
        windowCallbacks.closeWindow(windowSessionID)
    }

    const minimizeWindow = (e) => {
        e.preventDefault()
        windowCallbacks.minimizeWindow(windowSessionID)
    }

    const maximizeWindow = (e) => {
        e.preventDefault()
        windowCallbacks.maximizeWindow(windowSessionID)
    }

    const normalizeWindow = (e) => {
        e.preventDefault()
        windowCallbacks.normalizeWindow(windowSessionID)
    }

    return <Box ref = {titleElementRef} id = 'wb-titlebar' data-type = 'window-title' style = {windowTitleStyles}>
        <Box data-type = 'window-close' onClick = {closeWindow} style = {leftIconBoxStyles} >
            <img draggable = "false" style = {{width:'20px'}} src = {closeLightIcon} />
        </Box>
        <Box data-type = 'text-block' id = 'draghandle' style = {titleTextBlockStyles}>
            <Box style = {titleContentStyles}>
            {title} [{type}]
            </Box>
        </Box>
        <Box data-type = 'window-icon-group' style = {titleIconGroupStyles}>
            <Box onClick = {minimizeWindow} style = {iconBoxStyles} ><img draggable = "false" src = {windowMinimalIcon} /></Box>
            <Box onClick = {normalizeWindow} style = {iconBoxStyles} ><img draggable = "false" src = {windowFloatIcon} /></Box>
            <Box onClick = {maximizeWindow} style = {iconBoxStyles} ><img draggable = "false" src = {windowFullIcon} /></Box>
            <Box style = {iconBoxStyles} ><img draggable = "false" src = {moreVertIcon} /></Box>
        </Box>
    </Box>
})



export default WindowTitle