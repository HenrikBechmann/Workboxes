// App.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, { useRef } from 'react'

// services
import { Routes, Route } from 'react-router'

// local
import Tribalopolis from './Tribalopolis'
import Signin from './pages/Signin'
import Account from './pages/Account'
import NotFound from './pages/NotFound'

import MemberRoutes from './components/MemberRoutes'

/* // allow sharing
    <Route path = '/workbox' element = { <Tribalopolis /> } >
        <Route path = ':id' element = { <Tribalopolis /> } />
    </Route>
    <Route path = '/window' element = { <Tribalopolis /> } >
        <Route path = ':id' element = { <Tribalopolis /> } />
    </Route>
    <Route path = '/panel' element = { <Tribalopolis /> } >
        <Route path = ':id' element = { <Tribalopolis /> } />
    </Route>
    <Route path = '/workspace' element = { <Tribalopolis /> } >
        <Route path = ':id' element = { <Tribalopolis /> } />
    </Route>
{//            <Route path = '/admin' element = {<Admin />} />
}                
*/

const App = () => {

    return (
      
        <Routes>
            <Route path = '/' element = {<MemberRoutes />} > 
                <Route index element = { <Tribalopolis /> } />
                <Route path = 'account' element = { <Account /> } />
                <Route path = '*' element = {<NotFound />} />
            </Route>
            <Route path = '/signin' element = { <Signin /> } />
        </Routes>

    )
  
}

export default App
