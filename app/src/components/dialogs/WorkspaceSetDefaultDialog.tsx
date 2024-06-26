// WorkspaceSetDefaultDialog.tsx
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

const WorkspaceSetDefaultDialog = (props) => {

    const 
        { setWorkspaceSetDefaultDialogState } = props,
        focusRef = useRef(null),
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        { settings, workspaceSelection } = workspaceHandler,
        [alertState, setAlertState] = useState('setup'),
        navigate = useNavigate(),
        toast = useToast({duration:4000, isClosable:true}),
        checkboxRef = useRef(null),
        selectRef = useRef(null),
        [currentDefaultIndex, setCurrentDefaultIndex] = useState(-1),
        [selectedIndex, setSelectedIndex] = useState(null),
        [workspaceList, setWorkspaceList] = useState([])

    useEffect(()=>{
        if (alertState == 'setup') {
            setAlertState('ready')
        }

    },[alertState])

    useEffect(()=>{

        if (!selectRef.current) return
        selectRef.current.selectedIndex = currentDefaultIndex
        setSelectedIndex(currentDefaultIndex)

    },[currentDefaultIndex, selectRef.current])

    useEffect(()=>{
        getWorkspaceList()
    },[])

    async function getWorkspaceList() {
        const result = await workspaceHandler.getWorkspaceList()

        if (result.error) {
            navigate('/error')
            return
        }

        const workspaceList = result.payload

        workspaceList.sort((a,b) => {
            return (a.name < b.name)
                ? -1
                : (a.name > b.name)
                    ? 1
                    :0
        })

        setWorkspaceList(workspaceList)

    }

    const workspaceOptions = useMemo(()=>{

        const workspaceOptionsList = []

        let workspaceIndex = 0
        workspaceList.forEach((item) => {
            if (item.is_default) {
                setCurrentDefaultIndex(workspaceIndex)
            }
            workspaceIndex++
            workspaceOptionsList.push(
                <option key = {item.id} value = {item.id}>
                    {item.name + (item.is_default?'*':'')}
                </option>
            )
        })

        return workspaceOptionsList

    },[workspaceList])

    const onSelect = ((event) => {

            const 
                { target } = event,
                selectedPanel = target.selectedOptions[0].value

            setSelectedIndex(target.selectedIndex)

    })

    async function doSetDefault() {

        setAlertState('processing')

        const 
            newDefaultSelection = workspaceList[selectedIndex],
            previousDefaultSelection = workspaceList[currentDefaultIndex],
            result = await workspaceHandler.setDefaultWorkspace(previousDefaultSelection, newDefaultSelection)

        if (result.error) {
           navigate('/error')
           return
        }

        toast({description:result.notice})

        if (checkboxRef.current.checked) {

            workspaceHandler.setWorkspaceSelection(newDefaultSelection.id, newDefaultSelection.name)
        } else {
            workspaceHandler.setWorkspaceSelection(workspaceSelection.id, workspaceSelection.name)
        }

        dispatchWorkspaceHandler('defaultworkspace')

        doClose()

    }

    const doClose = () => {
        setWorkspaceSetDefaultDialogState(false)
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
                        Select a new default workspace
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {(settings.mode == 'automatic') &&
                            <>{(alertState == 'processing') && <Text>Processing...</Text>}
                                <Text>The default workspace is displayed as a fallback if a currently displayed workspace is deleted. 
                                The default workspace itself cannot be deleted
                                (but it can be reset).</Text>
                                <Box data-type = 'namefield' margin = '3px' padding = '3px'>
                                    <FormControl 
                                        mt = '8px'
                                        isDisabled = {alertState == 'processing'} 
                                        minWidth = '300px' 
                                        maxWidth = '400px' 
                                    >
                                        <FormLabel paddingTop = '6px' fontSize = 'sm'>Select a new default workspace:</FormLabel>
                                        <Select
                                            ref = {selectRef}
                                            onChange = {onSelect}
                                        >
                                            {workspaceOptions}
                                        </Select>
                                        {(currentDefaultIndex === selectedIndex) && <FormHelperText fontSize = 'xs' fontStyle = 'italic' >
                                            This selection is the current default workspace. Choose a different workspace for a change of the default workspace.
                                        </FormHelperText>}
                                    </FormControl>
                                    <FormControl 
                                        isDisabled = {alertState == 'processing'} 
                                        mt = '8px' 
                                        borderTop = '1px solid silver'
                                    >
                                        <Checkbox ref = {checkboxRef} >Navigate to the new default workspace.</Checkbox>
                                    </FormControl>
                                </Box>
                            </>
                        }
                        {(settings.mode == 'manual') &&
                            <Text>The default workspace cannot be changed when workspace saving is set to manual. 
                            Change to automatic if you want to change the default.</Text>
                        }
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button isDisabled = {alertState == 'processing'} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button 
                            isDisabled = {
                                (alertState == 'processing') 
                                || currentDefaultIndex === selectedIndex 
                                || settings.mode == 'manual'
                            } 
                            ml = '8px' colorScheme = 'blue'
                            onClick = {doSetDefault}
                        >
                          Change default
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default WorkspaceSetDefaultDialog
