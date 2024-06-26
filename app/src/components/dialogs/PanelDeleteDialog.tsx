// PanelDeleteDialog.tsx
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
    useWorkspaceHandler, 
} from '../../system/WorkboxesProvider'

const PanelDeleteDialog = (props) => {

    const 
        { setPanelDeleteDialogState, setPanelResetDialogState } = props,
        cancelRef = useRef(null),
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        [alertState, setAlertState] = useState('ready'),
        [isDefaultState, setIsDefaultState] = useState(false),
        toast = useToast({duration:4000, isClosable:true}),
        navigate = useNavigate(),
        { panelSelection, setPanelSelection, panelRecords } = workspaceHandler,
        panelRecord = panelRecords[panelSelection.index]

    useEffect(()=>{

        setIsDefaultState(panelRecord.profile.flags.is_default)
    
    },[])

    const doClose = () => {

        setPanelDeleteDialogState(false)

    }
    async function doDeletePanel() {

        const result = await workspaceHandler.deletePanel(panelSelection)

        if (result.error) {
            navigate('/error')
            return
        }

        const newPanelIndex = result.payload
        const newPanelRecord = workspaceHandler.panelRecords[newPanelIndex]
        setPanelSelection({index:newPanelIndex, id:newPanelRecord.profile.panel.id, name:newPanelRecord.profile.panel.name})

        toast({description:result.notice + ` and replaced by [${newPanelRecord.profile.panel.name}]`})
        setPanelDeleteDialogState(false)
        dispatchWorkspaceHandler('deletepanel')
        
    }

    // TODO to come
    async function doResetPanel() {

        setPanelDeleteDialogState(false)
        setPanelResetDialogState(true)

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
                        Delete the current panel
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {alertState == 'processing' && <Text>Processing...</Text>}
                        
                        {(!isDefaultState && (workspaceHandler.settings.mode == 'automatic')) && 
                            <Text>
                                Continue? The current panel (<span style = {{fontStyle:'italic'}}>
                                    {panelRecord.profile.panel.name}</span>) will be deleted, 
                                and replaced by the default panel.
                            </Text>
                        }

                        {isDefaultState && <>
                            <Text>The panel <span style = {{fontStyle:'italic'}}>
                                {panelRecord.profile.panel.name}</span> cannot
                                be deleted because it is the default panel.
                            </Text>
                        
                            <Text mt = '6px'>But it can be reset, which would remove all of its window other than
                                the default window.
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
                            onClick = {!isDefaultState? doDeletePanel: doResetPanel}
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

export default PanelDeleteDialog
