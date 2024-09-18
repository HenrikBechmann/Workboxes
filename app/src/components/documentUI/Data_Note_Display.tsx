// Data_Note_Display.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useEffect, CSSProperties} from 'react'

import { Block, filterSuggestionItems, PartialBlock } from "@blocknote/core"
import "@blocknote/core/fonts/inter.css";
import { 
    getDefaultReactSlashMenuItems,
    SuggestionMenuController,
    useCreateBlockNote
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

import { useWorkboxHandler } from '../workbox/Workbox'

const DataNoteDisplay = () => {

    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        { workboxRecord } = workboxHandler,
        documentData = workboxRecord.document.data,
        editor = useCreateBlockNote({initialContent:documentData.content || [{}] as PartialBlock[], trailingBlock:false})

    useEffect(()=>{

        editor.replaceBlocks(editor.document,documentData.content)

    },[documentData.content])

    return <div><BlockNoteView editor = { editor } editable = { false } sideMenu = { false }/></div>

}

export default DataNoteDisplay

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

