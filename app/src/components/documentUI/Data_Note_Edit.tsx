// Data_Note_Edit.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useRef, lazy} from 'react'

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

const SubjectFieldInput = lazy(()=> import('./SubjectFieldInput'))

const DataNoteEdit = () => {

    const 
        storage = useStorage(),
        [workboxHandler] = useWorkboxHandler(),
        editBaseRecord = workboxHandler.editRecord?.document.base || 
            workboxHandler.workboxRecord.document.base,
        { editRecord } = workboxHandler,
        { data:editRecordData, files:editorUploadedFiles } = (editRecord?.document || workboxHandler.workboxRecord.document),
        // editData = (editRecord?.document.base || workboxHandler.workboxRecord.document.base),
        content = editRecordData.content?JSON.parse(editRecordData.content):[{}],
        // content = (typeof(firstcontent) == 'string') ? JSON.parse(firstcontent):firstcontent,
        editor = useCreateBlockNote({initialContent:content, trailingBlock:false, uploadFile}),
        [blocks, setBlocks] = useState(content)

    workboxHandler.editoreditcontent = blocks // stringify to editRecord.document.data.content in DocumentBase.save()

    const changeData = () => {

        setBlocks(editor.document)

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
        <SubjectFieldInput editBaseRecord = {editBaseRecord} />
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

