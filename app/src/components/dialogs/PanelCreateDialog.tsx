// PanelCreateDialog.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef, useState, useEffect} from 'react'

import {
    Button, Text, Input, Select,
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

const PanelCreateDialog = (props) => {

    const 
        { setPanelCreateDialogState, setPanelSelection } = props,
        systemRecords = useSystemRecords(),
        maxNameLength = systemRecords.settings.constraints.input.panelNameLength_max,
        minNameLength = systemRecords.settings.constraints.input.panelNameLength_min,
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
        {panelSelection, panelRecords } = workspaceHandler,
        panelName = panelRecords[panelSelection.index].profile.panel.name

    useEffect(()=>{

        isInvalidTests.name('')    

    },[])

    useEffect(()=>{
        if (alertState == 'setup') {
            setAlertState('ready')
        }

    },[alertState])

    const helperText = {
        name:`The panel name can be ${minNameLength}-${maxNameLength} characters long.`,
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
        select:(event) => {
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
    async function doCreate() {
        if (isInvalidFieldFlags.name) {
            // TODO use chakra Alert instead
            alert('Please correct errors before saving')
            return
        }
        setAlertState('processing')

        const 
            result = await workspaceHandler.panelCreate(panelSelection,writeValues.name)

        if (result.error) {
           navigate('/error')
           return
        }

        toast({description:result.notice})

        setPanelSelection((previousState)=>{
            previousState.name = writeValues.name
            return {...previousState}
        })

        dispatchWorkspaceHandler('copy')

        doClose()

    }

    const doClose = () => {
        setPanelCreateDialogState(false)
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
                        Create a new panel
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {alertState == 'processing' && <Text>Processing...</Text>}
                        <Box data-type = 'namefield' margin = '3px' padding = '3px'>
                            <FormControl 
                                isDisabled = {alertState == 'processing'} 
                                minWidth = '300px' 
                                maxWidth = '400px' 
                                isInvalid = {isInvalidFieldFlags.name}
                            >
                                <FormLabel fontSize = 'sm'>New panel name:</FormLabel>
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
                                borderTop = '1px solid silver'
                                mt = '8px'
                                isDisabled = {alertState == 'processing'} 
                                minWidth = '300px' 
                                maxWidth = '400px' 
                                isInvalid = {isInvalidFieldFlags.name}
                            >
                                <FormLabel paddingTop = '6px' fontSize = 'sm'>Select a base domain for this panel:</FormLabel>
                                <Select
                                    placeholder = 'Select a base domain' 
                                    onChange = {onChangeFunctions.select}
                                >
                                </Select>
                                <FormHelperText fontSize = 'xs' fontStyle = 'italic' >
                                    The domain workbox, and your member workbox for this domain. will be
                                    your starting points for working in this panel.
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
                            onClick = {doCreate}
                        >
                          Create
                        </Button>
                    </AlertDialogFooter>


                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default PanelCreateDialog