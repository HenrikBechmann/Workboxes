// DocumentBase.tsx
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

        setTimeout(()=>{
            requestAnimationFrame(()=> {
                element.style.height = sectionHeight + 'px';
                element.style.opacity = 1
            })
        },25)           

    });

    setTimeout(()=>{
        element.style.transition = ''
        element.style.height = 'auto'
    },600)
  
}

// utility components
const SectionDivider = (props) => {

    const { title, isDisabled } = props

    return <> 
    <Divider style = {
        {
            clear:'left', 
            borderColor: 'black', 
            borderWidth:'2px', 
            marginLeft:'-32px', 
            width:'calc(100% + 32px)'
        }
    } />
    <Box style = {
        {
            textAlign:'center', 
            backgroundColor:'silver', 
            fontSize:'small', 
            marginLeft:'-32px',
            width:'calc(100% + 32px)',
            opacity: isDisabled?.5:1,
        }
    } >{title}</Box>
    </>
}

const Loading = (props) => {
    return <Box minHeight = '100px'>Loading...</Box>
}

// --------------------------------------[ section edit displays ]-------------------------------------

// const Base_Edit_Todo = (props) => {

//     const { controlPack } = props

//     const 
//         [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
//         editBaseRecord = workboxHandler.editRecord?.document.base || 
//             workboxHandler.workboxRecord.document.base, // allow for animation delay
//         [todoText, setTodoText] = useState(editBaseRecord.todo), // allow for animation delay
//         helperText = {
//             todo:`The to do field holds notes for administrators.`,
//         }

//     // console.log('Base_Edit_Todo: editBaseRecord', editBaseRecord)

//     const onChangeFunctions = {
//         todo:(event) => {
//             const
//                 target = event.target as HTMLInputElement,
//                 value = target.value
//             setTodoText(value)
//         },
//     }

//     const onSave = () => {
//         editBaseRecord.todo = todoText
//         controlPack.actionResponses.onSave(controlPack.blockIDMap.get('todo'))
//     }

//     const onCancel = () => {
//         controlPack.actionResponses.onCancel(controlPack.blockIDMap.get('todo'))
//     }

//     return <Box data-type = 'active-edit-todo-list'>
//         <Box style = {actionBoxStyles} data-type = 'action box'> 
//             <Box style = {basicActionIconStyles} data-type = 'actionbox'>
//                 <SideIcon icon = {saveIcon} response = {onSave} tooltip = 'save the changes' caption = 'edit'/>
//             </Box>
//             <Box style = {basicAlternateActionIconStyles} data-type = 'actionbox'>
//                 <SideIcon icon = {cancelEditIcon} response = {onCancel} tooltip = 'cancel the changes' caption = 'cancel'/>
//             </Box>
//         </Box>
//         <Box style = {{fontSize:'small'}}>To do notes</Box>
//         <Box data-type = 'todofield' margin = '3px' padding = '3px' border = '1px dashed silver'>
//             <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px'>
//                 <Textarea 
//                     value = {todoText || ''} 
//                     size = 'sm'
//                     onChange = {onChangeFunctions.todo}
//                 />
//                 <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
//                     {helperText.todo} Current length is {todoText.length || '0 (blank)'}.
//                 </FormHelperText>
//             </FormControl>
//         </Box>
//     </Box>
// }

