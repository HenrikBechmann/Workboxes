// Toolbar_Contents.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'

import {
  Box, MenuList, MenuItem
} from '@chakra-ui/react'

import MenuIcon from './MenuIcon'
import StandardIcon from './StandardIcon'

const contentsToolbarStyles = {
    padding:'2px',
    minHeight:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'nowrap',
    whitespace:'nowrap',
    alignItems:'center',
    boxSizing:'border-box',
    backgroundColor:'#f2f2f2',
    borderRadius:'8px 8px 0 0',
    // borderBottom:'1px solid silver',

} as CSSProperties

import packageIcon from '../../../assets/package.png'
import listIcon from '../../../assets/list.png'

const smallerIconStyles = {
    height:'18px', 
    width:'18px'
}

const iconWrapperStyles = {
    height: '24px',
    opacity:0.7,
    padding:'4px',
}

const ContentsToolbar = (props) => {

    const contentsmenulist = <MenuList >
        <MenuItem>Something</MenuItem>
    </MenuList>

    // render
    return <Box data-type = 'cover-toolbar' style = {contentsToolbarStyles}>
    
        <MenuIcon icon = {packageIcon} caption = 'contents' tooltip = 'Workbox Contents' menulist = {contentsmenulist} />        
        <StandardIcon icon = {listIcon} caption = 'format' tooltip = 'switch formats'/>

    </Box>
}

export default ContentsToolbar