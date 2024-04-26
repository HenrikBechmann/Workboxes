// Main.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import {  doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore'

import { useFirestore, useUserRecords } from '../system/WorkboxesProvider'
import Workspace from '../components/workholders/Workspace'

export const Main = (props) => {
    const
        [mainState, setMainState] = useState('setup'),
        userRecords = useUserRecords(),
        [workspaceData, setWorkspaceData] = useState(null),
        db = useFirestore()

    async function getWorkspaceData() {

        let workspaceData

        const workspaceID = userRecords.user.workspace.id

        if (workspaceID) {
            const workspaceDoc = await getDoc(doc(db, 'users/workspaces',workspaceID))
            workspaceData = workspaceDoc.data()
        } else { // create a workspace record
            // check to see fi there are any worspace records, otherwise create one.
        }

        setWorkspaceData(workspaceData)
        setMainState('ready')

    }

    useEffect(()=>{

        getWorkspaceData() // setup only

    },[])

    return ((mainState != 'setup') && <Workspace workspaceData = {workspaceData}/>)
}

export default Main
