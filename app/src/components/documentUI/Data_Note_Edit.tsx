// Data_Note_Edit.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef} from 'react'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Flex,
    Input, Textarea,
    Divider,
} from '@chakra-ui/react'

import "@blocknote/core/fonts/inter.css";
import { 
    useCreateBlockNote
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

import {ref, uploadBytes, getDownloadURL} from 'firebase/storage'

import { useSystemRecords, useStorage } from '../../system/WorkboxesProvider'

import { useWorkboxHandler } from '../workbox/Workbox'

const DataNoteEdit = () => {

    const 
        storage = useStorage(),
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        editBaseRecord = workboxHandler.editRecord?.document.base || 
            workboxHandler.workboxRecord.document.base,
        { editRecord } = workboxHandler,
        { data:editRecordData, files:editorUploadedFiles } = (editRecord?.document || workboxHandler.workboxRecord.document),
        // editData = (editRecord?.document.base || workboxHandler.workboxRecord.document.base),
        content = editRecordData.content?JSON.parse(editRecordData.content):[{}],
        // content = (typeof(firstcontent) == 'string') ? JSON.parse(firstcontent):firstcontent,
        editor = useCreateBlockNote({initialContent:content, trailingBlock:false, uploadFile}),
        [blocks, setBlocks] = useState(content),
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

    workboxHandler.editoreditcontent = blocks // stringify to editRecord.document.data.content in DocumentBase.save()

    const changeData = () => {

        setBlocks(editor.document)

    }

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

    async function uploadFile(file:File) {

        if (editorUploadedFiles.includes(file.name)) { // avoid invalidation of the first
            alert(file.name + ' has already been uploaded') // placeholder
            return null
        }

        const fileRef = ref(storage, workboxHandler.editRecord.profile.workbox.id + '/document/' + file.name)
        try {
            await uploadBytes(fileRef, file)
        } catch (error) {
            console.log('An error occured uploading file.name', file.name)
            alert (error.message) // placeholder
            return null
        }

        editorUploadedFiles.push(file.name)

        const url = await getDownloadURL(fileRef)

        return url

    }

    return <Box>
        <Box data-type = 'namefield' margin = '3px' padding = '3px'>
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
        <BlockNoteView editor={editor} onChange= {changeData} />
        </Box>
}

export default DataNoteEdit

// <BlockNoteView editor={editor} onChange={() => {
//     setBlocks(editor.document);
//     }} slashMenu = {false}><SuggestionMenuController
//         triggerCharacter={"/"}
//         getItems={async (query) =>
//           filterSuggestionItems(customSlashMenuItemsRef.current, query)
//         }
//     />
// </BlockNoteView>

    // useEffect(()=>{

    //     editor.replaceBlocks(editor.document,summary)

    // },[summary])

    // editData.summary = blocks

        // const defaultSlashMenuItems = getDefaultReactSlashMenuItems(editor)
        // const customSlashMenuItems = defaultSlashMenuItems.filter((value) => {
        //     const key = value['key']
        //     // console.log('value.key, value', value['key'],value)
        //     // return true
        //     return !['image','video','audio' ].includes(key)
        // })
        // console.log('customSlashMenuItems',customSlashMenuItems)
         // customSlashMenuItemsRef.current = customSlashMenuItems

