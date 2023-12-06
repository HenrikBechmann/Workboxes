// scaffold.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

// general support
import GeneralLayout from '../components/GeneralLayout'

import Signin from '../pages/Signin'
import About from '../pages/About'
import Notices from '../pages/Notices'
import Classifieds from '../pages/Classifieds'
import Unauthorized from '../pages/Unauthorized'
import NotFound from '../pages/NotFound'

// user support
import MemberRoutes from '../components/MemberRoutes'
import MemberLayout from '../components/MemberLayout'

import Tribalopolis from '../Tribalopolis'
import Account from '../pages/Account'
import Domains from '../pages/Domains'
import Memberships from '../pages/Memberships'
import Subscriptions from '../pages/Subscriptions'

// system support
import SysadminRoutes from '../components/SysadminRoutes'
import SysadminLayout from '../components/SysadminLayout'

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
                element: <MemberLayout />,
                children:[
                    {
                        index: true,
                        element: <Tribalopolis />,
                    },
                    {
                        path:'workspace',
                        children:[
                            {
                                index: true,
                                element: <Tribalopolis />,
                            },
                            {
                                path: ':focus',
                                element:<Tribalopolis />,
                            },
                        ]
                    },
                    {
                        path:'notices',
                        element:<Notices />
                    },
                    {
                        path:'classifieds',
                        element:<Classifieds />
                    },
                    {
                        path: 'account',
                        children:[
                            {
                                index:true,
                                element: <Account />,
                            },
                            {
                                path:'domains',
                                element:<Domains />
                            },
                            {
                                path:'memberships',
                                element:<Memberships />
                            },
                            {
                                path:'subscriptions',
                                element:<Subscriptions />
                            },
                        ]
                    },
                    {
                        path: 'unauthorized',
                        element: <Unauthorized />,
                    },
                ]
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
        path:'/',
        element: <GeneralLayout />,
        children:[
            {
                path: 'about',
                element: <About />
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
]

export default routes
