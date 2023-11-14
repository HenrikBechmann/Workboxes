
import React from 'react'

import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root'))

const queryClient = new QueryClient()

root.render(
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
        <App /> 
    </BrowserRouter>
    </QueryClientProvider>
)