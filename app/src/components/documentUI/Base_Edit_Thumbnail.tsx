// Base_Edit_Thumbnail.tsx
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


import Loading from '../../system/Loading'
const IntakeCroppedImage = lazy(() => import('./IntakeCroppedImage'))
const SideIcon = lazy(() => import('../toolbars/controls/SideIcon'))

import cancelEditIcon from '../../../assets/edit_off.png'

const actionBoxStyles = {
    height: '82px',
    width: '24px',
    marginLeft: '-28px',
    float:'left',
    position:'sticky',
    top:0,
} as CSSProperties

const basicAlternateActionIconStyles = {
    height: '36px',
    width: '24px',
    marginTop:'10px',
    float:'left',
    clear:'left',
} as CSSProperties

const Base_Edit_Thumbnail = (props) => {

    const
        { controlPack } = props

    const onSave = () => {
        controlPack.actionResponses.onSave(controlPack.blockIDMap.get('thumbnail'))
    }

    const onCancel = () => {
        controlPack.actionResponses.onCancel(controlPack.blockIDMap.get('thumbnail'))
    }

    return <>
        <Box style = {actionBoxStyles} data-type = 'action box'> 
            <Box style = {basicAlternateActionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {cancelEditIcon} response = {onCancel} tooltip = 'cancel the changes' caption = 'cancel'/>
            </Box>
        </Box>
        <Suspense fallback = {<Loading />}><IntakeCroppedImage onSave = {onSave} /></Suspense>
    </>

}

export default Base_Edit_Thumbnail