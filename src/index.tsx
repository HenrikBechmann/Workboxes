
// index.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// chakra
import { ChakraProvider } from '@chakra-ui/react'

import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root'))

const queryClient = new QueryClient()

root.render(
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
    <ChakraProvider>
        <App /> 
    </ChakraProvider>
    </BrowserRouter>
    </QueryClientProvider>
)