// Toolbar_Document.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, useEffect, CSSProperties} from 'react'

import {
  Box, MenuList, MenuItem
} from '@chakra-ui/react'

import MenuIcon from './MenuIcon'
import StandardIcon from './StandardIcon'
import LearnIcon from './LearnIcon'

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

import profileIcon from '../../../assets/profile.png'
import editIcon from '../../../assets/edit.png'
import insertIcon from '../../../assets/input.png'
import formIcon from '../../../assets/table_rows.png'
import reorderIcon from '../../../assets/reorder.png'
import uploadIcon from '../../../assets/upload.png'
import viewIcon from '../../../assets/view.png'
import hideIcon from '../../../assets/expand_less.png'

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
        { documentState, setDocumentState } = props,
        [toolbarState, setToolbarState] = useState('ready')

    const documentmenulist = <MenuList >
        <MenuItem >Download document as pdf</MenuItem>
        <MenuItem >Document settings</MenuItem>
    </MenuList>

    const toggleDocumentMode = () => {
        if (documentState.mode == 'edit') {
            documentState.mode = 'view'
        } else {
            documentState.mode = 'edit'
        }
        setDocumentState({...documentState})
    }

    // render
    return <Box data-type = 'document-toolbar' style = {documentToolbarStyles}>

        <MenuIcon icon = {profileIcon} caption = 'document' tooltip = 'Workbox Document' menulist = {documentmenulist} />  
        {(documentState.mode == 'edit') && <>
                <StandardIcon icon = {viewIcon} response = {toggleDocumentMode} caption = 'view' tooltip = 'switch to view mode'/>
                <StandardIcon icon = {insertIcon} caption = 'add section' tooltip = 'insert a section'/>
                <StandardIcon icon = {reorderIcon} caption = 'reorder' tooltip = 'reorder document sections'/>
                <StandardIcon icon = {uploadIcon} caption = 'upload' tooltip = 'upload and save changes'/>
            </>
        }
        {(documentState.mode == 'view') && 
            <StandardIcon icon = {editIcon} response = {toggleDocumentMode} caption = 'edit' tooltip = 'edit this document'/>
        }        
        <LearnIcon tooltip = 'Explain this toolbar'/>
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>

    </Box>
}

        // <StandardIcon icon = {formIcon} caption = 'forms' tooltip = 'data input'/>

export default DocumentToolbar