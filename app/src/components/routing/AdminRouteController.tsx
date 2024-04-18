// AdminRouteController.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Navigate, Outlet as RouteController, useLocation } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import { useUserData } from '../../system/FirebaseProviders'

function AdminRouteController() {

    const 
        userdata = useUserData(),
        location = useLocation()

    if (userdata === undefined) {

        return <Box> Loading... </Box>
      
    } else if (!userdata) {

        const from = location.pathname || '/'

        return <Navigate to = {`/signin?from=${from}`}/>

    } else if (userdata.sysadminStatus.isSuperUser) {

        return <RouteController />

    } else {

        return <Navigate to = {`/unauthorized`} replace/>

    }

}
export default AdminRouteController
