// Toolbar_Resources.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'

import {
  Box, MenuList, MenuItem
} from '@chakra-ui/react'

import { useWorkboxHandler } from '../workbox/Workbox'

import MenuIcon from './controls/MenuIcon'
import StandardIcon from './controls/StandardIcon'
import { useToggleIcon } from './controls/ToggleIcon'
import LearnIcon from './controls/LearnIcon'
import ToolbarVerticalDivider from './controls/VerticalDivider'

import emptylistIcon from '../../../assets/empty_list.png'
import labelIcon from '../../../assets/label.png'
import listIcon from '../../../assets/list.png'
import drillIcon from '../../../assets/drill.png'
import addIcon from '../../../assets/add.png'
import editIcon from '../../../assets/edit.png'
import removeIcon from '../../../assets/close.png'
import selectIcon from '../../../assets/select.png'
import dragIcon from '../../../assets/drag.png'

import resourcesIcon from '../../../assets/resources.png'
import filterIcon from '../../../assets/filter.png'
import sortIcon from '../../../assets/sort.png'
import directionIcon from '../../../assets/direction.png'
import spreadIcon from '../../../assets/spread.png'
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

const resourcesToolbarStyles = {
    padding:'2px',
    minHeight:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'nowrap',
    whitespace:'nowrap',
    alignItems:'center',
    boxSizing:'border-box',
    backgroundColor:'lavender',
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

const ResourcesToolbar = (props) => {

    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        resourcesConfig = workboxHandler.settings.resources,
        modeSettings = workboxHandler.session.resources.modesettings,
        spreadSettingsRef = useRef({select: false, disabled: false}),
        onSpread = (value) => {
            spreadSettingsRef.current.select = !spreadSettingsRef.current.select
            dispatchWorkboxHandler()
        },
        onNormal = (value) => {
            modeSettings.view.select = true
            modeSettings.drill.select = false
            modeSettings.insert.select = false
            modeSettings.edit.select = false
            modeSettings.remove.select = false
            modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onDrill = (value) => {
            modeSettings.view.select = false
            modeSettings.drill.select = true
            modeSettings.insert.select = false
            modeSettings.edit.select = false
            modeSettings.remove.select = false
            modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onAdd = (value) => {
            modeSettings.view.select = false
            modeSettings.drill.select = false
            modeSettings.insert.select = true
            modeSettings.edit.select = false
            modeSettings.remove.select = false
            modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onEdit = (value) => {
            modeSettings.view.select = false
            modeSettings.drill.select = false
            modeSettings.insert.select = false
            modeSettings.edit.select = true
            modeSettings.remove.select = false
            modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onRemove = (value) => {
            modeSettings.view.select = false
            modeSettings.drill.select = false
            modeSettings.insert.select = false
            modeSettings.edit.select = false
            modeSettings.remove.select = true
            modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onDrag = (value) => {
            modeSettings.view.select = false
            modeSettings.drill.select = false
            modeSettings.insert.select = false
            modeSettings.edit.select = false
            modeSettings.remove.select = false
            modeSettings.drag.select = true
            dispatchWorkboxHandler()
        },

        // view, drill, add, edit, remove, select, drag
        normalToggle = useToggleIcon({
            icon:listIcon, 
            tooltip:'Normal browsing',
            caption:'view',
            settings:modeSettings.view,
            is_radio: true,
            callback: onNormal
        }),
        drillToggle = useToggleIcon({
            icon:drillIcon, 
            tooltip:'Drill down',
            caption:'drill',
            settings:modeSettings.drill,
            is_radio: true,
            callback: onDrill
        }),
        addToggle = useToggleIcon({
            icon:addIcon, 
            tooltip:'Insert a resource',
            caption:'insert',
            settings:modeSettings.insert,
            is_radio: true,
            callback: onAdd
        }),
        editToggle = useToggleIcon({
            icon:editIcon, 
            tooltip:'Edit a resource',
            caption:'edit',
            settings:modeSettings.edit,
            is_radio: true,
            callback: onEdit
        }),
        removeToggle = useToggleIcon({
            icon:removeIcon, 
            tooltip:'Remove a resource',
            caption:'remove',
            settings:modeSettings.remove,
            is_radio: true,
            callback: onRemove
        }),
        dragToggle = useToggleIcon({
            icon:dragIcon, 
            tooltip:'Toggle drag and drop',
            caption:'drag',
            settings:modeSettings.drag,
            is_radio: true,
            callback: onDrag
        }),
        spreadToggle = useToggleIcon({
            icon:spreadIcon,
            tooltip:'toggle vertical/horizontal',
            caption:'spread',
            settings:spreadSettingsRef.current,
            is_radio: false,
            callback: onSpread
        })

    // emptylistIcon is the wrong size for some reason; needs to be coerced
    const resourcesmenulist = <MenuList >
        <MenuItem icon = {<img src = {labelIcon}/>}>Workbox types to accept</MenuItem>
        <MenuItem icon = {<img src = {lockIcon}/>}>Lock this list</MenuItem>
        <MenuItem icon = {<img style = {{height:'24px', width:'24px'}} src = {emptylistIcon}/>}>Empty this list</MenuItem>
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
        // <StandardIcon icon = {resetIcon} caption = 'reset' tooltip = 'reset to main resources list'/>
        // <ToolbarVerticalDivider />
        // <StandardIcon icon = {addIcon} caption = 'add' tooltip = 'add a workbox'/>
        // { moveToggle }
        // { selectToggle }
    // render
    return <Box data-type = 'resource-toolbar' style = {resourcesToolbarStyles}>
    
        <MenuIcon icon = {resourcesIcon} caption = 'lists' tooltip = 'Workbox Resources' menulist = {resourcesmenulist} />
        <ToolbarVerticalDivider />
        <MenuIcon icon = {layoutIcon} caption = 'format' tooltip = 'switch formats' menulist = {layoutmenulist}/>
        <ToolbarVerticalDivider />
        { normalToggle }
        { addToggle }
        { editToggle }
        { removeToggle }
        <ToolbarVerticalDivider />
        { dragToggle }
        { spreadToggle }
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'Explain this toolbar'/>
        {false && <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>}

    </Box>
}
        // { drillToggle }
        // <StandardIcon icon = {directionIcon} iconStyles = {{transform:'rotate(90deg)'}} caption = 'spread' tooltip = 'horizontal view'/>
        // <StandardIcon icon = {filterIcon} caption = 'filter' tooltip = 'filter items'/>
        // <StandardIcon icon = {sortIcon} caption = 'sort' tooltip = 'sort items'/>

export default ResourcesToolbar
