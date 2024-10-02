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

}

const displayStyles = {
    padding: '3px',
}

const actionIconStyles = {
    height: '36px',
    width: '24px',
    marginLeft: '-28px',
    float:'left',
    position:'sticky',
    top:0,
} as CSSProperties

const alternateActionIconStyles = {
    height: '24px',
    width: '24px',
    marginLeft: '-28px',
    marginTop:'10px',
    float:'left',
    clear:'left',
    position:'sticky',
    top:'26px',
} as CSSProperties

// edit

const Base_Edit_Todo = (props) => {

    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        editBaseRecord = workboxHandler.editRecord.document.base,
        helperText = {
            todo:`The to do field holds notes for administrators.`,
            // thumbnail:`This image (sized to 90 x 90 px) is used as a visual representation in resource listings.`
        }

    const onChangeFunctions = {
        todo:(event) => {
            const
                target = event.target as HTMLInputElement,
                value = target.value
            editBaseRecord.todo = value
        },
    }

    return <Box data-type = 'active-edit-todo-list'>
        <Box style = {{fontSize:'small'}}>To do notes</Box>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {saveIcon} tooltip = 'save the changes' caption = 'edit'/>
        </Box>
        <Box style = {alternateActionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {editIcon} tooltip = 'cancel the changes' caption = 'cancel'/>
        </Box>
        <Box data-type = 'todofield' margin = '3px' padding = '3px' border = '1px dashed silver'>
            <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px'>
                <Textarea 
                    value = {editBaseRecord.todo || ''} 
                    size = 'sm'
                    onChange = {onChangeFunctions.todo}
                >
                </Textarea>
                <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
                    {helperText.todo} Current length is {editBaseRecord.todo?.length || '0 (blank)'}.
                </FormHelperText>
            </FormControl>
        </Box>
    </Box>

}

const Base_Edit_Identity = (props) => {

    const 
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        editBaseRecord = workboxHandler.editRecord.document.base,
        [editState,setEditState] = useState('setup'),
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

    // initialize editRecord and editData (editRecord subset)
    useEffect(()=>{

        const 
            editData = workboxHandler.editRecord.document.base

        isInvalidTests.name(editData.name ?? '')
        isInvalidTests.description(editData.description ?? '')

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
    }

    return <>
        <Box style = {{fontSize:'small'}}>workbox basics</Box>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {saveIcon} tooltip = 'save the changes' caption = 'edit'/>
        </Box>
        <Box style = {alternateActionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {editIcon} tooltip = 'cancel changes' caption = 'cancel'/>
        </Box>
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
        </Flex>
    </>
    
}

const Base_Edit_Thumbnail = (props) => {

    return <>
        <Box style = {alternateActionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {editIcon} tooltip = 'cancel the changes' caption = 'cancel'/>
        </Box>
        <IntakeCroppedImage />
    </>

}
const Base_Edit_Data = (props) => {

    return <Box data-type = 'active-edit-data'>
        <Box style = {{fontSize:'small'}}>document data</Box>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {saveIcon} tooltip = 'save the changes' caption = 'edit'/>
        </Box>
        <Box style = {alternateActionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {editIcon} tooltip = 'cancel the changes' caption = 'cancel'/>
        </Box>
        <BaseDataEditController />
    </Box>

}

// edit mode

const Base_EditMode_Todo = (props) => {

    const { controlPack, todo } = props

    return <Box data-type = 'editmode-todo-list'>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {editIcon} tooltip = 'edit the todo list' caption = 'edit'/>
        </Box>
        <Box style = {{fontWeight:'bold',fontStyle:'italic',color:'red', fontSize:'0.8em'}}>To do</Box>
        <Box borderBottom = '1px solid silver'>
               <pre style = {{fontFamily:'inherit', fontSize:'0.8em'}} >{todo}</pre>
        </Box>
    </Box>

}

const Base_EditMode_Identity = (props) => {

    const { controlPack, name, description } = props

    return <Box data-type = 'editmode-identity'>
        <Box style = {actionIconStyles} data-type = 'actionbox'>
            <SideIcon icon = {editIcon} tooltip = 'edit the basics' caption = 'edit'/>
        </Box>
        <Box fontWeight = 'bold' style = {{clear:'left'}}>
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

    return <Box data-type = 'editmode-thumbnail'>
        <Box 
            style = {{borderBottom:'1px solid silver', display:'flex'}}
        >
            <Box style = {actionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {editIcon} tooltip = 'edit the thumbnail' caption = 'edit'/>
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

    return <>
        <Divider style = {{clear:'left', borderColor: 'gray'}} />
        <Box data-type = 'editmode-summary'>
            <Box style = {actionIconStyles} data-type = 'actionbox'>
                <SideIcon icon = {editIcon} tooltip = 'edit the summary' caption = 'edit'/>
            </Box>
            <BaseDataDisplayController />
        </Box>
    </>
}

// display

const Base_Display_Todo = (props) => {

    const {todo} = props

    return <>{ todo && <Box borderBottom = '1px solid silver'>
       <details>
           <summary style = {{fontWeight:'bold',fontStyle:'italic',color:'red', fontSize:'0.8em'}}>To do</summary>
           <pre style = {{fontFamily:'inherit', fontSize:'0.8em'}} >{todo}</pre>
       </details>
    </Box>}</>

}

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
        <img style = {{width: '55px', height: '55px', borderRadius:'6px'}} src = {thumbnail.source} />
    </Box>}</>
    
}
const Base_Display_Data = (props) => {

    return  <>
        <Divider style = {{clear:'left', borderColor: 'gray'}} />
        <Box >
            <BaseDataDisplayController />
        </Box>
    </>

}

const TodoController = (props) => {

    const 
        { controlPack, todo } = props,
        { mode } = controlPack

    return <Box>
        {(mode !='edit') 
            ? <Base_Display_Todo todo = {todo}/>
            : <Base_EditMode_Todo todo = {todo} controlPack = { controlPack }/>
        }
    </Box>
}

const IdentityController = (props) => {

    const 
        { controlPack, name, description } = props,
        { mode } = controlPack

    return <Box>
        {(mode !='edit')
            ? <Base_Display_Identity name = {name} description = {description} />
            : <Base_EditMode_Identity name = {name} description = {description} controlPack = {controlPack} />
        }
    </Box>
}

const ThumbnailController = (props) => {

    const 
        { controlPack, thumbnail } = props,
        {mode} = controlPack

    return <Box>
        {(mode !='edit')
            ? <Base_Display_Thumbnail thumbnail = {thumbnail} />
            : <Base_EditMode_Thumbnail thumbnail = {thumbnail} controlPack = {controlPack}/>
        }
    </Box>
}

const DataController = (props) => {

    const 
        {controlPack} = props,
        { mode } = controlPack

    return <Box>
        {(mode !='edit')
            ? <Base_Display_Data />
            : <Base_EditMode_Data controlPack = {controlPack}/>
        }
    </Box>
}

// controller directs to appropriate component
const DocBase = (props) => {

    const 
        { documentBaseData, mode, sessionID } = props,
        baseFields = documentBaseData.base,
        { name, description, image, todo } = baseFields,
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        {document: sessiondocument} = workboxHandler.session,
        sessionIDRef = useRef(sessionID),
        [baseEditMode, setBaseEditMode] = useState(false)

    let actionIcon, response, tooltip, canceltip

    const onInsert = () => {

        sessiondocument.insertunit(sessionIDRef.current)

    }

    const onEdit = () => {

        if (sessiondocument.editunit(sessionIDRef.current)) {
            setBaseEditMode(true)
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
            setBaseEditMode(false)
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
        setBaseEditMode(false)
        
    }

    const actionResponses = {onInsert, onEdit, onSave, onCancel}

    if (baseEditMode) {
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

    const controlPack = {
        mode,
        sessionID,
        actionResponses,
    }

    return <Box data-type = 'documentbase' style = {baseStyles} marginLeft = {mode == 'view'?'0': '24px'}>
        <Box>
            <TodoController 
                controlPack = {controlPack}
                todo = { todo } 
            />
        </Box>
        <Box>
            <IdentityController 
                controlPack = {controlPack}
                name = {name} 
                description = {description} 
            />
        </Box>
        <Box>
            <ThumbnailController 
                controlPack = {controlPack}
                thumbnail = { image }
            />
        </Box>
        <Box>
            <DataController 
                controlPack = {controlPack}
            />
        </Box>
    </Box>
}

export default DocBase

// {(mode == 'edit') && <DocBaseDisplayEditMode documentBaseData = {documentBaseData}/>}
// {(mode !='edit') && <DocBaseDisplay documentBaseData = {documentBaseData}/>}
// {(!['view', 'drag', 'remove'].includes(mode)) && <>
//     <Box style = {actionIconStyles} data-type = 'actionbox'>
//         <SideIcon icon = {actionIcon} response = {response} tooltip = {tooltip} />
//     </Box>
//     {baseEditMode &&
//         <Box style = {alternateActionIconStyles} data-type = 'cancelbox'>
//             <SideIcon icon = {cancelEditIcon} response = {onCancel} tooltip = {canceltip}></SideIcon>
//         </Box>
//     }</>
// }

// const DocBaseDisplayEditMode = (props) => { // simplicity makes component available for document callout

//     const 
//         {documentBaseData} = props,
//         baseFields = documentBaseData.base,
//         baseData = documentBaseData.data,
//         { name, description, image, todo } = baseFields,
//         [activeEdit, setActiveEdit] = useState(false)

//     return <Box data-type = 'displaybaseeditmode' padding = '3px'>
//         <Box data-type = 'editmode-todo-list'>
//             <Box style = {actionIconStyles} data-type = 'actionbox'>
//                 <SideIcon icon = {editIcon} tooltip = 'edit the todo list' caption = 'edit'/>
//             </Box>
//             <Box style = {{fontWeight:'bold',fontStyle:'italic',color:'red', fontSize:'0.8em'}}>To do</Box>
//             <Box borderBottom = '1px solid silver'>
//                    <pre style = {{fontFamily:'inherit', fontSize:'0.8em'}} >{todo}</pre>
//             </Box>
//         </Box>
//         <Box data-type = 'editmode-thumbnail'>
//             <Box 
//                 style = {{borderBottom:'1px solid silver', display:'flex'}}
//             >
//                 <Box style = {actionIconStyles} data-type = 'actionbox'>
//                     <SideIcon icon = {editIcon} tooltip = 'edit the thumbnail' caption = 'edit'/>
//                 </Box>
//                 <Box style = {{margin:'3px', border:'3px ridge silver', borderRadius:'8px'}} >
//                     <img style = {{width: '55px', height: '55px', borderRadius:'6px'}} src = {image.source} />
//                 </Box>
//             </Box>
//         </Box>
//         <Box data-type = 'editmode-identity'>
//             <Box style = {actionIconStyles} data-type = 'actionbox'>
//                 <SideIcon icon = {editIcon} tooltip = 'edit the basics' caption = 'edit'/>
//             </Box>
//             <Box fontWeight = 'bold' style = {{clear:'left'}}>
//                 {name}
//             </Box>
//             <Box fontStyle = 'italic'>
//                {description}
//             </Box>
//         </Box>
//         <Divider style = {{clear:'left', borderColor: 'gray'}} />
//         <Box data-type = 'editmode-summary'>
//             <Box style = {actionIconStyles} data-type = 'actionbox'>
//                 <SideIcon icon = {editIcon} tooltip = 'edit the summary' caption = 'edit'/>
//             </Box>
//             <BaseDataDisplayController />
//         </Box>
//     </Box>
// }

// const DocBaseDisplay = (props) => {

//     const 
//         {documentBaseData} = props,
//         baseFields = documentBaseData.base,
//         baseData = documentBaseData.data,
//         { name, description, image, todo } = baseFields

//     return <Box data-type = 'displaybase' padding = '3px'>
//         { todo && <Box borderBottom = '1px solid silver'>
//            <details>
//                <summary style = {{fontWeight:'bold',fontStyle:'italic',color:'red', fontSize:'0.8em'}}>To do</summary>
//                <pre style = {{fontFamily:'inherit', fontSize:'0.8em'}} >{todo}</pre>
//            </details>
//         </Box>}
//         {image.source && <Box style = {{float:'left', margin:'3px 3px 3px 0', border:'3px ridge silver', borderRadius:'8px'}} >
//             <img style = {{width: '55px', height: '55px', borderRadius:'6px'}} src = {image.source} />
//         </Box>}
//         <Box fontWeight = 'bold'>
//             {name}
//         </Box>
//         <Box fontStyle = 'italic'>
//            {description}
//         </Box>
//         <Divider style = {{clear:'left', borderColor: 'gray'}} />
//         <Box >
//             <BaseDataDisplayController />
//         </Box>
//     </Box>
// }

// const DocBaseEdit = (props) => {
    
//     const 
//         [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
//         editBaseRecord = workboxHandler.editRecord.document.base,
//         [editState,setEditState] = useState('setup'),
//         systemRecords = useSystemRecords(),
//         maxDescriptionLength = systemRecords.settings.constraints.input.descriptionLength_max,
//         maxNameLength = systemRecords.settings.constraints.input.nameLength_max,
//         minNameLength = systemRecords.settings.constraints.input.nameLength_min,
//         errorMessages = {
//             name:`The name can only be between ${minNameLength} and ${maxNameLength} characters, and cannot be blank.`,
//             description:`The description can only be up to ${maxDescriptionLength} characters.`,
//             todo: 'There are no limits to content'
//         },
//         helperText = {
//             name:`This name will appear to app users. Can be changed. Up to ${maxNameLength} characters.`,
//             description:`This description will appear to app users. Max ${maxDescriptionLength} characters.`,
//             todo:`The to do field holds notes for administrators.`,
//             // thumbnail:`This image (sized to 90 x 90 px) is used as a visual representation in resource listings.`
//         },
//         invalidFieldFlagsRef = useRef({
//             name:false,
//             description:false,
//             image:false,
//             todo:false,
//         }),
//         invalidFieldFlags = invalidFieldFlagsRef.current

//     // initialize editRecord and editData (editRecord subset)
//     useEffect(()=>{

//         const 
//             editData = workboxHandler.editRecord.document.base

//         isInvalidTests.name(editData.name ?? '')
//         isInvalidTests.description(editData.description ?? '')
//         isInvalidTests.image(editData.image ?? '')
//         isInvalidTests.todo(editData.todo)

//         setEditState('checking')

//     },[])

//     useEffect(()=>{

//         if (['checking','validating', 'uploading'].includes(editState)) setEditState('ready')

//     },[editState])

//     const onChangeFunctions = {
//         name:(event) => {
//             const 
//                 target = event.target as HTMLInputElement,
//                 value = target.value

//             isInvalidTests.name(value)
//             editBaseRecord.name = value
//             setEditState('validating')
//         },
//         description:(event) => {
//             const
//                 target = event.target as HTMLInputElement,
//                 value = target.value
//             isInvalidTests.description(value)
//             editBaseRecord.description = value
//             setEditState('validating')
//         },
//         todo:(event) => {
//             const
//                 target = event.target as HTMLInputElement,
//                 value = target.value
//             isInvalidTests.todo(value)
//             editBaseRecord.todo = value
//             setEditState('validating')
//         },
//     }

//     const setChangeError = () => {

//         let is_change_error = false
//         for (const prop in invalidFieldFlags) {
//             if (invalidFieldFlags[prop]) {
//                 is_change_error = true
//                 break
//             }
//         }

//         workboxHandler.session.document.is_change_error = is_change_error

//     }

//     const isInvalidTests = {
//         // TODO check for blank, string
//         name:(value) => {
//             let isInvalid = false
//             if (value.length > maxNameLength || value.length < minNameLength) {
//                 isInvalid = true
//             }
//             if (!isInvalid) {
//                 if (!value) {// blank
//                     isInvalid = true
//                 }
//             }
//             invalidFieldFlags.name = isInvalid
//             setChangeError()
//             return isInvalid
//         },
//         description:(value) => {
//             let isInvalid = false
//             if (value.length > maxDescriptionLength) {
//                 isInvalid = true
//             }
//             invalidFieldFlags.description = isInvalid
//             setChangeError()
//             return isInvalid
//         },
//         image:(value) => {
//             let isInvalid = false

//             return isInvalid
//         },
//         todo:(value) => {
//             let isInvalid = false

//             return isInvalid
//         }
//     }

//     return <Box padding = '3px'>
//         <Heading as = 'h6' 
//             fontSize = 'x-small' 
//             color = 'gray' 
//             borderTop = '1px solid silver'
//             backgroundColor = '#F0F0F0'
//         >--- Document basics ---</Heading>
//         <Box data-type = 'active-edit-todo-list'>
//             <Box style = {{fontSize:'small'}}>To do notes</Box>
//             <Box data-type = 'todofield' margin = '3px' padding = '3px' border = '1px dashed silver'>
//                 <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px' isInvalid = {invalidFieldFlags.todo}>
//                     <Textarea 
//                         value = {editBaseRecord.todo || ''} 
//                         size = 'sm'
//                         onChange = {onChangeFunctions.todo}
//                     >
//                     </Textarea>
//                     <FormErrorMessage>
//                         {errorMessages.todo} Current length is {editBaseRecord.todo?.length || '0 (blank)'}.
//                     </FormErrorMessage>
//                     <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
//                         {helperText.todo} Current length is {editBaseRecord.todo?.length || '0 (blank)'}.
//                     </FormHelperText>
//                 </FormControl>
//             </Box>
//         </Box>
//         <Box data-type = 'active-edit-basic-data'>
//         <Box style = {{fontSize:'small'}}>workbox basics</Box>
//         <Flex data-type = 'documenteditflex' flexWrap = 'wrap'>
//             <Box data-type = 'namefield' margin = '3px' padding = '3px' border = '1px dashed silver'>
//                 <FormControl minWidth = '300px' maxWidth = '400px' isInvalid = {invalidFieldFlags.name}>
//                     <FormLabel fontSize = 'sm'>Workbox name:</FormLabel>
//                     <Input 
//                         value = {editBaseRecord.name || ''} 
//                         size = 'sm'
//                         onChange = {onChangeFunctions.name}
//                     >
//                     </Input>
//                     <FormErrorMessage>
//                         {errorMessages.name} Current length is {editBaseRecord.name?.length || '0 (blank)'}.
//                     </FormErrorMessage>
//                     <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
//                         {helperText.name} Current length is {editBaseRecord.name?.length || '0 (blank)'}.
//                     </FormHelperText>
//                 </FormControl>
//             </Box>
//             <Box data-type = 'descriptionfield' margin = '3px' padding = '3px' border = '1px dashed silver'>
//                 <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px' isInvalid = {invalidFieldFlags.description}>
//                     <FormLabel fontSize = 'sm'>Description:</FormLabel>
//                     <Textarea 
//                         rows = {2}
//                         value = {editBaseRecord.description || ''} 
//                         size = 'sm'
//                         onChange = {onChangeFunctions.description}
//                     >
//                     </Textarea>
//                     <FormErrorMessage>
//                         {errorMessages.description} Current length is {editBaseRecord.description?.length || '0 (blank)'}.
//                     </FormErrorMessage>
//                     <FormHelperText fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
//                         {helperText.description} Current length is {editBaseRecord.description?.length || '0 (blank)'}.
//                     </FormHelperText>
//                 </FormControl>
//             </Box>
//             <IntakeCroppedImage />
//         </Flex>
//         </Box>
//         <Box data-type = 'active-edit-data'>
//             <Box style = {{fontSize:'small'}}>document data</Box>
//             <BaseDataEditController />
//         </Box>
//     </Box>
// }
