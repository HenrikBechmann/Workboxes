// Base_Edit_Identity.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useEffect, CSSProperties, useCallback, useMemo, Suspense, lazy} from 'react'

import {ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Flex,
    Input, Textarea,
    Divider,
} from '@chakra-ui/react'

import { useSystemRecords, useStorage } from '../../system/WorkboxesProvider'
import { useWorkboxHandler } from '../workbox/Workbox'
const SideIcon = lazy(() => import('../toolbars/controls/SideIcon'))

import saveIcon from '../../../assets/check.png'
import cancelEditIcon from '../../../assets/edit_off.png'

const actionBoxStyles = {
    height: '82px',
    width: '24px',
    marginLeft: '-28px',
    float:'left',
    position:'sticky',
    top:0,
} as CSSProperties

const basicActionIconStyles = {
    height: '36px',
    width: '24px',
    float:'left',
} as CSSProperties

const basicAlternateActionIconStyles = {
    height: '36px',
    width: '24px',
    marginTop:'10px',
    float:'left',
    clear:'left',
} as CSSProperties

const Base_Edit_Identity = (props) => {

    const 
        [workboxHandler] = useWorkboxHandler(),
        editBaseRecord = workboxHandler.editRecord?.document.base || 
            workboxHandler.workboxRecord.document.base,
        { controlPack } = props,
        // [editState,setEditState] = useState('setup'),
        [editData, setEditData] = useState(editBaseRecord),
        systemRecords = useSystemRecords(),
        maxDescriptionLength = systemRecords.settings.constraints.input.descriptionLength_max,
        maxNameLength = systemRecords.settings.constraints.input.nameLength_max,
        minNameLength = systemRecords.settings.constraints.input.nameLength_min,
        errorMessages = {
            name:`The name can only be between ${minNameLength} and ${maxNameLength} characters, and cannot be blank.`,
            description:`The description can only be up to ${maxDescriptionLength} characters.`,
        },
        helperText = {
            name:`This name will appear to app users. Can be changed. Up to ${maxNameLength} characters.`,
            description:`This description will appear to app users. Max ${maxDescriptionLength} characters.`,
        },
        invalidFieldFlagsRef = useRef({
            name:false,
            description:false,
        }),
        invalidFieldFlags = invalidFieldFlagsRef.current

    // console.log('editState', editState)

    // initialize editRecord and editData (editRecord subset)
    useEffect(()=>{

        const 
            editData = workboxHandler.editRecord.document.base

        isInvalidTests.name(editData.name ?? '')
        isInvalidTests.description(editData.description ?? '')

        setEditData({...editData})

        // setEditState('checking')

    },[])

    const onChangeFunctions = {
        name:(event) => {
            const 
                target = event.target as HTMLInputElement,
                value = target.value

            if (!isInvalidTests.name(value)) {
                editBaseRecord.name = value
            }
            setEditData({name:value, description:editData.description})
        },
        description:(event) => {
            const
                target = event.target as HTMLInputElement,
                value = target.value

            console.log('description value',value)

            if (!isInvalidTests.description(value)) {
                editBaseRecord.description = value
            }
            setEditData({description:value, name:editData.name})
        },
    }

    const setChangeError = () => {

        let is_change_error = false
        for (const prop in invalidFieldFlags) {
            if (invalidFieldFlags[prop]) {
                is_change_error = true
                break
            }
        }

        workboxHandler.session.document.is_change_error = is_change_error

    }

    const isInvalidTests = {
        // TODO check for blank, string
        name:(value) => {
            let isInvalid = false
            if (value.length > maxNameLength || value.length < minNameLength) {
                isInvalid = true
            }
            if (!isInvalid) {
                if (!value) {// blank
                    isInvalid = true
                }
            }
            invalidFieldFlags.name = isInvalid
            setChangeError()
            return isInvalid
        },
        description:(value) => {
            let isInvalid = false
            if (value.length > maxDescriptionLength) {
                isInvalid = true
            }
            invalidFieldFlags.description = isInvalid
            setChangeError()
            return isInvalid
        },
    }

    const onSave = () => {
        Object.assign(editBaseRecord, editData)
        controlPack.actionResponses.onSave(controlPack.blockIDMap.get('identity'))
    }

    const onCancel = () => {
        controlPack.actionResponses.onCancel(controlPack.blockIDMap.get('identity'))
    }


    return <>
        <Box style = {actionBoxStyles} data-type = 'action box'> 
            <Box style = {basicActionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {saveIcon} response = {onSave} tooltip = 'save the changes' caption = 'save'/>
            </Box>
            <Box style = {basicAlternateActionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {cancelEditIcon} response = {onCancel} tooltip = 'cancel the changes' caption = 'cancel'/>
            </Box>
        </Box>
        <Flex data-type = 'documenteditflex' flexWrap = 'wrap'>
            <Box data-type = 'namefield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' maxWidth = '400px' isInvalid = {invalidFieldFlags.name}>
                    <FormLabel fontSize = 'sm'>Workbox subject:</FormLabel>
                    <Input 
                        value = {editData.name || ''} 
                        size = 'sm'
                        onChange = {onChangeFunctions.name}
                    >
                    </Input>
                    <FormErrorMessage>
                        {errorMessages.name} Current length is {editData.name?.length || '0 (blank)'}.
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
                        {helperText.name} Current length is {editData.name?.length || '0 (blank)'}.
                    </FormHelperText>
                </FormControl>
            </Box>
            <Box data-type = 'descriptionfield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px' isInvalid = {invalidFieldFlags.description}>
                    <FormLabel fontSize = 'sm'>Description:</FormLabel>
                    <Textarea 
                        rows = {2}
                        value = {editData.description || ''} 
                        size = 'sm'
                        onChange = {onChangeFunctions.description}
                    >
                    </Textarea>
                    <FormErrorMessage>
                        {errorMessages.description} Current length is {editData.description?.length || '0 (blank)'}.
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
                        {helperText.description} Current length is {editData.description?.length || '0 (blank)'}.
                    </FormHelperText>
                </FormControl>
            </Box>
        </Flex>
    </>
    
}

export default Base_Edit_Identity