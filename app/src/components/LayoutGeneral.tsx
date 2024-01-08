// GeneralLayout.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Text, Box, Grid, GridItem } from '@chakra-ui/react'

import { useUserData } from '../system/FirebaseProviders'

import Toolbar from '../components/Toolbar'
import ToolbarStandard from '../components/ToolbarStandard'

const bodyStyle = {
    height: '100%', 
    display:'relative', 
    backgroundColor:'aliceblue',
    borderTop:'1px solid lightgray',
    overflow:'hidden', // hide drawers
}

const navlinkStyles = { 
    textDecoration:'underline', 
    fontStyle:'italic', 
    color:'blue',
}

const LayoutGeneral = (props) => {

    const userData = useUserData()

    if (userData === undefined) return null

    return <Grid
        data-type = 'layout-general'
        height = '100vh' 
        gridTemplateColumns = '1fr' 
        gridTemplateRows = 'auto 1fr'
        gridTemplateAreas = {`"header"
                              "body"`}
    >
        <GridItem data-type = 'grid-header' gridArea = 'header'>
            <Toolbar>
                {!userData && <Text ml = '6px'>Welcome to Tribalopolis! <NavLink to = '/signin'
                style={navlinkStyles}
                    >Sign in</NavLink></Text>}
                {userData && <ToolbarStandard />}
            </Toolbar>
        </GridItem>
        <GridItem data-type = 'grid-body' gridArea = 'body'>        
            <Box data-type = 'general-outlet' style = {bodyStyle}>
                <Outlet />
            </Box>
        </GridItem>
    </Grid>
}

export default LayoutGeneral