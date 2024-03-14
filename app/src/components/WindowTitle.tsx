// WindowTitle.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { forwardRef, CSSProperties } from 'react'

import {
    Box
} from '@chakra-ui/react'

import windowMinimalIcon from '../../assets/window-minimal.png'
import windowFloatIcon from '../../assets/window-float.png'
import windowFullIcon from '../../assets/window-full.png'
import moreVertIcon from '../../assets/more_vert_light.png'
import closeLightIcon from '../../assets/close_light.png'

const windowTitleStyles = {
    width: '100%',
    borderBottom:'2px solid silver',
    borderRadius: '7px 7px 0 0',
    padding: '3px',
    backgroundColor:'gainsboro',
    display: 'flex',
    alignItems: 'center',
} as CSSProperties

const titleTextBlockStyles = {
    overflow:'clip',
    minWidth:0,
    fontSize:'small', 
    textWrap:'nowrap', 
    textOverflow: 'ellipsis',   
}  as CSSProperties

const titleIconGroupStyles = {
    marginLeft:'auto',
    borderRadius: '0 7px 0 0',
    display:'flex',
} as CSSProperties

const WindowTitle = forwardRef( function WindowTitle (props:any, titleElementRef:any) {

    return <Box ref = {titleElementRef} id = 'title' data-type = 'window-title' style = {windowTitleStyles}>
        <Box><img style = {{width:'20px'}} src = {closeLightIcon} /></Box>
        <Box data-type = 'text-block' style = {titleTextBlockStyles}>
            Henrik Bechmann (Domain)
        </Box>
        <Box data-type = 'window-icon-group' style = {titleIconGroupStyles}>
            <img src = {windowMinimalIcon} />
            <img src = {windowFloatIcon} />
            <img src = {windowFullIcon} />
            <img src = {moreVertIcon} />
        </Box>
    </Box>
})

export default WindowTitle