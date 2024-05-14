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
                        Change saving behaviour for the workspace
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {alertState == 'processing' && <Text>Processing...</Text>}
                        <Text>
                            Continue?
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button isDisabled = {alertState == 'processing'} ref={cancelRef} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {alertState == 'processing'} colorScheme = 'blue'
                            onClick = {doClose}
                        >
                          Automated Saves
                        </Button>
                        <Button isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'red'
                            onClick = {doClose}
                        >
                          Manual Saves
                        </Button>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default WorkspaceSaveDialog