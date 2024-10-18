// WorkboxCreateStarter.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    create:
    - workbox
    - connectors
        - extras
        - types
    - document list (attachment or extension)
    - hydration

*/

import React, {useState, useRef, useMemo, lazy, CSSProperties} from 'react'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Flex,
    Input,
    Button
} from '@chakra-ui/react'

import { doc, collection } from 'firebase/firestore'

import {useFirestore} from '../../system/WorkboxesProvider'

import { updateDocumentSchema } from '../../system/utilities'

const SideIcon = lazy(() => import('../toolbars/controls/SideIcon'))

import { useSystemRecords } from '../../system/WorkboxesProvider'
import { useWorkboxHandler } from './Workbox'

const actionIconStyles = {
    height: '36px',
    width: '24px',
    marginLeft: '-28px',
    float:'left',
    position:'sticky',
    top:0,
} as CSSProperties

import removeIcon from '../../../assets/close.png'

const WorkboxCreateStarter = (props) => {

    const 
        db = useFirestore(),
        { doneCreate, cancelCreate, context } = props,
        [workboxHandler] = useWorkboxHandler(),
        createType = workboxHandler.session.document.createselection,
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
        [editData, setEditData] = useState({name:'untitled'}),
        invalidFieldFlags = invalidFieldFlagsRef.current

    const onCancel = () => {
        cancelCreate()
    }

    const prompt = useMemo(()=>{

        const type = (context == 'attachment')
            ? 'add-on'
            : 'extension'

        let prompt
        switch (createType) {
        case 'media':
            prompt = `Create Media ${type}`
            break
        case 'note':
            prompt = `Create Note ${type}`
            break
        case 'weblink':
            prompt = `Create Weblink ${type}`
        }

        return prompt

    },[context, createType])

    async function doCreate() {
        if (invalidFieldFlags.name) {
            alert('Please fix error before proceeding')
        }
        // const newWorkboxRef = doc(collection(db,'workboxes'))
        const parentRecord = workboxHandler.workboxRecord
        const workboxRecord = {
            document: {
                base: {
                    name: editData.name,
                }
            },
            profile: {
                type: {
                    name: createType
                },
                domain: parentRecord.profile.domain,
                owner: parentRecord.profile.owner,
                roles: parentRecord.profile.roles,
                workbox: {
                    name: editData.name,
                }
            }
        }

        const databaseRecord = updateDocumentSchema('workboxes', createType ,{}, workboxRecord)

        workboxHandler.saveNewWorkboxRecord(databaseRecord)

    }

    const onChangeFunctions = {
        name:(event) => {
            const 
                target = event.target as HTMLInputElement,
                value = target.value
            isInvalidTests.name(value)
            setEditData({name:value})
        },
    }
    const isInvalidTests = {
        name:(value) => {
            let isInvalid = false
            if ((value.length > maxNameLength) || (value.length < minNameLength)) {
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
    return <>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {removeIcon} response = {onCancel} tooltip = 'cancel the changes' caption = 'cancel'/>
        </Box>
        <Box data-type = 'namefield' margin = '3px' padding = '3px'>
            <FormControl style = {{minWidth:'300px', maxWidth:'500px', paddingBottom:'6px'}} 
                isInvalid = {invalidFieldFlags.name}>
                <Flex data-type = 'documenteditflex' align = 'center'>
                    <FormLabel data-type = 'subjectlabel' style = {{margin:0, marginRight:'3px'}} fontSize = 'sm'>Subject:</FormLabel>
                    <Input 
                        value = {editData.name} 
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
            <Button onClick = {doCreate} colorScheme = 'blue'>{prompt}</Button>
        </Box>
    </>
}

export default WorkboxCreateStarter