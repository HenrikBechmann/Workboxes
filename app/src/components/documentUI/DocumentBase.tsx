// DocumentBase.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useEffect, CSSProperties, useCallback, lazy} from 'react'

import {ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import {
    Box,
    FormControl, FormLabel, FormHelperText, FormErrorMessage,
    Flex, HStack,
    Input, Textarea, Heading,
    Divider,
} from '@chakra-ui/react'

// import {useDropzone} from 'react-dropzone'

import { useSystemRecords, useStorage } from '../../system/WorkboxesProvider'
import { useWorkboxHandler } from '../workbox/Workbox'

const BaseDataDisplayController = lazy(()=> import('./BaseDataDisplayController'))
const BaseDataEditController = lazy(()=> import('./BaseDataEditController'))
const IntakeCroppedImage = lazy(() => import('./IntakeCroppedImage'))

const SideIcon = lazy(() => import('../toolbars/controls/SideIcon'))

import insertIcon from '../../../assets/add.png'
import editIcon from '../../../assets/edit.png'
import saveIcon from '../../../assets/check.png'
import removeIcon from '../../../assets/close.png'
import dragIcon from '../../../assets/drag.png'
import cancelEditIcon from '../../../assets/edit_off.png'
import tapIcon from '../../../assets/tap.png'
import dropIcon from '../../../assets/drop.png'

const baseStyles = {

    transition: 'margin-left 0.5s',
    borderLeft: '1px solid silver',
    // borderBottom: '1px solid silver',
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
        storage = useStorage(),
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        editBaseRecord = workboxHandler.editRecord.document.base,
        [editState,setEditState] = useState('setup')

    // const
    //     onDrop = useCallback(async (acceptedFiles) => {
    //         console.log('acceptedFiles', acceptedFiles)
    //         const file = acceptedFiles[0]
    //         const fileRef = ref(storage, workboxHandler.editRecord.profile.workbox.id + '/thumbnail/' + file.name)
    //         try {
    //             await uploadBytes(fileRef, file)
    //         } catch (error) {
    //             console.log('An error occured uploading file.name', file.name)
    //             alert (error.message) // placeholder
    //             return null
    //         }
    //         console.log('file has been uploaded', file.name)

    //         const url = await getDownloadURL(fileRef)

    //         workboxHandler.editRecord.document.base.image.source = url

    //         setEditState('uploading')

    //     }, [])

    const
        // {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, multiple:false}),

        systemRecords = useSystemRecords(),
        maxDescriptionLength = systemRecords.settings.constraints.input.descriptionLength_max,
        maxNameLength = systemRecords.settings.constraints.input.nameLength_max,
        minNameLength = systemRecords.settings.constraints.input.nameLength_min,
        errorMessages = {
            name:`The name can only be between ${minNameLength} and ${maxNameLength} characters, and cannot be blank.`,
            description:`The description can only be up to ${maxDescriptionLength} characters.`,
            todo: 'There are no limits to content'
        },
        helperText = {
            name:`This name will appear to app users. Can be changed. Up to ${maxNameLength} characters.`,
            description:`This description will appear to app users. Max ${maxDescriptionLength} characters.`,
            todo:`The to do field holds notes for administrators.`,
            // thumbnail:`This image (sized to 90 x 90 px) is used as a visual representation in resource listings.`
        },
        invalidFieldFlagsRef = useRef({
            name:false,
            description:false,
            image:false,
            todo:false,
        }),
        invalidFieldFlags = invalidFieldFlagsRef.current,
        // editor = useCreateBlockNote({initialContent:editData.summary || [{}], trailingBlock:false}),
        // [blocks,setBlocks] = useState<Block[]>(editData.summary || [{}]),
        customSlashMenuItemsRef = useRef([])

    // initialize editRecord and editData (editRecord subset)
    useEffect(()=>{

        const 
            editData = workboxHandler.editRecord.document.base

        isInvalidTests.name(editData.name ?? '')
        isInvalidTests.description(editData.description ?? '')
        isInvalidTests.image(editData.image ?? '')
        isInvalidTests.todo(editData.todo)

        setEditState('checking')

    },[])

    useEffect(()=>{

        if (['checking','validating', 'uploading'].includes(editState)) setEditState('ready')

    },[editState])

    const onChangeFunctions = {
        name:(event) => {
            const 
                target = event.target as HTMLInputElement,
                value = target.value

            isInvalidTests.name(value)
            editBaseRecord.name = value
            setEditState('validating')
        },
        description:(event) => {
            const
                target = event.target as HTMLInputElement,
                value = target.value
            isInvalidTests.description(value)
            editBaseRecord.description = value
            setEditState('validating')
        },
        todo:(event) => {
            const
                target = event.target as HTMLInputElement,
                value = target.value
            isInvalidTests.todo(value)
            editBaseRecord.todo = value
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
        todo:(value) => {
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
        >--- Document basics ---</Heading>
        <details>
        <summary style = {{fontSize:'small'}}>To do notes</summary>
            <Box data-type = 'todofield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px' isInvalid = {invalidFieldFlags.todo}>
                    <Textarea 
                        value = {editBaseRecord.todo || ''} 
                        size = 'sm'
                        onChange = {onChangeFunctions.todo}
                    >
                    </Textarea>
                    <FormErrorMessage>
                        {errorMessages.todo} Current length is {editBaseRecord.todo?.length || '0 (blank)'}.
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
                        {helperText.todo} Current length is {editBaseRecord.todo?.length || '0 (blank)'}.
                    </FormHelperText>
                </FormControl>
            </Box>
        </details>
        <details open = {!(editBaseRecord.name && editBaseRecord.description && editBaseRecord.image.source)}>
        <summary style = {{fontSize:'small'}}>workbox basics</summary>
        <Flex data-type = 'documenteditflex' flexWrap = 'wrap'>
            <Box data-type = 'namefield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' maxWidth = '400px' isInvalid = {invalidFieldFlags.name}>
                    <FormLabel fontSize = 'sm'>Workbox name:</FormLabel>
                    <Input 
                        value = {editBaseRecord.name || ''} 
                        size = 'sm'
                        onChange = {onChangeFunctions.name}
                    >
                    </Input>
                    <FormErrorMessage>
                        {errorMessages.name} Current length is {editBaseRecord.name?.length || '0 (blank)'}.
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
                        {helperText.name} Current length is {editBaseRecord.name?.length || '0 (blank)'}.
                    </FormHelperText>
                </FormControl>
            </Box>
            <Box data-type = 'descriptionfield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px' isInvalid = {invalidFieldFlags.description}>
                    <FormLabel fontSize = 'sm'>Description:</FormLabel>
                    <Textarea 
                        rows = {2}
                        value = {editBaseRecord.description || ''} 
                        size = 'sm'
                        onChange = {onChangeFunctions.description}
                    >
                    </Textarea>
                    <FormErrorMessage>
                        {errorMessages.description} Current length is {editBaseRecord.description?.length || '0 (blank)'}.
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
                        {helperText.description} Current length is {editBaseRecord.description?.length || '0 (blank)'}.
                    </FormHelperText>
                </FormControl>
            </Box>
            <IntakeCroppedImage />
        </Flex>
        </details>
        <details open>
            <summary style = {{fontSize:'small'}}>document data</summary>
            <BaseDataEditController />
        </details>
    </Box>
}

// <Box minWidth = '300px' margin = '3px' padding = '3px' border = '1px dashed silver' >
//     Thumbnail image:
//     <div {...getRootProps()}>
//         <input {...getInputProps()} />
//     {
//         isDragActive ?
//             <p>Drop the files here ...</p> :
//             <p>Drag 'n' drop some files here, or click to select files</p>
//         }
//     </div>                
//     <Box fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
//     {helperText.thumbnail}
//     </Box>
//     <Box><img style = {{width: '90px', height: '90px'}} src = {workboxHandler.editRecord.document.base.image.source} /></Box>
// </Box>

// <Flex>
//     <Flex style = {{
//         alignItems:'center',
//         padding: '3px',
//         width: '130px',
//         border: '1px solid silver',
//         opacity: 0.5}}>
//         <span>upload</span> 
//         <img width = '18px' height = '18px' src = {tapIcon}/> 
//         <img  width = '18px' height = '18px' src = {dropIcon} /></Flex>
// </Flex>
// <Flex style = {{
//     alignItems:'center',
//     padding: '3px',
//     width: '130px',
//     border: '1px solid silver',
//     opacity: 0.5}}>
//     <span>embed</span> 
//     <img  width = '18px' height = '18px' src = {tapIcon}/> 
//     <img  width = '18px' height = '18px' src = {dropIcon} /></Flex>
// <Flex style = {{
//     alignItems:'center',
//     padding: '3px',
//     width: '130px',
//     border: '1px solid silver',
//     opacity: 0.5}}>
//     <span>resource</span> 
//     <img width = '18px' height = '18px' src = {dropIcon} /></Flex>

export const BaseDisplay = (props) => { // simplicity makes component available for document callout

    const 
        {documentBaseData} = props,
        baseFields = documentBaseData.base,
        baseData = documentBaseData.data,
        { name, description, image, todo } = baseFields

    console.log('documentBaseData',documentBaseData)

    return <Box data-type = 'displaybase' padding = '3px'>
        { todo && <Box borderBottom = '1px solid silver'>
           <details>
               <summary style = {{fontWeight:'bold',fontStyle:'italic',color:'red', fontSize:'0.8em'}}>To do</summary>
               <pre style = {{fontFamily:'inherit', fontSize:'0.8em'}} >{todo}</pre>
           </details>
        </Box>}
        {image.source && <Box style = {{float:'left', margin:'3px 3px 3px 0', border:'3px ridge silver', borderRadius:'8px'}} >
            <img style = {{width: '55px', height: '55px', borderRadius:'6px'}} src = {image.source} />
        </Box>}
        <Box fontWeight = 'bold'>
            {name}
        </Box>
        <Box fontStyle = 'italic'>
           {description}
        </Box>
        <Divider style = {{clear:'left', borderColor: 'gray'}} />
        <Box >
            <BaseDataDisplayController />
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

    async function onSave () {

        let editorFiles = []
        const documentFiles = workboxHandler.editRecord.document.files
        if (workboxHandler.editorcontent) {
            workboxHandler.editRecord.document.data.content = 
                JSON.stringify(workboxHandler.editorcontent)
            editorFiles = workboxHandler.getEditorFiles(workboxHandler.editorcontent)
        }
        await workboxHandler.reconcileUploadedFiles(documentFiles, editorFiles)
        if (sessiondocument.savechanges(sessionIDRef.current)) { // check for errors or other blocking conditions
            setBaseEditState(false)
        }

    }

    async function onCancel() {

        let editorFiles = []
        const documentFiles = workboxHandler.editRecord.document.files
        if (workboxHandler.workboxRecord.document.data.content) {
            const editorcontent = JSON.parse(workboxHandler.workboxRecord.document.data.content)
            editorFiles = workboxHandler.getEditorFiles(editorcontent)
            // console.log('documentFiles, editorcontent, editorFiles',documentFiles, editorcontent, editorFiles)
        }
        await workboxHandler.revertUploadedFiles(documentFiles, editorFiles)

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
