// Data_Note_Display.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useEffect, CSSProperties} from 'react'

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
        editor = useCreateBlockNote({initialContent:documentData.content || [{}], trailingBlock:false})

    useEffect(()=>{

        editor.replaceBlocks(editor.document,documentData.content)

    },[documentData.content])

    return <div><BlockNoteView editor = { editor } editable = { false } sideMenu = { false }/></div>

}

export default DataNoteDisplay
