// UserControls.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import { getFunctions, httpsCallable } from "firebase/functions"
import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center
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

   const {
        drawerProps,
        containerElementRef,
        drawerState,
        onOpens,
    } = useDrawers()

    // --------------------------- render --------------------

    const claimEmailInputRef = useRef(null)

    const [isInputValid, setIsInputValid] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)

    async function claimAction(e) {
        const 
            actionName = e.target.name,
            email = claimEmailInputRef.current.value,
            isInputValid = claimEmailInputRef.current.reportValidity()

        console.log('actionName, value, isInputValid',actionName, email, isInputValid)

        if (isInputValid) {
            setIsProcessing(true)
            let adminPack
            const functions = getFunctions()

            if (actionName == 'grantadmin') {
                const setAdminClaim = httpsCallable(functions, 'setAdminClaim')
                adminPack = await setAdminClaim({email})
            } else { // actionName = 'revokeadmin'
                const revokeAdminClaim = httpsCallable(functions, 'revokeAdminClaim')
                adminPack = await revokeAdminClaim({email})
            }

            console.log('adminPack.data', adminPack.data)

        }

        setIsInputValid(isInputValid)
        setIsProcessing(false)

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

    return <Box ref = {containerElementRef} data-type = 'usercontrols' style = {outerStyle}>
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
                <FormControl isInvalid = {!isInputValid}>
                    <FormLabel>Admin user email:</FormLabel>
                    <Input ref = {claimEmailInputRef} type = 'email'/>
                    <FormHelperText fontSize = 'xs'>For granting the claim, email must be registered in the sysadmins collection</FormHelperText>
                </FormControl>
                <Button name = 'grantadmin' onClick = {claimAction} colorScheme = 'blue'>Grant admin claim</Button>
                <Button name = 'revokeadmin' onClick = {claimAction} colorScheme = 'blue'>Revoke admin claim</Button>
                {(isProcessing) && <Text>Processing...</Text>}
            </VStack>
        </ContentBox>
        <ContentBox>
            <Button onClick = {getAdminStatus} colorScheme = 'blue'>View signin's admin claim</Button>
        </ContentBox>
        <ContentBox>
        </ContentBox>
        </Box>
    </Box>

}

export default UserControls
