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
        editor = useCreateBlockNote({initialContent:documentData.content || [{}], trailingBlock:false}),
        [isEmpty, setIsEmpty] = useState(false)

    useEffect(()=>{

        const data = documentData.content || [{}],
            block = data[0]

        editor.replaceBlocks(editor.document,data)

        const isEmpty = (!documentData.content || 
            (data.length == 1 && block.type == 'paragraph' && block.content.length == 0))

        setIsEmpty( isEmpty )

    },[documentData.content])

    return <div>{(!isEmpty) && <BlockNoteView editor = { editor } editable = { false } sideMenu = { false }/>}</div>

}

export default DataNoteDisplay
