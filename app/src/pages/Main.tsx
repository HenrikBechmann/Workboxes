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

import { useFirestore, useUserRecords, useWorkspaceConfiguration, useErrorControl, useUsage } from '../system/WorkboxesProvider'

import { updateDocumentSchema } from '../system/utilities'
import Workspace from '../components/workholders/Workspace'
import { isMobile } from '../index'

export const Main = (props) => {
    const
        [mainState, setMainState] = useState('setup'),
        mainStateRef = useRef(null),
        userRecords = useUserRecords(),
        workspaceConfiguration = useWorkspaceConfiguration(), // selection for toolbar, and to get workspaceData
        panelDataRef = useRef(null),
        db = useFirestore(),
        toast = useToast({duration:3000}),
        errorControl = useErrorControl(),
        navigate = useNavigate(),
        usage = useUsage()

    // console.log('running MAIN', mainState)

    mainStateRef.current = mainState

    // TODO consolidate error handling
    async function getStartingWorkspaceData() {

        let workspaceSelectionRecord

        // --------------[ 1. try to get workspaceID from most recent usage ]-----------
        let workspaceID, workspaceIDtype, workspaceDoc
        const 
            userWorkspaceData = userRecords.user.workspace,
            mobileID = userWorkspaceData.mobile.id,
            desktopID = userWorkspaceData.desktop.id,
            userProfileInfo = userRecords.user.profile.user,
            workspaceCollection = collection(db,'users',userProfileInfo.id,'workspaces')

        workspaceID = 
            isMobile
                ? mobileID || desktopID
                : desktopID || mobileID

        workspaceIDtype = 
            !workspaceID // neither mobile nor desktop workspaceID was found
                ? isMobile
                    ? 'mobile'
                    : 'desktop'
                : mobileID === workspaceID
                    ? 'mobile'
                    : 'desktop'

        // ----------------[ 2. verify found workspaceID existence, and load if found ]---------------
        if (workspaceID) { 

            const workspaceDocRef = doc(workspaceCollection,workspaceID)

            try {

                workspaceDoc = await getDoc(workspaceDocRef)

                if (!workspaceDoc.exists()) { // TODO this can be corrected by nulling source and searching for default workspace
                    workspaceID = null
                } else {
                    workspaceSelectionRecord = workspaceDoc.data()
                    toast({description:`loaded workspace last used on ${workspaceIDtype}`})
                }

            } catch (error) {

                console.log('error getting starting workspace data in Main', error)
                errorControl.push({description:'error getting starting workspace data in Main', error})
                navigate('/error')
                return
            }
            usage.read(1)

        }

        // ---------------------[ 3. but if no previous workspace specified, or not found ]---------------
        // look for other existing workspace - default, or (as the last resort) first found
        if (!workspaceID) { 
            const workspaceDocs = []
            const q = query(workspaceCollection)
            try {

                const dbDocs = await getDocs(q)
                let found_default = false
                if (dbDocs.size) { // at least one found
                    console.log('dbDocs', dbDocs)
                    usage.read(dbDocs.size)
                    const docs = dbDocs.docs
                    // collect data, and look for default
                    for (let index = 0; index < dbDocs.size; index++) {
                        const dbdoc = docs[index]
                        const data = dbdoc.data()
                        workspaceDocs.push(data)
                        if (data.profile.flags.is_default) {
                            found_default = true
                            workspaceID = data.profile.workspace.id
                            workspaceSelectionRecord = data
                        }
                    }
                    if (!workspaceID) { // grab the first item, set it to default (edge case)
    
                        workspaceSelectionRecord = workspaceDocs[0]
                        workspaceID = workspaceSelectionRecord.profile.workspace.id
                        workspaceSelectionRecord.profile.flags.is_default = true
                        toast({description:'default not found; loaded first found workspace, and set it to default'})

                    } else {

                        toast({description:'loaded default workspace'})

                    }
                    // update version, or default flag
                    const updatedWorkspaceRecord = updateDocumentSchema('workspaces','standard',workspaceSelectionRecord)

                    if ((!Object.is(workspaceSelectionRecord, updatedWorkspaceRecord)) || !found_default) {
                        try {

                            const workspaceDocRef = doc(collection(db,'users',userProfileInfo.id,'workspaces'),workspaceID)
                            await setDoc(workspaceDocRef, updatedWorkspaceRecord)
                            workspaceSelectionRecord = updatedWorkspaceRecord

                        } catch (error) {

                            console.log('error updating workspace version in Main', error)
                            errorControl.push({description:'error updating workspace versoin in Main', error})
                            navigate('/error')
                            return

                        }
                        usage.write(1)
                    }

                    // update user record with new workspaceID
                    const name = workspaceSelectionRecord.profile.workspace.name
                    const userUpdateData = 
                        isMobile
                            ? {'workspace.mobile': {id:workspaceID, name}}
                            : {'workspace.desktop': {id:workspaceID, name}}

                    try {

                        await updateDoc(doc(collection(db,'users'),userProfileInfo.id),userUpdateData)

                    } catch (error) {

                        console.log('error updating workspace count for user in Main', error)
                        errorControl.push({description:'error updating workspace count for user in Main', error})
                        navigate('/error')
                        return

                    }
                    usage.write(1)

                } else {

                    usage.read(1) // for fail

                }

            } catch(error) {

                console.log('error getting workspace list in Main', error)
                errorControl.push({description:'error getting workspace list in Main', error})
                navigate('/error')
                return

            }
        }

        // ---------------------[ 4. if no workspaces exist, create first workspace record ]---------------
        if (!workspaceID) { 

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

        // ------------[ 5. by this time a workspaceSelectionRecord is guaranteed ]-------------
        const { setWorkspaceConfiguration } = workspaceConfiguration // for standard toolbar component

        // ---- DISTRIBUTE first workspace record ----
        setWorkspaceConfiguration((previousState) => { 
            previousState.workspace.id = workspaceSelectionRecord.profile.workspace.id
            previousState.workspace.name = workspaceSelectionRecord.profile.workspace.name
            previousState.record = workspaceSelectionRecord
            previousState.flags.new_workspace = true
            return {...previousState}
        })

        setMainState('ready')

    }

    useEffect(()=>{

        getStartingWorkspaceData() // setup only

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
            getStartingWorkspaceData()
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
        const { setWorkspaceConfiguration } = workspaceConfiguration

        // ---- DISTRIBUTE loaded workspace record ----
        setWorkspaceConfiguration((previousState)=>{ 
            previousState.record = workspaceData
            previousState.settings.changed = false
            previousState.changedRecords.workspace = null
            previousState.changedRecords.setwindowpositions.clear(),
            previousState.changedRecords.setpanels.clear()
            previousState.changedRecords.deletepanels.clear()
            previousState.flags.new_workspace = true
            return {...previousState}
        })

    }

    // workspaceConfiguration.record always exists
    useEffect(()=>{

        if (mainStateRef.current == 'setup') return // handled by startup

        if (!workspaceConfiguration.workspace.id) { // contingency

            getStartingWorkspaceData()
            return

        }

        if (workspaceConfiguration.record.profile.workspace.id !== workspaceConfiguration.workspace.id) {

            loadWorkspaceData(workspaceConfiguration.workspace.id)

        }

    },[workspaceConfiguration])

    // return ((mainState == 'ready') && (workspaceConfiguration.record) && <Workspace panelDataRef = {panelDataRef}/>)
    return ((mainState == 'ready') && <Workspace panelDataRef = {panelDataRef}/>)
}

export default Main
