// UserControls.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import { getFunctions, httpsCallable } from "firebase/functions"
import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center, Grid, GridItem
} from '@chakra-ui/react'

// import Drawer from '../components/Drawer'
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

const UserControls = (props) => {

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

    const claimEmailInputRef = useRef(null)

    const [isAdminInputValid, setIsAdminInputValid] = useState(true)
    const [isAdminProcessing, setIsAdminProcessing] = useState(false)
    const [returnAdminPack, setReturnAdminPack] = useState(null)

    async function claimAction(e) {
        const 
            actionName = e.target.name,
            email = claimEmailInputRef.current.value,
            isInputValid = claimEmailInputRef.current.reportValidity()

        if (isInputValid) {
            setIsAdminProcessing(true)
            setReturnAdminPack(null)
            let adminPack
            const functions = getFunctions()

            if (actionName == 'grantadmin') {
                const setAdminClaim = httpsCallable(functions, 'setAdminClaim')
                adminPack = await setAdminClaim({email})
            } else { // actionName = 'revokeadmin'
                const revokeAdminClaim = httpsCallable(functions, 'revokeAdminClaim')
                adminPack = await revokeAdminClaim({email})
            }

            setReturnAdminPack(adminPack.data)

        }

        setIsAdminInputValid(isInputValid)
        setIsAdminProcessing(false)

    }

    async function getAdminStatus(e) {

        const 
            functions = getFunctions(),
            isAdminUser = httpsCallable(functions, 'isAdminUser')

        let isAdmin
        try {
            isAdmin = await isAdminUser()
        } catch (e) {
            console.log('failure to get isAdmin status')
            return
        }

        console.log('isAdmin',isAdmin)

    }

    return <Grid
        data-type = 'metadata'
        height = '100%'
        templateAreas={`"body"`}
        gridTemplateRows={'1fr'}
        gridTemplateColumns={'1fr'}
    >
    <GridItem data-type = 'metadata-body' area = 'body'>
    <Box data-type = 'metadata-frame' height = '100%' position = 'relative'>
        <Box 
            data-type = 'usercontrols'
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
        <Box data-type = 'metadata-panel' overflow = 'auto' height = '100%' position = 'relative'>
        <Box data-type = 'inner-box' overflow = 'auto' width = '100%' display = 'flex' flexWrap = 'wrap'>
        <ContentBox>
            <VStack>
                <Text>User Controls</Text>
                <Button onClick = {openFunctions.openDataDrawer} >Data</Button> 
                <Button onClick = {openFunctions.openLookupDrawer }>Lookup</Button> 
                <Button onClick = {openFunctions.openHelpDrawer}>Help</Button> 
                <Button onClick = {openFunctions.openMessagesDrawer}>Messages</Button>
            </VStack>
        </ContentBox>
        <ContentBox>
            <VStack data-type = 'vstack' padding = '3px' width = '100%'>
                <FormControl isInvalid = {!isAdminInputValid}>
                    <FormLabel>Admin user email:</FormLabel>
                    <Input ref = {claimEmailInputRef} type = 'email' autoComplete = 'on'/>
                    <FormHelperText fontSize = 'xs'>For granting the claim, email must be registered in the sysadmins collection</FormHelperText>
                </FormControl>
                <Button name = 'grantadmin' onClick = {claimAction} colorScheme = 'blue'>Grant admin claim</Button>
                <Button name = 'revokeadmin' onClick = {claimAction} colorScheme = 'blue'>Revoke admin claim</Button>
                {isAdminProcessing && <Text>Processing...</Text>}
                {returnAdminPack && <Text>
                    {`status: ${returnAdminPack.status}; error: ${returnAdminPack.error}; message: ${returnAdminPack.message}`}
                    </Text>}
            </VStack>
        </ContentBox>
        <ContentBox>
            <Button onClick = {getAdminStatus} colorScheme = 'blue'>View signin's admin claim</Button>
        </ContentBox>
        <ContentBox>
        </ContentBox>
        </Box>
        </Box>
    </Box>
    </Box>
    </GridItem>
    </Grid>
}

export default UserControls
