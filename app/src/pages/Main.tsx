// Tribalopolis.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef } from 'react'

import Toolbar from '../components/Toolbar'
import WorkspaceToolbar from '../components/WorkspaceToolbar'

export const Main = (props) => {

    const workspaceStyleRef = useRef({
        height: 'calc(100% - 47px)', 
        display:'relative', 
        backgroundColor:'ghostwhite',
        borderTop:'1px solid silver',
        borderBottom:'1px solid silver'
    })

    const workspaceStyle = workspaceStyleRef.current

    return <>
        <div data-type = 'members-outlet' style = {workspaceStyle}>
            Main page
        </div>
        <Toolbar>
            <WorkspaceToolbar />
        </Toolbar>
    </>
}

export default Main