const Base_Edit_Identity = (props) => {

    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        editBaseRecord = workboxHandler.editRecord?.document.base || 
            workboxHandler.workboxRecord.document.base,
        { controlPack } = props,
        [editState,setEditState] = useState('setup'),
        [nameValue, setNameValue] = useState(editBaseRecord.name),
        [descriptionValue, setDescriptionValue] = useState(editBaseRecord.description),
        systemRecords = useSystemRecords(),
        maxDescriptionLength = systemRecords.settings.constraints.input.descriptionLength_max,
        maxNameLength = systemRecords.settings.constraints.input.nameLength_max,
        minNameLength = systemRecords.settings.constraints.input.nameLength_min,
        errorMessages = {
            name:`The name can only be between ${minNameLength} and ${maxNameLength} characters, and cannot be blank.`,
            description:`The description can only be up to ${maxDescriptionLength} characters.`,
        },
        helperText = {
            name:`This name will appear to app users. Can be changed. Up to ${maxNameLength} characters.`,
            description:`This description will appear to app users. Max ${maxDescriptionLength} characters.`,
        },
        invalidFieldFlagsRef = useRef({
            name:false,
            description:false,
        }),
        invalidFieldFlags = invalidFieldFlagsRef.current

    console.log('editState', editState)

    // initialize editRecord and editData (editRecord subset)
    useEffect(()=>{

        const 
            editData = workboxHandler.editRecord.document.base

        isInvalidTests.name(editData.name ?? '')
        isInvalidTests.description(editData.description ?? '')

        setEditState('checking')

    },[])

    useEffect(()=>{

        if (editState !== 'ready') setEditState('ready')

    },[editState])

    const onChangeFunctions = {
        name:(event) => {
            const 
                target = event.target as HTMLInputElement,
                value = target.value

            if (!isInvalidTests.name(value)) {
                editBaseRecord.name = value
            }
            setNameValue(value)
        },
        description:(event) => {
            const
                target = event.target as HTMLInputElement,
                value = target.value

            console.log('description value',value)

            if (!isInvalidTests.description(value)) {
                editBaseRecord.description = value
            }
            setDescriptionValue(value)
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
            console.log('description isInvalid', isInvalid)
            setChangeError()
            return isInvalid
        },
    }

    const onSave = () => {
        controlPack.actionResponses.onSave(controlPack.blockIDMap.get('identity'))
    }

    const onCancel = () => {
        controlPack.actionResponses.onCancel(controlPack.blockIDMap.get('identity'))
    }


    return <>
        <Box style = {actionBoxStyles} data-type = 'action box'> 
            <Box style = {basicActionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {saveIcon} response = {onSave} tooltip = 'save the changes' caption = 'edit'/>
            </Box>
            <Box style = {basicAlternateActionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {cancelEditIcon} response = {onCancel} tooltip = 'cancel the changes' caption = 'cancel'/>
            </Box>
        </Box>
        <Flex data-type = 'documenteditflex' flexWrap = 'wrap'>
            <Box data-type = 'namefield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' maxWidth = '400px' isInvalid = {invalidFieldFlags.name}>
                    <FormLabel fontSize = 'sm'>Workbox subject:</FormLabel>
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
        </Flex>
    </>
    
}

const Base_Edit_Thumbnail = (props) => {

    const
        { controlPack } = props

    const onSave = () => {
        controlPack.actionResponses.onSave(controlPack.blockIDMap.get('thumbnail'))
    }

    const onCancel = () => {
        controlPack.actionResponses.onCancel(controlPack.blockIDMap.get('thumbnail'))
    }

    return <>
        <Box style = {actionBoxStyles} data-type = 'action box'> 
            <Box style = {basicActionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {saveIcon} response = {onSave} tooltip = 'save the changes' caption = 'edit'/>
            </Box>
            <Box style = {basicAlternateActionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {cancelEditIcon} response = {onCancel} tooltip = 'cancel the changes' caption = 'cancel'/>
            </Box>
        </Box>
        <Suspense fallback = {<Loading />}><IntakeCroppedImage /></Suspense>
    </>

}
const Base_Edit_Data = (props) => {

    const
        { controlPack } = props

    const onSave = () => {
        controlPack.actionResponses.onSave(controlPack.blockIDMap.get('data'))
    }

    const onCancel = () => {
        controlPack.actionResponses.onCancel(controlPack.blockIDMap.get('data'))
    }

    return <Box data-type = 'active-edit-data' minHeight = '200px'>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {saveIcon} response = {onSave} tooltip = 'save the changes' caption = 'edit'/>
        </Box>
        <Box style = {alternateActionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {cancelEditIcon} response = {onCancel} tooltip = 'cancel the changes' caption = 'cancel'/>
        </Box>
        <Box style = {{fontSize:'small'}}>document data</Box>
        <Suspense fallback = {<Loading />}><BaseDataEditController /></Suspense>
    </Box>
}

// -----------------------------------[ section edit mode displays ]-------------------------------

// const Base_EditMode_Todo = (props) => {

//     const { controlPack, todo } = props

//     const onEdit = () => {
//         controlPack.actionResponses.onEdit(controlPack.blockIDMap.get('todo'))
//     }

//     const isDisabled = !!controlPack.currentEditBlockID

//     return <>
//         <Box data-type = 'editmode-todo-list' opacity = {isDisabled? 0.5:1} minHeight = '100px'>
//             <Box style = {actionIconStyles} data-type = 'actionbox'>
//                 <SideIcon icon = {editIcon} tooltip = 'edit the todo list' isDisabled = {isDisabled} response = {onEdit} caption = 'edit'/>
//             </Box>
//             <Box style = {{fontWeight:'bold',fontStyle:'italic',color:'red', fontSize:'0.8em'}}>To do</Box>
//             <Box borderBottom = '1px solid silver'>
//                    <pre style = {{fontFamily:'inherit', fontSize:'0.8em'}} >{todo}</pre>
//             </Box>
//         </Box>
//     </>
// }

const Base_EditMode_Identity = (props) => {

    const { controlPack, name, description } = props

    const onEdit = () => {
        controlPack.actionResponses.onEdit(controlPack.blockIDMap.get('identity'))
    }

    const isDisabled = !!controlPack.currentEditBlockID

    return <Box data-type = 'editmode-identity'  opacity = {isDisabled? 0.5:1}>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {editIcon} isDisabled = {isDisabled} response = {onEdit} tooltip = 'edit the basics' caption = 'edit'/>
        </Box>
        <Box fontWeight = 'bold'>
            {name}
        </Box>
        <Box fontStyle = 'italic'>
           {description}
        </Box>
    </Box>
    
}

const Base_EditMode_Thumbnail = (props) => {

    const 
        { controlPack, thumbnail } = props

    const onEdit = () => {
        controlPack.actionResponses.onEdit(controlPack.blockIDMap.get('thumbnail'))
    }

    const isDisabled = !!controlPack.currentEditBlockID

    return <Box data-type = 'editmode-thumbnail'  opacity = {isDisabled? 0.5:1}>
        <Box 
            style = {{borderBottom:'1px solid silver', display:'flex'}}
        >
            <Box style = {actionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {editIcon} isDisabled = {isDisabled} response = {onEdit} tooltip = 'edit the thumbnail' caption = 'edit'/>
            </Box>
            <Box style = {{margin:'3px', border:'3px ridge silver', borderRadius:'8px'}} >
                <img style = {{width: '55px', height: '55px', borderRadius:'6px'}} src = {thumbnail.source} />
            </Box>
        </Box>
    </Box>
    
}

const Base_EditMode_Data = (props) => {

    const 
        { controlPack } = props

    const onEdit = () => {
        controlPack.actionResponses.onEdit(controlPack.blockIDMap.get('data'))
    }

    const isDisabled = !!controlPack.currentEditBlockID

    return <Box data-type = 'editmode-summary'  opacity = {isDisabled? 0.5:1} minHeight = '100px'>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {editIcon} isDisabled = {isDisabled} response = {onEdit} tooltip = 'edit the summary' caption = 'edit'/>
        </Box>
        <Suspense fallback = {<Loading />}><BaseDataDisplayController /></Suspense>
    </Box>
}

// ---------------------------[ section view displays ]-------------------------------------------

// const Base_Display_Todo = (props) => {

//     const {todo} = props

//     return <>{ todo && <Box borderBottom = '1px solid silver'>
//        <details>
//            <summary style = {{fontWeight:'bold',fontStyle:'italic',color:'red', fontSize:'0.8em'}}>To do</summary>
//            <pre style = {{fontFamily:'inherit', fontSize:'0.8em'}} >{todo}</pre>
//        </details>
//     </Box>}</>

// }

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

// const TodoController = (props) => {

//     const 
//         { controlPack, todo } = props,
//         { mode } = controlPack,
//         animationBoxRef = useRef(null),
//         isInitializedRef = useRef(false),
//         [newMode, setNewMode] = useState('mode'),
//         activeEdit = controlPack.currentEditBlockID === controlPack.blockIDMap.get('todo'),
//         [isActiveEdit, setIsActiveEdit] = useState(activeEdit),
//         isDisabled = ((mode == 'edit') && controlPack.currentEditBlockID && !activeEdit)

//     useLayoutEffect(()=>{

//         if (!isInitializedRef.current) {
//             return
//         }

//         const startingHeight = animationBoxRef.current.scrollHeight
//         animationBoxRef.current.style.height = startingHeight + 'px'

//         setNewMode(mode)
//         setIsActiveEdit(activeEdit)

//     },[mode, activeEdit])


//     useEffect(()=>{

//         if (!isInitializedRef.current) {
//             isInitializedRef.current = true
//             return
//         }

//         animateModeChange(animationBoxRef.current)

//     },[newMode, isActiveEdit])

//     return <Box data-type = 'animationbox' ref = {animationBoxRef} ><Box>
//         {(newMode !='edit') && <Base_Display_Todo todo = {todo}/>}
//         {(newMode == 'edit') && <>
//             <SectionDivider isDisabled = {isDisabled} title = 'Document builder: to do notes' />
//             {(isActiveEdit
//                 ? <Base_Edit_Todo todo = {todo} controlPack = { controlPack }/>
//                 : <Base_EditMode_Todo todo = {todo} controlPack = { controlPack }/>)
//             }
//         </>}
//     </Box></Box>
// }

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

        setNewMode(mode)
        setIsActiveEdit(activeEdit)

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
            <SectionDivider isDisabled = {isDisabled} title = 'Document builder: identity section'/>
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
        [newMode, setNewMode] = useState('mode'),
        activeEdit = controlPack.currentEditBlockID === controlPack.blockIDMap.get('thumbnail'),
        [isActiveEdit, setIsActiveEdit] = useState(activeEdit),
        isDisabled = ((mode == 'edit') && controlPack.currentEditBlockID && !activeEdit)

    useLayoutEffect(()=>{

        if (!isInitializedRef.current) {
            return
        }

        const startingHeight = animationBoxRef.current.scrollHeight
        animationBoxRef.current.style.height = startingHeight + 'px'

        setNewMode(mode)
        setIsActiveEdit(activeEdit)

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
            <SectionDivider isDisabled = {isDisabled} title = 'Document builder: thumbnail'/>
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
        [newMode, setNewMode] = useState('mode'),
        activeEdit = controlPack.currentEditBlockID === controlPack.blockIDMap.get('data'),
        [isActiveEdit, setIsActiveEdit] = useState(activeEdit),
        isDisabled = ((mode == 'edit') && controlPack.currentEditBlockID && !activeEdit)

    useLayoutEffect(()=>{

        if (!isInitializedRef.current) {
            return
        }

        const startingHeight = animationBoxRef.current.scrollHeight
        animationBoxRef.current.style.height = startingHeight + 'px'

        setNewMode(mode)
        setIsActiveEdit(activeEdit)

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
            <SectionDivider isDisabled = {isDisabled} title = 'Document builder: main section'/>
            {isActiveEdit
                ? <Base_Edit_Data controlPack = {controlPack} />
                : <Base_EditMode_Data controlPack = {controlPack}/>
            }
        </>}
    </Box></Box>
}

// ----------------------[ document base controller ]-------------------------------
//directs to appropriate component

const DocBase = (props) => {

    const 
        { documentBaseData, mode, sessionDocumentSectionID } = props,
        baseFields = documentBaseData.base,
        { name, description, image, todo } = baseFields,
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        {document: sessiondocument} = workboxHandler.session,
        // sessionIDRef = useRef(sessionDocumentSectionID),
        // [baseEditMode, setBaseEditMode] = useState(false),
        blockIDMapRef = useRef(new Map([
            ['todo',sessionDocumentSectionID + '.base.todo'],
            ['identity',sessionDocumentSectionID + '.base.identity'],
            ['thumbnail',sessionDocumentSectionID + '.base.thumbnail'],
            ['data',sessionDocumentSectionID + '.base.data'],
        ]))

    let actionIcon, response, tooltip, canceltip

    const onInsert = (sessionBlockID) => {

        return sessiondocument.insertblock(sessionBlockID)

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

    const actionResponses = {onInsert, onEdit, onSave, onCancel}

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

    const dataController = <Box key = 'data'>
            <DataController 
                controlPack = {controlPack}
            />
        </Box>

    let content
    if (mode === 'view') {
        content = [image.source?thumbnailController:null, identityController, dataController]
    } else {
        content = [identityController, thumbnailController, dataController]
    }

    return <Box data-type = 'documentbase' style = {baseStyles} marginLeft = {mode == 'view'?'0': '28px'}>
        
        {content}
        
    </Box>
}

export default DocBase

// <Box>
//     <TodoController 
//         controlPack = {controlPack}
//         todo = { todo } 
//     />
// </Box>
