// scaffold.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

// general support
import LayoutGeneral from '../components/Layout_General'

import Signin from '../pages/Signin'
import About from '../pages/About'
import Workbox from '../pages/WorkboxShared'
import Notices from '../pages/Notices'
import Classifieds from '../pages/Classifieds'
import Unauthorized from '../pages/Unauthorized'
import NotFound from '../pages/NotFound'

// user support
import RoutesMember from '../components/Routes_Member'
import LayoutMember from '../components/Layout_Member'

import Main from '../pages/Main'
import Account from '../pages/Account'
import Domains from '../pages/Domains'
import Memberships from '../pages/Memberships'
import Subscriptions from '../pages/Subscriptions'
import Registration from '../pages/Registration'

// system support
import RoutesSysadmin from '../components/Routes_Sysadmin'
import LayoutSysadmin from '../components/Layout_Sysadmin'

import Sysadmin from '../pages/Sysadmin'
import SysSettings from '../pages/SysSettings'
import Metadata from '../pages/Metadata'
import UserControls from '../pages/UserControls'
import HelpPanels from '../pages/HelpPanels'

const routes = [
    
    
    {
        path: '/',
        element: <RoutesMember />,
        children: [
            {
                element: <LayoutMember />,
                children:[
                    {
                        index: true,
                        element: <Main />,
                    },
                    {
                        path:'workspace',
                        children:[
                            {
                                index: true,
                                element: <Main />,
                            },
                            {
                                path: ':focus',
                                element:<Main />,
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
                            {
                                path:'registration',
                                element:<Registration />
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
        element: <RoutesSysadmin />,
        children: [
            {
                element: <LayoutSysadmin />,
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
        element: <LayoutGeneral />,
        children:[
            {
                path: 'about',
                element: <About />
            },
            {
                path: 'workbox',
                element: <Workbox />
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
