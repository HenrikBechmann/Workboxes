// WorkspaceDeleteDialog.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef, useState, useEffect} from 'react'

import {
    Button, Text,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    useToast,
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import { 
    useUserRecords, 
    useFirestore, 
    useWorkspaceHandler, 
    useErrorControl,
    useUsage,
} from '../../system/WorkboxesProvider'

const WorkspaceDeleteDialog = (props) => {

    const 
        { setDeleteDialogState } = props,
        dialogStateRef = useRef(null),
        userRecords = useUserRecords(),
        cancelRef = useRef(null),
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        [alertState, setAlertState] = useState('ready'),
        [isDefaultState, setIsDefaultState] = useState(false),
        toast = useToast({duration:3000}),
        navigate = useNavigate()

    useEffect(()=>{

        setIsDefaultState(workspaceHandler.workspaceRecord.profile.flags.is_default)
    
    },[])

    const doClose = () => {

        setDeleteDialogState(false)

    }

    async function doDeleteWorkspace() {

        const result = await workspaceHandler.deleteWorkspace(userRecords.user)

        if (result.error) {
            navigate('/error')
            return
        }

        toast({description:result.notice})
        setDeleteDialogState(false)
        dispatchWorkspaceHandler('delete')
        
    }

    // TODO to come
    async function doResetWorkspace() {

        setDeleteDialogState(false)
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
                        Delete the current workspace
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {alertState == 'processing' && <Text>Processing...</Text>}
                        
                        {(!isDefaultState && (workspaceHandler.settings.mode == 'automatic')) && 
                            <Text>
                                Continue? The current workspace (<span style = {{fontStyle:'italic'}}>
                                    {workspaceHandler.workspaceSelection.name}</span>) will be deleted, 
                                and replaced by the default workspace.
                            </Text>
                        }

                        {(!isDefaultState && (workspaceHandler.settings.mode == 'manual')) && <>
                            <Text>The workspace <span style = {{fontStyle:'italic'}}>
                                {workspaceHandler.workspaceSelection.name}</span> cannot
                                be deleted because it is set for manual saving, protecting other instances of this login. 
                            </Text>
                            <Text mt = '6px'>But it can be reset, which would remove all of its panels other than
                                the default panel.
                            </Text>
                        </>}

                        {isDefaultState && <>
                            <Text>The workspace <span style = {{fontStyle:'italic'}}>
                                {workspaceHandler.workspaceSelection.name}</span> cannot
                                be deleted because it is the default workspace. 
                                {(workspaceHandler.settings.mode == 'manual')
                                    && '... and because workspace save is set to manual.'
                                }
                            </Text>
                        
                            <Text mt = '6px'>But it can be reset, which would remove all of its panels other than
                                the default panel.
                            </Text>
                        </>}

                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button isDisabled = {alertState == 'processing'} ref={cancelRef} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'red'
                            onClick = {!isDefaultState? doDeleteWorkspace: doResetWorkspace}
                        >
                          {(!isDefaultState && (workspaceHandler.settings.mode == 'automatic')) && 'Delete'}
                          {(isDefaultState || (workspaceHandler.settings.mode == 'manual')) && 'Reset'}

                        </Button>
                    </AlertDialogFooter>


                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default WorkspaceDeleteDialog
