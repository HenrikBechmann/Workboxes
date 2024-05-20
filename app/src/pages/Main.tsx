// Main.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
 TODO
 - recover from failed update to workspace record if another tab deleted the workspace
 - disallow workspace delete with manual updates. But allow reset

*/

import React, { useRef, useState, useEffect } from 'react'
import { Box, useToast } from '@chakra-ui/react'
import {  
    collection, doc, getDoc, getDocs, 
    setDoc, updateDoc, increment, serverTimestamp, 
    writeBatch, query 
} from 'firebase/firestore'

import { useNavigate } from 'react-router-dom'

import { useFirestore, useUserRecords, useWorkspaceHandler, useErrorControl, useUsage } from '../system/WorkboxesProvider'

import { updateDocumentSchema } from '../system/utilities'
import Workspace from '../components/workholders/Workspace'
import { isMobile } from '../index'

export const Main = (props) => {
    const
        [mainState, setMainState] = useState('setup'),
        mainStateRef = useRef(null),
        userRecords = useUserRecords(),
        [workspaceHandler, dispatchWorkspaceHandler, workspacePayload] = useWorkspaceHandler(), // selection for toolbar, and to get workspaceData
        panelDataRef = useRef(null),
        db = useFirestore(),
        toast = useToast({duration:3000}),
        errorControl = useErrorControl(),
        navigate = useNavigate(),
        usage = useUsage()

    // console.log('running MAIN', mainState)

    mainStateRef.current = mainState

    // TODO consolidate error handling
    async function setupWorkspace() {

        const result = await workspaceHandler.setupWorkspace(userRecords.user)

        if (result.error) {

            navigate('/error')
            return

        } else {

            if (result.description) {
                toast({description:result.description})
            }

            dispatchWorkspaceHandler('setup')

            setMainState('ready')

        }

    }

    useEffect(()=>{

        setupWorkspace() // setup only

    },[])

    async function loadWorkspaceData(workspaceID) {

        const 
            dbWorkspaceRecordRef = doc(collection(db,'users',userRecords.user.profile.user.id,'workspaces'),workspaceID)

        let dbdoc 
        try {

            dbdoc = await getDoc(dbWorkspaceRecordRef)

        } catch (error) {

            console.log('error getting new workspace data', error)
            errorControl.push({description:'error getting new workspace data in Main', error})
            navigate('/error')
            return
        }
        usage.read(1)
        if (!dbdoc.exists()) {
            toast({description:'requested workspace record does not exist. Reloading...'})
            setupWorkspace()
            return
        }
        const
            workspaceData = dbdoc.data(),
            workspaceName = workspaceData.profile.workspace.name

        const userUpdateData = 
            isMobile
                ? {'workspace.mobile': {id:workspaceID, name:workspaceName}}
                : {'workspace.desktop': {id:workspaceID, name:workspaceName}}

            // userUpdateData['profile.counts.workspaces'] = increment(1)

        // console.log('userUpdateData', userUpdateData)

        try {
            await updateDoc(doc(collection(db,'users'),userRecords.user.profile.user.id),userUpdateData)
        } catch (error) {
            console.log('error in update user doc for workspace', error)
            errorControl.push({description:'error in update user doc for workspace in Main', error})
            navigate('/error')
            return
        }
        usage.write(1)

        // ---- DISTRIBUTE loaded workspace record ----
        workspaceHandler.workspaceRecord = workspaceData
        workspaceHandler.clearChanged()
        workspaceHandler.flags.new_workspace = true

        dispatchWorkspaceHandler('load')

    }

    // workspaceHandler.workspaceRecord always exists
    useEffect(()=>{

        if (mainStateRef.current == 'setup') return // handled by startup

        if (!workspaceHandler.workspaceSelection.id) { // contingency

            setupWorkspace()
            return

        }

        if (workspaceHandler.workspaceRecord.profile.workspace.id !== workspaceHandler.workspaceSelection.id) {

            loadWorkspaceData(workspaceHandler.workspaceSelection.id)

        }

    },[workspacePayload])

    // return ((mainState == 'ready') && (workspaceHandler.workspaceRecord) && <Workspace panelDataRef = {panelDataRef}/>)
    return ((mainState == 'ready') && <Workspace panelDataRef = {panelDataRef}/>)
}

export default Main
