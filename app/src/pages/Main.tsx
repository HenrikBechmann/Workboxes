// Main.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
 TODO
 - recover from failed update to workspace record if another tab deleted the workspace
 - disallow workspace delete with manual updates. But allow reset

*/

import React, { useState, useEffect } from 'react'
import { Box, useToast } from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import { useUserRecords, useWorkspaceHandler } from '../system/WorkboxesProvider'

import Workspace from '../components/workholders/Workspace'

// Bootstrap: setupWorkspace() is called; after that loadWorkspace below for switches;
//      switches are triggered by setWorkspaceSelection in Toolbar_Standard
export const Main = (props) => {
    const
        [mainState, setMainState] = useState('setup'),
        userRecords = useUserRecords(),
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(), // selection for toolbar, and to get workspaceData
        toast = useToast({duration:4000, isClosable:true}),
        navigate = useNavigate()

    // for setup
    async function setupWorkspace() {

        const result = await workspaceHandler.setupWorkspace() // userRecords.user)

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

    // for switch
    async function loadWorkspace(workspaceID) {

        const result = await workspaceHandler.loadWorkspace(workspaceID) // , userRecords.user)

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

    useEffect(()=>{

        setupWorkspace() // setup only

    },[])

    // workspaceHandler.workspaceRecord always exists
    // this is the switch controller
    useEffect(()=>{

        if (mainState == 'setup') return // setting workspace is underway

        if (!workspaceHandler.workspaceSelection.id) { // defensive; shouldn't happen

            setupWorkspace()
            return

        }

        // switch has occurred
        // if (workspaceHandler.workspaceRecord.profile.workspace.id !== workspaceHandler.workspaceSelection.id) {
            // console.log('loading workspace',workspaceHandler.workspaceSelection)

            loadWorkspace(workspaceHandler.workspaceSelection.id)

        // }

    // },[workspaceHandler.workspaceSelection.id, mainState])
    },[workspaceHandler.workspaceSelection, mainState])

    return ((mainState == 'ready') && <Workspace />)
}

export default Main
