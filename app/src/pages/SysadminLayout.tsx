// SysadminLaout.tsx

// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet } from 'react-router-dom'

import Toolbar from '../components/Toolbar'

const bodyStyle = {
    height: 'calc(100vh - 28px)', 
    display:'relative', 
    backgroundColor:'gray'
}

const SysadminLayout = (props) => {

    return <>
        <Toolbar />
        <div data-type = 'sysadmin-outlet' style = {bodyStyle}>
            <Outlet />
        </div>
    </>

}

export default SysadminLayout