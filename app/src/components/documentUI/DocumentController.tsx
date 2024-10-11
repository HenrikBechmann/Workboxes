// DocumentController.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useEffect, useLayoutEffect, CSSProperties, useCallback, useMemo, Suspense, lazy} from 'react'

import {ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Flex,
    Input, Textarea,
    Divider,
} from '@chakra-ui/react'

import { useSystemRecords, useStorage } from '../../system/WorkboxesProvider'
import { useWorkboxHandler } from '../workbox/Workbox'

const BaseDataDisplayController = lazy(()=> import('./BaseDataDisplayController'))
const SideIcon = lazy(() => import('../toolbars/controls/SideIcon'))
const Loading = lazy(() => import('../../system/Loading'))
const SectionDivider = lazy(()=> import('./SectionDivider'))
const Base_Edit_Identity = lazy(()=> import('./Base_Edit_Identity'))
const Base_Edit_Thumbnail = lazy(()=> import('./Base_Edit_Thumbnail'))
const Base_Edit_Data = lazy(()=> import('./Base_Edit_Data'))
const Base_EditMode_Identity = lazy(()=> import('./Base_EditMode_Identity'))
const Base_EditMode_Thumbnail = lazy(()=> import('./Base_EditMode_Thumbnail'))
const Base_EditMode_Data = lazy(()=> import('./Base_EditMode_Data'))

import insertIcon from '../../../assets/add.png'
import editIcon from '../../../assets/edit.png'
import saveIcon from '../../../assets/check.png'
import removeIcon from '../../../assets/close.png'
import dragIcon from '../../../assets/drag.png'
import cancelEditIcon from '../../../assets/edit_off.png'
import tapIcon from '../../../assets/tap.png'
import dropIcon from '../../../assets/drop.png'
import searchIcon from '../../../assets/search.png'

const baseStyles = {

    transition: 'margin-left 0.5s',
    borderLeft: '1px solid silver',
    maxWidth: '1056px'

}

const displayStyles = {
    padding: '3px',
}

const actionBoxStyles = {
    height: '82px',
    width: '24px',
    marginLeft: '-28px',
    float:'left',
    position:'sticky',
    top:0,
} as CSSProperties

const basicActionIconStyles = {
    height: '36px',
    width: '24px',
    float:'left',
} as CSSProperties

const basicAlternateActionIconStyles = {
    height: '36px',
    width: '24px',
    marginTop:'10px',
    float:'left',
    clear:'left',
} as CSSProperties

const actionIconStyles = {
    height: '36px',
    width: '24px',
    marginLeft: '-28px',
    float:'left',
    position:'sticky',
    top:0,
} as CSSProperties

const alternateActionIconStyles = {
    height: '36px',
    width: '24px',
    marginLeft: '-28px',
    marginTop:'10px',
    float:'left',
    clear:'left',
    position:'sticky',
    top:'36px',
} as CSSProperties

const animateTransition = 'all .5s'

// utility function
const animateModeChange = (element) => {

    const sectionHeight = element.firstChild.scrollHeight;

    element.style.opacity = 0 

    requestAnimationFrame(() => {

        element.style.transition = animateTransition

        // setTimeout(()=>{
            requestAnimationFrame(()=> {
                element.style.height = sectionHeight + 'px';
                element.style.opacity = 1
                // setTimeout(()=>{
                    requestAnimationFrame(()=> {
                        element.style.transition = ''
                        element.style.height = 'auto'
                    })
                // },600)
            })
        // },25)           

    });

  
}

// ---------------------------[ section view displays ]-------------------------------------------

const Base_Display_Identity = (props) => {

    const { name, description } = props

    return <>
        <Box fontWeight = 'bold'>
            {name}
        </Box>
        <Box fontStyle = 'italic'>
           {description}
        </Box>
    </>
    
}

const Base_Display_Thumbnail = (props) => {

    const { thumbnail } = props

    return <>{ thumbnail.source && <Box style = {{float:'left', margin:'3px 3px 3px 0', border:'3px ridge silver', borderRadius:'8px'}} >
        <img style = {{width: '30px', height: '30px', borderRadius:'5px'}} src = {thumbnail.source} />
    </Box>}</>
    
}

