// WorkspaceSaveDialog.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState} from 'react'

import {
    Button, Text,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    useToast,
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import { 
    useWorkspaceHandler, 
} from '../../system/WorkboxesProvider'

import { isMobile } from '../../index'

import uploadCloudIcon from '../../../assets/cloud_upload.png'

const WorkspaceSaveDialog = (props) => {

    const
        { setSaveDialogState } = props,
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        cancelRef = useRef(null),
        [alertState, setAlertState] = useState('ready'),
        toast = useToast({duration:4000}),
        navigate = useNavigate()

    const doClose = () => {
        setSaveDialogState(false)
    }

    const setAutomaticSave = () => {

        // ---- set save MODE ----
        if (workspaceHandler.settings.mode == 'manual') {
            toast({description:'workspace saving set to automatic'})
        }
        workspaceHandler.settings.mode = 'automatic'
        // TODO call immediate save on workspaceHandler
        dispatchWorkspaceHandler('automatic')
        doClose()
    }

    const setManualSave = () => {
        
        if (workspaceHandler.settings.mode == 'automatic') {
            toast({description:'workspace saving set to manual'})
        }
        // ---- set save MODE ----
        workspaceHandler.settings.mode = 'manual'
        dispatchWorkspaceHandler('manual')
        doClose()
    }

    async function reloadWorkspace() {

        const result = await workspaceHandler.reloadWorkspace()
        if (result.error) {
            navigate('/error')
            return
        }
        if (result.notice) {
            toast({description:result.notice})
        }
        dispatchWorkspaceHandler('reload')
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
                        Change saving behaviour for this workspace
                    </AlertDialogHeader>

                    <AlertDialogBody fontSize = 'sm'>
                        <Text borderTop = '1px solid silver'>
                            The <span style = {{fontWeight:'bold'}}>Automatic</span> setting (the default) saves workspace panel configuration changes 
                            immediately, or quickly. This includes 
                        </Text>
                        <Text>
                            - adding, removing, re-sorting, and renaming panels
                        </Text>
                        <Text>
                            - adding, removing, and moving windows in panels
                        </Text>
                        <Text borderTop = '1px solid silver'>
                            With the <span style = {{fontWeight:'bold'}}>Manual</span> setting, configuration
                            changes are not saved unless you click the cloud upload icon <img style = 
                            {{display: 'inline-block', height:'16px', width:'16px', verticalAlign:'middle'}} src = {uploadCloudIcon} />.
                        </Text>
                        <Text>
                            Manual saves lets you avoid saving when your login is concurrently using more than one tab or device with
                            the same workspace. Automatic saves in that case can clobber each others' configuration settings. 
                        </Text>
                        <Text borderTop = '1px solid silver'  borderBottom = '1px solid silver'>
                            Best advice: use different workspaces in different tabs.
                        </Text>
                        {(workspaceHandler.settings.mode == 'manual') && <Text>
                            <span style = {{fontWeight:'bold'}}>Reload...</span> to discard changes and start over.
                        </Text>}
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button mr = '10px' size = 'xs' isDisabled = {alertState == 'processing'} ref={cancelRef} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button size = 'xs' isDisabled = {alertState == 'processing'} colorScheme = 'blue'
                            onClick = {setAutomaticSave}
                        >
                          Automatic
                        </Button>
                        <Button size = 'xs' isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'red'
                            onClick = {setManualSave}
                        >
                          Manual
                        </Button>
                        {(workspaceHandler.settings.mode == 'manual') && <Button size = 'xs' isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'green'
                            onClick = {reloadWorkspace}
                        >
                          Reload...
                        </Button>}
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default WorkspaceSaveDialog