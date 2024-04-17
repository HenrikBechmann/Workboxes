// RoutesMember.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Navigate, Outlet, useLocation, redirect } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import { useUserData, useUserRecords } from '../system/FirebaseProviders'

function RoutesMember() {

  const 
    userdata = useUserData(),
    userRecords = useUserRecords(),
    location = useLocation()

  // console.log('userRecords',{...userRecords})

  if (userdata === undefined || !userRecords.user) {

      return <Box> Loading... </Box>
      
  }

  if (!userdata) {

    const from = location.pathname || '/'
    return <Navigate to = {`/signin?from=${from}`}/> // works

  } else if (!userRecords.user.profile.fully_registered) {

    return <Navigate to = {`/user-registration`} />

  } else {

    return <Outlet />

  }
}
export default RoutesMember