const Base_Display_Data = (props) => {

    return <Box style = {{clear:'left'}} >
        <BaseDataDisplayController />
    </Box>

}

// ------------------------[ section display controllers ]----------------------------------

const IdentityController = (props) => {

    const 
        { controlPack, name, description } = props,
        { mode } = controlPack,
        animationBoxRef = useRef(null),
        isInitializedRef = useRef(false),
        [newMode, setNewMode] = useState('mode'),
        activeEdit = controlPack.currentEditBlockID === controlPack.blockIDMap.get('identity'),
        [isActiveEdit, setIsActiveEdit] = useState(activeEdit),
        isDisabled = ((mode == 'edit') && controlPack.currentEditBlockID && !activeEdit)

    useLayoutEffect(()=>{

        if (!isInitializedRef.current) {
            return
        }

        const startingHeight = animationBoxRef.current.scrollHeight
        animationBoxRef.current.style.height = startingHeight + 'px'

        setIsActiveEdit(activeEdit)
        setNewMode(mode)

    },[mode, activeEdit])

    useEffect(()=>{

        if (!isInitializedRef.current) {
            isInitializedRef.current = true
            return
        }

        animateModeChange(animationBoxRef.current)

    },[newMode, isActiveEdit])

    return <Box ref = {animationBoxRef}><Box>
        {(newMode !='edit') && <Base_Display_Identity name = {name} description = {description} />}
        {(newMode == 'edit') && <>
            <SectionDivider isDisabled = {isDisabled} title = 'Workbox identity information'/>
            {isActiveEdit
                ? <Base_Edit_Identity name = {name} description = {description} controlPack = {controlPack} />
                : <Base_EditMode_Identity name = {name} description = {description} controlPack = {controlPack} />
            }
        </>}
    </Box></Box>
}

const ThumbnailController = (props) => {

    const 
        { controlPack, thumbnail } = props,
        {mode} = controlPack,
        animationBoxRef = useRef(null),
        isInitializedRef = useRef(false),
        [newMode, setNewMode] = useState(mode),
        activeEdit = controlPack.currentEditBlockID === controlPack.blockIDMap.get('thumbnail'),
        [isActiveEdit, setIsActiveEdit] = useState(activeEdit),
        isDisabled = ((mode == 'edit') && controlPack.currentEditBlockID && !activeEdit)

    useLayoutEffect(()=>{

        if (!isInitializedRef.current) {
            return
        }

        const startingHeight = animationBoxRef.current.scrollHeight
        animationBoxRef.current.style.height = startingHeight + 'px'

        setIsActiveEdit(activeEdit)
        setNewMode(mode)

    },[mode, activeEdit])

    useEffect(()=>{

        if (!isInitializedRef.current) {
            isInitializedRef.current = true
            return
        }

        animateModeChange(animationBoxRef.current)

    },[newMode, isActiveEdit])

    return <Box ref = {animationBoxRef} ><Box>
        {(newMode !='edit') && <Base_Display_Thumbnail thumbnail = {thumbnail} />}
        {(newMode =='edit') && <> 
            <SectionDivider isDisabled = {isDisabled} title = 'Iconic image (optional)'/>
            {isActiveEdit
                ? <Base_Edit_Thumbnail thumbnail = {thumbnail} controlPack = {controlPack}/>
                : <Base_EditMode_Thumbnail thumbnail = {thumbnail} controlPack = {controlPack}/>
            }
        </>}
    </Box></Box>
}

