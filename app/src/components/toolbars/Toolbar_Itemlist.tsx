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

import listIcon from '../../../assets/list.png'
import drillIcon from '../../../assets/drill.png'
import addIcon from '../../../assets/add.png'
import editIcon from '../../../assets/edit.png'
import removeIcon from '../../../assets/close.png'
import selectIcon from '../../../assets/select.png'
import dragIcon from '../../../assets/drag.png'

import itemlistIcon from '../../../assets/package.png'
import filterIcon from '../../../assets/filter.png'
import sortIcon from '../../../assets/sort.png'
import directionIcon from '../../../assets/direction.png'
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
        [toolbarState, setToolbarState] = useState('ready'),
        toggleOnNormalRef = useRef(true),
        disabledNormalRef = useRef(false),
        toggleOnDrillRef = useRef(false),
        disabledDrillRef = useRef(false),
        toggleOnAddRef = useRef(false),
        disabledAddRef = useRef(false),
        toggleOnEditRef = useRef(false),
        disabledEditRef = useRef(false),
        toggleOnRemoveRef = useRef(false),
        disabledRemoveRef = useRef(false),
        toggleOnDragRef = useRef(false),
        disabledDragRef = useRef(false),
        // toggleOnMoveRef = useRef(null),
        // disabledMoveRef = useRef(null),
        onNormal = (value) => {
            toggleOnNormalRef.current = true
            toggleOnDrillRef.current = false
            toggleOnAddRef.current = false
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = false
            setToolbarState('radio')
        },
        onDrill = (value) => {
            toggleOnNormalRef.current = false
            toggleOnDrillRef.current = true
            toggleOnAddRef.current = false
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = false
            setToolbarState('radio')
        },
        onAdd = (value) => {
            toggleOnNormalRef.current = false
            toggleOnDrillRef.current = false
            toggleOnAddRef.current = true
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = false
            setToolbarState('radio')
        },
        onEdit = (value) => {
            toggleOnNormalRef.current = false
            toggleOnDrillRef.current = false
            toggleOnAddRef.current = false
            toggleOnEditRef.current = true
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = false
            setToolbarState('radio')
        },
        onRemove = (value) => {
            toggleOnNormalRef.current = false
            toggleOnDrillRef.current = false
            toggleOnAddRef.current = false
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = true
            toggleOnDragRef.current = false
            setToolbarState('radio')
        },
        onDrag = (value) => {
            toggleOnNormalRef.current = false
            toggleOnDrillRef.current = false
            toggleOnAddRef.current = false
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = true
            setToolbarState('radio')
        },

        // normal, drill, add, edit, remove, select, drag
        normalToggle = useToggleIcon({
            icon:listIcon, 
            tooltip:'Normal browsing',
            caption:'normal',
            toggleOnRef:toggleOnNormalRef,
            disabledRef:disabledNormalRef,
            is_radio: true,
            callback: onNormal
        }),
        drillToggle = useToggleIcon({
            icon:drillIcon, 
            tooltip:'Drill down',
            caption:'drill',
            toggleOnRef:toggleOnDrillRef,
            disabledRef:disabledDrillRef, 
            is_radio: true,
            callback: onDrill
        }),
        addToggle = useToggleIcon({
            icon:addIcon, 
            tooltip:'Add item',
            caption:'add',
            toggleOnRef:toggleOnAddRef,
            disabledRef:disabledAddRef, 
            is_radio: true,
            callback: onAdd
        }),
        editToggle = useToggleIcon({
            icon:editIcon, 
            tooltip:'Edit item',
            caption:'edit',
            toggleOnRef:toggleOnEditRef,
            disabledRef:disabledEditRef, 
            is_radio: true,
            callback: onEdit
        }),
        removeToggle = useToggleIcon({
            icon:removeIcon, 
            tooltip:'Remove item',
            caption:'remove',
            toggleOnRef:toggleOnRemoveRef,
            disabledRef:disabledRemoveRef, 
            is_radio: true,
            callback: onRemove
        }),
        dragToggle = useToggleIcon({
            icon:dragIcon, 
            tooltip:'Toggle drag and drop',
            caption:'drag',
            toggleOnRef:toggleOnDragRef,
            disabledRef:disabledDragRef, 
            is_radio: true,
            callback: onDrag
        })

    useEffect(()=>{

        if (toolbarState != 'ready') setToolbarState('ready')

    },[toolbarState])
        // selectToggle = useToggleIcon({
        //     icon:selectIcon, 
        //     tooltip:'select items',
        //     caption:'select',
        //     toggleOnRef:toggleOnDragRef,
        //     disabledRef:disabledDragRef, 
        // }),

        // moveToggle = useToggleIcon({
        //     icon:moveIcon, 
        //     tooltip:'Toggle drag & drop move (vs copy)',
        //     caption:'d&d move',
        //     toggleOnRef:toggleOnMoveRef,
        //     disabledRef:disabledMoveRef, 
        // })

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

        // <ToolbarVerticalDivider />
        // <StandardIcon icon = {arrowbackIcon} caption = 'back' tooltip = 'back to previous list'/>
        // <StandardIcon icon = {arrowforwardIcon} caption = 'forward' tooltip = 'forward to next list'/>
        // <StandardIcon icon = {resetIcon} caption = 'reset' tooltip = 'reset to main itemlist list'/>
        // <ToolbarVerticalDivider />
        // <StandardIcon icon = {addIcon} caption = 'add' tooltip = 'add a workbox'/>
        // { moveToggle }
        // { selectToggle }
    // render
    return <Box data-type = 'document-toolbar' style = {itemlistToolbarStyles}>
    
        <MenuIcon icon = {itemlistIcon} caption = 'item list' tooltip = 'Workbox Resources' menulist = {itemlistmenulist} />
        <MenuIcon icon = {layoutIcon} caption = 'format' tooltip = 'switch formats' menulist = {layoutmenulist}/>
        <ToolbarVerticalDivider />
        { normalToggle }
        { drillToggle }
        { addToggle }
        { editToggle }
        { removeToggle }
        { dragToggle }
        <ToolbarVerticalDivider />
        <StandardIcon icon = {directionIcon} iconStyles = {{transform:'rotate(90deg)'}} caption = 'spread' tooltip = 'horizontal view'/>
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'Explain this toolbar'/>
        {false && <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>}

    </Box>
}

        // <StandardIcon icon = {filterIcon} caption = 'filter' tooltip = 'filter items'/>
        // <StandardIcon icon = {sortIcon} caption = 'sort' tooltip = 'sort items'/>

export default ItemlistToolbar
