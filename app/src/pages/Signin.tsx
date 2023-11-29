// Signin.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth"
import { 
    Card, CardHeader, CardBody, CardFooter,
    Box, VStack, HStack, StackDivider, Center,
    Text, Heading, Image, Button
} from '@chakra-ui/react'

import { useAuth, useUser } from '../system/FirebaseProviders'

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
        userRef = useRef(),
        navigate = useNavigate(),
        [searchParams] = useSearchParams(),
        from = searchParams.get('from') || '/'

    userRef.current = useUser()

    useEffect (()=>{

        getRedirectResult(auth)
            .then((result) => {

                if (result === null) return

                // additional properties if needed
                // const credential = GoogleAuthProvider.credentialFromResult(result)
                // const token = credential.accessToken
                // const user = result.user

                // IdP data available using getAdditionalUserInfo(result)
                // ...
                if (userRef.current) {

                    navigate(from)

                }

            }).catch((error) => {

                // console.log('error.message',error.message)
                const jsonstring = error.message.match(/\{(.*)\}/)[0]
                // console.log('error jsonstring', jsonstring)
                const json = JSON.parse(jsonstring)
                // console.log('json', json)
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

    if (userRef.current === undefined) {
        return <div> Connecting... </div>
    }

    if (userRef.current) {
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
                    Sorry, permission is denied.<br />
                    {errorState.error?.message}<br />
                    {errorState.error?.details} </Text>}
            </Box>
            <Box style = {{textAlign:'center'}} >
                <Text>Self organize into Work Groups.</Text>
                <Text>Organize information into Work Boxes. &nbsp;
                    <Image style = {{display:'inline-block', verticalAlign:'middle'}} src = {boxIcon}/>
                </Text>
                <Text>Organize Work Boxes into Work Windows,</Text>
                <Text>Work Panels, and Work Spaces.</Text>
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
