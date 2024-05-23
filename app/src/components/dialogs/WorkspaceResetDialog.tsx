// WorkspaceResetDialog.tsx
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

const WorkspaceResetDialog = (props) => {

    const
        { setResetDialogState } = props,
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        cancelRef = useRef(null),
        [alertState, setAlertState] = useState('ready'),
        toast = useToast({duration:4000}),
        navigate = useNavigate()

    const doClose = () => {
        setResetDialogState(false)
    }

    async function doWorkspaceReset () {

        const result = await workspaceHandler.resetWorkspace()

        if (result.error) {
            navigate('/error')
            return
        }

        toast({description:result.notice})
        
        dispatchWorkspaceHandler('reset')
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
                        Reset this workspace
                    </AlertDialogHeader>

                    <AlertDialogBody fontSize = 'sm'>
                        <Text>
                            Continue? This will remove all but the default panel from this workspace. For the
                            default panel this will remove all but the default window.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button mr = '10px' isDisabled = {alertState == 'processing'} ref={cancelRef} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {alertState == 'processing'} colorScheme = 'blue'
                            onClick = {doWorkspaceReset}
                        >
                          Reset
                        </Button>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default WorkspaceResetDialog
