// index.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import ismobile from 'is-mobile'

import FirebaseProviders from './system/FirebaseProviders'
import TribalopolisProvider from './system/TribalopolisProvider'
import scaffold from './system/scaffold'

export const isMobile = ismobile({featureDetect: true, tablet: true})

const router = createBrowserRouter(scaffold)

const root = createRoot(document.getElementById('root'))

root.render(
    <FirebaseProviders>
        <ChakraProvider>
            <TribalopolisProvider>
                <RouterProvider router = {router} />
            </TribalopolisProvider>
        </ChakraProvider>
    </FirebaseProviders>
)
