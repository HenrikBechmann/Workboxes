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

import Workspace from '../components/workholders/Workspace'
import { isMobile } from '../index'

export const Main = (props) => {
    const
        [mainState, setMainState] = useState('setup'),
        mainStateRef = useRef(null),
        userRecords = useUserRecords(),
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(), // selection for toolbar, and to get workspaceData
        db = useFirestore(),
        toast = useToast({duration:4000}),
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

            if (result.notice) {
                toast({description:result.notice})
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
            if (result.notice) {
                toast({description:result.notice})
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

    },[workspaceHandler.workspaceSelection.id]) // workspacePayload])

    // return ((mainState == 'ready') && (workspaceHandler.workspaceRecord) && <Workspace panelDataRef = {panelDataRef}/>)
    return ((mainState == 'ready') && <Workspace />)
}

export default Main
