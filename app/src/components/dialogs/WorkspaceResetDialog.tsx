// WorkspaceResetDialog.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useEffect} from 'react'

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
        { setWorkspaceResetDialogState } = props,
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        {setPanelSelection} = workspaceHandler,
        cancelRef = useRef(null),
        [alertState, setAlertState] = useState('ready'),
        toast = useToast({duration:4000, isClosable:true}),
        navigate = useNavigate(),
        [defaultSelection, setDefaultSelection] = useState(null)

    const doClose = () => {
        setWorkspaceResetDialogState(false)
    }

    useEffect(()=>{

        setDefaultSelection(getDefaultPanelSelection())

    },[])


    async function doWorkspaceReset () {

        const result = await workspaceHandler.resetWorkspace()

        if (result.error) {
            navigate('/error')
            return
        }

        if (result.success) {

            setPanelSelection(result.payload)

            toast({description:result.notice})
            
            dispatchWorkspaceHandler('reset')

        } else {
            toast({description:'No reset: There was only the default panel'})
        }
        doClose()
    }

    const getDefaultPanelSelection = () => {

        const { panelRecords } = workspaceHandler

        let defaultSelection
        panelRecords.forEach((item)=>{
            if (item.profile.flags.is_default) {
                defaultSelection = item.profile.panel
            }
        })

        return defaultSelection
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
                            Continue? This will remove all but the default panel (<span style = {{fontStyle: 'italic'}}>{defaultSelection?.name}</span>) from this workspace.
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
