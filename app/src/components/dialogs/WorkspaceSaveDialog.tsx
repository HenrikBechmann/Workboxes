// WorkspaceSaveDialog.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef, useState, useEffect} from 'react'

import {
    Button, Text,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    useToast,
} from '@chakra-ui/react'

import { 
    doc, collection, 
    query, where, getDocs, // orderBy, 
    getDoc, updateDoc, // deleteDoc, setDoc, 
    increment, // serverTimestamp,
    writeBatch,
} from 'firebase/firestore'

import { useNavigate } from 'react-router-dom'

import { 
    useUserRecords, 
    useFirestore, 
    useWorkspaceHandler, 
    useErrorControl,
    useUsage,
} from '../../system/WorkboxesProvider'

import { isMobile } from '../../index'

import uploadCloudIcon from '../../../assets/cloud_upload.png'

const WorkspaceSaveDialog = (props) => {

    const
        { setSaveDialogState } = props,
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        dialogStateRef = useRef(null),
        userRecords = useUserRecords(),
        db = useFirestore(),
        cancelRef = useRef(null),
        [alertState, setAlertState] = useState('ready'),
        // workspaceRecordRef = useRef(null),
        toast = useToast({duration:3000}),
        errorControl = useErrorControl(),
        navigate = useNavigate(),
        usage = useUsage()

    const doClose = () => {
        setSaveDialogState(false)
    }

    const setAutomaticSave = () => {

        // ---- set save MODE ----
        workspaceHandler.settings.mode = 'automatic'
        dispatchWorkspaceHandler()
        doClose()
    }

    const setManualSave = () => {
        
        // ---- set save MODE ----
        workspaceHandler.settings.mode = 'manual'
        dispatchWorkspaceHandler()
        doClose()
    }

    async function reloadWorkspace() {
        const 
            dbcollection = collection(db, 'users', userRecords.user.profile.user.id,'workspaces'),
            workspaceID = workspaceHandler.workspaceRecord.profile.workspace.id,
            dbdocRef = doc(dbcollection,workspaceID)

        let dbdoc
        try {
            dbdoc = await getDoc(dbdocRef)
        } catch(error) {
            console.log('error in reload workspace', error)
            errorControl.push({description:'error in reload workspace', error})
            navigate('/error')
            return
        }

        if (dbdoc.exists()) {
            const 
                workspaceData = dbdoc.data(),
                workspaceName = workspaceData.profile.workspace.name,
                dbuserDocRef = doc(db,'users',userRecords.user.profile.user.id),
                updateData = 
                    isMobile
                        ? {'workspace.mobile': {id:workspaceID, name:workspaceName}}
                        : {'workspace.desktop': {id:workspaceID, name:workspaceName}}

            try {
                await updateDoc(dbuserDocRef,updateData)
            } catch(error) {
                console.log('error in update user workspace after reload', error)
                errorControl.push({description:'error in update user workspace after reload', error})
                navigate('/error')
                return
            }

            // ---- set RELOAD workspace data ----
            workspaceHandler.workspaceRecord = workspaceData
            workspaceHandler.workspaceSelection.id = workspaceID
            workspaceHandler.workspaceSelection.name = workspaceName
            workspaceHandler.resetChanged()
            workspaceHandler.flags.new_workspace = true
            dispatchWorkspaceHandler()
            doClose()

        } else {
            toast({description:'this workspace record no longer exists'})
        }
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
                        <Text>
                            The <span style = {{fontWeight:'bold'}}>Automatic saves</span> setting (the default) saves workspace panel configuration changes 
                            immediately, or quickly. This includes 
                        </Text>
                        <Text>
                            - adding, removing, re-sorting, and renaming panels
                        </Text>
                        <Text>
                            - adding, removing, and moving windows in panels
                        </Text>
                        <Text>
                            With the <span style = {{fontWeight:'bold'}}>Manual saves</span> setting, configuration
                            changes are only saved when you click the cloud upload icon <img style = 
                            {{display: 'inline-block', height:'16px', width:'16px', verticalAlign:'middle'}} src = {uploadCloudIcon} />.
                        </Text>
                        <Text>
                            Manual saves can be helpful if your login is concurrently using more than one tab or device with
                            the same workspace. Automatic saves in that case can clobber each others' configuration settings.
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
                          Automatic saves
                        </Button>
                        <Button size = 'xs' isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'red'
                            onClick = {setManualSave}
                        >
                          Manual saves
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