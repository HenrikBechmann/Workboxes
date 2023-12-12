// SysadminLaout.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import Toolbar from '../components/Toolbar'
import ToolbarStandard from '../components/ToolbarStandard'

const bodyStyle = {
    height: 'calc(100vh - 52px)', 
    display:'relative', 
    backgroundColor:'aliceblue',
    borderTop:'1px solid lightgray',
}

const LayoutSysadmin = (props) => {

    return <>
        <Toolbar>
            <ToolbarStandard />
        </Toolbar>
        <Box data-type = 'sysadmin-outlet' style = {bodyStyle}>
            <Outlet />
        </Box>
    </>

}

export default LayoutSysadmin