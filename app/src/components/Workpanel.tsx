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
    minWidth:'700px',
    minHeight:'700px',
} as CSSProperties

let sessionID = 0

const Workpanel = (props:any) => {

    const 
        [panelState, setPanelState] = useState('ready'),
        { panelWindowSpecsList } = props

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

    const removeWindow = (zOrder) => {
        const windowsList = windowsListRef.current
        const numberOfWindows = windowsList.length
        let deletePointer = null
        for (let i = 0; i < numberOfWindows; i++) {
            const component = windowsList[i]
            const currentZOrder = component.props.zOrder
            if (currentZOrder === zOrder) {
                deletePointer = i
            } else if (currentZOrder > zOrder) {
                windowsList[i] = React.cloneElement(component, {zOrder:currentZOrder-1})
            }
        }
    
        windowsListRef.current.splice(deletePointer, 1)
        setPanelState('resorted')
    }

    const createWindow = (specs) => {
        sessionID++
        return <Workwindow 
            key = {sessionID} 
            sessionID = {sessionID} 
            setFocus = {setFocus} 
            {... specs.windowSpecs}
        >
            <Workbox 
                {...specs.workboxSpecs}
            />
        </Workwindow>
    }

    const addWindow = (specs) => {
        windowsList.push(
            createWindow(specs)
        )
    }

    const windowsList = useMemo(()=>{

        const list = []

        for (const specs of panelWindowSpecsList) {
            list.push(
                createWindow(specs)
            )
        }

        return list

    },[panelWindowSpecsList]) // one-time - input never changes

    const windowsListRef = useRef(null)
    windowsListRef.current = windowsList

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