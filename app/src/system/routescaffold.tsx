// scaffold.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

// general support
import Signin from '../pages/Signin'

// GeneralRouteController; GeneralLayout
import GeneralRouteController from '../components/routing/GeneralRouteController'
// public
import About from '../pages/About'
import Workbox from '../pages/WorkboxShared'
import NotFound from '../pages/NotFound'
import ErrorPage from '../pages/ErrorPage'

// user support
import UserRouteController from '../components/routing/UserRouteController'
import UserRegistration from '../pages/UserRegistration' // TODO part of user support?

import UserLayout from '../components/routing/UserLayout'
import Main from '../pages/Main'
import Notices from '../pages/Notices'
import Classifieds from '../pages/Classifieds'

import Account from '../pages/Account'
import Domains from '../pages/Domains'
import Memberships from '../pages/Memberships'
import Subscriptions from '../pages/Subscriptions'

import Unauthorized from '../pages/Unauthorized'

// system support
import AdminRouteController from '../components/routing/AdminRouteController'

import AdminLayout from '../components/routing/AdminLayout'
import Sysadmin from '../pages/Sysadmin'
import SysSettings from '../pages/SysSettings'
import Metadata from '../pages/Metadata'
import UserControls from '../pages/UserControls'
import HelpPanels from '../pages/HelpPanels'
import Administration from '../pages/Administration'

const routes = [
    
    {
        path: '/',
        element: <UserRouteController />,
        children: [
            {
                path:'user-registration',
                element:<UserRegistration />
            },
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
                                path: ':workspaceID',
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
        element: <AdminRouteController />,
        children: [
            {
                element: <AdminLayout />,
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
                    {
                        path:'administration',
                        element:<Administration />
                    },
                ]
            },
        ],
    },
    {
        path:'/',
        element: <GeneralRouteController />,
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
        path: '/error',
        element: <ErrorPage />
    },
    {
        path: 'signin',
        element: <Signin />
    },
]

export default routes
