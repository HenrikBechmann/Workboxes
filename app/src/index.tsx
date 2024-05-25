// index.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import ismobile from 'is-mobile'

import WorkboxesProvider from './system/WorkboxesProvider'

import scaffold from './system/routescaffold'

export const isMobile = ismobile({featureDetect: true, tablet: true})

console.log('isMobile', isMobile)

const router = createBrowserRouter(scaffold)

const root = createRoot(document.getElementById('root'))

root.render(
    <ChakraProvider>
        <WorkboxesProvider>
            <RouterProvider router = {router} />
        </WorkboxesProvider>
    </ChakraProvider>
)
