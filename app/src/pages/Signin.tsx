// Signin.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useLocation, NavLink } from 'react-router-dom'
import { GoogleAuthProvider, signInWithRedirect, signInWithPopup, getRedirectResult, getAdditionalUserInfo } from "firebase/auth"
import { 
    Card, CardHeader, CardBody, CardFooter,
    Box, VStack, HStack, StackDivider, Center,
    Text, Heading, Image, Button
} from '@chakra-ui/react'

import { useAuth, useUserAuthData, useErrorControl } from '../system/WorkboxesProvider'

import tribalopolisIcon from '../../assets/workbox-logo.png'
import boxIcon from '../../assets/workbox.png'
import dragIcon from '../../assets/drag.png'

const provider = new GoogleAuthProvider()
provider.setCustomParameters({
  prompt: 'select_account',
})

const navlinkStyles = { 
    textDecoration:'underline', 
    fontStyle:'italic', 
    color:'blue',
}

const Signin = (props) => {

    const 
        [errorState,setErrorState] = useState<any>(null),
        auth = useAuth(),
        navigate = useNavigate(),
        [searchParams] = useSearchParams(),
        from = searchParams.get('from') || '/',
        location = useLocation(),
        [signinState, setSigninState] = useState('ready'),
        userAuthData = useUserAuthData(),
        userAuthDataRef = useRef(null),
        errorControl = useErrorControl(),
        errorControlRef = useRef(null)

    userAuthDataRef.current = userAuthData

    // console.log('userAuthData',userAuthData)

    useEffect(()=>{

        if (userAuthData) { // shouldn't be here
            // console.log('redirecting to home')
            navigate('/',{replace:true})
        }

    },[userAuthData])

    // async function getRedirect() {

    //     await getRedirectResult(auth)
        
    //         .then((user) => {

    //             console.log('getRedirectResult', user, auth)

    //             if (user === null) {

    //                 return

    //             }

    //             // additional properties if needed
    //             // const token = credential.accessToken
    //             // const user = result.user
    //             // IdP data available using getAdditionalUserInfo(result)
    //             // ...
    //             if (user) { //(userRef.current) {

    //                 // const credential = GoogleAuthProvider.credentialFromResult(result)
    //                 // const additionalInfo = getAdditionalUserInfo(result)
    //                 // console.log('credential, additionalInfo',credential, additionalInfo)
    //                 // setSigninState('signedin')
    //                 navigate(from)

    //             }

    //         }).catch((error) => {

    //             console.log('signin error', error)

    //             try {
    //                 const jsonstring = error.message.match(/\{(.*)\}/)[0]
    //                 const json = JSON.parse(jsonstring)
    //                 const errorStatus = json.error?.status
    //                 if (errorStatus == 'PERMISSION_DENIED') {
    //                     json.error.status = 'Sorry, permission is denied.'
    //                 }
    //                 setErrorState(json)
    //             } catch(e) {

    //                 console.log('e', e)
    //                 errorControlRef.current.push({description: 'error interpreting server error',error:e})
    //                 navigate('/error',{replace:true})

    //             }
    //             // Handle Errors here.
    //             // const errorCode = error.code;
    //             // const errorMessage = error.message;
    //             // // The email of the user's account used.
    //             // const email = error.customData?.email;
    //             // // The AuthCredential type that was used.
    //             // const credential = GoogleAuthProvider.credentialFromError(error);
    //         });

    // }

    useEffect (()=>{

        // getRedirect()

        // getRedirectResult(auth)
        //     .then((result) => {

        //         console.log('getRedirectResult', result)

        //         if (result === null) {

        //             return

        //         }

        //         // additional properties if needed
        //         // const token = credential.accessToken
        //         // const user = result.user
        //         // IdP data available using getAdditionalUserInfo(result)
        //         // ...
        //         if (result) { //(userRef.current) {

        //             // const credential = GoogleAuthProvider.credentialFromResult(result)
        //             // const additionalInfo = getAdditionalUserInfo(result)
        //             // console.log('credential, additionalInfo',credential, additionalInfo)
        //             // setSigninState('signedin')
        //             navigate(from)

        //         }

        //     }).catch((error) => {

        //         console.log('signin error', error)

        //         try {
        //             const jsonstring = error.message.match(/\{(.*)\}/)[0]
        //             const json = JSON.parse(jsonstring)
        //             const errorStatus = json.error?.status
        //             if (errorStatus == 'PERMISSION_DENIED') {
        //                 json.error.status = 'Sorry, permission is denied.'
        //             }
        //             setErrorState(json)
        //         } catch(e) {

        //             console.log('e', e)
        //             errorControlRef.current.push({description: 'error interpreting server error',error:e})
        //             navigate('/error',{replace:true})

        //         }
        //         // Handle Errors here.
        //         // const errorCode = error.code;
        //         // const errorMessage = error.message;
        //         // // The email of the user's account used.
        //         // const email = error.customData?.email;
        //         // // The AuthCredential type that was used.
        //         // const credential = GoogleAuthProvider.credentialFromError(error);
        //     });

    },[])

    const signInWithGoogle = () => {

        // signInWithRedirect(auth, provider)
        // signInWithPopup(auth, provider)

        signInWithPopup(auth, provider)
          .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // IdP data available using getAdditionalUserInfo(result)
            // ...
            if (user) {
                navigate(from)
            }
          }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
          });
    }

    if (userAuthData === undefined) { // signin in progress

        return <Box> Connecting... </Box>

    } else if (userAuthData) { // no need for signin

        return null

    }

    return (
    <Card ml = {20} mr = {20} mt = {5} >
    
        <CardBody>
            <Center>
            <VStack divider={<StackDivider />} spacing='4'>
            <Box style = {{textAlign:'center'}} >
                <Heading size = 'lg'>Welcome to the Workboxes App!</Heading>
                <Heading size = 'xl'>
                    <Text>Use <Image style = {{display:"inline-block", verticalAlign:'baseline'}} src = {tribalopolisIcon} />Workboxes to...</Text>
                </Heading>
            </Box>
            <Box style = {{textAlign:'center'}} >
                <Heading size = 'lg'> Get things done:</Heading>
                <Heading size = 'lg'> Organize, Re-organize, <br /> Communicate, and Collaborate</Heading>
                <Text>
                    <NavLink to = '/about' style={navlinkStyles} >Learn more</NavLink>
                </Text>
            </Box>
            <Box style = {{textAlign:'center'}} >
                <Text>While we get established, we're accepting members by invitation only.</Text>
                <Text mt = {3}><i>If you've received an invitation, please sign in.</i></Text>
                <HStack justifyContent = 'center' spacing = {10} mt = {5}>
                    <Box><Button 
                        colorScheme = "blue" 
                        width = '300px'
                        onClick = {signInWithGoogle}
                    >
                        Sign in using Google
                    </Button></Box>
                </HStack>
                {errorState && 
                    <Text mt = {"20px"} style = {{backgroundColor:'lightpink', padding:'10px 3px 10px 3px'}}> 
                    {errorState.error.status}<br />
                    {errorState.error?.message}<br />
                    {errorState.error?.details} </Text>}
            </Box>
            <Box style = {{textAlign:'center'}} >
                <Text>- Organize information into Workboxes, and do your work there. &nbsp;
                    <Image style = {{display:'inline-block', verticalAlign:'middle'}} src = {boxIcon}/>
                </Text>
                <Text>- Organize Workboxes into Work Panels, and Work Panels into Work Spaces.</Text>
                <Text>- Even organize into Work Groups (Domains).</Text>
            </Box>
            </VStack>
        </Center>
        </CardBody>

    </Card>
    )
}

export default Signin
