
// index.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import { BrowserRouter as RouterProvider} from 'react-router-dom'
// see instead the favoured createBrowserRouter https://reactrouter.com/en/main/routers/create-browser-router

// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// chakra
import { ChakraProvider } from '@chakra-ui/react'

import FirebaseProviders from './system/FirebaseProviders'

import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root'))

// const queryClient = new QueryClient()

// <QueryClientProvider client={queryClient}>
// </QueryClientProvider>

root.render(
    <FirebaseProviders>
    <RouterProvider>
    <ChakraProvider>
        <App /> 
    </ChakraProvider>
    </RouterProvider>
    </FirebaseProviders>
)
