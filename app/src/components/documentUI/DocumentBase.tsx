// DocumentBase.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useEffect, CSSProperties} from 'react'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Flex,
    Input, Textarea, Heading
} from '@chakra-ui/react'

// import "@blocknote/core/fonts/inter.css";
// import { useCreateBlockNote } from "@blocknote/react";
// import { BlockNoteView } from "@blocknote/mantine";
// import "@blocknote/mantine/style.css";

// import {useDropzone} from 'react-dropzone'
// import ReactCrop from 'react-image-crop'
// import 'react-image-crop/dist/ReactCrop.css'

import { useSystemRecords } from '../../system/WorkboxesProvider'
import { useWorkboxHandler } from '../workbox/Workbox'

import SideIcon from '../toolbars/SideIcon'

import insertIcon from '../../../assets/add.png'
import editIcon from '../../../assets/edit.png'
import saveIcon from '../../../assets/save.png'
import removeIcon from '../../../assets/close.png'
import dragIcon from '../../../assets/drag.png'
import cancelEditIcon from '../../../assets/edit_off.png'

const baseStyles = {

    transition: 'margin-left 0.5s',
    borderLeft: '1px solid silver',
    borderBottom: '1px solid silver',
}

const displayStyles = {
    padding: '3px',
}

const actionIconStyles = {
    height: '24px',
    width: '24px',
    marginLeft: '-28px',
    float:'left',
} as CSSProperties

// TODO import maxNameLength and maxDescriptionLength from db system.settings.constraints
const BaseEdit = (props) => {
    
    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        { workboxRecord } = workboxHandler,
        documentBaseData = workboxRecord.document.base,
        { description, image, summary } = documentBaseData,
        [editValues, setEditValues] = useState({...documentBaseData}),
        [editState,setEditState] = useState('ready'),
        // invalidFieldFlags = invalidStandardFieldFlagsRef.current,
        systemRecords = useSystemRecords(),
        maxDescriptionLength = systemRecords.settings.constraints.input.descriptionLength_max,
        maxNameLength = systemRecords.settings.constraints.input.nameLength_max,
        minNameLength = systemRecords.settings.constraints.input.nameLength_min,
        editDataRef = useRef(null)

    const errorMessages = {
        name:`The name can only be between ${minNameLength} and ${maxNameLength} characters, and cannot be blank.`,
        description:`The description can only be up to ${maxDescriptionLength} characters.`
    }

    const helperText = {
        name:`This name will appear to app users. Can be changed. Up to ${maxNameLength} characters.`,
        description:`This description will appear to app users. Max ${maxDescriptionLength} characters.`,
    }

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
            // invalidFieldFlags.name = isInvalid
            return isInvalid
        },
        description:(value) => {
            let isInvalid = false
            if (value.length > maxDescriptionLength) {
                isInvalid = true
            }
            // invalidFieldFlags.description = isInvalid
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
        <Heading as = 'h6' 
            fontSize = 'x-small' 
            color = 'gray' 
            borderTop = '1px solid silver'
            backgroundColor = '#F0F0F0'
        >--- Base section ---</Heading>
        <Flex data-type = 'documenteditflex' flexWrap = 'wrap'>
            <Box data-type = 'namefield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' maxWidth = '400px' isInvalid = {false/*invalidFieldFlags.name*/}>
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
                <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px' isInvalid = {false/*invalidFieldFlags.description*/}>
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
                Thumbnail image:
            </Box>
        </Flex>
        <Box>
            Summary:
        </Box>
    </Box>
}

export const BaseDisplay = (props) => { // simplicity makes component available for document callout

    const {documentBaseData} = props

    const { name, description, image, summary } = documentBaseData

    return <Box data-type = 'displaybase' padding = '3px'>
        <Box>
            Name: {name}
        </Box>
        <Box>
           Description: {description}
        </Box>
        <Box>
           Image:
        </Box>
        <Box>
           Summary: {summary}
        </Box>
    </Box>
}

// controller directs to appropriate component
const DocumentBase = (props) => {

    const 
        { documentBaseData, documentConfig, mode, sessionID } = props,
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        sessionIDRef = useRef(sessionID),
        [baseEditState, setBaseEditState] = useState(false)

    let actionIcon, response

    const onInsert = () => {

        workboxHandler.session.document.insertunit(sessionIDRef.current)

    }

    const onEdit = () => {

        if (workboxHandler.session.document.editunit(sessionIDRef.current)) {
            setBaseEditState(true)
        }

    }

    const onSave = () => {

        workboxHandler.session.document.savechanges(sessionIDRef.current)
        setBaseEditState(false)

    }

    const onCancel = () => {

        workboxHandler.session.document.cancelchanges(sessionIDRef.current)
        setBaseEditState(false)
        
    }

    if (baseEditState) {
        actionIcon = saveIcon
        response = onSave
    } else {

        switch (mode) {
            case 'insert': {
                actionIcon = insertIcon
                response = onInsert
                break
            }
            case 'edit': {
                actionIcon = editIcon
                response = onEdit
                break
            }
        }

    }

    return <Box data-type = 'documentbase' style = {baseStyles} marginLeft = {mode == 'normal'?'0': '24px'}>
        {(!['normal', 'drag', 'remove'].includes(mode)) && 
            <Box style = {actionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {actionIcon} response = {response} />
            </Box>
        }
        {baseEditState && <>
            <Box float = 'right'>
                <SideIcon icon = {cancelEditIcon} response = {onCancel}></SideIcon>
            </Box>
        <BaseEdit /></>}
        {!baseEditState && <BaseDisplay documentBaseData = {documentBaseData}/>}
    </Box>
}

export default DocumentBase
