// WorkspaceWriteDialog.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef, useState, useEffect} from 'react'

import {
    Button, Text, Input,
    Box,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    FormControl, FormLabel, FormErrorMessage, FormHelperText,
} from '@chakra-ui/react'

import { 
    doc, collection, 
    query, where, getDocs, orderBy, 
    getDoc, setDoc, updateDoc, deleteDoc, 
    increment, serverTimestamp,
    writeBatch,
} from 'firebase/firestore'

import { useNavigate } from 'react-router-dom'

import { updateDocumentSchema } from '../../system/utilities'

import { isMobile } from '../../index'

import { 
    // useUserAuthData, 
    useUserRecords, 
    // useAuth, 
    useFirestore, 
    useWorkspaceSelection, 
    useSystemRecords,
    useErrorControl,
    useUsage,
} from '../../system/WorkboxesProvider'

const WorkspaceWriteDialog = (props) => {

    const 
        { writeDialogState, setWriteDialogState } = props,
        dialogStateRef = useRef(null),
        systemRecords = useSystemRecords(),
        userRecords = useUserRecords(),
        db = useFirestore(),
        maxNameLength = systemRecords.settings.constraints.input.workspaceNameLength_max,
        minNameLength = systemRecords.settings.constraints.input.workspaceNameLength_min,
        focusRef = useRef(null),
        [writeValues, setWriteValues] = useState({name:null}),
        writeIsInvalidFieldFlagsRef = useRef({
            name: false,
        }),
        newInvocationRef = useRef(true),
        workspaceSelection = useWorkspaceSelection(),
        [alertState, setAlertState] = useState('ready'),
        writeIsInvalidFieldFlags = writeIsInvalidFieldFlagsRef.current,
        navigate = useNavigate(),
        errorControl = useErrorControl(),
        usage = useUsage()

    dialogStateRef.current = writeDialogState

    useEffect(()=>{
        if (newInvocationRef.current) {
            (dialogStateRef.current.action == 'changename')
                ? setWriteValues({name:workspaceSelection.name})
                : setWriteValues({name:''})
            if (dialogStateRef.current.action == 'createworkspace') {
                writeIsInvalidTests.name('')
            }
            newInvocationRef.current = false
        }
    },[newInvocationRef.current, workspaceSelection])


    const writeHelperText = {
        name:`The workspace name can be ${minNameLength}-${maxNameLength} characters long.`,
    }

    const writeErrorMessages = {
        name:`The name must be ${minNameLength} to ${maxNameLength} characters.`,
    }

    const onWriteChangeFunctions = {
        name:(event) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            writeIsInvalidTests.name(value)
            writeValues.name = value
            setWriteValues({...writeValues})
        },
    }

    const writeIsInvalidTests = {
        name: (value) => {
            let isInvalid = false
            if (value.length > maxNameLength || value.length < minNameLength) {
                isInvalid = true
            }
            writeIsInvalidFieldFlags.name = isInvalid
            return isInvalid
        },        
    }

    async function doSaveWrite() {
        if (writeIsInvalidFieldFlags.name) {
            // TODO use chakra Alert instead
            alert('Please correct errors before saving')
            return
        }
        setAlertState('processing')
        // changename user workspace data
        const 
            userRecord = userRecords.user,
            userDocRef = doc(collection(db, 'users'), userRecord.profile.user.id),
            workspaceID = workspaceSelection.id,
            workspaceDocRef = doc(collection(db, 'users',userRecord.profile.user.id, 'workspaces'), workspaceID),
            updateBlock = {}

        let fieldsToUpdateCount = 0

        if (workspaceID == userRecord.workspace.mobile.id) {
            updateBlock['workspace.mobile.name'] = writeValues.name
            fieldsToUpdateCount++
        }
        if (workspaceID == userRecord.workspace.desktop.id) {
            updateBlock['workspace.desktop.name'] = writeValues.name
            fieldsToUpdateCount++
        }
        try {
            const batch = writeBatch(db)

            if (fieldsToUpdateCount) {
                batch.update(userDocRef,updateBlock)
            }

            batch.update(workspaceDocRef, {
                'profile.workspace.name':writeValues.name
            })

            await batch.commit()

        } catch (error) {
            console.log('error updating workspace name from standard toolbar', error)
            errorControl.push({description:'error updating workspace name from standard toolbar', error})
            navigate('/error')   
            return         
        }
        usage.write(fieldsToUpdateCount?2:1)
        // changename workspaceSelection
        const { setWorkspaceSelection } = workspaceSelection
        setWorkspaceSelection((previousState) => {
            previousState.name = writeValues.name
            return {...previousState}
        })

        doClose()

    }

    async function doCreateWorkspace() {
        if (writeIsInvalidFieldFlags.name) {
            // TODO use chakra Alert instead
            alert('Please correct errors before saving')
            return
        }
        setAlertState('processing')
        // changename user workspace data
        const 
            userRecord = userRecords.user,
            userDocRef = doc(collection(db, 'users'), userRecord.profile.user.id),
            newWorkspaceDocRef = doc(collection(db, 'users',userRecord.profile.user.id, 'workspaces')),
            newWorkspaceRecord = updateDocumentSchema('workspaces','standard',{},{
                    profile: {
                        workspace:{
                            name: writeValues.name,
                            id: newWorkspaceDocRef.id,
                        },
                        device: {
                            name:isMobile?'mobile':'desktop',
                        },
                        owner: {
                            id: userRecord.profile.user.id,
                            name: userRecord.profile.user.name,
                        },
                        commits: {
                            created_by: {
                                id: userRecord.profile.user.id,
                                name: userRecord.profile.user.name,
                            },
                            created_timestamp: serverTimestamp(),
                            udpated_by: {
                                id: userRecord.profile.user.id,
                                name: userRecord.profile.user.name,
                            },
                            updated_timestamp: serverTimestamp(),
                        },
                    }
                })
        try {
            const batch = writeBatch(db)
            batch.set(newWorkspaceDocRef, newWorkspaceRecord)
            batch.update(doc(collection(db,'users'),userRecord.profile.user.id),{'profile.counts.workspaces':increment(1)})
            await batch.commit()
        } catch (error) {
            console.log('error creating new workspace record (or updating count) from standard toolbar', error)
            errorControl.push({description:'error creating new workspace record (or updating count) from standard toolbar', error})
            navigate('/error')
            return
        }
        usage.write(1)
        usage.create(1)
        // changename workspaceSelection
        const { setWorkspaceSelection } = workspaceSelection
        setWorkspaceSelection((previousState) => {
            previousState.name = writeValues.name
            previousState.id = newWorkspaceDocRef.id
            return {...previousState}
        })

        doClose()

    }

    const doClose = () => {
        newInvocationRef.current = true // TODO not required; dialog is destoroyed after use
        setWriteDialogState((previousState)=>{
            previousState.open = false
            return {...previousState}
        })
    }

    return (<>
        <AlertDialog
            isOpen={writeDialogState.open}
            leastDestructiveRef={focusRef}
            onClose={doClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {writeDialogState.action == 'changename' && 'Change the name of the current workspace.'}
                        {writeDialogState.action == 'createworkspace' && 'Create a new workspace.'}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {alertState == 'processing' && <Text>Processing...</Text>}
                        <Box data-type = 'namefield' margin = '3px' padding = '3px'>
                            <FormControl isDisabled = {alertState == 'processing'} minWidth = '300px' maxWidth = '400px' isInvalid = {writeIsInvalidFieldFlags.name}>
                                <FormLabel fontSize = 'sm'>Workspace name:</FormLabel>
                                <Input 
                                    value = {writeValues.name || ''} 
                                    size = 'sm'
                                    onChange = {onWriteChangeFunctions.name}
                                    ref = {focusRef}
                                >
                                </Input>
                                <FormErrorMessage>
                                    {writeErrorMessages.name} Current length is {writeValues.name?.length || '0 (blank)'}.
                                </FormErrorMessage>
                                <FormHelperText fontSize = 'xs' fontStyle = 'italic' >
                                    {writeHelperText.name} Current length is {writeValues.name?.length || '0 (blank)'}.
                                </FormHelperText>
                            </FormControl>
                        </Box>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button isDisabled = {alertState == 'processing'} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'blue'
                            onClick = {writeDialogState.action == 'changename'? doSaveWrite:doCreateWorkspace}
                        >
                          {writeDialogState.action == 'changename'?'Save':'Create'}
                        </Button>
                    </AlertDialogFooter>


                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default WorkspaceWriteDialog