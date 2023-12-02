// scaffold.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

// ananymous support
import Signin from '../pages/Signin'
import About from '../pages/About'
import NotFound from '../pages/NotFound'

// user support
import MemberRoutes from '../components/MemberRoutes'
import Tribalopolis from '../Tribalopolis'
import Account from '../pages/Account'
import Unauthorized from '../pages/Unauthorized'

// system support
import SysadminRoutes from '../components/SysadminRoutes'
import SysadminLayout from '../pages/SysadminLayout'
import Sysadmin from '../pages/Sysadmin'
import SysSettings from '../pages/SysSettings'
import Metadata from '../pages/Metadata'
import UserControls from '../pages/UserControls'
import HelpPanels from '../pages/HelpPanels'

const routes = [
    
    {
        path: '/',
        element: <MemberRoutes />,
        children: [
            {
                index: true,
                element: <Tribalopolis />,
            },
            {
                path: 'account',
                element: <Account />,
            },
            {
                path: 'unauthorized',
                element: <Unauthorized />,
            },
        ],
    },
    {
        path: 'sysadmin',
        element: <SysadminRoutes />,
        children: [
            {
                element: <SysadminLayout />,
                children:[
                    {
                        index:true,
                        element:<Sysadmin />,
                    },
                    {
                        path:'settings',
                        element:<SysSettings />
                    },
                    {
                        path:'metadata',
                        element:<Metadata />
                    },
                    {
                        path:'usercontrols',
                        element:<UserControls />
                    },
                    {
                        path:'helppanels',
                        element:<HelpPanels />
                    },
                ]
            },
        ],
    },
    {
        path: 'signin',
        element: <Signin />
    },
    {
        path: 'about',
        element: <About />
    },
    {
        path: '*',
        element: <NotFound />,
    },
]

export default routes