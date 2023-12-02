// MemberRoutes.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useUserData } from '../system/FirebaseProviders'

function MemberRoutes() {

  const 
    userdata = useUserData(),
    location = useLocation()

  if (userdata === undefined) {

      return <div> Loading... </div>
      
  }

  if (!userdata) {

    const from = location.pathname || '/'
    return <Navigate to = {`/signin?from=${from}`}/>

  } else {

    return <Outlet />

  }
}
export default MemberRoutes