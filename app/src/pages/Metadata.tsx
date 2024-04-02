// Metadata.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties, forwardRef } from 'react'
import { getFunctions, httpsCallable } from "firebase/functions"
import { doc, getDoc } from "firebase/firestore"

import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center,
    Grid, GridItem,
} from '@chakra-ui/react'

import { useFirestore, useUserData } from '../system/FirebaseProviders'

import Draggable from 'react-draggable'

import { useTypes } from '../system/TribalopolisProvider'

import Drawer, { useDrawers } from '../components/Drawer'

import Workwindow from '../components/Workwindow'

import Workbox from '../components/workbox/Workbox'

import { metatype } from '../system/system.type'


const contentBoxStyle = {
    position:'relative',
    flexBasis:'auto', 
    flexShrink: 0, 
    margin: '5px',
    backgroundColor:'white', 
    height:'300px', 
    width: '300px', 
    border: '2px solid silver',
    borderRadius:'12px',
} as CSSProperties

const ContentBox = (props) => {

    const {children, styles} = props
    const boxStyle = {...contentBoxStyle}
    Object.assign(boxStyle, styles)

    return <Box data-type = 'content-box' style = {boxStyle}>
            <VStack height = '100%' data-type = 'contentbox-vstack'>
                {children}
            </VStack>
        </Box>
}

const Metadata = (props) => {

    const onStart = () => {
        dragState.activeDrags = ++dragState.activeDrags
        setDragState(dragState)
    }

    const onStop = () => {
        dragState.activeDrags = --dragState.activeDrags
        setDragState(dragState)
    }

    const 
        userData = useUserData(),
        { displayName, photoURL } = userData.authUser,
        dragHandlers = {onStart, onStop},
        [dragState, setDragState] = useState(
        {
            activeDrags: 0,
        })

    const defaultConfig = {
        settingsShow:false,
        settingsDisabled:false,
        coverShow:true,
        coverDisabled:false,
        contentsShow:true,
        contentsDisabled:false,
    }

   const transferCollectionRef = useRef(null)
   const transferDocumentRef = useRef(null)

   const [isInTransferProcessing, setIsInTransferProcessing] = useState(false)
   const [returnInData, setReturnInData] = useState(null)
   const [pageState, setPageState] = useState('setup')

   const db = useFirestore()
   const getType = useTypes()

   useEffect(()=>{

       if (pageState != 'ready') setPageState('ready')

   },[pageState])

   const completeData = (context) => {

   }
   const completeLookup = (context) => {
       
   }
   const completeHelp = (context) => {
       
   }
   const completeMessages = (context) => {
       
   }

   const completeFunctions = {
       data:completeData,
       lookup:completeLookup,
       help:completeHelp,
       messages:completeMessages,
   }

   const {
        drawerProps,
        containerElementRef,
        drawersState,
        openFunctions,
    } = useDrawers(completeFunctions)

    async function transferInDocument() { // in to database

        if (!confirm('Transfer meta document type to database?')) return

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
                    path:'', collection:'types', documentID:'system.class'}})
            console.log('returnData', returnData)
        } catch (e) {
            console.log('error',e)
        }

        setReturnInData(returnData.data)

        setIsInTransferProcessing(false)

    }

    const openDataDrawer = () => {
        openFunctions.openDataDrawer(null) // add context
    }

    const openLookupDrawer = () => {
        openFunctions.openLookupDrawer(null)
    }

    const openHelpDrawer = () => {
        openFunctions.openHelpDrawer(null)
    }

    const openMessageDrawer = () => {
        openFunctions.openMessagesDrawer(null)
    }

    // --------------------------- render --------------------

    // children, 
    // configDefaults, // for this Workwindow 
    // sessionID, // system control
    // zOrder, // inherited; modified by setFocus 
    // viewDeclaration, // normalized, maximized, minimized
    // callbacks, // change zOrder etc.
    // containerDimensionSpecs // height, width; change can cause repositioning and resizing of window


    return <Grid
        data-type = 'page'
        height = '100%'
        gridTemplateAreas={`"body"`}
        gridTemplateRows={'1fr'}
        gridTemplateColumns={'1fr'}
    >
        <GridItem data-type = 'page-body' area = 'body'>
            <Box data-type = 'page-frame' height = '100%' position = 'relative'>
                <Box 
                    data-type = 'page-liner' 
                    ref = {containerElementRef} 
                    height = '100%' 
                    position = 'absolute' 
                    inset = '0' 
                    overflow = 'hidden'
                >
                    {pageState != 'setup' && <>
                        <Drawer {...drawerProps.lookup} />
                        <Drawer {...drawerProps.data} />
                        <Drawer {...drawerProps.messages} />
                        <Drawer {...drawerProps.help} />
                    </>}
                    {pageState != 'setup' && <Workwindow 
                        key = {2} 
                        sessionID = {2} 
                        zOrder = {2} 
                        configDefaults = {{top:40,left:60, width:600,height:400}}
                        viewDeclaration = {{view:'normalized',stackOrder:null}}
                        containerDimensionSpecs = {{width:containerElementRef.current.offsetWidth, height:containerElementRef.current.offsetHeigth}}
                    >
                        <Workbox 
                            defaultConfig = {defaultConfig} 
                            itemIcon = {photoURL} 
                            itemTitle = {displayName}
                            domainTitle = 'Henrik Bechmann'
                            typeName = 'Domain'
                        />
                    </Workwindow>}
                    <Box data-type = 'page-container' overflow = 'auto' height = '100%' position = 'relative'>
                        <Box data-type = 'page-content' width = '100%' display = 'flex' flexWrap = 'wrap'>
                            <Box data-type = 'contentbox-wrapper' height = '310px' ><ContentBox>
                                <VStack height = '100%'>
                                    <Text>User Controls</Text>
                                    <Button onClick = {openDataDrawer} >Data</Button> 
                                    <Button onClick = {openLookupDrawer }>Lookup</Button> 
                                    <Button onClick = {openHelpDrawer}>Help</Button> 
                                    <Button onClick = {openMessageDrawer}>Messages</Button>
                                </VStack>
                            </ContentBox></Box>
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
                </Box>
            </Box>
        </GridItem>
    </Grid>
}
export default Metadata
