// Toolbar_Cover.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'

import {
  Box, MenuList, MenuItem
} from '@chakra-ui/react'

import MenuIcon from './MenuIcon'
import StandardIcon from './StandardIcon'

const coverToolbarStyles = {
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

import profileIcon from '../../../assets/profile.png'
import editIcon from '../../../assets/edit.png'

const smallerIconStyles = {
    height:'18px', 
    width:'18px'
}

const iconWrapperStyles = {
    height: '24px',
    opacity:0.7,
    padding:'4px',
}

const CoverToolbar = (props) => {

    const covermenulist = <MenuList >
        <MenuItem >Download Cover Page</MenuItem>
        <MenuItem >Cover Page Settings</MenuItem>
    </MenuList>

    // render
    return <Box data-type = 'cover-toolbar' style = {coverToolbarStyles}>

        <MenuIcon icon = {profileIcon} caption = 'cover page' tooltip = 'Workbox Cover Page' menulist = {covermenulist} />        
        <StandardIcon icon = {editIcon} caption = 'edit' tooltip = 'edit the cover'/>

    </Box>
}

export default CoverToolbar