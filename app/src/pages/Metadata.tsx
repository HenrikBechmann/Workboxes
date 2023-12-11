// Metadata.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text, Button} from '@chakra-ui/react'

// import Drawer from '../components/Drawer'
import Drawer, { useDrawers } from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties

const Metadata = (props) => {

   const {
        drawerPropsRef,
        containerElementRef,
        drawerState,
        onOpens,
    } = useDrawers()

    // --------------------------- render --------------------
    const renderProps = drawerPropsRef.current

    return <div ref = {containerElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {drawerState != 'setup' && <>
            <Drawer {...renderProps.lookups} />
            <Drawer {...renderProps.data} />
            <Drawer {...renderProps.messages} />
            <Drawer {...renderProps.info} />
        </>}
        <Text>Metadata</Text>
        <>
        <Button onClick = {onOpens.openData} >Data</Button> 
        <Button onClick = {onOpens.openLookups }>Lookups</Button> 
        <Button onClick = {onOpens.openInfo}>Info</Button> 
        <Button onClick = {onOpens.openMessages}>Messages</Button>
        </>
    </div>
}
export default Metadata
