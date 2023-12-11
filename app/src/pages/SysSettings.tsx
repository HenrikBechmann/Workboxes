// SysSettings.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text, Button} from '@chakra-ui/react'

// import Drawer from '../components/Drawer'
import Drawer, { useDrawerSupport } from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties

const SysSettings = (props) => {

   const {
        drawerPropsRef,
        containerElementRef,
        drawerState,
        onOpens,
    } = useDrawerSupport()

    // --------------------------- render --------------------
    const renderProps = drawerPropsRef.current

    return <div ref = {containerElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {drawerState != 'setup' && <>
            <Drawer {...renderProps.lookups} />
            <Drawer {...renderProps.data} />
            <Drawer {...renderProps.notices} />
            <Drawer {...renderProps.info} />
        </>}
        <Text>System settings</Text>
        <>
        <Button onClick = {onOpens.openRight} >Right</Button> 
        <Button onClick = {onOpens.openTop }>Top</Button> 
        <Button onClick = {onOpens.openLeft}>Left</Button> 
        <Button onClick = {onOpens.openBottom}>Bottom</Button>
        </>
    </div>

}

export default SysSettings