const DataController = (props) => {

    const 
        {controlPack} = props,
        { mode } = controlPack,
        animationBoxRef = useRef(null),
        isInitializedRef = useRef(false),
        [newMode, setNewMode] = useState(mode),
        activeEdit = controlPack.currentEditBlockID === controlPack.blockIDMap.get('data'),
        [isActiveEdit, setIsActiveEdit] = useState(activeEdit),
        isDisabled = ((mode == 'edit') && controlPack.currentEditBlockID && !activeEdit)

    useEffect(()=>{

        if (!isInitializedRef.current) {
            return
        }

        const startingHeight = animationBoxRef.current.scrollHeight
        animationBoxRef.current.style.height = startingHeight + 'px'

        setIsActiveEdit(activeEdit)
        setNewMode(mode)

    },[mode, activeEdit])

    useEffect(()=>{

        if (!isInitializedRef.current) {
            isInitializedRef.current = true
            return
        }

        animateModeChange(animationBoxRef.current)

    },[newMode, isActiveEdit])

    return <Box ref = {animationBoxRef} ><Box>
        {(newMode !='edit') && <Base_Display_Data />}
        {(newMode == 'edit') && <>
            <SectionDivider isDisabled = {isDisabled} title = 'Main document content'/>
            {isActiveEdit
                ? <Base_Edit_Data controlPack = {controlPack} />
                : <Base_EditMode_Data controlPack = {controlPack}/>
            }
        </>}
    </Box></Box>
}

const AttachmentsController = (props) => {

    const 
        { controlPack } = props,
        { mode } = controlPack,
        { onCreate } = controlPack.actionResponses,
        { onAdd } = controlPack.actionResponses,
        [workboxHandler] = useWorkboxHandler(),
        {attachments} = workboxHandler.workboxRecord.document.data,
        isDisabled = !!controlPack.currentEditBlockID,
        emptyList = attachments.list.length == 0,
        extraText = 
            mode == 'remove'
                ? ' - nothing to remove'
                : mode == 'edit'
                    ? ' - nothing to edit'
                    : null

    return <>
        {(mode !== 'view') && <><SectionDivider type = 'block' title = 'Base document add-on sections (also shown in workbox lists)'/>
            {((mode === 'create') && attachments.list.length == 0) && 
                <Box style = {actionIconStyles} data-type = 'actionbox'>
                    <SideIcon icon = {insertIcon} isDisabled = {isDisabled} response = {onCreate} tooltip = 'create an add-on' caption = 'create'/>
                </Box>
            }
            {((mode === 'add') && attachments.list.length == 0) && 
                <Box style = {actionIconStyles} data-type = 'actionbox'>
                    <SideIcon icon = {searchIcon} isDisabled = {isDisabled} response = {onAdd} tooltip = 'add an add-on' caption = 'add'/>
                </Box>
            }
            {emptyList && <Box fontStyle = 'italic' fontSize = 'sm' opacity = '0.5'>(no current add-on sections {extraText})</Box>}
        </>}
    </>

}

const ExtensionsController = (props) => {

    const 
        { controlPack } = props,
        { mode } = controlPack,
        { onCreate } = controlPack.actionResponses,
        { onAdd } = controlPack.actionResponses,
        [workboxHandler] = useWorkboxHandler(),
        {extensions} = workboxHandler.workboxRecord.document,
        isDisabled = !!controlPack.currentEditBlockID,
        emptyList = extensions.list.length == 0,
        extraText = 
            mode == 'remove'
                ? ' - nothing to remove'
                : mode == 'edit'
                    ? ' - nothing to edit'
                    : null

    return <>
        {(mode !== 'view') && <><SectionDivider type = 'block' title = 'Extra document sections (shown only with full workbox display)'/>
            {((mode === 'create') && extensions.list.length == 0) && 
                <Box style = {actionIconStyles} data-type = 'actionbox'>
                    <SideIcon icon = {insertIcon} isDisabled = {isDisabled} response = {onCreate} tooltip = 'create an extension' caption = 'insert'/>
                </Box>
            }
            {((mode === 'add') && extensions.list.length == 0) && 
                <Box style = {actionIconStyles} data-type = 'actionbox'>
                    <SideIcon icon = {searchIcon} isDisabled = {isDisabled} response = {onAdd} tooltip = 'add an extension' caption = 'add'/>
                </Box>
            }
            {emptyList && <Box fontStyle = 'italic' fontSize = 'sm' opacity = '0.5'>(no current extra sections {extraText})</Box>}
        </>}
    </>

}


