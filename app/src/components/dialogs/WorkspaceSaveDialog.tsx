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
    getDoc, // deleteDoc, setDoc, updateDoc
    increment, // serverTimestamp,
    writeBatch,
} from 'firebase/firestore'

import { useNavigate } from 'react-router-dom'

import { 
    useUserRecords, 
    useFirestore, 
    useWorkspaceConfiguration, 
    useErrorControl,
    useUsage,
} from '../../system/WorkboxesProvider'

import uploadCloudIcon from '../../../assets/cloud_upload.png'

const WorkspaceSaveDialog = (props) => {

    const
        { setSaveDialogState } = props,
        dialogStateRef = useRef(null),
        userRecords = useUserRecords(),
        db = useFirestore(),
        cancelRef = useRef(null),
        [alertState, setAlertState] = useState('ready'),
        workspaceRecordRef = useRef(null),
        toast = useToast({duration:3000}),
        errorControl = useErrorControl(),
        navigate = useNavigate(),
        usage = useUsage()

    const doClose = () => {
        setSaveDialogState(false)
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
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button mr = '10px' size = 'xs' isDisabled = {alertState == 'processing'} ref={cancelRef} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button size = 'xs' isDisabled = {alertState == 'processing'} colorScheme = 'blue'
                            onClick = {doClose}
                        >
                          Automatic saves
                        </Button>
                        <Button size = 'xs' isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'red'
                            onClick = {doClose}
                        >
                          Manual saves
                        </Button>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default WorkspaceSaveDialog