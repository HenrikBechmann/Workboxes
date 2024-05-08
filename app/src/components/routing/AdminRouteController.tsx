// AdminRouteController.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Navigate, Outlet as RouterOutput, useLocation, useNavigate } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import { useUserAuthData, useUserRecords, useErrorControl } from '../../system/WorkboxesProvider'

function AdminRouteController() {

    const 
        userAuthData = useUserAuthData(),
        userRecords = useUserRecords(),
        location = useLocation(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    if (errorControl.length) {
        navigate('/error')
        return
    }

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
