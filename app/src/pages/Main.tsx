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

import { useFirestore, useUserRecords, useWorkspaceSelection } from '../system/WorkboxesProvider'
import { updateDocumentSchema } from '../system/utilities'
import Workspace from '../components/workholders/Workspace'
import { isMobile } from '../index'

export const Main = (props) => {
    const
        [mainState, setMainState] = useState('setup'),
        userRecords = useUserRecords(),
        workspaceSelection = useWorkspaceSelection(), // selection for toolbar, and to get workspaceData
        [workspaceRecord, setWorkspaceRecord] = useState(null), // full data for Workspace component
        db = useFirestore(),
        toast = useToast()

    async function getStartingWorkspaceData() {

        let workspaceSelectionRecord

        // try to get workspaceSelection from most recent usage
        const 
            userWorkspaceData = userRecords.user.workspace,
            mobileID = userWorkspaceData.mobile.id,
            desktopID = userWorkspaceData.desktop.id,
            workspaceID = 
                isMobile
                    ? mobileID || desktopID
                    : desktopID || mobileID,
            workspaceIDtype = 
                !workspaceID // neither mobile nor desktop workspaceID was found
                    ? isMobile
                        ? 'mobile'
                        : 'desktop'
                    : mobileID === workspaceID
                        ? 'mobile'
                        : 'desktop',
            userProfileInfo = userRecords.user.profile.user

        // console.log('workspaceIDtype, mobileID, desktopID, workspaceID',workspaceIDtype, mobileID, desktopID, workspaceID)

        if (workspaceID) { // get existing workspace
            const 
                workspaceDocRef = doc(collection(db,'users',userProfileInfo.id,'workspaces'),workspaceID),
                dbdoc = await getDoc(workspaceDocRef)

            workspaceSelectionRecord = dbdoc.data()

            const updatedWorkspaceRecord = updateDocumentSchema('workspaces','standard',workspaceSelectionRecord)

            if (!Object.is(workspaceSelectionRecord, updatedWorkspaceRecord)) {
                await setDoc(workspaceDocRef, updatedWorkspaceRecord)
                workspaceSelectionRecord = updatedWorkspaceRecord
            }

            toast({description:`loaded workspace last used on ${workspaceIDtype}`})

        } else { // create first workspace record

            const workspaceDocRef = doc(collection(db,'users',userProfileInfo.id,'workspaces'))

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
                        id: userProfileInfo.id,
                        name: userProfileInfo.name,
                    },
                    commits: {
                        created_by: {
                            id: userProfileInfo.id, 
                            name: userProfileInfo.name
                        },
                        created_timestamp: serverTimestamp(),
                    },
                }
            })

            workspaceSelectionRecord = workspaceRecord

            await setDoc(workspaceDocRef,workspaceRecord)

            const userUpdateData = 
                isMobile
                    ? {'workspace.mobile': {id:workspaceDocRef.id, name:'Main workspace'}}
                    : {'workspace.desktop': {id:workspaceDocRef.id, name:'Main workspace'}}

                userUpdateData['profile.counts.workspaces'] = increment(1)

            await updateDoc(doc(collection(db,'users'),userProfileInfo.id),userUpdateData)

            toast({description:`created new workspace`})

        }

        setWorkspaceRecord(workspaceSelectionRecord)
        const { setWorkspaceSelection } = workspaceSelection
        setWorkspaceSelection({ // distribute workspaceSelection
            id: workspaceSelectionRecord.profile.workspace.id,
            name: workspaceSelectionRecord.profile.workspace.name,
            setWorkspaceSelection,
        })
        setMainState('ready')

    }

    useEffect(()=>{

        getStartingWorkspaceData() // setup only

    },[])

    return ((mainState != 'setup') && <Workspace workspaceData = {workspaceRecord}/>)
}

export default Main
