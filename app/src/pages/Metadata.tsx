// Metadata.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import { getFunctions, httpsCallable } from "firebase/functions"
import { doc, getDoc } from "firebase/firestore"

import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center
} from '@chakra-ui/react'

import { useFirestore } from '../system/FirebaseProviders'

import { useTypes } from '../system/TribalopolisProvider'

import Drawer, { useDrawers } from '../components/Drawer'
import Workbox from '../components/Workbox'

import { metatype } from '../system/system.type'


const outerStyle = {height: '100%', position:'relative'} as CSSProperties

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
            <VStack>
                {children}
            </VStack>
        </Box>
}

const Metadata = (props) => {

   const [isOutTransferProcessing, setIsOutTransferProcessing] = useState(false)
   const [returnOutData, setReturnOutData] = useState(null)
   const transferCollectionRef = useRef(null)
   const transferDocumentRef = useRef(null)

   const [isInTransferProcessing, setIsInTransferProcessing] = useState(false)
   const [returnInData, setReturnInData] = useState(null)

   const db = useFirestore()
   const getType = useTypes()

   const {
        drawerProps,
        containerElementRef,
        drawersState,
        onOpens,
    } = useDrawers()

    async function transferOutDocument() { // out from database

        const docRef = doc(db, "types", "system.type");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
        }

    }

    async function transferInDocument() { // in to database

        setIsInTransferProcessing(true)
        setReturnInData(null)
        let returnData
        const functions = getFunctions()

        try {
            const updateDatabase = httpsCallable(functions, 'updateDatabase')
            returnData = await updateDatabase({
                document:metatype, 
                context:{
                    operation:'set', 
                    path:'', collection:'system', documentID:'metatype'}})
            console.log('returnData', returnData)
        } catch (e) {
            console.log('error',e)
        }

        setReturnInData(returnData.data)

        setIsInTransferProcessing(false)

    }

    // --------------------------- render --------------------

    return <Box ref = {containerElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {drawersState != 'setup' && <>
            <Drawer {...drawerProps.lookup} >Lookup Drawer</Drawer>
            <Drawer {...drawerProps.data} ><Workbox>Data Drawer</Workbox></Drawer>
            <Drawer {...drawerProps.messages} >Message Drawer</Drawer>
            <Drawer {...drawerProps.help} >Help Drawer</Drawer>
        </>}
        <Box data-type = 'inner-box' overflow = 'auto' width = '100%' height = '100%' display = 'flex' flexWrap = 'wrap'>
        <ContentBox>
            <VStack>
                <Text>User Controls</Text>
                <Button onClick = {onOpens.openData} >Data</Button> 
                <Button onClick = {onOpens.openLookup }>Lookup</Button> 
                <Button onClick = {onOpens.openHelp}>Help</Button> 
                <Button onClick = {onOpens.openMessages}>Messages</Button>
            </VStack>
        </ContentBox>
        <ContentBox>
            <VStack data-type = 'vstack' padding = '3px' width = '100%'>
                <FormControl>
                    <FormLabel>Collection:</FormLabel>
                    <Input ref = {transferCollectionRef}/>
                </FormControl>
                <FormControl>
                    <FormLabel>Document:</FormLabel>
                    <Input ref = {transferDocumentRef}/>
                </FormControl>
                <Button onClick = {transferOutDocument} colorScheme = 'blue'>Transfer document to console</Button>
                {isOutTransferProcessing && <Text>Processing...</Text>}
                {returnOutData && <Text>see the console</Text>}
            </VStack>
        </ContentBox>
        <ContentBox>
            <VStack data-type = 'vstack' padding = '3px' width = '100%'>
                <Button onClick = {transferInDocument} colorScheme = 'blue'>Transfer metatype to database</Button>
                {isInTransferProcessing && <Text>Processing...</Text>}
                {returnInData && <Text>Status: {returnInData.status.toString()}, 
                    error: {returnInData.error.toString()}, 
                    message: {returnInData.message}, 
                    docpath: {returnInData.docpath} </Text>}
            </VStack>
        </ContentBox>
        </Box>        
    </Box>
}
export default Metadata
