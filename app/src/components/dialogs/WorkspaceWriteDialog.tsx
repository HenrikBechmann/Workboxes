// WorkspaceWriteDialog.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef, useState, useEffect} from 'react'

import {
    Button, Text, Input,
    Box,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    FormControl, FormLabel, FormErrorMessage, FormHelperText,
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import { updateDocumentSchema } from '../../system/utilities'

import { isMobile } from '../../index'

import { 
    // useUserAuthData, 
    useUserRecords, 
    // useAuth, 
    useFirestore, 
    useWorkspaceHandler, 
    useSystemRecords,
    useErrorControl,
    useUsage,
} from '../../system/WorkboxesProvider'

const WorkspaceWriteDialog = (props) => {

    const 
        { writeDialogState, setWriteDialogState } = props,
        dialogStateRef = useRef(null),
        systemRecords = useSystemRecords(),
        userRecords = useUserRecords(),
        db = useFirestore(),
        maxNameLength = systemRecords.settings.constraints.input.workspaceNameLength_max,
        minNameLength = systemRecords.settings.constraints.input.workspaceNameLength_min,
        focusRef = useRef(null),
        [writeValues, setWriteValues] = useState({name:null}),
        writeIsInvalidFieldFlagsRef = useRef({
            name: false,
        }),
        newInvocationRef = useRef(true),
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        [alertState, setAlertState] = useState('ready'),
        writeIsInvalidFieldFlags = writeIsInvalidFieldFlagsRef.current,
        navigate = useNavigate(),
        errorControl = useErrorControl(),
        usage = useUsage()

    dialogStateRef.current = writeDialogState

    useEffect(()=>{
        if (newInvocationRef.current) {
            (dialogStateRef.current.action == 'changename')
                ? setWriteValues({name:workspaceHandler.workspaceSelection.name})
                : setWriteValues({name:''})
            if (dialogStateRef.current.action == 'createworkspace') {
                writeIsInvalidTests.name('')
            }
            newInvocationRef.current = false
        }
    },[newInvocationRef.current]) //, workspacePayload]) TODO not needed?


    const writeHelperText = {
        name:`The workspace name can be ${minNameLength}-${maxNameLength} characters long.`,
    }

    const writeErrorMessages = {
        name:`The name must be ${minNameLength} to ${maxNameLength} characters.`,
    }

    const onWriteChangeFunctions = {
        name:(event) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            writeIsInvalidTests.name(value)
            writeValues.name = value
            setWriteValues({...writeValues})
        },
    }

    const writeIsInvalidTests = {
        name: (value) => {
            let isInvalid = false
            if (value.length > maxNameLength || value.length < minNameLength) {
                isInvalid = true
            }
            writeIsInvalidFieldFlags.name = isInvalid
            return isInvalid
        },        
    }

    // TODO make sure record exists before saving
    async function doSaveRename() {
        if (writeIsInvalidFieldFlags.name) {
            // TODO use chakra Alert instead
            alert('Please correct errors before saving')
            return
        }
        setAlertState('processing')

        const 
            userRecord = userRecords.user,
            result = await workspaceHandler.renameWorkspace(writeValues.name)

        if (result.error) {
           navigate('/error')
           return
        }

        dispatchWorkspaceHandler('rename')

        doClose()

    }

    async function doCreateWorkspace() {
        if (writeIsInvalidFieldFlags.name) {
            // TODO use chakra Alert instead
            alert('Please correct errors before saving')
            return
        }

        setAlertState('processing')

        const result = await workspaceHandler.createWorkspace(writeValues.name)

        if (result.error) {
            navigate('/error')
            return
        }

        dispatchWorkspaceHandler('create')

        doClose()

    }

    const doClose = () => {
        newInvocationRef.current = true // TODO not required; dialog is destoroyed after use
        setWriteDialogState((previousState)=>{
            previousState.open = false
            return {...previousState}
        })
    }

    return (<>
        <AlertDialog
            isOpen={writeDialogState.open}
            leastDestructiveRef={focusRef}
            onClose={doClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {writeDialogState.action == 'changename' && 'Change the name of the current workspace.'}
                        {writeDialogState.action == 'createworkspace' && 'Create a new workspace.'}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {alertState == 'processing' && <Text>Processing...</Text>}
                        <Box data-type = 'namefield' margin = '3px' padding = '3px'>
                            <FormControl isDisabled = {alertState == 'processing'} minWidth = '300px' maxWidth = '400px' isInvalid = {writeIsInvalidFieldFlags.name}>
                                <FormLabel fontSize = 'sm'>Workspace name:</FormLabel>
                                <Input 
                                    value = {writeValues.name || ''} 
                                    size = 'sm'
                                    onChange = {onWriteChangeFunctions.name}
                                    ref = {focusRef}
                                >
                                </Input>
                                <FormErrorMessage>
                                    {writeErrorMessages.name} Current length is {writeValues.name?.length || '0 (blank)'}.
                                </FormErrorMessage>
                                <FormHelperText fontSize = 'xs' fontStyle = 'italic' >
                                    {writeHelperText.name} Current length is {writeValues.name?.length || '0 (blank)'}.
                                </FormHelperText>
                            </FormControl>
                        </Box>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button isDisabled = {alertState == 'processing'} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'blue'
                            onClick = {writeDialogState.action == 'changename'? doSaveRename:doCreateWorkspace}
                        >
                          {writeDialogState.action == 'changename'?'Save':'Create'}
                        </Button>
                    </AlertDialogFooter>


                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default WorkspaceWriteDialog
