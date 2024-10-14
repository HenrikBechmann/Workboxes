// scaffold.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { lazy } from 'react'

// general support
const Signin = lazy(()=> import('../pages/Signin'))

// GeneralRouteController; GeneralLayout
const GeneralRouteController = lazy(()=> import('./routing/GeneralRouteController'))
// public
const About = lazy(()=> import('../pages/About'))
const WorkboxShared = lazy(()=> import('../pages/WorkboxShared'))
const NotFound = lazy(()=> import('../pages/NotFound'))
const ErrorPage = lazy(()=> import('../pages/ErrorPage'))

// user support
const UserRouteController = lazy(()=> import('./routing/UserRouteController'))
const UserRegistration = lazy(()=> import('../pages/UserRegistration')) // TODO part of user support?

const UserLayout = lazy(()=> import('./routing/UserLayout'))
const Main = lazy(()=> import('../pages/Main'))
const Notices = lazy(()=> import('../pages/Notices'))
const Classifieds = lazy(()=> import('../pages/Classifieds'))

const Account = lazy(()=> import('../pages/Account'))
const Domains = lazy(()=> import('../pages/Domains'))
const Memberships = lazy(()=> import('../pages/Memberships'))
const Subscriptions = lazy(()=> import('../pages/Subscriptions'))

const Unauthorized = lazy(()=> import('../pages/Unauthorized'))

// system support
const AdminRouteController = lazy(()=> import('./routing/AdminRouteController'))

const AdminLayout = lazy(()=> import('./routing/AdminLayout'))
const Sysadmin = lazy(()=> import('../pages/Sysadmin'))
const SysSettings = lazy(()=> import('../pages/SysSettings'))
const Metadata = lazy(()=> import('../pages/Metadata'))
const UserControls = lazy(()=> import('../pages/UserControls'))
const HelpPanels = lazy(()=> import('../pages/HelpPanels'))
const Administration = lazy(()=> import('../pages/Administration'))

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
                element: <WorkboxShared />
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
