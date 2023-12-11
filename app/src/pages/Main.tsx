// Tribalopolis.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef } from 'react'

import Toolbar from '../components/Toolbar'
import WorkspaceToolbar from '../components/WorkspaceToolbar'

// ------------------------- static values --------------------
const workspaceStyle = {
    height: 'calc(100% - 47px)', 
    display:'relative', 
    backgroundColor:'ghostwhite',
    borderTop:'1px solid silver',
    borderBottom:'1px solid silver'
}

// ------------------------ Main component -------------------
export const Main = (props) => {

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
