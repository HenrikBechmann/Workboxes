// Start.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'
import { 
    Card, CardHeader, CardBody, CardFooter,
    Box, VStack, HStack, StackDivider,
    Text, Heading, Image, Center, Icon, Button
} from '@chakra-ui/react'

import tribalopolisIcon from '../../assets/fire.png'
import boxIcon from '../../assets/workbox.png'
import dragIcon from '../../assets/drag.png'

export const Start = (props) => {

    return (
    <Card ml = {20} mr = {20} mt = {10} >
    
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
                <Text mt = {3}><i>If you've received an invitation, <br />please sign up or log in.</i></Text>
                <HStack justifyContent = 'center' spacing = {10} mt = {5}>
                    <div><Button colorScheme = "blue" width = '180px'>Sign Up</Button><Text fontSize = 'sm' fontStyle = 'italic'>First time users</Text></div>
                    <div><Button colorScheme = "blue" width = '180px'>Log In</Button><Text fontSize = 'sm' fontStyle = 'italic'>Returning users</Text></div>
                </HStack>
            </Box>
            <Box style = {{textAlign:'center'}} >
                <Text>Organize your information into our <Image style = {{display:'inline-block', verticalAlign:'middle'}} src = {boxIcon}/> Work Boxes.</Text>
                <Text>Cluster the Work Boxes into Work Windows.</Text>
                <Text>Drag and Drop <Image style = {{display:'inline-block', verticalAlign:'middle'}} src = {dragIcon}/> things around to keep up to date.</Text>
                <Text>Organize the Work Windows into Work Panels.</Text>
                <Text>Organize the Work Panels into Work Spaces.</Text>
                <Text>Have fun!</Text>
            </Box>
            </VStack>
        </Center>
        </CardBody>

    </Card>
    )
}

// <Box style = {{display:'flex',flexDirection:'column', justifyContent:'space-between'}}></Box>

export default Start
