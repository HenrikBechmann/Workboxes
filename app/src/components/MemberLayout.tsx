// MembersLayout.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import Toolbar from '../components/Toolbar'
import StandardToolbar from '../components/StandardToolbar'

const bodyStyle = {
    height: 'calc(100vh - 52px)', 
    display:'relative', 
    backgroundColor:'ghostwhite',
    borderTop:'1px solid lightgray',
}

const MemberLayout = (props) => {

    return <>
        <Toolbar>
            <StandardToolbar />
        </Toolbar>
        <Box data-type = 'members-outlet' style = {bodyStyle}>
            <Outlet />
        </Box>
    </>

}

export default MemberLayout