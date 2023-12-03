// Sysadmin.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'

import { useNavigate } from 'react-router-dom'
import Scroller from 'react-infinite-grid-scroller'

import { 
    Button, Text, Heading,
    Card, CardHeader, CardBody, CardFooter,
    Grid, GridItem,
    Center
} from '@chakra-ui/react'


const MenuTile = (props) => {
    const {header, body, footer, buttonPrompt, nav} = props

    const navigate = useNavigate()

    const gotoNav = () => {
        navigate(nav)
    }

    return <Card>
        <CardHeader>
            {header}
        </CardHeader>
        <CardBody>
            {body}
        </CardBody>
        <CardFooter>
            {footer}
            <Button onClick = {gotoNav}>
                {buttonPrompt}
            </Button>
        </CardFooter>
    </Card>
}

const menuTileData = [
        {
            header:'Global settings',
            body:'',
            footer:null,
            buttonPrompt:'Go to global settings',
            nav:'/sysadmin/settings',
        },
        {
            header:'Document metadata',
            body:'',
            footer:null,
            buttonPrompt:'Go to metadata',
            nav:'/sysadmin/metadata',
        },
        {
            header:'User controls',
            body:'',
            footer:null,
            buttonPrompt:'Go to User controls',
            nav:'/sysadmin/usercontrols',
        },
        {
            header:'Help panels',
            body:'',
            footer:null ,
            buttonPrompt:'Go to help panels',
            nav:'/sysadmin/helppanels',
        },
    ]

const outerSysadminStyle = {
    height: '100%', 
    display:'relative'
}

const Sysadmin = (props) => {

    return <div data-type = 'sysadmin' style = {outerSysadminStyle}>

    <Grid height = '100%'
      templateAreas={`"header"
                      "body"`}
      gridTemplateRows={'50px 1fr'}
      gridTemplateColumns={'1fr'}
    >
      <GridItem area={'header'}>
          <Center>
              <Heading mt = {3} fontSize = 'xl'>System Administration</Heading>
          </Center>
      </GridItem>
      <GridItem area={'body'}>
          
      </GridItem>
    </Grid>

    </div>

}

export default Sysadmin