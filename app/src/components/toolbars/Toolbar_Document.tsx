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

const selectCreateStyles = {
    display: 'inline-block',
    transition: 'width 0.5s',
    overflow: 'hidden',
} as CSSProperties

const selectAddStyles = {
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
import searchIcon from '../../../assets/search.png'

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
        createTypeRef = useRef(null),
        addTypeRef = useRef(null)

    useEffect(()=>{

        workboxHandler.session.document.createselection = createTypeRef.current.value
        workboxHandler.session.document.addselection = addTypeRef.current.value

    },[])

    const
        onNormal = (value) => {
            documentConfig.mode = 'view'
            modeSettings.view.select = true
            modeSettings.create.select = false
            modeSettings.add.select = false
            modeSettings.edit.select = false
            modeSettings.remove.select = false
            // modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onCreate = (value) => {
            documentConfig.mode = 'create'
            modeSettings.view.select = false
            modeSettings.create.select = true
            modeSettings.add.select = false
            modeSettings.edit.select = false
            modeSettings.remove.select = false
            // modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onAdd = (value) => {
            documentConfig.mode = 'add'
            modeSettings.view.select = false
            modeSettings.create.select = false
            modeSettings.add.select = true
            modeSettings.edit.select = false
            modeSettings.remove.select = false
            dispatchWorkboxHandler()
        },
        onEdit = (value) => {
            documentConfig.mode = 'edit'
            modeSettings.view.select = false
            modeSettings.create.select = false
            modeSettings.add.select = false
            modeSettings.edit.select = true
            modeSettings.remove.select = false
            // modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onRemove = (value) => {
            documentConfig.mode = 'remove'
            modeSettings.view.select = false
            modeSettings.create.select = false
            modeSettings.add.select = false
            modeSettings.edit.select = false
            modeSettings.remove.select = true
            // modeSettings.drag.select = false
            dispatchWorkboxHandler()
        },
        onDrag = (value) => {
            documentConfig.mode = 'drag'
            modeSettings.view.select = false
            modeSettings.create.select = false
            modeSettings.add.select = false
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
        createToggle = useToggleIcon({
            icon:insertIcon, 
            tooltip:'Create a section',
            caption:'create',
            settings:modeSettings.create,
            is_radio: true,
            callback: onCreate
        }),
        addToggle = useToggleIcon({
            icon:searchIcon, 
            tooltip:'Add a section',
            caption:'add',
            settings:modeSettings.add,
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
        onChangeCreateType = (event) => {
            workboxHandler.session.document.createselection = event.target.value
        },

        onChangeAddType = (event) => {
            workboxHandler.session.document.addselection = event.target.value
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

    const selectcreatewidth = (documentConfig.mode == 'create')?'88px':0

    const createStyles = useMemo(()=>{
        return Object.assign({}, selectCreateStyles, {width:selectcreatewidth})
    },[selectcreatewidth])

    const selectaddwidth = (documentConfig.mode == 'add')?'88px':0

    const addStyles = useMemo(()=>{
        return Object.assign({}, selectAddStyles, {width:selectaddwidth})
    },[selectaddwidth])

    // { dragToggle }

    return <Box data-type = 'document-toolbar' style = {documentToolbarStyles}>

        <MenuIcon icon = {profileIcon} caption = 'document' tooltip = 'Workbox Document' menulist = {documentmenulist} />  
        <ToolbarVerticalDivider />
        <StandardIcon icon = {reorderIcon} caption = 'organize' tooltip = 'organize document sections'/>
        <ToolbarVerticalDivider />
        { normalToggle }
        { createToggle }
        <Box style = {createStyles}>
            <Select ref = {createTypeRef} size = 'xs' marginLeft = '8px' width = '80px' onChange = {onChangeCreateType}>
                <option value="note">Note</option>
                <option value="weblink">Weblink</option>
                <option value="image">Media</option>
            </Select>
        </Box>
        { addToggle }
        <Box style = {addStyles}>
            <Select ref = {addTypeRef} size = 'xs' marginLeft = '8px' width = '80px' onChange = {onChangeAddType}>
                <option value="workbox">Workbox document</option>
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
