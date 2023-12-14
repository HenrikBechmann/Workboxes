// UserControls.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {
    Text, 
    Button, 
    Box, VStack,
} from '@chakra-ui/react'

// import Drawer from '../components/Drawer'
import Drawer, { useDrawers } from '../components/Drawer'

const outerStyle = {display: 'flex', flexWrap: 'wrap', height: '100%', position:'relative'} as CSSProperties

const ContentBox = (props) => {

    const {children} = props

    return <Box style = {{flexBasis:'auto', flexShrink: 0, margin: '5px', backgroundColor:'white', height:'250px', width: '300px', border: '5px outset silver'}}>
            <VStack>
                {children}
            </VStack>
        </Box>
}

const UserControls = (props) => {

   const {
        drawerProps,
        containerElementRef,
        drawerState,
        onOpens,
    } = useDrawers()

    // --------------------------- render --------------------

    return <Box ref = {containerElementRef} data-type = 'usercontrols' style = {outerStyle}>
        {drawerState != 'setup' && <>
            <Drawer {...drawerProps.lookup} />
            <Drawer {...drawerProps.data} />
            <Drawer {...drawerProps.messages} />
            <Drawer {...drawerProps.help} />
        </>}
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
            
        </ContentBox>
        <ContentBox>
            
        </ContentBox>
        <ContentBox>
            
        </ContentBox>
    </Box>

}

export default UserControls
