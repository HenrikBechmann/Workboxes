// Administration.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    general admin functions
    - specify user to address admin to



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

import { useFirestore, useUserRecords, useErrorControl } from '../system/WorkboxesProvider'

import { updateDocumentSchema } from '../system/utilities'

const contentBoxStyle = {
    flexBasis:'auto', 
    flexShrink: 0, 
    margin: '5px', 
    backgroundColor:'white', 
    height:'300px', 
    width: '300px', 
    border: '5px outset silver',
    paddingTop: '6px',
}

const ContentBox = (props) => {

    const {children, style} = props

    const renderStyle = {...contentBoxStyle, ...style}

    return <Box style = {renderStyle}>
            <VStack data-type = 'vstack' padding = '3px' width = '100%'>
                {children}
            </VStack>
        </Box>
}

const Administration = (props) => {

    const
        [userSpecs] = useUserOptions(),
        [userID, setUserID] = useState(null),
        assertMemberRecord = useAssertMemberRecord(userID)

    const selectComponent = useMemo(()=>{

        if (!userSpecs) return null

        const {defaultUserID, userOptions} = userSpecs

        setUserID(defaultUserID)

        const component = <Select defaultValue = {defaultUserID} onChange = {(event) => {
            setUserID(event.target.value)
        }}>
            {userOptions}
        </Select>

        return component

    },[userSpecs])

    return (
    <Box data-type = 'page-content' width = '100%' display = 'flex' flexWrap = 'wrap'>
        <ContentBox>
            <Text>Select user account for administration</Text>
            {selectComponent}
        </ContentBox>
        <ContentBox style = {{width:'400px',fontSize:'small'}}>
            <Text>Assert presence of...</Text>
            <UnorderedList>
                <ListItem>user member record</ListItem>
                <ListItem>user base domain workbox and standard resources</ListItem>
                <ListItem>user base member workbox and standard resources</ListItem>
                <ListItem>user/access/memberships record</ListItem>
                <ListItem>user default workspace record, with default panel record</ListItem>
            </UnorderedList>
            <Button colorScheme = 'blue'>Assert</Button>
            <Text>See console for results</Text>
        </ContentBox>
    </Box>)

}

const useUserOptions = () => {

    const 
        userListRef = useRef(null),
        defaultValueRef = useRef(null),
        db = useFirestore(),
        [userSpecs, setUserSpecs] = useState(null)

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

    return [userSpecs]
}

async function useAssertMemberRecord(userID) {

    const assertMemberRecord = useMemo(()=>{

        async function assertMemberRecord () {
            const 
                db = useFirestore(),
                errorControl = useErrorControl(),
                navigate = useNavigate(),
                userCollection = collection(db,'users'),
                userDoc = userID?await getDoc(doc(userCollection,userID)):null,
                userRecord = userDoc?userDoc.data():null,
                workboxCollection = collection(db, 'workboxes')

            if (!userRecord) {
                alert('user not found')
                return
            }

            const
                userDomainID = userRecord.profile.domain.id,
                memberCollection = collection(db, 'domains', userDomainID, 'members'),
                membersQuery = query(memberCollection,where('profile.user.id','==',userID)),
                memberDoc = await getDoc((doc(memberCollection))),
                userMemberRecord = memberDoc.data()

            console.log('userMemberRecord',userMemberRecord)

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
        }
    },[userID])

    return assertMemberRecord
}


export default Administration