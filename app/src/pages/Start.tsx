// Start.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'
import { 
    Card, CardHeader, CardBody, CardFooter,
    Box, Stack, StackDivider,
    Text, Heading, Image
} from '@chakra-ui/react'

import image from '../../public/fire.png'

export const Start = (props) => {

    return ( 
    <Card margin = {3}>
    
        <CardBody>
            <Stack divider={<StackDivider />} spacing='4'>
            <Box>
                <Heading size = 'xl'>
                    <Image src = {image} /> Use Tribalopolis to...
                </Heading>
            </Box>
            <Box>
                <Heading size = 'lg'> Organize, Re-organize, Communicate, Collaborate</Heading>
            </Box>
            <Box>
                <Text>While we get established, we're accepting members by invitation only.</Text>
                <Text>If you've received an invitation, please sign up or log in.</Text>
            </Box>
            </Stack>
        </CardBody>
    
    </Card>
    )
}

export default Start
