// Main.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
 TODO
 - recover from failed update to workspace record if another tab deleted the workspace
 - disallow workspace delete with manual updates. But allow reset

*/

import React, { useRef, useState, useEffect } from 'react'
import { Box, useToast } from '@chakra-ui/react'

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
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(), // selection for toolbar, and to get workspaceData
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

            if (result.toast) {
                toast({description:result.toast})
            }

            dispatchWorkspaceHandler('setup')

            setMainState('ready')

        }

    }

    useEffect(()=>{

        setupWorkspace() // setup only

    },[])

    async function loadWorkspace(workspaceID) {

        const result = await workspaceHandler.loadWorkspace(workspaceID, userRecords.user)

        if (result.error) {
            navigate('error')
            return
        } else {
            if (result.toast) {
                toast({description:result.toast})
            }
            dispatchWorkspaceHandler('load')

        }

    }

    // workspaceHandler.workspaceRecord always exists
    useEffect(()=>{

        if (mainStateRef.current == 'setup') return // handled by startup

        if (!workspaceHandler.workspaceSelection.id) { // contingency

            setupWorkspace()
            return

        }

        if (workspaceHandler.workspaceRecord.profile.workspace.id !== workspaceHandler.workspaceSelection.id) {

            loadWorkspace(workspaceHandler.workspaceSelection.id)

        }

    },[workspaceHandler.workspaceRecord?.profile.workspace.id]) // workspacePayload])

    // return ((mainState == 'ready') && (workspaceHandler.workspaceRecord) && <Workspace panelDataRef = {panelDataRef}/>)
    return ((mainState == 'ready') && <Workspace panelDataRef = {panelDataRef}/>)
}

export default Main
