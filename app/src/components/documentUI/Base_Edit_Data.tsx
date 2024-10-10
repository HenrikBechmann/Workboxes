// Base_Edit_Data.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useEffect, useLayoutEffect, CSSProperties, useCallback, useMemo, Suspense, lazy} from 'react'

import {ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Flex,
    Input, Textarea,
    Divider,
} from '@chakra-ui/react'


const Loading = lazy(() => import('../../system/Loading'))
const IntakeCroppedImage = lazy(() => import('./IntakeCroppedImage'))
const SideIcon = lazy(() => import('../toolbars/controls/SideIcon'))
const BaseDataEditController = lazy(()=> import('./BaseDataEditController'))

import cancelEditIcon from '../../../assets/edit_off.png'
import saveIcon from '../../../assets/check.png'

const actionIconStyles = {
    height: '36px',
    width: '24px',
    marginLeft: '-28px',
    float:'left',
    position:'sticky',
    top:0,
} as CSSProperties

const alternateActionIconStyles = {
    height: '36px',
    width: '24px',
    marginLeft: '-28px',
    marginTop:'10px',
    float:'left',
    clear:'left',
    position:'sticky',
    top:'36px',
} as CSSProperties

const basicAlternateActionIconStyles = {
    height: '36px',
    width: '24px',
    marginTop:'10px',
    float:'left',
    clear:'left',
} as CSSProperties

const Base_Edit_Data = (props) => {

    const
        { controlPack } = props

    const onSave = () => {
        controlPack.actionResponses.onSave(controlPack.blockIDMap.get('data'))
    }

    const onCancel = () => {
        controlPack.actionResponses.onCancel(controlPack.blockIDMap.get('data'))
    }

    return <Box data-type = 'active-edit-data' minHeight = '200px'>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {saveIcon} response = {onSave} tooltip = 'save the changes' caption = 'edit'/>
        </Box>
        <Box style = {alternateActionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {cancelEditIcon} response = {onCancel} tooltip = 'cancel the changes' caption = 'cancel'/>
        </Box>
        <Suspense fallback = {<Loading />}><BaseDataEditController /></Suspense>
    </Box>
}

export default Base_Edit_Data