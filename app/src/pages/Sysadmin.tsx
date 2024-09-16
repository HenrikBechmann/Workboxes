// Sysadmin.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, {CSSProperties, lazy} from 'react'

import { Box } from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'
const Scroller = lazy(() => import('react-infinite-grid-scroller'))

import { 
    Button, Text, Heading,
    Card, CardHeader, CardBody, CardFooter,
    Grid, GridItem, VStack,
    Center
} from '@chakra-ui/react'

const cardStyles = {
    cursor:'pointer',
}

const MenuTile = (props) => {
    const {header, body, buttonPrompt, nav} = props

    const navigate = useNavigate()

    const gotoNav = (e) => {
        e.preventDefault()
        navigate(nav)
    }

    return <Card onClick = {gotoNav} style = {cardStyles} boxShadow = {'0px 0px 15px gray'} h = '100%'>
        <CardHeader p = '3px'>
            <Heading fontSize = 'xl' textAlign = 'center'>{header}</Heading>
        </CardHeader>
        <CardBody p = '3px 12px'>
            <Text>{body}</Text>
        </CardBody>
    </Card>
}

const menuTileData = [
        {
            header:'Global settings',
            body:`One document holds global settings for clients; 
                another holds internal global settings.`,
            buttonPrompt:'Administer',
            nav:'/sysadmin/settings',
        },
        {
            header:'Workbox metadata',
            body:`Technical parameters for each data type, informing clients how to present fields.`,
            buttonPrompt:'Administer',
            nav:'/sysadmin/metadata',
        },
        {
            header:'User controls',
            body:`Invitations and suspensions, by email.`,
            buttonPrompt:'Administer',
            nav:'/sysadmin/usercontrols',
        },
        {
            header:'Help panels',
            body:`Sets the text for each help icon. Help icons are found all over the place.`,
            buttonPrompt:'Administer',
            nav:'/sysadmin/helppanels',
        },
        {
            header:'user admin',
            body:`General user admin procedures.`,
            buttonPrompt:'Administer',
            nav:'/sysadmin/administration',
        },
    ]

const scrollerContainer = {
    height:'100%', 
    position:'relative',
} as CSSProperties

const Sysadmin = (props) => {

    const getMenuTile = (index) => {
        return {
            component:<MenuTile {...menuTileData[index]} />,
            profile:{index}
        }
    }

    return <Grid 
        data-type = 'sysadmin'
        height = '100%'
        gridTemplateAreas={`"header"
                      "body"`}
        gridTemplateRows={'auto 1fr'}
        gridTemplateColumns={'1fr'}
    >
        <GridItem data-type = 'sysadmin-header' area={'header'}>
            <Center borderBottom = '1px solid gray'>
                <VStack data-type = 'sysadmin-header'>
                <Heading mt = {1} fontSize = 'xl'>System Administration Menu</Heading>
                <Heading mt = {0} fontSize = 'md' color = 'gray'>Available only to system administrators</Heading>
                </VStack>
            </Center>
        </GridItem>
        <GridItem data-type = 'sysadmin-body' area = 'body'>
            <Box data-type = 'tiles-body' style = {scrollerContainer}>
                <Scroller 
                    cellWidth = {200} 
                    cellHeight = {220} 
                    orientation = 'vertical'
                    padding = {[10,20]}
                    gap = {20}
                    startingListRange = {[0,4]}
                    getItemPack = {getMenuTile}
                    usePlaceholder = {false}
                />
            </Box>
        </GridItem>
    </Grid>

}

export default Sysadmin