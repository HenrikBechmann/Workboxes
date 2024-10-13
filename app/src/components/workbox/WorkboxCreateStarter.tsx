// WorkboxCreateStarter.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef} from 'react'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Flex,
    Input,
    Button
} from '@chakra-ui/react'

import { useSystemRecords } from '../../system/WorkboxesProvider'

const WorkboxCreateStarter = (props) => {

    const 
        { prompt, response } = props,
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
        [editData, setEditData] = useState({name:'unitled'}),
        invalidFieldFlags = invalidFieldFlagsRef.current

    const onChangeFunctions = {
        name:(event) => {
            const 
                target = event.target as HTMLInputElement,
                value = target.value

            setEditData({name:value})
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
            return isInvalid
        },
    }
    return <Box data-type = 'namefield' margin = '3px' padding = '3px'>
        <FormControl style = {{minWidth:'300px', maxWidth:'500px', paddingBottom:'6px'}} 
            isInvalid = {invalidFieldFlags.name}>
            <Flex data-type = 'documenteditflex' align = 'center'>
                <FormLabel data-type = 'subjectlabel' style = {{margin:0, marginRight:'3px'}} fontSize = 'sm'>Subject:</FormLabel>
                <Input 
                    value = {editData.name || 'untitled'} 
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
        <Button onClick = {response} colorScheme = 'blue'>{prompt}</Button>
    </Box>
}

export default WorkboxCreateStarter