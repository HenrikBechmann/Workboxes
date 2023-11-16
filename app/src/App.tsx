// App.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React from 'react'

// services
import { Routes, Route } from 'react-router'
import { useUser } from './utilities/contexts'

// local
import Tribalopolis from './Tribalopolis'
import Start from './pages/Start'
import MemberRoutes from './components/MemberRoutes'

const App = () => {

    const user = useUser()

    return (
      
        <Routes>
            <Route path = '/' element = {
                <MemberRoutes>
                    <Route index element = {<Tribalopolis/>} />
                </MemberRoutes>
            } />
            <Route path = '/start' element = {<Start />} />
{
//            <Route path = '/signup' element = {<Signup />} />
//            <Route path = '/login' element = {<Login />} />
//            <Route path = '/admin' element = {<Admin />} />
//            <Route path = '*' element = {<NotFound />} />
}                
        </Routes>

    )
  
}

export default App