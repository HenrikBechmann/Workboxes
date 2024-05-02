// NotFound.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import { signOut } from "firebase/auth"

import { useNavigate } from 'react-router-dom'

import { Box, Button } from '@chakra-ui/react'

import { useAuth, useErrorControl } from '../system/WorkboxesProvider'

const ErrorPage = (props) => {

    const 
        errorControl = useErrorControl(),
        auth = useAuth(),
        navigate = useNavigate()

    async function logOut() {
        await signOut(auth)
        navigate('/signin')
    }

    return <Box height= '100vh' position = 'relative'>
        <Box 
            border = '2px solid silver'
            position = 'absolute' 
            width = '300px' 
            height = '150px' 
            top = 'calc(50% - 150px)' 
            left = 'calc(50% - 150px)'
            padding = '5px'
            borderRadius = '8px'
        >
            Error: something went wrong (error count = {errorControl.length}). Best to log out and try again.
            For tech support, see notes in the console. <Button onClick = {logOut} colorScheme = 'blue'>Logout</Button>
        </Box>
    </Box>

}

export default ErrorPage