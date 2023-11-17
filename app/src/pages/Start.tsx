// Start.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'
import { 
    Card, CardHeader, CardBody, CardFooter,
    Box, VStack, HStack, StackDivider,
    Text, Heading, Image, Center, Icon
} from '@chakra-ui/react'

import tribalopolisIcon from '../../assets/fire.png'
import boxIcon from '../../assets/workbox.png'

export const Start = (props) => {

    return (
    <Card ml = {20} mr = {20} mt = {10} >
    
        <CardBody>
            <Center>
            <VStack divider={<StackDivider />} spacing='4'>
            <Box>
                <Heading style = {{textAlign:'center'}} size = 'lg'>Welcome!</Heading>
                <Heading style = {{textAlign:'center'}} size = 'xl'>
                    <Text>Use <Image style = {{display:"inline-block", verticalAlign:'baseline'}} src = {tribalopolisIcon} />Tribalopolis to...</Text>
                </Heading>
            </Box>
            <Box>
                <Heading style = {{textAlign:'center'}} size = 'lg'> Organize, Re-organize, <br /> Communicate, and Collaborate</Heading>
            </Box>
            <Box style = {{textAlign:'center'}} >
                <Text>While we get established, we're accepting members by invitation only.</Text>
                <Text mt = {3}><i>If you've received an invitation, <br />please sign up or log in.</i></Text>
            </Box>
            <Box style = {{textAlign:'center'}} >
                <Text>Organize your information into our <Image style = {{display:'inline-block', verticalAlign:'middle'}} src = {boxIcon}/> Work Bins.</Text>
                <Text>Cluster the Work Bins into Work Windows.</Text>
                <Text>Drag and Drop things around to keep up to date.</Text>
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
