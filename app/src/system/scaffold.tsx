// scaffold.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import MemberRoutes from '../components/MemberRoutes'
import Tribalopolis from '../Tribalopolis'
import Signin from '../pages/Signin'
import Account from '../pages/Account'
import NotFound from '../pages/NotFound'
import About from '../pages/About'

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
                path: '*',
                element: <NotFound />,
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
]

export default routes