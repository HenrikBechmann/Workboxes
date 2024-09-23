// Data_Note_Edit.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState} from 'react'

import "@blocknote/core/fonts/inter.css";
import { 
    useCreateBlockNote
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

import {ref, uploadBytes, getDownloadURL} from 'firebase/storage'

import { useStorage } from '../../system/WorkboxesProvider'

import { useWorkboxHandler } from '../workbox/Workbox'

const DataNoteEdit = () => {

    const 
        storage = useStorage(),
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        { editRecord } = workboxHandler,
        { data:editRecordData, files:editRecordFiles } = editRecord.document,
        content = editRecordData.content?JSON.parse(editRecordData.content):[{}],
        // content = (typeof(firstcontent) == 'string') ? JSON.parse(firstcontent):firstcontent,
        editor = useCreateBlockNote({initialContent:content, trailingBlock:false, uploadFile}),
        [blocks, setBlocks] = useState(content)

    workboxHandler.editorcontent = blocks // stringify to editRecord.document.data.content in DocumentBase.save()

    const changeData = () => {

        setBlocks(editor.document)

    }

    async function uploadFile(file:File) {

        if (editRecordFiles.includes(file.name)) { // avoid invalidation of the first
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

        editRecordFiles.push(file.name)

        const url = await getDownloadURL(fileRef)

        return url

    }

    return <div><BlockNoteView editor={editor} onChange= {changeData} /></div>
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

