// Administration.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    general admin functions

*/

import React, {useEffect, useRef, useState, useMemo} from 'react'

import { Box, VStack, Text, Button, UnorderedList, ListItem, Select } from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import { 
    doc, collection, 
    getDoc, setDoc, updateDoc, // deleteDoc
    query, where, orderBy, getDocs,
    arrayUnion, arrayRemove,
    increment, serverTimestamp,
    runTransaction, writeBatch,
} from 'firebase/firestore'

import { cloneDeep as _cloneDeep, isEqual as _isEqual } from 'lodash'

import { useFirestore, useUserRecords, useErrorControl } from '../system/WorkboxesProvider'

import { updateDocumentSchema } from '../system/utilities'

const contentBoxStyle = {
    flexBasis:'auto', 
    flexShrink: 0, 
    margin: '5px', 
    backgroundColor:'white', 
    height:'200px', 
    width: '300px', 
    border: '5px outset silver',
    paddingTop: '6px',
    overflow:'scroll',
}

const ContentBox = (props) => {

    const {children, styles} = props

    const renderStyle = {...contentBoxStyle, ...styles}

    return <Box style = {renderStyle}>
            <VStack data-type = 'vstack' padding = '3px' width = '100%'>
                {children}
            </VStack>
        </Box>
}

const Administration = (props) => {

    const
        [userSelectionSpecs] = useUserSelections(),
        [userID, setUserID] = useState(null),

        assertUser = useAssertUser(userID),
        assertUserHandle = useAssertUserHandle(userID),
        assertAccount = useAssertAccount(userID),
        assertDomain = useAssertDomain(userID),
        assertDomainWorkbox = useAssertDomainWorkbox(userID),
        assertMember = useAssertMember(userID),
        assertMemberWorkbox = useAssertMemberWorkbox(userID),
        assertWorkspace = useAssertWorkspace(userID),
        assertAccessMemberships = useAssertAccessMemberships(userID),
        assertConnectors = useAssertAccessMemberships(userID)

    const selectComponent = useMemo(()=>{

        if (!userSelectionSpecs) return null

        const {defaultUserID, userOptions} = userSelectionSpecs

        setUserID(defaultUserID)

        const component = <Select defaultValue = {defaultUserID} onChange = {(event) => {
            setUserID(event.target.value)
        }}>
            {userOptions}
        </Select>

        return component

    },[userSelectionSpecs])

    return (
    <Box data-type = 'page-content' width = '100%' display = 'flex' flexWrap = 'wrap'>
        <ContentBox>
            <Text>Select user account for administration</Text>
            {selectComponent}
        </ContentBox>
        <ContentBox styles = {{fontSize:'x-small'}}>
            <Text>Assert compliance of...</Text>
            <UnorderedList>
                <ListItem>[1]<b>user</b></ListItem>
                <ListItem>[2]<b>user handle</b></ListItem>
                <ListItem>user [3]<b>account</b></ListItem>
                <ListItem>user [4]<b>domain</b></ListItem>
                <ListItem>base [5]<b>domain workbox</b> and standard <b>resource connectors</b></ListItem>
                <ListItem>user domain [6]<b>member</b></ListItem>
                <ListItem>base [7]<b>domain member workbox</b> and <b>standard resource connectors</b></ListItem>
                <ListItem>default [8]<b>workspace</b> and <b>panel</b></ListItem>
                <ListItem>user/access/[9]<b>memberships</b>, subscriptions, forums documents</ListItem>
                <ListItem>[10]<b>connectors</b></ListItem>
            </UnorderedList>
            <Button colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
        <ContentBox>
            <Text>Assert compliance of...</Text>
            <UnorderedList>
                <ListItem>[1]<b>user</b></ListItem>
            </UnorderedList>
            <Button onClick = {assertUser} colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
        <ContentBox>
            <Text>Assert compliance of...</Text>
            <UnorderedList>
                <ListItem>[2]<b>user handle</b></ListItem>
            </UnorderedList>
            <Button onClick = {assertUserHandle} colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
        <ContentBox>
            <Text>Assert compliance of...</Text>
            <UnorderedList>
                <ListItem>user [3]<b>account</b></ListItem>
            </UnorderedList>
            <Button onClick = {assertAccount} colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
        <ContentBox>
            <Text>Assert compliance of...</Text>
            <UnorderedList>
                <ListItem>user [4]<b>domain</b></ListItem>
            </UnorderedList>
            <Button onClick = {assertDomain} colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
        <ContentBox>
            <Text>Assert compliance of...</Text>
            <UnorderedList>
                <ListItem>base [5]<b>domain workbox</b> and standard <b>resource connectors</b></ListItem>
            </UnorderedList>
            <Button onClick = {assertDomainWorkbox} colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
        <ContentBox>
            <Text>Assert compliance of...</Text>
            <UnorderedList>
                <ListItem>user domain [6]<b>member</b></ListItem>
            </UnorderedList>
            <Button onClick = {assertMember} colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
        <ContentBox>
            <Text>Assert compliance of...</Text>
            <UnorderedList>
                <ListItem>base [7]<b>domain member workbox</b> and <b>standard resource connectors</b></ListItem>
            </UnorderedList>
            <Button onClick = {assertMemberWorkbox} colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
        <ContentBox>
            <Text>Assert compliance of...</Text>
            <UnorderedList>
                <ListItem>default [8]<b>workspace</b> and <b>panel</b></ListItem>
            </UnorderedList>
            <Button onClick = {assertWorkspace} colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
        <ContentBox>
            <Text>Assert compliance of...</Text>
            <UnorderedList>
                <ListItem>user/access/[9]<b>memberships</b>, subscriptions, forums documents</ListItem>
            </UnorderedList>
            <Button onClick = {assertAccessMemberships} colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
        <ContentBox>
            <Text>Assert compliance of...</Text>
            <UnorderedList>
                <ListItem>[10]<b>connectors</b>, subscriptions, forums documents</ListItem>
            </UnorderedList>
            <Button onClick = {assertConnectors} colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
    </Box>)

}

