// Toolbar_Document.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'

import {
  Box, MenuList, MenuItem, Icon, Select
} from '@chakra-ui/react'

import { useWorkboxHandler } from '../workbox/Workbox'

import { useToggleIcon } from './ToggleIcon'

import MenuIcon from './MenuIcon'
import StandardIcon from './StandardIcon'
import LearnIcon from './LearnIcon'
import ToolbarVerticalDivider from './VerticalDivider'

const documentToolbarStyles = {
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

const selectStyles = {
    display: 'inline-block',
    transition: 'width 0.5s',
    overflow: 'hidden',
}

import collectionIcon from '../../../assets/collection.png'
import reorderIcon from '../../../assets/reorder.png'
import sortIcon from '../../../assets/sort.png'
import databaseIcon from '../../../assets/database.png'

import labelIcon from '../../../assets/label.png'
import insertIcon from '../../../assets/add.png'
import editIcon from '../../../assets/edit.png'
import removeIcon from '../../../assets/close.png'
import dragIcon from '../../../assets/drag.png'
import articleIcon from '../../../assets/article.png'

import profileIcon from '../../../assets/profile.png'
import hideIcon from '../../../assets/expand_less.png'
import imageIcon from '../../../assets/image.png'
import noteIcon from '../../../assets/note.png'
import settingsIcon from '../../../assets/settings.png'
import lockOpenIcon from '../../../assets/lock_open.png'
import downloadIcon from '../../../assets/download.png'

const smallerIconStyles = {
    height:'18px', 
    width:'18px'
}

const iconWrapperStyles = {
    height: '24px',
    opacity:0.7,
    padding:'4px',
}

const DocumentToolbar = (props) => {

    const 
        { invalidStandardFieldFlagsRef } = props,
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        documentConfig = workboxHandler.settings.configuration.document,
        toggleOnDropRef = useRef(null),
        disabledDropRef = useRef(null),
        dropToggle = useToggleIcon({
            icon:dragIcon, 
            tooltip:'Re-sort, and import items from itemlist',
            caption:'import',
            toggleOnRef:toggleOnDropRef,
            disabledRef:disabledDropRef, 
        })

    const
        toggleOnNormalRef = useRef(true),
        disabledNormalRef = useRef(false),
        toggleOnInsertRef = useRef(false),
        disabledInsertRef = useRef(false),
        toggleOnEditRef = useRef(false),
        disabledEditRef = useRef(false),
        toggleOnRemoveRef = useRef(false),
        disabledRemoveRef = useRef(false),
        toggleOnDragRef = useRef(false),
        disabledDragRef = useRef(false),
        onNormal = (value) => {
            documentConfig.mode = 'normal'
            toggleOnNormalRef.current = true
            toggleOnInsertRef.current = false
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = false
            dispatchWorkboxHandler()
        },
        onAdd = (value) => {
            documentConfig.mode = 'insert'
            toggleOnNormalRef.current = false
            toggleOnInsertRef.current = true
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = false
            dispatchWorkboxHandler()
        },
        onEdit = (value) => {
            documentConfig.mode = 'edit'
            toggleOnNormalRef.current = false
            toggleOnInsertRef.current = false
            toggleOnEditRef.current = true
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = false
            dispatchWorkboxHandler()
        },
        onRemove = (value) => {
            documentConfig.mode = 'remove'
            toggleOnNormalRef.current = false
            toggleOnInsertRef.current = false
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = true
            toggleOnDragRef.current = false
            dispatchWorkboxHandler()
        },
        onDrag = (value) => {
            documentConfig.mode = 'drag'
            toggleOnNormalRef.current = false
            toggleOnInsertRef.current = false
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = true
            dispatchWorkboxHandler()
        },

        // normal, drill, insert, edit, remove, select, drag
        normalToggle = useToggleIcon({
            icon:articleIcon, 
            tooltip:'Normal viewing',
            caption:'normal',
            toggleOnRef:toggleOnNormalRef,
            disabledRef:disabledNormalRef,
            is_radio: true,
            callback: onNormal
        }),
        addToggle = useToggleIcon({
            icon:insertIcon, 
            tooltip:'Insert a section',
            caption:'insert',
            toggleOnRef:toggleOnInsertRef,
            disabledRef:disabledInsertRef, 
            is_radio: true,
            callback: onAdd
        }),
        editToggle = useToggleIcon({
            icon:editIcon, 
            tooltip:'Edit a section',
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
            tooltip:'re-order internal section items',
            caption:'re-order',
            toggleOnRef:toggleOnDragRef,
            disabledRef:disabledDragRef, 
            is_radio: true,
            callback: onDrag
        })

        // <MenuItem icon = {<img src = {settingsIcon} />}>Document settings</MenuItem>

    const documentmenulist = <MenuList >
        <MenuItem icon = {<img src = {labelIcon} />}>Show section tags</MenuItem>
        <MenuItem icon = {<img src = {lockOpenIcon} />}>Lock this document</MenuItem>
    </MenuList>

    // const insertmenulist = <MenuList >
    //     <MenuItem icon = {<img src = {noteIcon} />}>Blocknote</MenuItem>
    //     <MenuItem icon = {<img src = {imageIcon} />}>Image</MenuItem>
    // </MenuList>

    // const isInvalidStandardField = () => {
    //     let isInvalid = false
    //     const fieldFlags = invalidStandardFieldFlagsRef.current
    //     for (const property in fieldFlags) {
    //         if (fieldFlags[property]) isInvalid = true
    //     }
    //     return isInvalid
    // }

    // const toggleDocumentMode = () => {
    //     if (documentConfig.mode == 'edit') {
    //         if (isInvalidStandardField()) {
    //             alert('Please correct errors, or cancel edit, before proceeding.')
    //             return
    //         } else {
    //             documentConfig.mode = 'view'
    //         }
    //     } else {
    //         documentConfig.mode = 'edit'
    //     }
    //     dispatchWorkboxHandler()
    // }

    // const cancelEdit = () => {
    //     documentConfig.mode = 'view'
    //     dispatchWorkboxHandler()
    // }

    // render

    const selectwidth = (documentConfig.mode == 'insert')?'88px':0

    return <Box data-type = 'document-toolbar' style = {documentToolbarStyles}>

        <MenuIcon icon = {profileIcon} caption = 'document' tooltip = 'Workbox Document' menulist = {documentmenulist} />  
        <ToolbarVerticalDivider />
        <StandardIcon icon = {reorderIcon} caption = 'organize' tooltip = 'organize document sections'/>
        <ToolbarVerticalDivider />
        { normalToggle }
        { addToggle }
        <Box style = {selectStyles} width = {selectwidth} >
            <Select size = 'xs' marginLeft = '8px' width = '80px'>
                <option value="note">Note</option>
                <option value="callout">Callout</option>
            </Select>
        </Box>
        { editToggle }
        { removeToggle }
        { dragToggle }
        <ToolbarVerticalDivider />
        <StandardIcon icon = {downloadIcon} caption = 'pdf' tooltip = 'download a pdf of the document'/>
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'Explain this toolbar'/>
        {false && <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>}

    </Box>
}

export default DocumentToolbar
