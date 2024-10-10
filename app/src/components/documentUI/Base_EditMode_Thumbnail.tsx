// Base_EditMode_Thumbnail.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties, lazy} from 'react'

import { Box } from '@chakra-ui/react'


const SideIcon = lazy(() => import('../toolbars/controls/SideIcon'))

import editIcon from '../../../assets/edit.png'

const actionIconStyles = {
    height: '36px',
    width: '24px',
    marginLeft: '-28px',
    float:'left',
    position:'sticky',
    top:0,
} as CSSProperties

const Base_EditMode_Thumbnail = (props) => {

    const 
        { controlPack, thumbnail } = props

    const onEdit = () => {
        controlPack.actionResponses.onEdit(controlPack.blockIDMap.get('thumbnail'))
    }

    const isDisabled = !!controlPack.currentEditBlockID

    return <Box data-type = 'editmode-thumbnail'  opacity = {isDisabled? 0.5:1}>
        <Box 
            style = {{borderBottom:'1px solid silver', display:'flex'}}
        >
            <Box style = {actionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {editIcon} isDisabled = {isDisabled} response = {onEdit} tooltip = 'edit the thumbnail' caption = 'edit'/>
            </Box>
            <Box style = {{margin:'3px', border:'3px ridge silver', borderRadius:'8px'}} >
                <img style = {{width: '55px', height: '55px', borderRadius:'6px'}} src = {thumbnail.source} />
            </Box>
        </Box>
    </Box>
    
}

export default Base_EditMode_Thumbnail
