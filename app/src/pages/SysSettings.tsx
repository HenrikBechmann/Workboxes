// SysSettings.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text, Button, Box, Grid, GridItem} from '@chakra-ui/react'

// import Drawer from '../components/Drawer'
import Drawer, { useDrawers } from '../components/workholders/Drawer'

const SysSettings = (props) => {

    // const [displayState,setDisplayState] = useState('setup')

    // useEffect(()=>{

    //     const headElement = document.getElementsByTagName('head')[0]

    //     const metaElement = document.createElement('meta')

    //     metaElement.setAttribute('httpEquiv',"Content-Security-Policy")
    //     metaElement.setAttribute('content',"frame-ancestors https://docs.google.com/spreadsheets")

    //     headElement.appendChild(metaElement)

    //     setDisplayState('ready')

    // // <meta httpEquiv="Content-Security-Policy" content="default-src https:" />
    // },[])

    return <div>

    <h5>Experiment</h5>

    </div>
}

// <object 
//     type='application/vnd.google-apps.spreadsheet'
//     data= 'https://docs.google.com/spreadsheets/d/12ogoO1MP8-M6tNOHKubyIkLyzesWVV8xZm-HyO6EGrU/edit?usp=drive_link' />

    // <object 
    //     data="https://www.toronto.ca/legdocs/mmis/2024/cc/bgrd/backgroundfile-249288.pdf" 
    //     type="application/pdf"
    //     width = '500'
    //     height = '500'
    //     ></object>


export default SysSettings


   // const completeData = (context) => {

   // }
   // const completeLookup = (context) => {
       
   // }
   // const completeHelp = (context) => {
       
   // }
   // const completeMessages = (context) => {
       
   // }

   // const completeFunctions = {
   //     data:completeData,
   //     lookup:completeLookup,
   //     help:completeHelp,
   //     messages:completeMessages,
   // }

   // const {
   //      drawerProps,
   //      containerElementRef,
   //      drawersState,
   //      openFunctions,
   //  } = useDrawers(completeFunctions)

    // <Grid
    //     data-type = 'page'
    //     height = '100%'
    //     gridTemplateAreas={`"body"`}
    //     gridTemplateRows={'1fr'}
    //     gridTemplateColumns={'1fr'}
    // >
    //     <GridItem data-type = 'page-body' area = 'body'>
    //         <Box data-type = 'page-frame' height = '100%' position = 'relative'>
    //             <Box 
    //                 data-type = 'page-liner'
    //                 ref = {containerElementRef} 
    //                 height = '100%' 
    //                 position = 'absolute' 
    //                 inset = '0' 
    //                 overflow = 'hidden'
    //             >
    //                 {drawersState != 'setup' && <>
    //                     <Drawer {...drawerProps.lookup} />
    //                     <Drawer {...drawerProps.data} />
    //                     <Drawer {...drawerProps.messages} />
    //                     <Drawer {...drawerProps.help} />
    //                 </>}
    //                 <Box data-type = 'page-container' overflow = 'auto' height = '100%' position = 'relative'>
    //                     <Box data-type = 'page-content' width = '100%'>
    //                         <Text>System settings</Text>
    //                         <Box>
    //                         <Button onClick = {openFunctions.openDataDrawer} >Data</Button> 
    //                         <Button onClick = {openFunctions.openLookupDrawer }>Lookup</Button> 
    //                         <Button onClick = {openFunctions.openHelpDrawer}>Help</Button> 
    //                         <Button onClick = {openFunctions.openMessagesDrawer}>Messages</Button>
    //                         </Box>
    //                     </Box>
    //                 </Box>
    //             </Box>
    //         </Box>
    //     </GridItem>
    // </Grid>