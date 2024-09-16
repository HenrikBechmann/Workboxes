// Metadata.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties, forwardRef, lazy } from 'react'

import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center,
    Grid, GridItem,
} from '@chakra-ui/react'
import { useFirestore, useUserAuthData } from '../system/WorkboxesProvider'
const Draggable = lazy(() => import('react-draggable'))
// import { useTypes } from '../system/TribalopolisProvider'
import Drawer, { useDrawers } from '../components/workholders/Drawer'
const Workwindow = lazy(() => import('../components/workholders/Workwindow'))
const Workbox = lazy(() => import('../components/workbox/Workbox'))
const Workpanel = lazy(() => import('../components/workholders/Workpanel'))
// import { metatype } from '../system/system.type'

import appIcon from '../../assets/workbox-logo.png'

const defaultDocumentState = {
    mode:'view',
}

const defaultResourcesState = {

}

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

const defaultWorkboxState = {
    settingsShow:false,
    settingsDisabled:false,
    documentShow:true,
    documentDisabled:false,
    resourcesShow:true,
    resourcesDisabled:false,
}


// {
//     window:{
//         zOrder: 1,
//         configDefaults: {top:20,left:20, width:610,height:400},
//         view: 'normalized',
//     },
//     workbox: {
//         defaultWorkboxState:{...defaultWorkboxState},
//         defaultDocumentState: {...defaultDocumentState},
//         defaultResourcesState: {...defaultResourcesState},
//         itemTitle: "[Henrik Bechmann]",
//         itemIcon: homeIcon,
//         domainTitle: displayName,
//         domainIcon: photoURL,
//         typeName: 'Collection',
//         type:'Collection',
//         id:null,
//     }
// },

const Metadata = (props) => {

    const
        userAuthData = useUserAuthData(),
        { displayName, photoURL } = userAuthData.authUser,
        startingWindowsSpecsList = [
            {
                window:{
                    zOrder: 1,
                    configDefaults: {top:20,left:20, width:610,height:400},
                    view: 'normalized',
                    // type:'Collection',
                    // title:'Workbox types',
                },
                workbox: {
                    defaultWorkboxState:{...defaultWorkboxState},
                    defaultDocumentState: {...defaultDocumentState},
                    defaultResourcesState: {...defaultResourcesState},
                    itemTitle: 'Workbox types',
                    itemIcon: appIcon,
                    domainTitle: 'WorkboxesApp',
                    domainIcon: photoURL,
                    typeName: 'Collection',
                    type:'Collection',
                    id:null,
                }
            }
        ],
        transferCollectionRef = useRef(null),
        transferDocumentRef = useRef(null),
        [isInTransferProcessing, setIsInTransferProcessing] = useState(false),
        [returnInData, setReturnInData] = useState(null),
        [pageState, setPageState] = useState('setup'),
        db = useFirestore(),
        // getType = useTypes(),
        [dragState, setDragState] = useState(
        {
            activeDrags: 0,
        }),
        workboxComponentMapRef = useRef(null),
        workboxHandlerMapRef = useRef(null)

    useEffect(()=>{

        workboxComponentMapRef.current = new Map()
        workboxHandlerMapRef.current = new Map()

    },[])

    const onStart = () => {
        dragState.activeDrags = ++dragState.activeDrags
        setDragState(dragState)
    }

    const onStop = () => {
        dragState.activeDrags = --dragState.activeDrags
        setDragState(dragState)
    }

    const dragHandlers = {onStart, onStop}

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

    // async function transferInDocument() { // in to database

    //     if (!confirm('Transfer meta document type to database?')) return

    //     setIsInTransferProcessing(true)
    //     setReturnInData(null)
    //     let returnData
    //     const functions = getFunctions()

    //     try {
    //         const updateDatabase = httpsCallable(functions, 'updateDatabase')
    //         returnData = await updateDatabase({
    //             document:metatype, 
    //             context:{
    //                 operation:'set', 
    //                 path:'', collection:'types', documentID:'system.class'}})
    //         // console.log('returnData', returnData)
    //     } catch (e) {
    //         console.log('error',e)
    //     }

    //     setReturnInData(returnData.data)

    //     setIsInTransferProcessing(false)

    // }

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
    // KEEP FOR LATER
    // {pageState != 'setup' && <>
    //     <Drawer {...drawerProps.lookup} />
    //     <Drawer {...drawerProps.data} />
    //     <Drawer {...drawerProps.messages} />
    //     <Drawer {...drawerProps.help} />
    // </>}
    // <Box data-type = 'page-container' overflow = 'auto' height = '100%' position = 'relative'>
    //     <Box data-type = 'page-content' width = '100%' display = 'flex' flexWrap = 'wrap'>
    //         <Box data-type = 'contentbox-wrapper' height = '310px' ><ContentBox>
    //             <VStack height = '100%'>
    //                 <Text>User Controls</Text>
    //                 <Button onClick = {openDataDrawer} >Data</Button> 
    //                 <Button onClick = {openLookupDrawer }>Lookup</Button> 
    //                 <Button onClick = {openHelpDrawer}>Help</Button> 
    //                 <Button onClick = {openMessageDrawer}>Messages</Button>
    //             </VStack>
    //         </ContentBox></Box>
    //         <ContentBox>
    //             <VStack data-type = 'vstack' padding = '3px' width = '100%'>
    //                 <Button onClick = {transferInDocument} colorScheme = 'blue'>Transfer metatype to database</Button>
    //                 {isInTransferProcessing && <Text>Processing...</Text>}
    //                 {returnInData && <Text>Status: {returnInData.status.toString()}, 
    //                     error: {returnInData.error.toString()}, 
    //                     message: {returnInData.message}, 
    //                     docpath: {returnInData.docpath} </Text>}
    //             </VStack>
    //         </ContentBox>
    //     </Box>        
    // </Box>

    return <Grid
        data-type = 'page'
        height = '100%'
        gridTemplateAreas={`"body"`}
        gridTemplateRows={'1fr'}
        gridTemplateColumns={'1fr'}
    >
        <GridItem data-type = 'page-body' area = 'body'>
            <Box id = 'wb-panelframe' data-type = 'page-frame' height = '100%' position = 'relative'>
                <Box 
                    data-type = 'page-liner' 
                    ref = {containerElementRef} 
                    height = '100%' 
                    position = 'absolute' 
                    inset = '0' 
                    overflow = 'hidden'
                >
                    {pageState != 'setup' && <Workpanel 
                        workboxComponentMapRef = {workboxComponentMapRef}
                        workboxHandlerMapRef = {workboxHandlerMapRef}
                        startingWindowsSpecsList = {startingWindowsSpecsList} 
                    />}
                </Box>
            </Box>
        </GridItem>
    </Grid>
}
export default Metadata
