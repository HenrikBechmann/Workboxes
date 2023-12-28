// SysSettings.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text, Button, Box} from '@chakra-ui/react'

// import Drawer from '../components/Drawer'
import Drawer, { useDrawers } from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties

const SysSettings = (props) => {

   const onCompleteData = (context) => {

   }
   const onCompleteLookup = (context) => {
       
   }
   const onCompleteHelp = (context) => {
       
   }
   const onCompleteMessages = (context) => {
       
   }

   const onCompleteFunctions = {
       data:onCompleteData,
       lookup:onCompleteLookup,
       help:onCompleteHelp,
       messages:onCompleteMessages,
   }

   const {
        drawerProps,
        containerElementRef,
        drawersState,
        onOpenFunctions,
    } = useDrawers(onCompleteFunctions)

    // --------------------------- render --------------------

    return <Box ref = {containerElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {drawersState != 'setup' && <>
            <Drawer {...drawerProps.lookup} />
            <Drawer {...drawerProps.data} />
            <Drawer {...drawerProps.messages} />
            <Drawer {...drawerProps.help} />
        </>}
        <Text>System settings</Text>
        <>
        <Button onClick = {onOpenFunctions.openDataDrawer} >Data</Button> 
        <Button onClick = {onOpenFunctions.openLookupDrawer }>Lookup</Button> 
        <Button onClick = {onOpenFunctions.openHelpDrawer}>Help</Button> 
        <Button onClick = {onOpenFunctions.openMessagesDrawer}>Messages</Button>
        </>
    </Box>

}

export default SysSettings
