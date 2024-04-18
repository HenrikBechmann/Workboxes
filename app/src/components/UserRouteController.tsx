// UserRouteController.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Navigate, Outlet as RouteController, useLocation } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import { useUserData, useUserRecords } from '../system/FirebaseProviders'

const UserRouteController = () => {

  const 
    userdata = useUserData(),
    userRecords = useUserRecords(),
    location = useLocation()

  if (userdata === undefined) { // registering is underway

      return <Box> Loading... </Box>
      
  }

  // console.log('userRecords.user.profile',{...userRecords.user?.profile} )

  if (!userdata) { // null = logged out

    const from = location.pathname || '/'

    return <Navigate to = {`/signin?from=${from}`}/>

  } else if (!userRecords.user) { // assembling user records is underway

    return <Box> Registering... </Box>

  } else if (!userRecords.user.profile.fully_registered) { // pre-empt anything else

    // console.log('UserRouteController: not fully registered', userRecords.user.profile)

    if (location.pathname != '/user-registration') {

      return <Navigate to = 'user-registration' />

    }
  }

  return <RouteController /> // respond to router state

}
export default UserRouteController