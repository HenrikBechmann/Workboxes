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

   const onCompletes = {
       data:onCompleteData,
       lookup:onCompleteLookup,
       help:onCompleteHelp,
       messages:onCompleteMessages,
   }

   const {
        drawerProps,
        containerElementRef,
        drawersState,
        onOpens,
    } = useDrawers(onCompletes)

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
        <Button onClick = {onOpens.openData} >Data</Button> 
        <Button onClick = {onOpens.openLookup }>Lookup</Button> 
        <Button onClick = {onOpens.openHelp}>Help</Button> 
        <Button onClick = {onOpens.openMessages}>Messages</Button>
        </>
    </Box>

}

export default SysSettings
