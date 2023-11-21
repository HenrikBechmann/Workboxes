// ProtectedRoute.tsx based on https://www.robinwieruch.de/react-router-private-routes/
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { useUser } from '../utilities/FirebaseProviders'

function MemberRoute() {

  const user = useUser()
  if (!user) {
    return <Navigate to = {'/start'} replace />
  }
  return <Outlet />
}
export default MemberRoute