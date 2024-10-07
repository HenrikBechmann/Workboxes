// Toolbar_Document.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, useMemo, CSSProperties, lazy} from 'react'

import {
  Box, MenuList, MenuItem, Icon, Select
} from '@chakra-ui/react'

import { useWorkboxHandler } from '../workbox/Workbox'

import { useToggleIcon } from './controls/ToggleIcon'

const MenuIcon = lazy(()=> import('./controls/MenuIcon'))
const StandardIcon = lazy(()=> import('./controls/StandardIcon'))
const LearnIcon = lazy(()=> import('./controls/LearnIcon'))
const ToolbarVerticalDivider = lazy(()=> import('./controls/VerticalDivider'))

const documentToolbarStyles = {
    padding:'2px',
    minHeight:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'nowrap',
    whitespace:'nowrap',
    alignItems:'center',
    boxSizing:'border-box',
    backgroundColor:'cornsilk',
    borderRadius:'8px 8px 0 0',
    // borderBottom:'1px solid silver',
} as CSSProperties

const selectStyles = {
    display: 'inline-block',
    transition: 'width 0.5s',
    overflow: 'hidden',
} as CSSProperties

import collectionIcon from '../../../assets/collection.png'
import reorderIcon from '../../../assets/reorder.png'
import sortIcon from '../../../assets/sort.png'
import databaseIcon from '../../../assets/database.png'

import hideLabelIcon from '../../../assets/label_off.png'
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
import lockClosedIcon from '../../../assets/lock.png'
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
        documentConfig = workboxHandler.settings.document,
        modeSettings = workboxHandler.session.document.modesettings,
        insertTypeRef = useRef(null)

    useEffect(()=>{

        workboxHandler.session.document.insertselection = insertTypeRef.current.value

    },[])

    const
        onNormal = (value) => {
            documentConfig.mode = 'view'
            modeSettings.view.select = true
            modeSettings.insert.select = false
            modeSettings.edit.select = false
            modeSettings.remove.select = false
            // modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onAdd = (value) => {
            documentConfig.mode = 'insert'
            modeSettings.view.select = false
            modeSettings.insert.select = true
            modeSettings.edit.select = false
            modeSettings.remove.select = false
            // modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onEdit = (value) => {
            documentConfig.mode = 'edit'
            modeSettings.view.select = false
            modeSettings.insert.select = false
            modeSettings.edit.select = true
            modeSettings.remove.select = false
            // modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onRemove = (value) => {
            documentConfig.mode = 'remove'
            modeSettings.view.select = false
            modeSettings.insert.select = false
            modeSettings.edit.select = false
            modeSettings.remove.select = true
            // modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onDrag = (value) => {
            documentConfig.mode = 'drag'
            modeSettings.view.select = false
            modeSettings.insert.select = false
            modeSettings.edit.select = false
            modeSettings.remove.select = false
            // modeSettings.drag.select = true
            dispatchWorkboxHandler()
        },

        // view, drill, insert, edit, remove, drag
        normalToggle = useToggleIcon({
            icon:articleIcon, 
            tooltip:'Normal viewing',
            caption:'view',
            settings:modeSettings.view,
            is_radio: true,
            callback: onNormal
        }),
        addToggle = useToggleIcon({
            icon:insertIcon, 
            tooltip:'Insert a section',
            caption:'add',
            settings:modeSettings.insert,
            is_radio: true,
            callback: onAdd
        }),
        editToggle = useToggleIcon({
            icon:editIcon, 
            tooltip:'Edit a section',
            caption:'edit',
            settings:modeSettings.edit,
            is_radio: true,
            callback: onEdit
        }),
        removeToggle = useToggleIcon({
            icon:removeIcon, 
            tooltip:'Remove a section',
            caption:'remove',
            settings:modeSettings.remove,
            is_radio: true,
            callback: onRemove
        }),
        // dragToggle = useToggleIcon({
        //     icon:dragIcon, 
        //     tooltip:'re-order internal section items',
        //     caption:'re-order',
        //     settings:modeSettings.drag,
        //     is_radio: true,
        //     callback: onDrag
        // }),
        onChangeInsertType = (event) => {
            workboxHandler.session.document.insertselection = event.target.value
        }

        // <MenuItem icon = {<img src = {settingsIcon} />}>Document settings</MenuItem>

    const documentmenulist = <MenuList >
        <MenuItem >Go to document extensions</MenuItem>
        <MenuItem icon = {<img style = {{width:'24px', height: '24px'}} src = {hideLabelIcon} />}>Hide section tags</MenuItem>
        <MenuItem icon = {<img src = {lockClosedIcon} />}>Lock this document</MenuItem>
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

    const insertStyles = useMemo(()=>{
        return Object.assign({}, selectStyles, {width:selectwidth})
    },[selectwidth])

    // { dragToggle }

    return <Box data-type = 'document-toolbar' style = {documentToolbarStyles}>

        <MenuIcon icon = {profileIcon} caption = 'document' tooltip = 'Workbox Document' menulist = {documentmenulist} />  
        <ToolbarVerticalDivider />
        <StandardIcon icon = {reorderIcon} caption = 'organize' tooltip = 'organize document sections'/>
        <ToolbarVerticalDivider />
        { normalToggle }
        { addToggle }
        <Box style = {insertStyles}>
            <Select ref = {insertTypeRef} size = 'xs' marginLeft = '8px' width = '80px' onChange = {onChangeInsertType}>
                <option value="note">Note</option>
                <option value="weblink">Weblink</option>
                <option value="image">Media</option>
                <option value="file">File</option>
                <option value="workbox">Document</option>
            </Select>
        </Box>
        { editToggle }
        { removeToggle }
        <ToolbarVerticalDivider />
        <StandardIcon icon = {downloadIcon} caption = 'pdf' tooltip = 'download a pdf of the document'/>
        <ToolbarVerticalDivider />
        <LearnIcon tooltip = 'Explain this toolbar'/>
        {false && <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>}
        
    </Box>
}

export default DocumentToolbar
