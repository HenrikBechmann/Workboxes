// App.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// react
import React, { useRef } from 'react'

// services
import { Routes, Route, useLocation } from 'react-router'
import { useUser } from './utilities/FirebaseProviders'

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

    const user = useUser()

    const location = useLocation()

    console.log('location in App', location)

    if (user === undefined) {
        return <div> Connecting... </div>
    }

    return (
      
        <Routes>
            <Route path = '/' element = {<MemberRoutes/>} > 
                <Route index element = { <Tribalopolis /> } />
                <Route path = 'account' element = { <Account /> } />
            </Route>
            <Route path = '/signin/*' element = { <Signin /> } >
                <Route path = ':id' element = { <Signin /> } />
            </Route>
            <Route path = '*' element = {<NotFound />} />
        </Routes>

    )
  
}

export default App