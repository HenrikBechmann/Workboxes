// Metadata.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text, Button, Box} from '@chakra-ui/react'

// import Drawer from '../components/Drawer'
import Drawer, { useDrawers } from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties

const Metadata = (props) => {

   const {
        drawerProps,
        containerElementRef,
        drawerState,
        onOpens,
    } = useDrawers()

    // --------------------------- render --------------------

    return <Box ref = {containerElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {drawerState != 'setup' && <>
            <Drawer {...drawerProps.lookup} />
            <Drawer {...drawerProps.data} />
            <Drawer {...drawerProps.messages} />
            <Drawer {...drawerProps.help} />
        </>}
        <Text>Metadata</Text>
        <>
        <Button onClick = {onOpens.openData} >Data</Button> 
        <Button onClick = {onOpens.openLookup }>Lookup</Button> 
        <Button onClick = {onOpens.openHelp}>Help</Button> 
        <Button onClick = {onOpens.openMessages}>Messages</Button>
        </>
    </Box>
}
export default Metadata
