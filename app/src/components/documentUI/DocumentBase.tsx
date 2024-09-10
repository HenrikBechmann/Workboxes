// DocumentBase.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useEffect, CSSProperties} from 'react'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Flex,
    Input, Textarea, Heading
} from '@chakra-ui/react'

import { Block, filterSuggestionItems } from "@blocknote/core"
import "@blocknote/core/fonts/inter.css";
import { 
    getDefaultReactSlashMenuItems,
    SuggestionMenuController,
    useCreateBlockNote 
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

import {useDropzone} from 'react-dropzone'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { useSystemRecords } from '../../system/WorkboxesProvider'
import { useWorkboxHandler } from '../workbox/Workbox'

import SideIcon from '../toolbars/controls/SideIcon'

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

const alternateActionIconStyles = {
    height: '24px',
    width: '24px',
    marginLeft: '-28px',
    marginTop:'10px',
    float:'left',
    clear:'left',
} as CSSProperties

// TODO import maxNameLength and maxDescriptionLength from db system.settings.constraints
const BaseEdit = (props) => {
    
    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        editData = workboxHandler.editRecord.document.base,
        [editState,setEditState] = useState('setup'),

        systemRecords = useSystemRecords(),
        maxDescriptionLength = systemRecords.settings.constraints.input.descriptionLength_max,
        maxNameLength = systemRecords.settings.constraints.input.nameLength_max,
        minNameLength = systemRecords.settings.constraints.input.nameLength_min,
        errorMessages = {
            name:`The name can only be between ${minNameLength} and ${maxNameLength} characters, and cannot be blank.`,
            description:`The description can only be up to ${maxDescriptionLength} characters.`
        },
        helperText = {
            name:`This name will appear to app users. Can be changed. Up to ${maxNameLength} characters.`,
            description:`This description will appear to app users. Max ${maxDescriptionLength} characters.`,
        },
        invalidFieldFlagsRef = useRef({
            name:false,
            description:false,
            image:false,
            summary:false,
        }),
        invalidFieldFlags = invalidFieldFlagsRef.current,
        editor = useCreateBlockNote(),
        [blocks,setBlocks] = useState<Block[]>([]),
        customSlashMenuItemsRef = useRef([])

    // initialize editRecord and editData (editRecord subset)
    useEffect(()=>{

        const 
            editData = workboxHandler.editRecord.document.base

        isInvalidTests.name(editData.name ?? '')
        isInvalidTests.description(editData.description ?? '')
        isInvalidTests.image(editData.image ?? '')
        isInvalidTests.summary(editData.summary ?? '')

        setEditState('checking')

        const defaultSlashMenuItems = getDefaultReactSlashMenuItems(editor)
        const customSlashMenuItems = defaultSlashMenuItems.filter((value) => {
            const key = value['key']
            // console.log('value.key, value', value['key'],value)
            // return true
            return !['image','video','audio' ].includes(key)
        })
        // console.log('customSlashMenuItems',customSlashMenuItems)
         customSlashMenuItemsRef.current = customSlashMenuItems

    },[])

    useEffect(()=>{

        if (['checking','validating'].includes(editState)) setEditState('ready')

    },[editState])

    const onChangeFunctions = {
        name:(event) => {
            const 
                target = event.target as HTMLInputElement,
                value = target.value

            isInvalidTests.name(value)
            editData.name = value
            setEditState('validating')
        },
        description:(event) => {
            const
                target = event.target as HTMLInputElement,
                value = target.value
            isInvalidTests.description(value)
            editData.description = value
            setEditState('validating')
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
                <FormControl minWidth = '300px' maxWidth = '400px' isInvalid = {invalidFieldFlags.name}>
                    <FormLabel fontSize = 'sm'>Workbox name:</FormLabel>
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
            <Box minWidth = '300px' margin = '3px' padding = '3px' border = '1px dashed silver' >
                Thumbnail image:
            </Box>
        </Flex>
        <Box>
            Summary note:
            <Box>
                <BlockNoteView editor={editor} onChange={() => {
                    setBlocks(editor.document);
                    }} slashMenu = {false}><SuggestionMenuController
                        triggerCharacter={"/"}
                        getItems={async (query) =>
                          filterSuggestionItems(customSlashMenuItemsRef.current, query)
                        }
                    />
                </BlockNoteView>
            </Box>
            <div>Document JSON:</div>
            <div className={"item bordered"}>
                <pre>
                    <code>{JSON.stringify(blocks, null, 2)}</code>
                </pre>
            </div>
        </Box>
    </Box>
}

export const BaseDisplay = (props) => { // simplicity makes component available for document callout

    const {documentBaseData} = props

    const { name, description, image, summary } = documentBaseData

    return <Box data-type = 'displaybase' padding = '3px'>
        <Box>
            Workbox Name: {name}
        </Box>
        <Box>
           Description: {description}
        </Box>
        <Box>
           Thumbnail:
        </Box>
        <Box>
           Summary note: {summary}
        </Box>
    </Box>
}

// controller directs to appropriate component
const DocumentBase = (props) => {

    const 
        { documentBaseData, documentConfig, mode, sessionID } = props,
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        {document: sessiondocument} = workboxHandler.session,
        sessionIDRef = useRef(sessionID),
        [baseEditState, setBaseEditState] = useState(false)

    let actionIcon, response, tooltip, canceltip

    const onInsert = () => {

        sessiondocument.insertunit(sessionIDRef.current)

    }

    const onEdit = () => {

        if (sessiondocument.editunit(sessionIDRef.current)) {
            setBaseEditState(true)
        }

    }

    const onSave = () => {

        if (sessiondocument.savechanges(sessionIDRef.current)) {
            setBaseEditState(false)
        }

    }

    const onCancel = () => {

        sessiondocument.cancelchanges(sessionIDRef.current)
        setBaseEditState(false)
        
    }

    if (baseEditState) {
        actionIcon = saveIcon
        response = onSave
        tooltip = 'save section changes'
        canceltip = 'cancel section changes'
    } else {

        switch (mode) {
            case 'insert': {
                actionIcon = insertIcon
                response = onInsert
                tooltip = 'insert next section'
                break
            }
            case 'edit': {
                actionIcon = editIcon
                response = onEdit
                tooltip = 'edit this section'
                break
            }
        }

    }

    return <Box data-type = 'documentbase' style = {baseStyles} marginLeft = {mode == 'view'?'0': '24px'}>
        {(!['view', 'drag', 'remove'].includes(mode)) && <>
            <Box style = {actionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {actionIcon} response = {response} tooltip = {tooltip} />
            </Box>
            {baseEditState &&
                <Box style = {alternateActionIconStyles} data-type = 'cancelbox'>
                    <SideIcon icon = {cancelEditIcon} response = {onCancel} tooltip = {canceltip}></SideIcon>
                </Box>
            }</>
        }
        {baseEditState && <BaseEdit />}
        {!baseEditState && <BaseDisplay documentBaseData = {documentBaseData}/>}
    </Box>
}

export default DocumentBase
