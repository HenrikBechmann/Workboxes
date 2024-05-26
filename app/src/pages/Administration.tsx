// Administration.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import { Box, VStack, Text, Button } from '@chakra-ui/react'

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

        const 
            userRecord = userRecords.user,
            userDomainWorkboxID = userRecords.domain.profile.workbox.id,
            memberRecordRef = doc(memberCollection),
            memberWorkboxRef = doc(workboxCollection)

        let
            memberRecord,
            memberWorkbox,
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
        
        console.log('userRecord, userDomainWorkbox',userRecord, userDomainWorkbox)

    }

    return <Box data-type = 'page-content' width = '100%' display = 'flex' flexWrap = 'wrap'>
            <ContentBox>
                <Text>Create current user Member Record and Member Workbox</Text>
                <Button onClick = {createMemberRecords} colorScheme = 'blue'>Create</Button>
            </ContentBox>
        </Box>

}

export default Administration