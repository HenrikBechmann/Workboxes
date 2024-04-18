// GeneralLayout.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, {useRef, useState} from 'react'
import { Outlet as RouteController, NavLink, Navigate } from 'react-router-dom'
import { Text, Box, Grid, GridItem, Link } from '@chakra-ui/react'

import { signOut } from "firebase/auth"

import { useUserData, useUserRecords, useAuth } from '../system/FirebaseProviders'

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

const LayoutGeneralController = (props) => {

    const 
        userData = useUserData(),
        userRecords = useUserRecords(),
        auth = useAuth(),
        [layoutState, setLayoutState] = useState('ready')

    console.log('LayoutGeneral:',userData, userRecords, layoutState)

    if (userData === undefined) return null

    if (userData && !userRecords.user) return null

    const logOut = () => {
            signOut(auth).then(() => {
              setLayoutState('signedout')
              // console.log('Sign-out successful.')
            }).catch((error) => {
                // console.log('signout error', error)
              // An error happened.
            })
        }
    // console.log('in LayoutGeneral: userData, userRecords.user', userData, userRecords.user, layoutState)

    // TODO this should not be necessary
    if (layoutState == 'signedout') {
        return <Navigate to = {`/signin`}/>
    }

// <Link color = 'teal.500' onClick = {logOut}>Sign out</Link> if you like and sign back in later.
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
                {!userData && <Text ml = '6px'>Welcome to Workboxes! <NavLink to = '/signin'
                style={navlinkStyles}
                    >Sign in</NavLink></Text>}
                {(userData && userRecords.user.profile && !userRecords.user.profile.fully_registered) && 
                    <Text ml = '6px'>Welcome to Workboxes!</Text>
                }
                {(userData && userRecords.user.profile && userRecords.user.profile.fully_registered) && <ToolbarStandard />}
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'grid-body' gridArea = 'body' width = '100vw'>
            <Box data-type = 'general-outlet' style = {bodyStyle}>
                <RouteController />
            </Box>
        </GridItem>
    </Grid>
}

export default LayoutGeneralController