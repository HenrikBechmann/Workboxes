// UserRouteController.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Navigate, Outlet as RouterOutput, useLocation, useNavigate } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import { useUserAuthData, useUserRecords, useErrorControl } from '../../system/WorkboxesProvider'

const UserRouteController = () => {

    const 
        userdata = useUserAuthData(),
        userRecords = useUserRecords(),
        location = useLocation(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    if (errorControl.length) {
        navigate('/error')
        return
    }

    if (userdata === undefined) { // registering is underway

        return <Box> Loading... </Box>
      
    } else if (!userdata) { // null = logged out

        const from = location.pathname || '/'

        return <Navigate to = {`/signin?from=${from}`}/>

    } else if (!userRecords.user) { // assembling user records is underway

        return <Box> Registering... </Box>

    } else if (!userRecords.user.profile.flags.fully_registered) { // pre-empt anything else

        if (location.pathname != '/user-registration') {

            return <Navigate to = 'user-registration' />

        }

    }

    return <RouterOutput /> // respond to router state

}
export default UserRouteController