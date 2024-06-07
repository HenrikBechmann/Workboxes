// PanelSetDefaultDialog.tsx
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

const PanelSetDefaultDialog = (props) => {

    const 
        { setPanelSetDefaultDialogState, setPanelSelection } = props,
        systemRecords = useSystemRecords(),
        focusRef = useRef(null),
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        [alertState, setAlertState] = useState('setup'),
        navigate = useNavigate(),
        toast = useToast({duration:4000}),
        {panelSelection, panelRecords } = workspaceHandler,
        [defaultSelection, setDefaultSelection] = useState(null),
        checkboxRef = useRef(null),
        selectRef = useRef(null),
        [currentDefaultIndex, setCurrentDefaultIndex] = useState(-1),
        selectedIndex = selectRef.current?.selectedIndex

    useEffect(()=>{
        if (alertState == 'setup') {
            setAlertState('ready')
        }

    },[alertState])

    useEffect(()=>{

        if (!selectRef.current) return
        selectRef.current.selectionIndex = currentDefaultIndex

    },[currentDefaultIndex, selectRef.current])

    const panelOptions = useMemo(()=>{

        const panelOptionsList = []

        panelRecords.forEach((item) => {
            if (item.profile.flags.is_default) {
                setCurrentDefaultIndex(item.profile.display_order)
            }
            panelOptionsList.push(
                <option key = {item.profile.panel.id} value = {item.profile.panel.id}>
                    {item.profile.panel.name + (item.profile.flags.is_default?'*':'')}
                </option>
            )
        })

        return panelOptionsList

    },[])

    const onSelect = ((event) => {

            const selectedPanel = event.target.selectedOptions[0].value

            setDefaultSelection(selectedPanel)
    })

    // TODO make sure record exists before saving
    async function doSetDefault() {

        return
        // setAlertState('processing')

        // let defaultSelection
        // panelRecords.forEach((item) => {
        //     if (item.id == defaultSelection) {
        //         defaultSelection = item
        //     }
        // })

        // const 
        //     result = await workspaceHandler.panelCreate(writeValues.name, domainSelection)

        // if (result.error) {
        //    navigate('/error')
        //    return
        // }

        // const { payload } = result

        // toast({description:result.notice})

        // if (checkboxRef.current.checked) {

        //     setPanelSelection({
        //         id: payload.id,
        //         name: payload.name,
        //         index: workspaceHandler.panelCount - 1,
        //     })
        // } else {
        //     setPanelSelection((previousState)=>{
        //         return {...previousState}
        //     })
        // }

        // dispatchWorkspaceHandler('createpanel')

        doClose()

    }

    const doClose = () => {
        setPanelSetDefaultDialogState(false)
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
                        Select a new default panel
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {alertState == 'processing' && <Text>Processing...</Text>}
                        <Text>The default panel is displayed as a fallback if another panel is deleted. The default panel itself cannot be deleted
                        (but it can be reset).</Text>
                        <Box data-type = 'namefield' margin = '3px' padding = '3px'>
                            <FormControl 
                                mt = '8px'
                                isDisabled = {alertState == 'processing'} 
                                minWidth = '300px' 
                                maxWidth = '400px' 
                            >
                                <FormLabel paddingTop = '6px' fontSize = 'sm'>Select a new default panel:</FormLabel>
                                <Select
                                    ref = {selectRef}
                                    onChange = {onSelect}
                                >
                                    {panelOptions}
                                </Select>
                                {(currentDefaultIndex === selectedIndex) && <FormHelperText fontSize = 'xs' fontStyle = 'italic' >
                                    The current selection is the current default panel. Choose another for a change.
                                </FormHelperText>}
                            </FormControl>
                            <FormControl 
                                isDisabled = {alertState == 'processing'} 
                                mt = '8px' 
                                borderTop = '1px solid silver'
                            >
                                <Checkbox ref = {checkboxRef} >Navigate to the new default panel after the change.</Checkbox>
                            </FormControl>
                        </Box>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button isDisabled = {alertState == 'processing'} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {(alertState == 'processing') || currentDefaultIndex === selectedIndex} ml = '8px' colorScheme = 'blue'
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

export default PanelSetDefaultDialog
