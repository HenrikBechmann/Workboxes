// Main.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    TODO
        - provide message to user 'loading workspace last used on {mobile/desktop}'
        - save mobile window positions separately
        - use dbdoc.exists() to verify doc's existence
        - search for default workspace if no id is listed in user record

*/

import React, { useRef, useState, useEffect } from 'react'
import { Box, useToast } from '@chakra-ui/react'
import {  collection, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

import { useFirestore, useUserRecords, useWorkspaceSelection, useErrorControl, useUsage } from '../system/WorkboxesProvider'
import { updateDocumentSchema } from '../system/utilities'
import Workspace from '../components/workholders/Workspace'
import { isMobile } from '../index'

export const Main = (props) => {
    const
        [mainState, setMainState] = useState('setup'),
        mainStateRef = useRef(null),
        userRecords = useUserRecords(),
        workspaceSelection = useWorkspaceSelection(), // selection for toolbar, and to get workspaceData
        [workspaceRecord, setWorkspaceRecord] = useState(null), // full data for Workspace component
        workspaceRecordRef = useRef(null),
        panelDataRef = useRef(null),
        db = useFirestore(),
        toast = useToast({duration:3000}),
        errorControl = useErrorControl(),
        navigate = useNavigate(),
        usage = useUsage()

    workspaceRecordRef.current = workspaceRecord
    mainStateRef.current = mainState

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

        // console.log('userRecords, userWorkspaceData', {...userRecords}, {...userWorkspaceData})

        if (workspaceID) { // get existing workspace
            const 
                workspaceDocRef = doc(collection(db,'users',userProfileInfo.id,'workspaces'),workspaceID)

            let dbdoc 
            let writes = 0
            try {
                dbdoc = await getDoc(workspaceDocRef)

                if (!dbdoc.exists()) { // TODO this can be corrected by nulling source and searching for default workspace
                    throw('expected workspaceID not found in database ['+ workspaceID + '] for user record [' + userProfileInfo.id + ']')
                }

                workspaceSelectionRecord = dbdoc.data()

                // console.log('workspaceID, userProfileInfo.id, workspaceSelectionRecord',workspaceID, userProfileInfo.id, {...workspaceSelectionRecord})

                const updatedWorkspaceRecord = updateDocumentSchema('workspaces','standard',workspaceSelectionRecord)

                if (!Object.is(workspaceSelectionRecord, updatedWorkspaceRecord)) {
                    await setDoc(workspaceDocRef, updatedWorkspaceRecord)
                    workspaceSelectionRecord = updatedWorkspaceRecord
                    writes++
                }
            } catch (error) {

                errorControl.push({description:'error getting starting workspace data in Main', error})
                navigate('/error')
                return

            }
            usage.read(1)
            usage.write(writes)
            toast({description:`loaded workspace last used on ${workspaceIDtype}`})

        } else { // create first workspace record

            const 
                workspaceDocRef = doc(collection(db,'users',userProfileInfo.id,'workspaces')),
                workspaceRecord = updateDocumentSchema('workspaces','standard',{},{
                    profile: {
                        workspace:{
                            name: 'Main workspace (default)',
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
                            updated_by: {
                                id: userProfileInfo.id, 
                                name: userProfileInfo.name
                            },
                            updated_timestamp: serverTimestamp(),
                        },
                        flags: {
                            is_default: true,
                        }
                    }
                })

            workspaceSelectionRecord = workspaceRecord

            try {
                const batch = writeBatch(db)
                batch.set(workspaceDocRef,workspaceRecord)

                const userUpdateData = 
                    isMobile
                        ? {'workspace.mobile': {id:workspaceDocRef.id, name:'Main workspace (default)'}}
                        : {'workspace.desktop': {id:workspaceDocRef.id, name:'Main workspace (default)'}}

                    userUpdateData['profile.counts.workspaces'] = increment(1)

                batch.update(doc(collection(db,'users'),userProfileInfo.id),userUpdateData)
                
                await batch.commit()

            } catch (error) {

                console.log('error saving new workspace data', error)
                errorControl.push({description:'error saving new workspace data in Main', error})
                navigate('/error')
                return
            }
            usage.create(1)
            usage.write(1)
            toast({description:`created new workspace`})

        }

        setWorkspaceRecord(workspaceSelectionRecord) // for Workspace component

        const { setWorkspaceSelection } = workspaceSelection // for standard toolbar component
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

    useEffect(()=>{

        return () => {

            if (document.visibilityState != 'hidden') {
                console.log('cleanup of main page')
                // save workspace data
            }

        }

    },[])


    async function getNewWorkspaceData(workspaceID) {

        const 
            workspaceRecordRef = doc(collection(db,'users',userRecords.user.profile.user.id,'workspaces'),workspaceID)

        let dbdoc 
        try {

            dbdoc = await getDoc(workspaceRecordRef)

        } catch (error) {

            console.log('error getting new workspace data', error)
            errorControl.push({description:'error getting new workspace data in Main', error})
            navigate('/error')
            return
        }
        usage.read(1)
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
            errorControl.push({description:'in update user doc for workspace in Main', error})
            navigate('/error')
            return
        }
        usage.write(1)
        setWorkspaceRecord(workspaceData)

    }

    useEffect(()=>{

        if (mainStateRef.current == 'setup') return // handled by startup
            // console.log('workspaceSelection', workspaceSelection)
        if (workspaceRecordRef.current.profile.workspace.id != workspaceSelection.id) {
            getNewWorkspaceData(workspaceSelection.id)
        }

    },[workspaceSelection])

    return ((mainState != 'setup') && <Workspace panelDataRef = {panelDataRef} workspaceData = {workspaceRecord}/>)
}

export default Main
