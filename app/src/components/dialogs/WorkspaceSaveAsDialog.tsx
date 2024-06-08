// WorkspaceSaveAsDialog.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef, useState, useEffect} from 'react'

import {
    Button, Text, Input, Checkbox,
    Box,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    FormControl, FormLabel, FormErrorMessage, FormHelperText,
    useToast,
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import { isMobile } from '../../index'

import { 
    useWorkspaceHandler, 
    useSystemRecords,
} from '../../system/WorkboxesProvider'

const WorkspaceSaveAsDialog = (props) => {

    const 
        { setWorkspaceSaveAsDialogState } = props,
        systemRecords = useSystemRecords(),
        maxNameLength = systemRecords.settings.constraints.input.workspaceNameLength_max,
        minNameLength = systemRecords.settings.constraints.input.workspaceNameLength_min,
        focusRef = useRef(null),
        [writeValues, setWriteValues] = useState({name:null}),
        isInvalidFieldFlagsRef = useRef({
            name: false,
        }),
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        [alertState, setAlertState] = useState('setup'),
        isInvalidFieldFlags = isInvalidFieldFlagsRef.current,
        navigate = useNavigate(),
        toast = useToast({duration:4000}),
        checkboxRef = useRef(null)

    useEffect(()=>{

        isInvalidTests.name('')    

    },[])

    useEffect(()=>{
        if (alertState == 'setup') {
            setAlertState('ready')
        }

    },[alertState])

    const helperText = {
        name:`The workspace name can be ${minNameLength}-${maxNameLength} characters long.`,
    }

    const errorMessages = {
        name:`The name must be ${minNameLength} to ${maxNameLength} characters.`,
    }

    const onChangeFunctions = {
        name:(event) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            isInvalidTests.name(value)
            writeValues.name = value
            setWriteValues({...writeValues})
        },
    }

    const isInvalidTests = {
        name: (value) => {
            let isInvalid = false
            if (value.length > maxNameLength || value.length < minNameLength) {
                isInvalid = true
            }
            isInvalidFieldFlags.name = isInvalid
            return isInvalid
        },        
    }

    // TODO make sure record exists before saving
    async function doSaveAs() {
        if (isInvalidFieldFlags.name) {
            // TODO use chakra Alert instead
            alert('Please correct errors before saving')
            return
        }
        setAlertState('processing')

        const 
            result = await workspaceHandler.copyWorkspaceAs(writeValues.name)

        if (result.error) {
           navigate('/error')
           return
        }

        if (checkboxRef.current.checked) {

            const selectionresult = await workspaceHandler.setWorkspaceSelection(result.payload.id, result.payload.name)
            if (selectionresult.error) {
                navigate('/error')
                return
            }

        }

        toast({description:result.notice})

        dispatchWorkspaceHandler('copy')

        doClose()

    }

    const doClose = () => {
        setWorkspaceSaveAsDialogState(false)
    }

    return (<>
        <AlertDialog
            isOpen={true}
            leastDestructiveRef={focusRef}
            onClose={doClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Copy the current workspace to...
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {alertState == 'processing' && <Text>Processing...</Text>}
                        <Text>This will clone the entire current workspace 
                        <span style = {{fontStyle: 'italic'}}> [{workspaceHandler.workspaceRecord.profile.workspace.name}]
                        </span> (including its panels and panel windows)
                        as a new workspace.</Text>
                        <Box data-type = 'namefield' margin = '3px' padding = '3px'>
                            <FormControl 
                                isDisabled = {alertState == 'processing'} 
                                minWidth = '300px' 
                                maxWidth = '400px' 
                                isInvalid = {isInvalidFieldFlags.name}
                            >
                                <FormLabel fontSize = 'sm'>New workspace name:</FormLabel>
                                <Input 
                                    value = {writeValues.name || ''} 
                                    size = 'sm'
                                    onChange = {onChangeFunctions.name}
                                    ref = {focusRef}
                                >
                                </Input>
                                <FormErrorMessage>
                                    {errorMessages.name} Current length is {writeValues.name?.length || '0 (blank)'}.
                                </FormErrorMessage>
                                <FormHelperText fontSize = 'xs' fontStyle = 'italic' >
                                    {helperText.name} Current length is {writeValues.name?.length || '0 (blank)'}.
                                </FormHelperText>
                            </FormControl>
                            <FormControl 
                                isDisabled = {alertState == 'processing'} 
                                mt = '8px' 
                                borderTop = '1px solid silver'
                            >
                                <Checkbox ref = {checkboxRef} >Navigate to the new workspace.</Checkbox>
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
                            onClick = {doSaveAs}
                        >
                          Make the copy
                        </Button>
                    </AlertDialogFooter>


                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default WorkspaceSaveAsDialog
