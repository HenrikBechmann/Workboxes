// NotFound.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useEffect, useRef} from 'react'

import { signOut } from "firebase/auth"

import { useNavigate } from 'react-router-dom'

import { Box, Button, Text } from '@chakra-ui/react'

import { useAuth, useErrorControl } from '../system/WorkboxesProvider'

const ErrorPage = (props) => {

    const 
        errorControl = useErrorControl(),
        auth = useAuth(),
        navigate = useNavigate(),
        errorControlRef = useRef(null)

    errorControlRef.current = errorControl

    useEffect(()=>{

        if (!errorControl.length) navigate('/', {replace:true})

    },[])

    if (errorControl.length) console.log('errorControl from error page', errorControl)

    async function logOut() {
        try {
            await signOut(auth)
        } catch (error) {
            console.log('error logging out on error page', error)
        }
        navigate('/signin')
    }

    return <Box height= '100vh' position = 'relative'>
        <Box 
            border = '2px solid silver'
            position = 'absolute' 
            width = '300px' 
            top = '50px' 
            left = 'calc(50% - 150px)'
            padding = '5px'
            borderRadius = '8px'
        >
            <Text>Error: something went wrong (error count = {errorControl.length}). Best to log out and try again.
            For tech support, see notes in the console. <Button onClick = {logOut} colorScheme = 'blue'>Logout</Button></Text>
            <Text>Error description: {errorControl[0]?.description || 'N/A'}</Text>
        </Box>
    </Box>

}

export default ErrorPage