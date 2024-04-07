// StandardDocumentSection.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useEffect} from 'react'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Input,
} from '@chakra-ui/react'

const errorMessages = {
    name:'The name can only be up to 50 characters, and cannot be blank.'
}

const helperText = {
    name:'This name will appear to app users. Can be changed. Up to 50 characters.'
}

// TODO import maxNameLength and maxDescriptionLength from db system.settings.constraints
const StandardEdit = (props) => {
    
    const 
        {documentData, editDataRef, invalidDataRef} = props,
        { data } = documentData,
        { description, image, summary } = data,
        invalidFieldFlagsRef = useRef({name:false, description:false,image:false,summary:false}),
        [editValues, setEditValues] = useState({...documentData.data}),
        [editState,setEditState] = useState('ready')

    const invalidFieldFlags = invalidFieldFlagsRef.current
    editDataRef.current = editValues
    invalidDataRef.current = invalidFieldFlagsRef.current

    useEffect(()=>{

        isInvalidTests.name(editValues.name??'')
        isInvalidTests.description(editValues.description??'')
        isInvalidTests.image(editValues.image??'')
        isInvalidTests.summary(editValues.summary??'')
        setEditState('checking')

    },[])

    useEffect(()=>{

        if (editState != 'ready') setEditState('ready')

    },[editState])

    const onChangeFunctions = {
        name:(event) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            isInvalidTests.name(value)
            editValues.name = value
            setEditValues({...editValues})
        },
    }

    // see db at system.settings.constraints.maxNameLength (set to 50)
    const isInvalidTests = {
        // TODO check for blank, string
        name:(value) => {
            let isInvalid = false
            if (value.length > 50) {
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
        description:(value) => {
            let isInvalid = false

            return isInvalid
        },
        image:(value) => {
            let isInvalid = false

            return isInvalid
        },
        summary:(value) => {
            let isInvalid = false

            return isInvalid
        }
    }

    return <Box padding = '3px'>
        <Box>
            <FormControl isInvalid = {invalidFieldFlags.name}>
                <FormLabel fontSize = 'sm'>Workbox name:</FormLabel>
                <Input 
                    value = {editValues.name || ''} 
                    size = 'sm'
                    onChange = {onChangeFunctions.name}
                >
                </Input>
                <FormErrorMessage>
                    {errorMessages.name} Current length is {editValues.name?.length || '0 (blank)'}.
                </FormErrorMessage>
                <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
                    {helperText.name}
                </FormHelperText>
            </FormControl>
        </Box>
        <Box>
            Description: {description}
        </Box>
        <Box>
            Image: {image}
        </Box>
        <Box>
            Summary: {summary}
        </Box>
    </Box>
}

const StandardDisplay = (props) => {
    const {documentData} = props
    const { data } = documentData

    const { name, description, image, summary } = data

    return <Box>
        <Box>
            {name}
        </Box>
        <Box>
            {description}
        </Box>
        <Box>
            {image}
        </Box>
        <Box>
            {summary}
        </Box>
    </Box>
}

const StandardDocumentSection = (props) => {

    const 
        {profileData, documentData, documentState} = props,
        editDataRef = useRef(null),
        invalidDataRef = useRef(null)

    return <Box>
        {(documentState.mode == 'view')
            ? <StandardDisplay documentData = {documentData} />
            : <StandardEdit documentData = {documentData} editDataRef = {editDataRef} invalidDataRef = {invalidDataRef}/>
        }
    </Box>
}

export default StandardDocumentSection