// ----------------------[ document base controller ]-------------------------------
//directs to appropriate component

const DocumentController = (props) => {

    const 
        { documentBaseData, mode, sessionDocumentSectionID } = props,
        baseFields = documentBaseData.base,
        { name, description, image, todo } = baseFields,
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        {document: sessiondocument} = workboxHandler.session,
        blockIDMapRef = useRef(new Map([
            ['todo',sessionDocumentSectionID + '.base.todo'],
            ['identity',sessionDocumentSectionID + '.base.identity'],
            ['thumbnail',sessionDocumentSectionID + '.base.thumbnail'],
            ['data',sessionDocumentSectionID + '.base.data'],
        ]))

    let actionIcon, response, tooltip, canceltip

    const onCreate = (sessionBlockID) => {

        return sessiondocument.createblock(sessionBlockID)

    }

    const onAdd = (sessionBlockID) => {

        return sessiondocument.addblock(sessionBlockID)

    }

    const onEdit = (sessionBlockID) => {

        // console.log('DocBase.onEdit: sessionBlockID', sessionBlockID)

        return sessiondocument.editblock(sessionBlockID)

    }

    async function onSave (sessionBlockID) {

        if (workboxHandler.editoreditcontent) { // there was a blocknote edit
            let editorFiles = []
            const documentFiles = workboxHandler.editRecord.document.files
            workboxHandler.editRecord.document.data.content = 
                JSON.stringify(workboxHandler.editoreditcontent)
            editorFiles = workboxHandler.getEditorFiles(workboxHandler.editoreditcontent)
            await workboxHandler.reconcileUploadedFiles(documentFiles, editorFiles)
        }
        return sessiondocument.savechanges(sessionBlockID) // check for errors or other blocking conditions

    }

    async function onCancel(sessionBlockID) {

        if (workboxHandler.editoreditcontent) { // there was a blocknote edit; reconcile files
            let editorFiles = []
            const documentFiles = workboxHandler.editRecord.document.files
            if (workboxHandler.workboxRecord.document.data.content) {
                const editoreditcontent = JSON.parse(workboxHandler.workboxRecord.document.data.content)
                editorFiles = workboxHandler.getEditorFiles(editoreditcontent)
            }
            await workboxHandler.revertUploadedFiles(documentFiles, editorFiles)
        }
        sessiondocument.cancelchanges(sessionBlockID)
        return true
        
    }

    const actionResponses = {onCreate, onAdd, onEdit, onSave, onCancel}

    const controlPack = useMemo(() => {

        return {
            mode,
            actionResponses,
            blockIDMap:blockIDMapRef.current,
            currentEditBlockID: workboxHandler.session.document.changesessionid,
        }
    },[workboxHandler.session.document.changesessionid, mode])

    const identityController = <Box key = 'identity'>
            <IdentityController 
                controlPack = {controlPack}
                name = {name} 
                description = {description} 
            />
        </Box>

    const thumbnailController = <Box key = 'thumbnail'>
            <ThumbnailController 
                controlPack = {controlPack}
                thumbnail = { image }
            />
        </Box>

    const dataController = <Box data-type = 'datasectionwrapper' key = 'data'>
            <DataController 
                controlPack = {controlPack}
            />
        </Box>

    let basecontent
    if (mode === 'view') {
        basecontent = [image.source?thumbnailController:null, identityController, dataController]
    } else {
        basecontent = [identityController, thumbnailController, dataController]
    }

    return <Box data-type = 'documentbase' style = {baseStyles} marginLeft = {mode == 'view'?'0': '28px'}>
        
        {(mode !== 'view') && <SectionDivider type = 'block' title = 'Base document content (shown in workbox lists)'/>}
        <Box data-type = 'documentcontrolframe'>
        {basecontent}
        </Box>
        <AttachmentsController controlPack = {controlPack} />
        <ExtensionsController controlPack = {controlPack} />

    </Box>
}

export default DocumentController
