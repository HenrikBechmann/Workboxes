// scaffold.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import MemberRoutes from '../components/MemberRoutes'
import SysadminRoutes from '../components/SysadminRoutes'
import Tribalopolis from '../Tribalopolis'
import Signin from '../pages/Signin'
import Account from '../pages/Account'
import NotFound from '../pages/NotFound'
import Unauthorized from '../pages/Unauthorized'
import About from '../pages/About'
import Sysadmin from '../pages/Sysadmin'
import SysadminLayout from '../pages/SysadminLayout'

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
        path: '/sysadmin',
        element: <SysadminRoutes />,
        children: [
            {
                element: <SysadminLayout />,
                children: [
                    {
                        index:true,
                        element:<Sysadmin />
                    }
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