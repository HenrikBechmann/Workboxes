// SubjectFieldInput.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef} from 'react'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Flex,
    Input, Textarea,
    Divider,
} from '@chakra-ui/react'

import { useSystemRecords } from '../../system/WorkboxesProvider'

import { useWorkboxHandler } from '../workbox/Workbox'

const SubjectFieldInput = (props) => {
    const 
        {editBaseRecord} = props,
        [workboxHandler] = useWorkboxHandler(),
        systemRecords = useSystemRecords(),
        maxNameLength = systemRecords.settings.constraints.input.nameLength_max,
        minNameLength = systemRecords.settings.constraints.input.nameLength_min,
        errorMessages = {
            name:`The name can only be between ${minNameLength} and ${maxNameLength} characters, and cannot be blank.`,
        },
        helperText = {
            name:`Subject is required. Betweeen ${minNameLength} and ${maxNameLength} characters.`,
        },
        invalidFieldFlagsRef = useRef({
            name:false,
        }),
        [editData, setEditData] = useState(editBaseRecord),
        invalidFieldFlags = invalidFieldFlagsRef.current

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
    return <Box data-type = 'namefield' margin = '3px' padding = '3px'>
    <FormControl style = {{minWidth:'300px', maxWidth:'500px', paddingBottom:'6px'}} 
        isInvalid = {invalidFieldFlags.name}>
        <Flex data-type = 'documenteditflex' align = 'center'>
            <FormLabel data-type = 'subjectlabel' style = {{margin:0, marginRight:'3px'}} fontSize = 'sm'>Subject:</FormLabel>
            <Input 
                value = {editData.name || ''} 
                size = 'sm'
                onChange = {onChangeFunctions.name}
            >
            </Input>
        </Flex>
        <FormErrorMessage mt = '0'>
            {errorMessages.name} Current length is {editData.name?.length || '0 (blank)'}.
        </FormErrorMessage>
        <FormHelperText mt = '0' fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
            {helperText.name} Current length is {editData.name?.length || '0 (blank)'}.
        </FormHelperText>
    </FormControl>
    </Box>
}

export default SubjectFieldInput