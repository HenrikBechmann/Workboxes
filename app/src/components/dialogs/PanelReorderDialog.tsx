// PanelReorderDialog.tsx
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

const PanelReorderDialog = (props) => {

    const
        { setPanelReorderDialogState } = props,
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        cancelRef = useRef(null),
        [alertState, setAlertState] = useState('ready'),
        toast = useToast({duration:4000}),
        navigate = useNavigate()

    const doClose = () => {
        setPanelReorderDialogState(false)
    }

    async function doPanelReorder () {

        // const result = await workspaceHandler.panelReset(workspaceHandler.panelSelection)

        // if (result.error) {
        //     navigate('/error')
        //     return
        // }

        // toast({description:result.notice})
        
        dispatchWorkspaceHandler('reorderpanel')
        doClose()
    }

                        // <Text>
                        //     Drag and drop the panels to re-order them.
                        // </Text>
    return (<>
        <AlertDialog
            isOpen={true}
            leastDestructiveRef={cancelRef}
            onClose={doClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent height = 'calc(100vh - 55px)' mt = '45px'>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Drag and drop to re-order the panels
                    </AlertDialogHeader>

                    <AlertDialogBody fontSize = 'sm' height = '100%'>
                        <Text>Body</Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button mr = '10px' isDisabled = {alertState == 'processing'} ref={cancelRef} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {alertState == 'processing'} colorScheme = 'blue'
                            onClick = {doPanelReorder}
                        >
                          Apply
                        </Button>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default PanelReorderDialog
