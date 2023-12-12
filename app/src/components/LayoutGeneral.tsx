// GeneralLayout.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Text, Box } from '@chakra-ui/react'

import { useUserData } from '../system/FirebaseProviders'

import Toolbar from '../components/Toolbar'
import ToolbarStandard from '../components/ToolbarStandard'

const bodyStyle = {
    height: 'calc(100vh - 52px)', 
    display:'relative', 
    backgroundColor:'aliceblue',
    borderTop:'1px solid lightgray',
}

const navlinkStyles = { 
    textDecoration:'underline', 
    fontStyle:'italic', 
    color:'blue',
}

const LayoutGeneral = (props) => {

    const userData = useUserData()

    if (userData === undefined) return null

    return <>
        <Toolbar>
            {!userData && <Text ml = '6px'>Welcome to Tribalopolis! <NavLink to = '/signin'
            style={navlinkStyles}
                >Sign in</NavLink></Text>}
            {userData && <ToolbarStandard />}
        </Toolbar>
        <Box data-type = 'general-outlet' style = {bodyStyle}>
            <Outlet />
        </Box>
    </>

}

export default LayoutGeneral