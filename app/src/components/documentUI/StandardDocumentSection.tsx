// StandardDocumentSection.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useEffect} from 'react'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Flex,
    Input, Textarea, Heading
} from '@chakra-ui/react'

const errorMessages = {
    name:'The name can only be up to 50 characters, and cannot be blank.',
    description:'The description can only be up to 150 characters.'
}

const helperText = {
    name:'This name will appear to app users. Can be changed. Up to 50 characters.',
    description:'This description will appear to app users. Max 150 characters.',
}

// TODO import maxNameLength and maxDescriptionLength from db system.settings.constraints
const StandardEdit = (props) => {
    
    const 
        {documentData, editDataRef, invalidStandardFieldFlagsRef} = props,
        { data } = documentData,
        { description, image, summary } = data,
        [editValues, setEditValues] = useState({...documentData.data}),
        [editState,setEditState] = useState('ready'),
        invalidFieldFlags = invalidStandardFieldFlagsRef.current
        
    editDataRef.current = editValues

    useEffect(()=>{

        isInvalidTests.name(editValues.name ?? '')
        isInvalidTests.description(editValues.description ?? '')
        isInvalidTests.image(editValues.image ?? '')
        isInvalidTests.summary(editValues.summary ?? '')
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
        description:(event) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            isInvalidTests.description(value)
            editValues.description = value
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
            if (value.length > 150) {
                isInvalid = true
            }
            invalidFieldFlags.description = isInvalid
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
        <Heading size = 'sm'>Standard section</Heading>
        <details>
        <Flex data-type = 'documenteditflex' flexWrap = 'wrap'>
            <Box data-type = 'namefield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' maxWidth = '400px' isInvalid = {invalidFieldFlags.name}>
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
                        {helperText.name} Current length is {editValues.name?.length || '0 (blank)'}.
                    </FormHelperText>
                </FormControl>
            </Box>
            <Box data-type = 'descriptionfield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px' isInvalid = {invalidFieldFlags.description}>
                    <FormLabel fontSize = 'sm'>Workbox description:</FormLabel>
                    <Textarea 
                        value = {editValues.description || ''} 
                        size = 'sm'
                        onChange = {onChangeFunctions.description}
                    >
                    </Textarea>
                    <FormErrorMessage>
                        {errorMessages.description} Current length is {editValues.description?.length || '0 (blank)'}.
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
                        {helperText.description} Current length is {editValues.description?.length || '0 (blank)'}.
                    </FormHelperText>
                </FormControl>
            </Box>
            <Box minWidth = '300px' margin = '3px' padding = '3px' border = '1px dashed silver' >
                Thumbnail image: {image}
            </Box>
        </Flex>
        <Box>
            Summary: {summary}
        </Box>
    </details>
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
        {profileData, documentData, documentState, invalidStandardFieldFlagsRef} = props,
        editDataRef = useRef(null)

    return <Box>
        {(documentState.mode == 'view')
            ? <StandardDisplay documentData = {documentData} />
            : <StandardEdit 
                documentData = {documentData} 
                editDataRef = {editDataRef} 
                invalidStandardFieldFlagsRef = {invalidStandardFieldFlagsRef}/>
        }
    </Box>
}

export default StandardDocumentSection