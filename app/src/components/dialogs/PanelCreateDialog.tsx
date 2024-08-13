// PanelCreateDialog.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef, useState, useEffect} from 'react'

import {
    Button, Text, Input, Select, Checkbox,
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
    useUserRecords,
} from '../../system/WorkboxesProvider'

const PanelCreateDialog = (props) => {

    const 
        { setPanelCreateDialogState, panelComponentListRef } = props,
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
        toast = useToast({duration:4000, isClosable:true}),
        {panelSelection, setPanelSelection, panelRecords } = workspaceHandler,
        panelName = panelRecords[panelSelection.index].profile.panel.name,
        [domainList, setDomainList] = useState([]),
        [selectedDomain, setSelectedDomain] = useState(''),
        checkboxRef = useRef(null)

    useEffect(()=>{

        isInvalidTests.name('')    

    },[])

    useEffect(() => {
        getUserDomainList()
    },[])

    useEffect(()=>{
        if (alertState == 'setup') {
            setAlertState('ready')
        }

    },[alertState])

    const domainOptions = useMemo(()=>{

        const domainOptionsList = []

        domainList.forEach((item) => {
            domainOptionsList.push(
                <option key = {item.id} value = {item.id}>{item.name}</option>
            )
        })

        return domainOptionsList

    },[domainList])

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
            const selectedDomain = event.target.selectedOptions[0].value

            setSelectedDomain(selectedDomain)
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
    async function doCreatePanel() {
        if (isInvalidFieldFlags.name) {
            // TODO use chakra Alert instead
            alert('Please correct errors before saving')
            return
        }
        setAlertState('processing')

        let domainSelection
        domainList.forEach((item) => {
            if (item.id == selectedDomain) {
                domainSelection = item
            }
        })

        const 
            result = await workspaceHandler.panelCreateRecord(writeValues.name, domainSelection)

        if (result.error) {
           navigate('/error')
           return
        }

        const { payload } = result

        toast({description:result.notice})

        if (checkboxRef.current.checked) {

            setPanelSelection({
                id: payload.id,
                name: payload.name,
                index: workspaceHandler.panelCount - 1,
            })
        } else {
            setPanelSelection((previousState)=>{
                return {...previousState}
            })
        }

        dispatchWorkspaceHandler('createpanelrecord')

        doClose()

    }

    async function getUserDomainList() {
        const result = await workspaceHandler.getUserDomainList()

        if (result.error) {
            navigate('/error')
            return
        }

        if (!result.success) {
            toast({description:result.notice})
            return
        }

        const domainList = result.payload

        domainList.sort((a,b)=>{
            return a.name < b.name
                ? -1
                : a.name > b.name
                    ? 1
                    :0
        })

        setDomainList(domainList)

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
                                <FormLabel paddingTop = '6px' fontSize = 'sm'>Select a base domain for this panel (required):</FormLabel>
                                <Select
                                    placeholder = 'Select a base domain' 
                                    onChange = {onChangeFunctions.select}
                                >
                                    {domainOptions}
                                </Select>
                                <FormHelperText fontSize = 'xs' fontStyle = 'italic' >
                                    The main workbox of this domain, and your membership workbox for this domain. will be
                                    your starting points for working in this new panel.
                                </FormHelperText>
                            </FormControl>
                            <FormControl 
                                isDisabled = {alertState == 'processing'} 
                                mt = '8px' 
                                borderTop = '1px solid silver'
                            >
                                <Checkbox ref = {checkboxRef} >Navigate to the new panel after it is created.</Checkbox>
                            </FormControl>
                        </Box>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button isDisabled = {alertState == 'processing'} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {(alertState == 'processing') || !selectedDomain} ml = '8px' colorScheme = 'blue'
                            onClick = {doCreatePanel}
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
