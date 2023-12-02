// SysadminLaout.tsx

// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet } from 'react-router-dom'

import Toolbar from '../components/Toolbar'

const bodyStyle = {height: 'calc(100vh - 56px)', display:'relative', backgroundColor:'gray'}

const SysadminLayout = (props) => {

    return <>
        <div data-type = 'sysadmin-layout' style = {{height:'28px'}}><Toolbar /></div>
        <div data-type = 'sysadmin-outlet' style = {bodyStyle}>
            <Outlet />
        </div>
        <div style = {{height:'28px'}}>Footer</div>
    </>

}

export default SysadminLayout