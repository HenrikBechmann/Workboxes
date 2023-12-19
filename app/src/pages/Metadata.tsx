// Metadata.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center
} from '@chakra-ui/react'

import Drawer, { useDrawers } from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties

const contentBoxStyle = {
    flexBasis:'auto', 
    flexShrink: 0, 
    margin: '5px',
    backgroundColor:'white', 
    height:'300px', 
    width: '300px', 
    border: '5px outset silver',
    paddingTop: '6px',
}

const ContentBox = (props) => {

    const {children} = props

    return <Box style = {contentBoxStyle}>
            <VStack>
                {children}
            </VStack>
        </Box>
}

const Metadata = (props) => {

   const [isTransferProcessing, setIsTransferProcessing] = useState(false)
   const [returnData, setReturnData] = useState(null)
   const transferCollectionRef = useRef(null)
   const transferDocumentRef = useRef(null)

   const {
        drawerProps,
        containerElementRef,
        drawerState,
        onOpens,
    } = useDrawers()

    async function transferDocument() {
        
    }

    // --------------------------- render --------------------

    return <Box ref = {containerElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {drawerState != 'setup' && <>
            <Drawer {...drawerProps.lookup} />
            <Drawer {...drawerProps.data} />
            <Drawer {...drawerProps.messages} />
            <Drawer {...drawerProps.help} />
        </>}
        <Box data-type = 'inner-box' overflow = 'auto' width = '100%' height = '100%' display = 'flex' flexWrap = 'wrap'>
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
            <VStack data-type = 'vstack' padding = '3px' width = '100%'>
                <FormControl>
                    <FormLabel>Collection:</FormLabel>
                    <Input ref = {transferCollectionRef}/>
                </FormControl>
                <FormControl>
                    <FormLabel>Document:</FormLabel>
                    <Input ref = {transferDocumentRef}/>
                </FormControl>
                <Button onClick = {transferDocument} colorScheme = 'blue'>Transfer document to console</Button>
                {isTransferProcessing && <Text>Processing...</Text>}
                {returnData && <Text>see the console</Text>}
            </VStack>
        </ContentBox>
        </Box>        
    </Box>
}
export default Metadata
