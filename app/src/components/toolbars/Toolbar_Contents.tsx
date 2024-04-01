// Toolbar_Contents.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'

import {
  Box, MenuList, MenuItem
} from '@chakra-ui/react'

import MenuIcon from './MenuIcon'
import StandardIcon from './StandardIcon'
import { useToggleIcon } from './ToggleIcon'

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
import addIcon from '../../../assets/add.png'
import filterIcon from '../../../assets/filter.png'
import sortIcon from '../../../assets/sort.png'
import directionIcon from '../../../assets/direction.png'
import dragIcon from '../../../assets/drag.png'
import columnIcon from '../../../assets/columns.png'

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


    const
        toggleOnCoverRef = useRef(null),
        disabledCoverRef = useRef(null),
        dragToggle = useToggleIcon({
        icon:dragIcon, 
        tooltip:'Toggle drag and drop',
        caption:'drag',
        toggleOnRef:toggleOnCoverRef,
        disabledRef:disabledCoverRef, 
    })

    const contentsmenulist = <MenuList >
        <MenuItem>Resource List settings</MenuItem>
    </MenuList>

    // render
    return <Box data-type = 'cover-toolbar' style = {contentsToolbarStyles}>
    
        <MenuIcon icon = {packageIcon} caption = 'folders' tooltip = 'Workbox Resources' menulist = {contentsmenulist} />
        <StandardIcon icon = {columnIcon} caption = 'format' tooltip = 'switch formats'/>
        { dragToggle }
        <StandardIcon icon = {addIcon} caption = 'add' tooltip = 'add an item'/>
        <StandardIcon icon = {directionIcon} iconStyles = {{transform:'rotate(90deg)'}} caption = 'splay' tooltip = 'horizontal view'/>

    </Box>
}

        // <StandardIcon icon = {filterIcon} caption = 'filter' tooltip = 'filter items'/>
        // <StandardIcon icon = {sortIcon} caption = 'sort' tooltip = 'sort items'/>

export default ContentsToolbar