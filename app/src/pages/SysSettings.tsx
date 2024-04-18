// SysSettings.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text, Button, Box, Grid, GridItem} from '@chakra-ui/react'

// import Drawer from '../components/Drawer'
import Drawer, { useDrawers } from '../components/workholders/Drawer'

const SysSettings = (props) => {

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

    // --------------------------- render --------------------

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
                    {drawersState != 'setup' && <>
                        <Drawer {...drawerProps.lookup} />
                        <Drawer {...drawerProps.data} />
                        <Drawer {...drawerProps.messages} />
                        <Drawer {...drawerProps.help} />
                    </>}
                    <Box data-type = 'page-container' overflow = 'auto' height = '100%' position = 'relative'>
                        <Box data-type = 'page-content' width = '100%'>
                            <Text>System settings</Text>
                            <Box>
                            <Button onClick = {openFunctions.openDataDrawer} >Data</Button> 
                            <Button onClick = {openFunctions.openLookupDrawer }>Lookup</Button> 
                            <Button onClick = {openFunctions.openHelpDrawer}>Help</Button> 
                            <Button onClick = {openFunctions.openMessagesDrawer}>Messages</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </GridItem>
    </Grid>
}

export default SysSettings
