// SysadminLaout.tsx

// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet } from 'react-router-dom'

const bodyStyle = {height: 'calc(100vh - 80px)', display:'relative', backgroundColor:'gray'}

const SysadminLayout = (props) => {

    return <>
        <div data-type = 'sysadmin-layout' style = {{height:'40px'}}>Header</div>
        <div data-type = 'sysadmin-outlet' style = {bodyStyle}>
            <Outlet />
        </div>
        <div style = {{height:'40px'}}>Footer</div>
    </>

}

export default SysadminLayout