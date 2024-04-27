// Main.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    TODO
        - provide message to user 'loading workspace last used on {mobile/desktop}'
        - save mobile window positions separately

*/

import React, { useRef, useState, useEffect } from 'react'
import { Box, useToast } from '@chakra-ui/react'
import {  collection, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'

import { useFirestore, useUserRecords } from '../system/WorkboxesProvider'
import { updateDocumentSchema } from '../system/utilities'
import Workspace from '../components/workholders/Workspace'
import { isMobile } from '../index'

export const Main = (props) => {
    const
        [mainState, setMainState] = useState('setup'),
        userRecords = useUserRecords(),
        [workspaceData, setWorkspaceData] = useState(null),
        db = useFirestore(),
        toast = useToast()

    async function getWorkspaceData() {

        let workspaceSelectionData

        const 
            workspaceData = isMobile?userRecords.user.workspace.mobile.id:userRecords.user.workspace,
            mobileID = workspaceData.mobile.id,
            desktopID = workspaceData.desktop.id,
            workspaceID = 
                isMobile
                    ? mobileID || desktopID
                    : desktopID || mobileID,
            workspaceIDtype = 
                !workspaceID
                    ? isMobile
                        ? 'mobile'
                        : 'desktop'
                    : mobileID === workspaceID
                        ? 'mobile'
                        : 'desktop',
            userInfo = userRecords.user.profile

        // console.log('workspaceIDtype, mobileID, desktopID, workspaceID',workspaceIDtype, mobileID, desktopID, workspaceID)

        if (workspaceID) { // get existing workspace
            const 
                workspaceDocRef = doc(collection(db,'users',userInfo.user.id,'workspaces'),workspaceID),
                dbdoc = await getDoc(workspaceDocRef)

            workspaceSelectionData = dbdoc.data()

            const updatedData = updateDocumentSchema('workspaces','standard',workspaceSelectionData)

            if (!Object.is(workspaceSelectionData, updatedData)) {
                await setDoc(workspaceDocRef, updatedData)
                workspaceSelectionData = updatedData
            }

            toast({description:`loaded workspace last used on ${workspaceIDtype}`})

        } else { // create a workspace record

            const workspaceDocRef = doc(collection(db,'users',userInfo.user.id,'workspaces'))

            const workspaceRecord = updateDocumentSchema('workspaces','standard',{},{
                profile: {
                    workspace:{
                        name: 'Main workspace',
                        id: workspaceDocRef.id,
                    },
                    device: {
                        name:workspaceIDtype,
                    },
                    owner: {
                        id: userInfo.user.id,
                        name: userInfo.user.name,
                    },
                    commits: {
                        created_by: {
                            id: userInfo.user.id, 
                            name: userInfo.user.name
                        },
                        created_timestamp: serverTimestamp(),
                    },
                }
            })

            workspaceSelectionData = workspaceRecord

            await setDoc(workspaceDocRef,workspaceRecord)

            const userUpdateData = 
                isMobile
                    ? {'workspace.mobile': {id:workspaceDocRef.id, name:'Main workspace'}}
                    : {'workspace.desktop': {id:workspaceDocRef.id, name:'Main workspace'}}

            await updateDoc(doc(collection(db,'users'),userInfo.user.id),userUpdateData)

            toast({description:`created new workspace`})

        }

        setWorkspaceData(workspaceSelectionData)
        setMainState('ready')

    }

    useEffect(()=>{

        getWorkspaceData() // setup only

    },[])

    return ((mainState != 'setup') && <Workspace workspaceData = {workspaceData}/>)
}

export default Main
