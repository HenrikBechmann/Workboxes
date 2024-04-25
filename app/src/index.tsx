// index.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import ismobile from 'is-mobile'

import WorkboxProviders from './system/WorkboxProviders'
// import TribalopolisProvider from './system/TribalopolisProvider'
import scaffold from './system/routescaffold'

export const isMobile = ismobile({featureDetect: true, tablet: true})

const router = createBrowserRouter(scaffold)

const root = createRoot(document.getElementById('root'))

root.render(
    <WorkboxProviders>
        <ChakraProvider>
            <RouterProvider router = {router} />
        </ChakraProvider>
    </WorkboxProviders>
)
