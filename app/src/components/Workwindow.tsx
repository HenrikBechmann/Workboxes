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
import windowCloseIcon from '../../assets/window-close.png'

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
    backgroundColor:'lightskyblue',
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
    position:'absolute',
    top:0,
    right:0,
    borderRadius: '0 7px 0 0',
    display:'flex',
} as CSSProperties

const handleIconStyles = {
    opacity:0.5, 
    height:'12px', 
    width:'12px',
}

const Workwindow = (props) => {
    const {children} = props

    return <Box data-type = 'window-frame' style = {windowStyles}>
        <Grid 
            data-type = 'window-grid'
            height = '100%' 
            gridTemplateColumns = '1fr' 
            gridTemplateRows = 'auto 1fr'
            gridTemplateAreas = {`"header"
                                  "body"`}
        >
            <GridItem data-type = 'window-header' gridArea = 'header' width = '100%' position = 'relative'>
                <Box data-type = 'window-title' style = {titleStyles}>Title</Box>
                <Box data-type = 'window-icon-group' style = {windowIconGroupStyles}>
                    <img src = {windowMinimalIcon} />
                    <img src = {windowFloatIcon} />
                    <img src = {windowFullIcon} />
                    <img src = {windowCloseIcon} />
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