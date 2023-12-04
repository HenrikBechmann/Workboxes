// MembersLayout.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet } from 'react-router-dom'

import Toolbar from '../components/Toolbar'
import StandardToolbar from '../components/StandardToolbar'

const bodyStyle = {
    height: 'calc(100vh - 30px)', 
    display:'relative', 
    backgroundColor:'ghostwhite'
}

const MembersLayout = (props) => {

    return <>
        <div style = {{minHeight:0}}>
        <Toolbar>
            <StandardToolbar />
        </Toolbar>
        </div>
        <div data-type = 'members-outlet' style = {bodyStyle}>
            <Outlet />
        </div>
    </>

}

export default MembersLayout