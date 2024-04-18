// scaffold.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

// general support
import GeneralLayoutController from '../components/Layout_GeneralController'

import Signin from '../pages/Signin'
import About from '../pages/About'
import Workbox from '../pages/WorkboxShared'
import Notices from '../pages/Notices'
import Classifieds from '../pages/Classifieds'
import Unauthorized from '../pages/Unauthorized'
import NotFound from '../pages/NotFound'

// user support
import UserRoutesController from '../components/RoutesController_User'
import UserLayout from '../components/Layout_User'

import Main from '../pages/Main'
import Account from '../pages/Account'
import Domains from '../pages/Domains'
import Memberships from '../pages/Memberships'
import Subscriptions from '../pages/Subscriptions'
import UserRegistration from '../pages/UserRegistration'

// system support
import SysadminRoutesController from '../components/RoutesController_Sysadmin'
import SysadminLayout from '../components/Layout_Sysadmin'

import Sysadmin from '../pages/Sysadmin'
import SysSettings from '../pages/SysSettings'
import Metadata from '../pages/Metadata'
import UserControls from '../pages/UserControls'
import HelpPanels from '../pages/HelpPanels'

const routes = [
    
    {
        path: '/',
        element: <UserRoutesController />,
        children: [
            {
                element: <UserLayout />,
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
                                path: ':workspaceID', // TODO verify name change
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
        path: '/sysadmin',
        element: <SysadminRoutesController />,
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
        element: <GeneralLayoutController />,
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
                path:'user-registration',
                element:<UserRegistration />
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
