// ProtectedRoute.tsx based on https://www.robinwieruch.de/react-router-private-routes/
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useUser } from '../utilities/FirebaseProviders'

function MemberRoute() {

  const user = useUser()

  const location = useLocation()

  // console.log('location in MemberRoutes',location)

  if (!user) {

    const from = location.pathname || '/'

    return <Navigate to = {`/signin?from=${location.pathname}`} />

  } else {

    return <Outlet />

  }
}
export default MemberRoute