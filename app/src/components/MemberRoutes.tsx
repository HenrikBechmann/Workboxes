// ProtectedRoute.tsx based on https://www.robinwieruch.de/react-router-private-routes/
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

    return <Outlet />

  }
}
export default MemberRoute