
// index.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'
import { createRoot } from 'react-dom/client'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import FirebaseProviders from './system/FirebaseProviders'

import { ChakraProvider } from '@chakra-ui/react'

import scaffold from './system/scaffold'

const router = createBrowserRouter(scaffold)

const root = createRoot(document.getElementById('root'))

root.render(
    <FirebaseProviders>
    <ChakraProvider>
    <RouterProvider router = {router} />
    </ChakraProvider>
    </FirebaseProviders>
)
