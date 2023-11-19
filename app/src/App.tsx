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
import Signup from './pages/Signup'
import Login from './pages/Login'
import Declined from './pages/Declined'
import Account from './pages/Account'
import NotFound from './pages/NotFound'

import MemberRoutes from './components/MemberRoutes'

const App = () => {

    const user = useUser()

    return (
      
        <Routes>
            <Route path = '/' element = {
                <MemberRoutes>
                    <Route index element = { <Tribalopolis/> } />
                    <Route path = '/account' element = { <Account /> } />
                </MemberRoutes>
            } />
            <Route path = '/start' element = { <Start /> } />
            <Route path = '/signup' element = { <Signup /> } />
            <Route path = '/login' element = { <Login /> } />
            <Route path = '/declined' element = { <Declined /> } />
            <Route path = '*' element = {<NotFound />} />
{//            <Route path = '/admin' element = {<Admin />} />
}                
        </Routes>

    )
  
}

export default App