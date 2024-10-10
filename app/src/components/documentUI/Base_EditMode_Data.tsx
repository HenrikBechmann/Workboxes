// Base_EditMode_Data.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties, Suspense, lazy} from 'react'

import { Box } from '@chakra-ui/react'

const BaseDataDisplayController = lazy(()=> import('./BaseDataDisplayController'))
const SideIcon = lazy(() => import('../toolbars/controls/SideIcon'))
const Loading = lazy(() => import('../../system/Loading'))

import editIcon from '../../../assets/edit.png'

const actionIconStyles = {
    height: '36px',
    width: '24px',
    marginLeft: '-28px',
    float:'left',
    position:'sticky',
    top:0,
} as CSSProperties

const Base_EditMode_Data = (props) => {

    const 
        { controlPack } = props

    const onEdit = () => {
        controlPack.actionResponses.onEdit(controlPack.blockIDMap.get('data'))
    }

    const isDisabled = !!controlPack.currentEditBlockID

    return <Box data-type = 'editmode-summary'  opacity = {isDisabled? 0.5:1} minHeight = '100px'>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {editIcon} isDisabled = {isDisabled} response = {onEdit} tooltip = 'edit the summary' caption = 'edit'/>
        </Box>
        <Suspense fallback = {<Loading />}><BaseDataDisplayController /></Suspense>
    </Box>
}

export default Base_EditMode_Data 