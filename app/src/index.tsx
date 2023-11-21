
// index.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import { BrowserRouter as RouterProvider} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// chakra
import { ChakraProvider } from '@chakra-ui/react'

import FirebaseProviders from './utilities/FirebaseProviders'

import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root'))

const queryClient = new QueryClient()

root.render(
    <FirebaseProviders>
        <QueryClientProvider client={queryClient}>
        <RouterProvider>
        <ChakraProvider>
            <App /> 
        </ChakraProvider>
        </RouterProvider>
        </QueryClientProvider>
    </FirebaseProviders>
)
