// PanelResetDialog.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState} from 'react'

import {
    Button, Text,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    useToast,
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import { useWorkspaceHandler } from '../../system/WorkboxesProvider'

import { isMobile } from '../../index'

const PanelResetDialog = (props) => {

    const
        { setPanelResetDialogState } = props,
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        cancelRef = useRef(null),
        [alertState, setAlertState] = useState('ready'),
        toast = useToast({duration:4000, isClosable:true}),
        navigate = useNavigate()

    const doClose = () => {
        setPanelResetDialogState(false)
    }

    async function doPanelReset () {

        const result = await workspaceHandler.panelReset(workspaceHandler.panelSelection)

        if (result.error) {
            navigate('/error')
            return
        }

        toast({description:result.notice})
        
        dispatchWorkspaceHandler('resetpanel')
        doClose()
    }

    return (<>
        <AlertDialog
            isOpen={true}
            leastDestructiveRef={cancelRef}
            onClose={doClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Reset this panel
                    </AlertDialogHeader>

                    <AlertDialogBody fontSize = 'sm'>
                        <Text>
                            Continue? This will remove all but the default window from this panel.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button mr = '10px' isDisabled = {alertState == 'processing'} ref={cancelRef} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {alertState == 'processing'} colorScheme = 'blue'
                            onClick = {doPanelReset}
                        >
                          Reset
                        </Button>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default PanelResetDialog
