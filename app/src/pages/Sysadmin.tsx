// Sysadmin.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'

import { useNavigate } from 'react-router-dom'
import Scroller from 'react-infinite-grid-scroller'

import { 
    Button, Text, Heading,
    Card, CardHeader, CardBody, CardFooter,
    Grid, GridItem, VStack,
    Center, Flex
} from '@chakra-ui/react'


const MenuTile = (props) => {
    const {header, body, buttonPrompt, nav} = props

    const navigate = useNavigate()

    const gotoNav = () => {
        navigate(nav)
    }

    return <Card boxShadow = {'0px 0px 15px gray'} h = '100%'>
        <CardHeader p = '3px'>
            <Heading fontSize = 'xl' textAlign = 'center'>{header}</Heading>
        </CardHeader>
        <CardBody p = '3px 12px'>
            <Text>{body}</Text>
        </CardBody>
        <CardFooter justifyContent = 'center'>
            <Button onClick = {gotoNav}>
                {buttonPrompt}
            </Button>
        </CardFooter>
    </Card>
}

const menuTileData = [
        {
            header:'Global settings',
            body:`One document holds global settings for clients; 
                another holds internal global settings.`,
            buttonPrompt:'Go to global settings',
            nav:'/sysadmin/settings',
        },
        {
            header:'Document metadata',
            body:`Technical parameters for each data type, informing clients how to present fields.`,
            buttonPrompt:'Go to metadata',
            nav:'/sysadmin/metadata',
        },
        {
            header:'User controls',
            body:`Invitations and suspensions, by email.`,
            buttonPrompt:'Go to User controls',
            nav:'/sysadmin/usercontrols',
        },
        {
            header:'Help panels',
            body:`Sets the text for each help icon. Help icons are found all over the place.`,
            buttonPrompt:'Go to help panels',
            nav:'/sysadmin/helppanels',
        },
    ]

const outerSysadminStyle = {
    height: '100%', 
    display:'relative'
}

const Sysadmin = (props) => {

    const getMenuTile = (index) => {
        return {
            component:<MenuTile {...menuTileData[index]} />,
            profile:{index}
        }
    }

    return <div data-type = 'sysadmin' style = {outerSysadminStyle}>

        <Grid height = '100%'
          templateAreas={`"header"
                          "body"`}
          gridTemplateRows={'56px 1fr'}
          gridTemplateColumns={'1fr'}
        >
          <GridItem area={'header'}>
              <Center>
                  <VStack>
                  <Heading mt = {1} fontSize = 'xl'>System Administration</Heading>
                  <Heading mt = {0} fontSize = 'md' color = 'gray'>Available only to system administrators</Heading>
                  </VStack>
              </Center>
          </GridItem>
          <GridItem area={'body'}>
              <div style = {{height:'100%', position:'relative'}}>
              <Scroller 
                  cellWidth = {200} 
                  cellHeight = {220} 
                  orientation = 'vertical'
                  padding = {20}
                  gap = {20}
                  startingListRange = {[0,3]}
                  getItemPack = {getMenuTile}
                  usePlaceholder = {false}
              />
              </div>
          </GridItem>
        </Grid>

    </div>

}

export default Sysadmin