// AdminRouteController.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Navigate, Outlet as RouterOutput, useLocation } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import { useUserAuthData, useUserRecords } from '../../system/WorkboxProviders'

function AdminRouteController() {

    const 
        userAuthData = useUserAuthData(),
        userRecords = useUserRecords(),
        location = useLocation()

    if (userAuthData === undefined) {

        return <Box> Loading... </Box>
      
    } else if (!userAuthData) {

        const from = location.pathname || '/'

        return <Navigate to = {`/signin?from=${from}`}/>

    } else if (userAuthData && !userRecords.user) {

        return <Box> Registering... </Box>
        
    } else if (!userRecords.user.profile.flags.fully_registered) { // pre-empt anything else

        return <Navigate to = 'user-registration' />

    } else if (userAuthData.sysadminStatus.isSuperUser) {

        return <RouterOutput />

    } else {

        return <Navigate to = '/unauthorized' replace/>

    }

}
export default AdminRouteController
