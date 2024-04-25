// AdminRouteController.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Navigate, Outlet as RouterOutput, useLocation } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import { useUserData, useUserRecords } from '../../system/WorkboxProviders'

function AdminRouteController() {

    const 
        userData = useUserData(),
        userRecords = useUserRecords(),
        location = useLocation()

    if (userData === undefined) {

        return <Box> Loading... </Box>
      
    } else if (!userData) {

        const from = location.pathname || '/'

        return <Navigate to = {`/signin?from=${from}`}/>

    } else if (userData && !userRecords.user) {

        return <Box> Registering... </Box>
        
    } else if (!userRecords.user.profile.flags.fully_registered) { // pre-empt anything else

        return <Navigate to = 'user-registration' />

    } else if (userData.sysadminStatus.isSuperUser) {

        return <RouterOutput />

    } else {

        return <Navigate to = '/unauthorized' replace/>

    }

}
export default AdminRouteController
