// Data_Note_Display.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useEffect, useState} from 'react'

import "@blocknote/core/fonts/inter.css";
import { 
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
        content = documentData.content?JSON.parse(documentData.content):[{}],
        editor = useCreateBlockNote(
            {
                initialContent:content, 
                trailingBlock:false,
            }),
        [isEmpty, setIsEmpty] = useState(false)

    useEffect(()=>{

        const
            content = documentData.content?JSON.parse(documentData.content):[{}],
            // content = (typeof(firstcontent) == 'string') ? JSON.parse(firstcontent):firstcontent,
            block = content[0]

        editor.replaceBlocks(editor.document,content)

        const isEmpty = (!documentData.content || 
            (content.length == 1 && (block.type === undefined || (block.type == 'paragraph' && block.content.length == 0))))

        setIsEmpty( isEmpty )

    },[documentData.content])

    return <div>
            <style>
                {
                    `.bn-editor {
                        padding-inline: 0;
                    }`
                }
            </style>
            {(!isEmpty) && <BlockNoteView editor = { editor } editable = { false } sideMenu = { false }/>}
        </div>

}

export default DataNoteDisplay