const useUserSelections = () => {

    const 
        userListRef = useRef(null),
        defaultValueRef = useRef(null),
        db = useFirestore(),
        [userSelectionSpecs, setUserSpecs] = useState(null)

    async function setUserOptions () { 

        const 
            q = query(collection(db, "users")),
            userRecords = await getDocs(q),
            list = []

        defaultValueRef.current = userRecords.docs[0]?.id
        userRecords.forEach((doc) => {
            list.push(
                <option key = {doc.id} value = {doc.id}>{doc.data().profile.user.name}</option>
            )
        })

        userListRef.current = list

        setUserSpecs({defaultUserID:defaultValueRef.current, userOptions:userListRef.current})

    }

    useEffect(()=>{

        setUserOptions()

    },[])

    return [userSelectionSpecs]
}

function useAssertUser(userID) {

    const 
        db = useFirestore(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    async function assertData() {

        const 
            userDocRef = doc(collection(db,'users'), userID),
            userRecord = await getDoc(userDocRef)

        if (userRecord.exists()) {
            console.log(`user record for ${userID} retrieved`, )
        } else {
            console.log(`user record for ${userID} NOT retrieved, aborting`)
            return
        }

        let update_count = 0

        let userRecordData = userRecord.data()

        console.log('retrieved version',userRecordData.version)

        const opening_version = userRecordData.version
        const opening_record = _cloneDeep(userRecordData)

        console.log('opening_record', opening_record)

        // todo run transformations
        userRecordData = updateDocumentSchema('users','standard',userRecordData,{},true) // force update

        console.log('asserted most recent version')

        console.log('closing_record',userRecordData)

        const isEqual = _isEqual(opening_record, userRecordData)

        console.log('isEqual',isEqual)

        if (!isEqual) update_count++

        const { profile, workspace } = userRecordData

        const commits = _cloneDeep(profile.commits)

        commits.created_timestamp = userRecordData.profile.commits.created_timestamp.toDate()
        commits.updated_timestamp = userRecordData.profile.commits.updated_timestamp.toDate()

        console.log('commits',commits)

        console.log('flags', profile.flags)

        console.log('version, generation', userRecordData.version, userRecordData.generation)

        if (userRecordData.version !== opening_version) {
            console.log('version number was updated')
            update_count++
        }

        const 
            account = profile.account,
            domain = profile.domain,
            handle = profile.handle.lower_case,
            workspace_mobile = workspace.mobile,
            workspace_desktop = workspace.mobile

        console.log('handle, account, domain, workspace_desktop, workspace_mobile\n',
            handle, account, domain, workspace_desktop, workspace_mobile)

        if (update_count) {

            await setDoc(userDocRef, userRecordData)

            console.log('updated user record with update_count',update_count)

        } else {

            console.log('no changes required')
        }

    }

    return () => {

        assertData()

    }
}

function useAssertUserHandle(userID) {

    const 
        db = useFirestore(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    async function assertData() {
    }

    return () => {

        assertData()

    }
}

function useAssertAccount(userID) {

    const 
        db = useFirestore(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    async function assertData() {
    }

    return () => {

        assertData()

    }
}

function useAssertDomain(userID) {

    const 
        db = useFirestore(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    async function assertData() {
    }

    return () => {

        assertData()

    }
}

function useAssertDomainWorkbox(userID) {

    const 
        db = useFirestore(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    async function assertData() {
    }

    return () => {

        assertData()

    }
}

function useAssertMember(userID) {

    const 
        db = useFirestore(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    async function assertData() {
        const
            userCollection = collection(db,'users'),
            userDoc = userID?await getDoc(doc(userCollection,userID)):null,
            userRecord = userDoc?userDoc.data():null,
            workboxCollection = collection(db, 'workboxes'),
            userDomainID = userRecord.profile.domain.id,
            memberCollection = collection(db, 'domains', userDomainID, 'members'),
            membersQuery = query(memberCollection,where('profile.user.id','==',userID)),
            memberDocs = await getDocs(membersQuery),
            userMemberRecord = memberDocs.docs[0].data()

        if (!userRecord) {
            alert('user not found')
            return
        }

        console.log('userMemberRecord:userDomainID, useMemberRecord',userDomainID, userMemberRecord)

    }

    return () => {

        assertData()

    }

}

function useAssertMemberWorkbox(userID) {

    const 
        db = useFirestore(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    async function assertData() {
    }

    return () => {

        assertData()

    }
}

function useAssertWorkspace(userID) {

    const 
        db = useFirestore(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    async function assertData() {
    }

    return () => {

        assertData()

    }
}

function useAssertAccessMemberships(userID) {

    const 
        db = useFirestore(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    async function assertData() {
    }

    return () => {

        assertData()

    }
}

function useAssertConnectors(userID) {

    const 
        db = useFirestore(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    async function assertData() {
    }

    return () => {

        assertData()

    }
}

// ===================================================
        // for assertMember:
        //     let queryPayload
        //     // ------------------[ database interaction ]-----------------
        //     try {
        //         queryPayload = await getDocs(membersQuery)
        //         if (queryPayload.size) {
        //             alert('members collection alerady exists')
        //             return
        //         }
        //     } catch(error) {
        //         const errdesc = 'administration error create member records'
        //         console.log(errdesc, error)
        //         errorControl.push({description:errdesc, error})
        //         navigate('/error')
        //         return
        //     }
        //     // --------------------

        //     const 
        //         // userDomainWorkboxID = userRecords.domain.profile.workbox.id,
        //         memberRecordRef = doc(memberCollection),
        //         memberWorkboxRef = doc(workboxCollection)

        //     let
        //         userDomainWorkbox

        //     // ------------------[ database interaction ]-----------------
        //     try {
        //         const userDomainWorkboxDoc = await getDoc(doc(workboxCollection, userDomainWorkboxID))
        //         if (userDomainWorkboxDoc.exists()) {
        //             userDomainWorkbox = userDomainWorkboxDoc.data()
        //         } else {
        //             alert ('domainWorkboxDoc not found')
        //             return
        //         }
        //     } catch (error) {
        //         const errdesc = 'administration error getting domain workbox record'
        //         console.log(errdesc, error)
        //         errorControl.push({description:errdesc, error})
        //         navigate('/error')
        //         return
        //     }
        //     // --------------------
            
        //     console.log('userRecord, userDomainWorkbox',userRecord, userDomainWorkbox)

        //     const panelMemberRecord = updateDocumentSchema('members','standard',{},{
        //         profile: {
        //             user: {
        //               id:userRecord.profile.user.id,
        //               name: userRecord.profile.user.name,
        //             },
        //             member: {
        //               id:memberRecordRef.id,
        //               name: userRecord.profile.user.name,
        //               image: {
        //                 source: userRecord.profile.user.image.source
        //               },
        //               location: userRecord.profile.user.location,
        //               description: userRecord.profile.user.description,
        //               date_joined: serverTimestamp(),
        //             },
        //             handle: {
        //               plain: userRecord.profile.handle.plain,
        //               lower_case: userRecord.profile.handle.lower_case,
        //             },
        //             domain: {
        //               id: userRecord.profile.domain.id,
        //               name: userRecord.profile.domain.name,
        //             },
        //             workbox: {
        //               id: memberWorkboxRef.id,
        //               name: userRecord.profile.user.name,
        //             },
        //             commits: {
        //               created_by: {
        //                   id:userRecord.profile.user.id,
        //                   name: userRecord.profile.user.name,
        //               },
        //               created_timestamp: serverTimestamp(),
        //               updated_by: {
        //                   id:userRecord.profile.user.id,
        //                   name: userRecord.profile.user.name,
        //               },
        //               updated_timestamp: serverTimestamp(),                  
        //             },
        //             counts:{
        //                 workboxes: 1
        //             }

        //         }}
        //     )

        //     const memberWorkbox = updateDocumentSchema('workboxes','member',{},{

        //         profile: {
        //             workbox: {
        //               id: memberWorkboxRef.id,
        //               name: userRecord.profile.user.name,
        //               image: {
        //                 source: userRecord.profile.user.image.source
        //               },
        //             },
        //             user: {
        //               id:userRecord.profile.user.id,
        //               name: userRecord.profile.user.name,
        //             },
        //             member: {
        //               id:memberRecordRef.id,
        //               name: userRecord.profile.user.name,
        //             },
        //             owner: {
        //               id:userRecord.profile.user.id,
        //               name: userRecord.profile.user.name,
        //             },
        //             domain: {
        //               id: userRecord.profile.domain.id,
        //               name: userRecord.profile.domain.name,
        //             },
        //             type: {
        //               name: "member",
        //               alias: "Member",
        //               image: {
        //                 source: null,
        //               },
        //             },
        //             commits: {
        //               created_by: {
        //                   id:userRecord.profile.user.id,
        //                   name: userRecord.profile.user.name,
        //               },
        //               created_timestamp: serverTimestamp(),
        //               updated_by: {
        //                   id:userRecord.profile.user.id,
        //                   name: userRecord.profile.user.name,
        //               },
        //               updated_timestamp: serverTimestamp(),
        //             },
        //         },
        //         document: {
        //             sections: [
        //               {
        //                 name: "standard",
        //                 alias: "Standard",
        //                 position: 0,
        //                 data: {
        //                   name: userRecord.profile.user.name,
        //                   image: {
        //                     source: userRecord.profile.user.image.source
        //                   },
        //                   description: userRecord.profile.user.description,
        //                   summary: null,
        //                 },
        //               },
        //             ],
        //         },
        //     })

        //     console.log('panelMemberRecord, memberWorkbox',panelMemberRecord, memberWorkbox)

        //     // ------------------[ database interaction ]-----------------
        //     const batch = writeBatch(db)
        //     try {
        //         batch.set(memberRecordRef,panelMemberRecord)
        //         batch.set(memberWorkboxRef,memberWorkbox)
        //         await batch.commit()
        //     } catch (error) {
        //         const errdesc = 'administration error writing panelMemberRecord and memberWorkbox to database'
        //         console.log(errdesc, error)
        //         errorControl.push({description:errdesc, error})
        //         navigate('/error')
        //         return
        //     }
        //     // --------------------

        //     alert('Done.')


export default Administration