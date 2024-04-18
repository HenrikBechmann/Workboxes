// RoutesMember.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Navigate, Outlet as RouteController, useLocation, redirect } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import { useUserData, useUserRecords } from '../system/FirebaseProviders'

const UserAuthRoutesController = () => {

  const 
    userdata = useUserData(),
    userRecords = useUserRecords(),
    location = useLocation()

  if (userdata === undefined) { // registering is underway

      return <Box> Loading... </Box>
      
  }

  if (!userdata) { // null = logged out

    const from = location.pathname || '/'
    return <Navigate to = {`/signin?from=${from}`}/>

  } else if (!userRecords.user) { // assembling user records is underway

    return <Box> Registering... </Box>

  } else if (!userRecords.user.profile.fully_registered) { // pre-empt anything else

    return <Navigate to = {`/user-registration`} />

  } else {

    return <RouteController /> // respond to router state

  }
}
export default UserAuthRoutesController