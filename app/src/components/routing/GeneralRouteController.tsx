// GeneralRouteController.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState} from 'react'
import { Outlet as RouterOutput, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { Text, Box, Grid, GridItem, Link } from '@chakra-ui/react'

import { useUserAuthData, useUserRecords, useAuth, useErrorControl } from '../../system/WorkboxesProvider'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import ToolbarStandard from '../toolbars/Toolbar_Standard'

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

const GeneralRouteController = (props) => {

    const 
        userAuthData = useUserAuthData(),
        userRecords = useUserRecords(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    if (errorControl.length) navigate('/error')

    if (userAuthData === undefined) {

        return <Box> Loading... </Box>

    } else if (userAuthData && !userRecords.user) {

        return <Box> Registering... </Box>

    } else if (!userRecords.user.profile.flags.fully_registered) { // pre-empt anything else

        return <Navigate to = 'user-registration' />

    }

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
                {!userAuthData && <Text ml = '6px'>Welcome to Workboxes! 
                    <NavLink to = '/signin' style={navlinkStyles} >
                        Sign in
                    </NavLink>
                </Text>}
                {userAuthData && <ToolbarStandard />}
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'grid-body' gridArea = 'body' width = '100vw'>
            <Box data-type = 'general-outlet' style = {bodyStyle}>
                <RouterOutput />
            </Box>
        </GridItem>
    </Grid>
}

export default GeneralRouteController