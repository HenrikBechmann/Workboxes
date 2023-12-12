// SysadminRoutes.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import { useUserData } from '../system/FirebaseProviders'

function SysadminRoutes() {

  const 
    userdata = useUserData(),
    location = useLocation()

  if (userdata === undefined) {

      return <Box> Loading... </Box>
      
  }

  if (!userdata) {

    const from = location.pathname || '/'
    return <Navigate to = {`/signin?from=${from}`}/>

  } else if (userdata.sysadminStatus.isSuperUser) {

    return <Outlet />

  } else {

    return <Navigate to = {`/unauthorized`} replace/>

  }

}
export default SysadminRoutes
