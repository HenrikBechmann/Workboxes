// GeneralLayout.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Text, Box, Grid, GridItem } from '@chakra-ui/react'

import { useUserData } from '../system/FirebaseProviders'

import ToolbarFrame from '../components/toolbars/Toolbar_Frame'
import ToolbarStandard from '../components/toolbars/Toolbar_Standard'

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
        width = '100vw'
        gridTemplateColumns = '1fr' 
        gridTemplateRows = 'auto 1fr'
        gridTemplateAreas = {`"header"
                              "body"`}
    >
        <GridItem data-type = 'grid-header' gridArea = 'header' width = '100vw'>
            <ToolbarFrame>
                {!userData && <Text ml = '6px'>Welcome to Tribalopolis! <NavLink to = '/signin'
                style={navlinkStyles}
                    >Sign in</NavLink></Text>}
                {userData && <ToolbarStandard />}
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'grid-body' gridArea = 'body' width = '100vw'>
            <Box data-type = 'general-outlet' style = {bodyStyle}>
                <Outlet />
            </Box>
        </GridItem>
    </Grid>
}

export default LayoutGeneral