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
    useWorkspaceSelection, 
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
        workspaceSelection = useWorkspaceSelection(),
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
                            <span style = {{fontWeight:'bold'}}>Automated saves</span> (the default) saves workspace panel configuration changes 
                            immediately (or quickly). This includes adding, removing, re-sorting, and renaming panels, 
                            and adding or removing windows in panels.
                        </Text>
                        <Text>
                            <span style = {{fontWeight:'bold'}}>Manual saves</span> don't do any of that. Configuration
                            changes are only saved when you click the cloud upload icon <img style = 
                            {{display: 'inline-block', height:'16px', width:'16px', verticalAlign:'middle'}} src = {uploadCloudIcon} />.
                        </Text>
                        <Text>Manual saves can be helpful if your login is using more than one tab or device with
                        the same workspace. Automated saves in that case can clobber each others' configuration settings.</Text>
                        <Text><span style = {{fontWeight:'bold'}}>Another option</span> is to set save to manual, experiment with configurations, and then
                        use the <span style = {{fontWeight:'bold'}}>Save as...</span> option to save your work, without clobbering the original workspace.</Text>
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
                          Automated saves
                        </Button>
                        <Button size = 'xs' isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'red'
                            onClick = {doClose}
                        >
                          Manual saves
                        </Button>
                        <Button size = 'xs' isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'green'
                            onClick = {doClose}
                        >
                          Save as...
                        </Button>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default WorkspaceSaveDialog