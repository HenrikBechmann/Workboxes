// Start.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Card, CardHeader, CardBody, CardFooter,
    Box, VStack, HStack, StackDivider, Center,
    Text, Heading, Image, Button
} from '@chakra-ui/react'

import tribalopolisIcon from '../../assets/fire.png'
import boxIcon from '../../assets/workbox.png'
import dragIcon from '../../assets/drag.png'

const Start = (props) => {

    const navigate = useNavigate()

    const gotoSignup = () => {

        navigate('/signup')

    }

    const gotoLogin = () => {

        navigate('/login')

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
                <Text mt = {3}><i>If you've received an invitation, <br />please sign up or log in.</i></Text>
                <HStack justifyContent = 'center' spacing = {10} mt = {5}>
                    <div><Button 
                        colorScheme = "blue" 
                        width = '150px'
                        onClick = {gotoSignup}
                    >
                        Sign Up
                    </Button>
                    <Text fontSize = 'xs' fontStyle = 'italic'>First time users</Text></div>
                    <div><Button 
                        colorScheme = "blue" 
                        width = '150px'
                        onClick = {gotoLogin}
                    >
                        Log In
                    </Button>
                    <Text fontSize = 'xs' fontStyle = 'italic'>Returning users</Text></div>
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

export default Start
