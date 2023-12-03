// Signin.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, getAdditionalUserInfo } from "firebase/auth"
import { 
    Card, CardHeader, CardBody, CardFooter,
    Box, VStack, HStack, StackDivider, Center,
    Text, Heading, Image, Button
} from '@chakra-ui/react'

import { useAuth, useUserData } from '../system/FirebaseProviders'

import tribalopolisIcon from '../../assets/fire.png'
import boxIcon from '../../assets/workbox.png'
import dragIcon from '../../assets/drag.png'

const provider = new GoogleAuthProvider()
provider.setCustomParameters({
  prompt: 'select_account',
})

const Signin = (props) => {

    const 
        [errorState,setErrorState] = useState<any>(null),
        auth = useAuth(),
        userDataRef = useRef(),
        navigate = useNavigate(),
        [searchParams] = useSearchParams(),
        from = searchParams.get('from') || '/',
        location = useLocation()

    // console.log('location', location, from)

    userDataRef.current = useUserData()

    useEffect (()=>{

        getRedirectResult(auth)
            .then((result) => {

                // console.log('getRedirectResult',result)

                if (result === null) return

                // additional properties if needed
                // const token = credential.accessToken
                // const user = result.user
                // IdP data available using getAdditionalUserInfo(result)
                // ...
                if (result) { //(userRef.current) {

                    // const credential = GoogleAuthProvider.credentialFromResult(result)
                    // const additionalInfo = getAdditionalUserInfo(result)
                    // console.log('credential, additionalInfo',credential, additionalInfo)
                    navigate(from)

                }

            }).catch((error) => {

                const jsonstring = error.message.match(/\{(.*)\}/)[0]
                const json = JSON.parse(jsonstring)
                const errorStatus = json.error?.status
                if (errorStatus == 'PERMISSION_DENIED') {
                    json.error.status = 'Sorry, permission is denied.'
                }
                setErrorState(json)
                // Handle Errors here.
                // const errorCode = error.code;
                // const errorMessage = error.message;
                // // The email of the user's account used.
                // const email = error.customData?.email;
                // // The AuthCredential type that was used.
                // const credential = GoogleAuthProvider.credentialFromError(error);
            });

    },[])

    const signInWithGoogle = () => {

        signInWithRedirect(auth, provider)

    }

    if (userDataRef.current === undefined) {
        return <div> Connecting... </div>
    }

    if (userDataRef.current) {

        return null

    }

    return (
    <Card ml = {20} mr = {20} mt = {5} >
    
        <CardBody>
            <Center>
            <VStack divider={<StackDivider />} spacing='4'>
            <Box style = {{textAlign:'center'}} >
                <Heading size = 'lg'>Welcome!</Heading>
                <Heading size = 'xl'>
                    <Text>Use <Image style = {{display:"inline-block", verticalAlign:'baseline'}} src = {tribalopolisIcon} />Tribalopolis to...</Text>
                </Heading>
            </Box>
            <Box style = {{textAlign:'center'}} >
                <Heading size = 'lg'> Organize, Re-organize, <br /> Communicate, and Collaborate</Heading>
            </Box>
            <Box style = {{textAlign:'center'}} >
                <Text>While we get established, we're accepting members by invitation only.</Text>
                <Text mt = {3}><i>If you've received an invitation, please sign in.</i></Text>
                <HStack justifyContent = 'center' spacing = {10} mt = {5}>
                    <div><Button 
                        colorScheme = "blue" 
                        width = '300px'
                        onClick = {signInWithGoogle}
                    >
                        Sign in using Google
                    </Button></div>
                </HStack>
                {errorState && 
                    <Text mt = {"20px"} style = {{backgroundColor:'lightpink', padding:'10px 3px 10px 3px'}}> 
                    {errorState.error.status}<br />
                    {errorState.error?.message}<br />
                    {errorState.error?.details} </Text>}
            </Box>
            <Box style = {{textAlign:'center'}} >
                <Text>Self organize into Work Groups (Domains).</Text>
                <Text>Organize information into Work Boxes. &nbsp;
                    <Image style = {{display:'inline-block', verticalAlign:'middle'}} src = {boxIcon}/>
                </Text>
                <Text>Organize Work Boxes into Work Windows,</Text>
                <Text>Domain Panels, and Work Spaces.</Text>
                <Text>Drag and Drop 
                    <Image style = {{display:'inline-block', verticalAlign:'middle'}} src = {dragIcon}/> 
                    things around to keep up to date.
                </Text>
                <Text>Have fun!</Text>
            </Box>
            </VStack>
        </Center>
        </CardBody>

    </Card>
    )
}

export default Signin
