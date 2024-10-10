// Base_EditMode_Identity.tsx
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

const Base_EditMode_Identity = (props) => {

    const { controlPack, name, description } = props

    const onEdit = () => {
        controlPack.actionResponses.onEdit(controlPack.blockIDMap.get('identity'))
    }

    const isDisabled = !!controlPack.currentEditBlockID

    return <Box data-type = 'editmode-identity'  opacity = {isDisabled? 0.5:1}>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {editIcon} isDisabled = {isDisabled} response = {onEdit} tooltip = 'edit the basics' caption = 'edit'/>
        </Box>
        <Box style = {{fontSize:'small'}} >
            Subject: <span style = {{fontWeight: 'bold'}}>{name}</span>
        </Box>
        <Box style = {{fontSize:'small'}}>
            Description: <span style = {{fontStyle: 'italic'}}>{description}</span>
        </Box>
    </Box>
    
}

export default Base_EditMode_Identity