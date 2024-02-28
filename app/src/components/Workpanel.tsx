// Workpanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, useMemo } from 'react'

import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center
} from '@chakra-ui/react'

import Workwindow from './Workwindow'
import Workbox from './workbox/Workbox'
// import { useUserData } from '../system/FirebaseProviders'

const workpanelStyles = {
    height:'100%',
    width:'100%',
    // position:'absolute',
    // inset: 0,
    minWidth:'700px',
    minHeight:'700px',
} as CSSProperties

let sessionID = 0

const Workpanel = (props:any) => {

    const [panelState, setPanelState] = useState('ready')

    const { panelWindowSpecsList } = props

    // const userData = useUserData()
    // const { displayName, photoURL } = userData.authUser

    const setFocus = (zOrder) => {
        const windowsList = windowsListRef.current
        const numberOfWindows = windowsList.length
        for (let i = 0; i < numberOfWindows; i++) {
            const component = windowsList[i]
            const currentZOrder = component.props.zOrder
            if (currentZOrder === zOrder) {
                windowsList[i] = React.cloneElement(component, {zOrder:numberOfWindows})
            } else if (currentZOrder > zOrder) {
                windowsList[i] = React.cloneElement(component, {zOrder:currentZOrder-1})
            }
        }
        setPanelState('resorted')
    }

    const windowsList = useMemo(()=>{

        const list = []

        for (const spec of panelWindowSpecsList) {
            sessionID++
            list.push(
                <Workwindow 
                    key = {sessionID} 
                    sessionID = {sessionID} 
                    setFocus = {setFocus} 
                    { ... spec.windowSpecs}
                >
                    <Workbox 
                        {...spec.workboxSpecs}
                    />
                </Workwindow>,
            )
        }

        return list


    },[panelWindowSpecsList])

    const windowsListRef = useRef(windowsList)

    useEffect(() => {

        if (panelState == 'resorted') {
            setPanelState('ready')
        }

    },[panelState])


    return <Box data-type = 'workpanel' style = {workpanelStyles}>
        {windowsList}
    </Box>
}

export default Workpanel