// Administration.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    general admin functions
    - specify user to address admin to



*/

import React from 'react'

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

    const {children} = props

    return <Box style = {contentBoxStyle}>
            <VStack data-type = 'vstack' padding = '3px' width = '100%'>
                {children}
            </VStack>
        </Box>
}

const Administration = (props) => {

    const
        db = useFirestore(),
        userRecords = useUserRecords(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    async function createMemberRecords() {

        const 
            userDomainID = userRecords.domain.profile.domain.id,
            memberCollection = collection(db, 'domains', userDomainID, 'members'),
            workboxCollection = collection(db, 'workboxes'),
            membersQuery = query(memberCollection)

        let queryPayload
        // ------------------[ database interaction ]-----------------
        try {
            queryPayload = await getDocs(membersQuery)
            if (queryPayload.size) {
                alert('members collection alerady exists')
                return
            }
        } catch(error) {
            const errdesc = 'administration error create member records'
            console.log(errdesc, error)
            errorControl.push({description:errdesc, error})
            navigate('/error')
            return
        }
        // --------------------

        const 
            userRecord = userRecords.user,
            userDomainWorkboxID = userRecords.domain.profile.workbox.id,
            memberRecordRef = doc(memberCollection),
            memberWorkboxRef = doc(workboxCollection)

        let
            userDomainWorkbox

        // ------------------[ database interaction ]-----------------
        try {
            const userDomainWorkboxDoc = await getDoc(doc(workboxCollection, userDomainWorkboxID))
            if (userDomainWorkboxDoc.exists()) {
                userDomainWorkbox = userDomainWorkboxDoc.data()
            } else {
                alert ('domainWorkboxDoc not found')
                return
            }
        } catch (error) {
            const errdesc = 'administration error getting domain workbox record'
            console.log(errdesc, error)
            errorControl.push({description:errdesc, error})
            navigate('/error')
            return
        }
        // --------------------
        
        console.log('userRecord, userDomainWorkbox',userRecord, userDomainWorkbox)

        const panelMemberRecord = updateDocumentSchema('members','standard',{},{
            profile: {
                user: {
                  id:userRecord.profile.user.id,
                  name: userRecord.profile.user.name,
                },
                member: {
                  id:memberRecordRef.id,
                  name: userRecord.profile.user.name,
                  image: {
                    source: userRecord.profile.user.image.source
                  },
                  location: userRecord.profile.user.location,
                  description: userRecord.profile.user.description,
                  date_joined: serverTimestamp(),
                },
                handle: {
                  plain: userRecord.profile.handle.plain,
                  lower_case: userRecord.profile.handle.lower_case,
                },
                domain: {
                  id: userRecord.profile.domain.id,
                  name: userRecord.profile.domain.name,
                },
                workbox: {
                  id: memberWorkboxRef.id,
                  name: userRecord.profile.user.name,
                },
                commits: {
                  created_by: {
                      id:userRecord.profile.user.id,
                      name: userRecord.profile.user.name,
                  },
                  created_timestamp: serverTimestamp(),
                  updated_by: {
                      id:userRecord.profile.user.id,
                      name: userRecord.profile.user.name,
                  },
                  updated_timestamp: serverTimestamp(),                  
                },
                counts:{
                    workboxes: 1
                }

            }}
        )

        const memberWorkbox = updateDocumentSchema('workboxes','member',{},{

            profile: {
                workbox: {
                  id: memberWorkboxRef.id,
                  name: userRecord.profile.user.name,
                  image: {
                    source: userRecord.profile.user.image.source
                  },
                },
                user: {
                  id:userRecord.profile.user.id,
                  name: userRecord.profile.user.name,
                },
                member: {
                  id:memberRecordRef.id,
                  name: userRecord.profile.user.name,
                },
                owner: {
                  id:userRecord.profile.user.id,
                  name: userRecord.profile.user.name,
                },
                domain: {
                  id: userRecord.profile.domain.id,
                  name: userRecord.profile.domain.name,
                },
                type: {
                  name: "member",
                  alias: "Member",
                  image: {
                    source: null,
                  },
                },
                commits: {
                  created_by: {
                      id:userRecord.profile.user.id,
                      name: userRecord.profile.user.name,
                  },
                  created_timestamp: serverTimestamp(),
                  updated_by: {
                      id:userRecord.profile.user.id,
                      name: userRecord.profile.user.name,
                  },
                  updated_timestamp: serverTimestamp(),
                },
            },
            document: {
                sections: [
                  {
                    name: "standard",
                    alias: "Standard",
                    position: 0,
                    data: {
                      name: userRecord.profile.user.name,
                      image: {
                        source: userRecord.profile.user.image.source
                      },
                      description: userRecord.profile.user.description,
                      summary: null,
                    },
                  },
                ],
            },
        })

        console.log('panelMemberRecord, memberWorkbox',panelMemberRecord, memberWorkbox)

        // ------------------[ database interaction ]-----------------
        const batch = writeBatch(db)
        try {
            batch.set(memberRecordRef,panelMemberRecord)
            batch.set(memberWorkboxRef,memberWorkbox)
            await batch.commit()
        } catch (error) {
            const errdesc = 'administration error writing panelMemberRecord and memberWorkbox to database'
            console.log(errdesc, error)
            errorControl.push({description:errdesc, error})
            navigate('/error')
            return
        }
        // --------------------

        alert('Done.')
    }

    return <Box data-type = 'page-content' width = '100%' display = 'flex' flexWrap = 'wrap'>
            <ContentBox>
                <Text>Select user account</Text>
                <Button onClick = {createMemberRecords} colorScheme = 'blue'>Create</Button>
                <Select>
                    <option value="__any__">All</option>
                </Select>
            </ContentBox>
            <ContentBox>
                <Text>Assert presence of...</Text>
                <UnorderedList>
                    <ListItem>user member record</ListItem>
                    <ListItem>user base domain workbox and standard resources</ListItem>
                    <ListItem>user base member workbox and standard resources</ListItem>
                    <ListItem>user/access/memberships record</ListItem>
                    <ListItem>user default workspace record, with default panel record</ListItem>
                </UnorderedList>
                <Button onClick = {createMemberRecords} colorScheme = 'blue'>Create</Button>
                <Text>See console for results</Text>
            </ContentBox>
        </Box>

}

export default Administration