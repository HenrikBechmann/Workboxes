// Toolbar_Itemlist.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'

import {
  Box, MenuList, MenuItem
} from '@chakra-ui/react'

import MenuIcon from './MenuIcon'
import StandardIcon from './StandardIcon'
import { useToggleIcon } from './ToggleIcon'
import LearnIcon from './LearnIcon'
import ToolbarVerticalDivider from './VerticalDivider'

const itemlistToolbarStyles = {
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
} as CSSProperties

import packageIcon from '../../../assets/package.png'
import listIcon from '../../../assets/list.png'
import addIcon from '../../../assets/add.png'
import filterIcon from '../../../assets/filter.png'
import sortIcon from '../../../assets/sort.png'
import directionIcon from '../../../assets/direction.png'
import dragIcon from '../../../assets/drag.png'
import moveIcon from '../../../assets/move.png'
import hideIcon from '../../../assets/expand_less.png'
import arrowbackIcon from '../../../assets/arrow_back.png'
import arrowforwardIcon from '../../../assets/arrow_forward.png'
import resetIcon from '../../../assets/restart.png'
import tilesIcon from '../../../assets/grid_view.png'
import cardsIcon from '../../../assets/splitscreen.png'
import settingsIcon from '../../../assets/settings.png'
import lockIcon from '../../../assets/lock.png'
import lockOpenIcon from '../../../assets/lock_open.png'

const smallerIconStyles = {
    height:'18px', 
    width:'18px'
}

const iconWrapperStyles = {
    height: '24px',
    opacity:0.7,
    padding:'4px',
}

const ItemlistToolbar = (props) => {


    const
        toggleOnDragRef = useRef(null),
        disabledDragRef = useRef(null),
        toggleOnMoveRef = useRef(null),
        disabledMoveRef = useRef(null),

        dragToggle = useToggleIcon({
            icon:dragIcon, 
            tooltip:'Toggle drag and drop',
            caption:'drag & drop',
            toggleOnRef:toggleOnDragRef,
            disabledRef:disabledDragRef, 
        }),

        moveToggle = useToggleIcon({
            icon:moveIcon, 
            tooltip:'Toggle drag & drop move (vs copy)',
            caption:'d&d move',
            toggleOnRef:toggleOnMoveRef,
            disabledRef:disabledMoveRef, 
        })

    const itemlistmenulist = <MenuList >
        <MenuItem icon = {<img src = {lockOpenIcon}/>}>Lock this itemlist</MenuItem>
        <MenuItem icon = {<img src = {settingsIcon} />}>Itemlist settings</MenuItem>
    </MenuList>

    const layoutmenulist = <MenuList >
        <MenuItem icon = {<img src = {listIcon}/>}>List</MenuItem>
        <MenuItem icon = {<img src = {cardsIcon}/>}>Cards</MenuItem>
        <MenuItem icon = {<img src = {tilesIcon}/>}>Tiles</MenuItem>
    </MenuList>

    const layoutIcon = listIcon

    // render
    return <Box data-type = 'document-toolbar' style = {itemlistToolbarStyles}>
    
        <MenuIcon icon = {packageIcon} caption = 'itemlist' tooltip = 'Workbox Resources' menulist = {itemlistmenulist} />
        <MenuIcon icon = {layoutIcon} caption = 'list' tooltip = 'switch formats' menulist = {layoutmenulist}/>
        <ToolbarVerticalDivider />
        <StandardIcon icon = {arrowbackIcon} caption = 'back' tooltip = 'back to previous list'/>
        <StandardIcon icon = {arrowforwardIcon} caption = 'forward' tooltip = 'forward to next list'/>
        <StandardIcon icon = {resetIcon} caption = 'reset' tooltip = 'reset to main itemlist list'/>
        <ToolbarVerticalDivider />
        <StandardIcon icon = {addIcon} caption = 'add' tooltip = 'add a workbox'/>
        <ToolbarVerticalDivider />
        { dragToggle }
        { moveToggle }
        <ToolbarVerticalDivider />
        <StandardIcon icon = {directionIcon} iconStyles = {{transform:'rotate(90deg)'}} caption = 'splay' tooltip = 'horizontal view'/>
        <LearnIcon tooltip = 'Explain this toolbar'/>
        {false && <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>}

    </Box>
}

        // <StandardIcon icon = {filterIcon} caption = 'filter' tooltip = 'filter items'/>
        // <StandardIcon icon = {sortIcon} caption = 'sort' tooltip = 'sort items'/>

export default ItemlistToolbar
