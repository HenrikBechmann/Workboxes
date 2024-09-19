// Data_Note_Edit.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState} from 'react'

import "@blocknote/core/fonts/inter.css";
import { 
    useCreateBlockNote
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

import { useWorkboxHandler } from '../workbox/Workbox'

const DataNoteEdit = () => {

    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        { editRecord } = workboxHandler,
        recordData = editRecord.document.data,
        firstcontent = recordData.content?JSON.parse(recordData.content):[{}],
        content = (typeof(firstcontent) == 'string') ? JSON.parse(firstcontent):firstcontent,
        editor = useCreateBlockNote({initialContent:content, trailingBlock:false}),
        [blocks, setBlocks] = useState(content)

    // TODO this is inefficient!
    recordData.content = JSON.stringify(blocks)

    const changeData = () => {

        setBlocks(editor.document)

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

        // editor = useCreateBlockNote({initialContent:summary, trailingBlock:false})

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

