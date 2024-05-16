// WorkspaceDeleteDialog.tsx
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
    runTransaction,
} from 'firebase/firestore'

import { useNavigate } from 'react-router-dom'

import { 
    useUserRecords, 
    useFirestore, 
    useWorkspaceConfiguration, 
    useErrorControl,
    useUsage,
} from '../../system/WorkboxesProvider'

const WorkspaceDeleteDialog = (props) => {

    const 
        { setDeleteDialogState } = props,
        dialogStateRef = useRef(null),
        userRecords = useUserRecords(),
        db = useFirestore(),
        cancelRef = useRef(null),
        workspaceConfiguration = useWorkspaceConfiguration(),
        [alertState, setAlertState] = useState('ready'),
        [isDefaultState, setIsDefaultState] = useState(false),
        // workspaceRecordRef = useRef(null),
        toast = useToast({duration:3000}),
        errorControl = useErrorControl(),
        navigate = useNavigate(),
        usage = useUsage()

    useEffect(()=>{
        checkIsDefaultWorkspace()
    },[])

    const doClose = () => {

        // isOpen = false
        setDeleteDialogState(false)

    }

    function checkIsDefaultWorkspace() {

        setIsDefaultState(workspaceConfiguration.record.profile.flags.is_default)

    }

    async function doDeleteWorkspace() {

        // get default workspace
        const 
            dbWorkspaceCollection = collection(db,'users',userRecords.user.profile.user.id, 'workspaces'),
            dbWorkspaceQuery = query(dbWorkspaceCollection, where('profile.flags.is_default','==',true))

        let dbDefaultWorkspace
        try {
            dbDefaultWorkspace = await getDocs(dbWorkspaceQuery)
        } catch (error) {
            console.log('error fetching user workspace collection')
            errorControl.push({description:'error fetching user workspace collection from standard toolbar', error:'N/A'})
            navigate('/error')
            return
        }
        usage.read(1)
        let dbDefaultDoc, defaultWorkspace
        if (dbDefaultWorkspace.size == 1) {
            dbDefaultDoc = dbDefaultWorkspace.docs[0]
            defaultWorkspace = dbDefaultDoc.data()
        } else {
            // TODO should try to recover from this
            console.log('error fetching default workspace for delete workspace')
            errorControl.push({description:'error no default workspace record found to deleted workspace from standard toolbar', error:'N/A'})
            navigate('/error')
            return
        }

        const 
            previousWorkspaceName = workspaceConfiguration.workspace.name,
            defaultWorkspaceName = defaultWorkspace.profile.workspace.name

        // delete current workspace
        let panelCount
        try {
            const
                workspaceID = workspaceConfiguration.workspace.id,
                dbWorkspacePanelCollection = 
                    collection(db,'users',userRecords.user.profile.user.id, 'workspaces',workspaceID,'panels'),
                dbWorkspacePanelsQuery = query(dbWorkspacePanelCollection),
                dbPanelQueryResult = await getDocs(dbWorkspacePanelsQuery),
                dbPanelDocs = dbPanelQueryResult.docs

            panelCount = dbPanelQueryResult.size

            await runTransaction(db, async (transaction) => {
                for (const dbdoc of dbPanelDocs) {
                    transaction.delete(dbdoc.ref)
                }
                const workspaceDocRef = doc(collection(db,'users',userRecords.user.profile.user.id, 'workspaces'),workspaceID)
                transaction.delete(workspaceDocRef)
                transaction.update(doc(collection(db,'users'),userRecords.user.profile.user.id),{'profile.counts.workspaces':increment(-1)})
            })

        } catch (error) {
            // TODO should try to recover from this
            console.log('error deleting workspace or incrementing workspace count')
            errorControl.push({description:'error deleting workspace or incrementing workspace count from standard toolbar', error})
            navigate('/error')
            return
        }
        usage.read(panelCount)
        usage.delete(panelCount + 1)
        usage.write(1)

        // set current workspace to default
        const {setWorkspaceConfiguration} = workspaceConfiguration

        // ---- set NEW workspace ----
        setWorkspaceConfiguration((previousState)=>{ 
            previousState.workspace.id = defaultWorkspace.profile.workspace.id
            previousState.workspace.name = defaultWorkspace.profile.workspace.name
            return {...previousState} // get new workspace
        })

        toast({
            description: 
                `deleted [${previousWorkspaceName}] and replaced it with [${defaultWorkspaceName}]`
        })

        setDeleteDialogState(false)

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
                        {(!isDefaultState && (workspaceConfiguration.settings.mode == 'automatic')) && <Text>
                            Continue? The current workspace (<span style = {{fontStyle:'italic'}}>{workspaceConfiguration.workspace.name}</span>) will be deleted, 
                            and replaced by the default workspace.
                        </Text>}
                        {isDefaultState && <><Text>The workspace <span style = {{fontStyle:'italic'}}>{workspaceConfiguration.workspace.name}</span> cannot
                        be deleted because it is the default workspace. {(workspaceConfiguration.settings.mode == 'manual')
                        && '... and because workspace save is set to manual.'}</Text>
                        <Text mt = '6px'>But it can be reset, which would remove all of its panels other than
                        the default panel.</Text></>}
                        {(!isDefaultState && (workspaceConfiguration.settings.mode == 'manual')) && 
                        <><Text>The workspace <span style = {{fontStyle:'italic'}}>{workspaceConfiguration.workspace.name}</span> cannot
                        be deleted because it is set for manual saving, protecting other instances of this login. </Text>
                        <Text mt = '6px'>But it can be reset, which would remove all of its panels other than
                        the default panel.</Text></>}
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
                          {(!isDefaultState && (workspaceConfiguration.settings.mode == 'automatic')) && 'Delete'}
                          {(isDefaultState || (workspaceConfiguration.settings.mode == 'manual')) && 'Reset'}

                        </Button>
                    </AlertDialogFooter>


                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default WorkspaceDeleteDialog
