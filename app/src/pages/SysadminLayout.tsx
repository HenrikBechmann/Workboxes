// SysadminLaout.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet } from 'react-router-dom'

import Toolbar from '../components/Toolbar'
import StandardToolbar from '../components/StandardToolbar'

const bodyStyle = {
    height: 'calc(100vh - 36px)', 
    display:'relative', 
    backgroundColor:'aliceblue',
    borderTop:'1px solid lightgray',
}

const SysadminLayout = (props) => {

    return <>
        <Toolbar>
            <StandardToolbar />
        </Toolbar>
        <div data-type = 'sysadmin-outlet' style = {bodyStyle}>
            <Outlet />
        </div>
    </>

}

export default SysadminLayout