// NotFound.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import { Box } from '@chakra-ui/react'

const ErrorPage = (props) => {

    return <Box height= '100%' position = 'relative'>
        <Box 
            border = '2px solid silver'
            position = 'absolute' 
            width = '300px' 
            height = '100px' 
            top = 'calc(50% - 100px)' 
            left = 'calc(50% - 150px)'
            padding = '5px'
            borderRadius = '8px'
        >
            Error: something went wrong. Best to log out and try again.
            For tech support, see notes in the console.
        </Box>
    </Box>

}

export default ErrorPage