// ProtectedRoute.tsx based on https://www.robinwieruch.de/react-router-private-routes/
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { useUser } from '../utilities/FirebaseProviders'

function MemberRoute({startingLocationRef}) {

  const user = useUser()

  console.log('user in MemberRoutes',user)

  if (!user) {
    return <Navigate to = {'/start'} replace />
  } else if (startingLocationRef.current) {
    const startingPath = startingLocationRef.current
    startingLocationRef.current = null
    return <Navigate to = {startingPath} replace />
  } else {
    return <Outlet />
  }
}
export default MemberRoute