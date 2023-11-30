// MemberRoutes.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useUser } from '../system/FirebaseProviders'

function MemberRoute() {

  const 
    user = useUser(),
    location = useLocation()

  if (user === undefined) {
      return <div> Loading... </div>
  }

  if (!user) {

    const from = location.pathname || '/'
    return <Navigate to = {`/signin?from=${from}`}/>

  } else {

    // console.log('user',user)

    return <Outlet />

  }
}
export default MemberRoute