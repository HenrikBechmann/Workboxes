// Toolbar_Document.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'

import {
  Box, MenuList, MenuItem, Icon
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

import addIcon from '../../../assets/add.png'
import editIcon from '../../../assets/edit.png'
import removeIcon from '../../../assets/close.png'
import selectIcon from '../../../assets/select.png'
import dragIcon from '../../../assets/drag.png'
import printIcon from '../../../assets/print.png'

import profileIcon from '../../../assets/profile.png'
import insertIcon from '../../../assets/input.png'
import formIcon from '../../../assets/table_rows.png'
import reorderIcon from '../../../assets/reorder.png'
import uploadIcon from '../../../assets/upload.png'
import viewIcon from '../../../assets/view.png'
import hideIcon from '../../../assets/expand_less.png'
import imageIcon from '../../../assets/image.png'
import noteIcon from '../../../assets/note.png'
import manifestIcon from '../../../assets/clipboard.png'
import linkIcon from '../../../assets/link.png'
import settingsIcon from '../../../assets/settings.png'
import lockIcon from '../../../assets/lock.png'
import lockOpenIcon from '../../../assets/lock_open.png'
import downloadIcon from '../../../assets/download.png'
import cancelEditIcon from '../../../assets/edit_off.png'

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
        [toolbarState, setToolbarState] = useState('ready'),
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
        toggleOnAddRef = useRef(false),
        disabledAddRef = useRef(false),
        toggleOnEditRef = useRef(false),
        disabledEditRef = useRef(false),
        toggleOnRemoveRef = useRef(false),
        disabledRemoveRef = useRef(false),
        toggleOnDragRef = useRef(false),
        disabledDragRef = useRef(false),
        onNormal = (value) => {
            toggleOnNormalRef.current = true
            toggleOnAddRef.current = false
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = false
            setToolbarState('radio')
        },
        onAdd = (value) => {
            toggleOnNormalRef.current = false
            toggleOnAddRef.current = true
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = false
            setToolbarState('radio')
        },
        onEdit = (value) => {
            toggleOnNormalRef.current = false
            toggleOnAddRef.current = false
            toggleOnEditRef.current = true
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = false
            setToolbarState('radio')
        },
        onRemove = (value) => {
            toggleOnNormalRef.current = false
            toggleOnAddRef.current = false
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = true
            toggleOnDragRef.current = false
            setToolbarState('radio')
        },
        onDrag = (value) => {
            toggleOnNormalRef.current = false
            toggleOnAddRef.current = false
            toggleOnEditRef.current = false
            toggleOnRemoveRef.current = false
            toggleOnDragRef.current = true
            setToolbarState('radio')
        },

        // normal, drill, add, edit, remove, select, drag
        normalToggle = useToggleIcon({
            icon:profileIcon, 
            tooltip:'Normal viewing',
            caption:'normal',
            toggleOnRef:toggleOnNormalRef,
            disabledRef:disabledNormalRef,
            is_radio: true,
            callback: onNormal
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
            tooltip:'sort sections by drag and drop',
            caption:'re-order',
            toggleOnRef:toggleOnDragRef,
            disabledRef:disabledDragRef, 
            is_radio: true,
            callback: onDrag
        })

    useEffect(()=>{

        if (toolbarState != 'ready') setToolbarState('ready')

    },[toolbarState])

    const documentmenulist = <MenuList >
        <MenuItem icon = {<img src = {downloadIcon} />}>Download document as pdf</MenuItem>
        <MenuItem icon = {<img src = {lockOpenIcon} />}>Lock this document</MenuItem>
        <MenuItem icon = {<img src = {settingsIcon} />}>Document settings</MenuItem>
    </MenuList>

    const insertmenulist = <MenuList >
        <MenuItem icon = {<img src = {noteIcon} />}>Blocknote</MenuItem>
        <MenuItem icon = {<img src = {imageIcon} />}>Image</MenuItem>
    </MenuList>

    const isInvalidStandardField = () => {
        let isInvalid = false
        const fieldFlags = invalidStandardFieldFlagsRef.current
        for (const property in fieldFlags) {
            if (fieldFlags[property]) isInvalid = true
        }
        return isInvalid
    }

    const toggleDocumentMode = () => {
        if (documentConfig.mode == 'edit') {
            if (isInvalidStandardField()) {
                alert('Please correct errors, or cancel edit, before proceeding.')
                return
            } else {
                documentConfig.mode = 'view'
            }
        } else {
            documentConfig.mode = 'edit'
        }
        dispatchWorkboxHandler()
        // setDocumentConfig({...documentConfig})
    }

    const cancelEdit = () => {
        documentConfig.mode = 'view'
        dispatchWorkboxHandler()
        // setDocumentConfig({...documentConfig})
    }

        // {(documentConfig.mode == 'edit') && 
        //     <>
        //         <StandardIcon icon = {viewIcon} response = {toggleDocumentMode} caption = 'view' tooltip = 'save, and switch to view mode'/>
        //         <MenuIcon icon = {insertIcon} caption = 'insert' tooltip = 'insert a section' menulist = {insertmenulist}/>
        //         {dropToggle}
        //         <StandardIcon icon = {cancelEditIcon} response = {cancelEdit} caption = 'cancel' tooltip = 'cancel edit'/>
        //     </>
        // }
        // {(documentConfig.mode == 'view') && 
        //     <StandardIcon icon = {editIcon} response = {toggleDocumentMode} caption = 'edit' tooltip = 'edit this document'/>
        // }
    // render
    return <Box data-type = 'document-toolbar' style = {documentToolbarStyles}>

        <MenuIcon icon = {profileIcon} caption = 'document' tooltip = 'Workbox Document' menulist = {documentmenulist} />  
        <ToolbarVerticalDivider />
        { normalToggle }
        { addToggle }
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
