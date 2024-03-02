// Workpanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, useMemo } from 'react'

import {
    Box
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
        [panelState, setPanelState] = useState('setup'),
        { panelWindowSpecsList } = props,
        panelElementRef = useRef(null)

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
    
        if (deletePointer !== null) windowsListRef.current.splice(deletePointer, 1)
        setPanelState('resorted')
    }

    const createWindow = (specs) => {
        sessionID++
        return <Workwindow 
            key = {sessionID} 
            sessionID = {sessionID} 
            setFocus = {setFocus} 
            containerSpecs = {null}
            {... specs.windowSpecs}
        >
            <Workbox 
                {...specs.workboxSpecs}
            />
        </Workwindow>
    }

    const addWindow = (specs) => {
        windowsListRef.current.push(
            createWindow(specs)
        )
    }

    const windowsListRef = useRef(null)
    // let windowsList
    windowsListRef.current = useMemo(()=>{

        const list = []

        for (const specs of panelWindowSpecsList) {
            list.push(
                createWindow(specs)
            )
        }

        return list

    },[panelWindowSpecsList]) // one-time - input never changes

    const onResize = useCallback(()=>{

        const 
            element = panelElementRef.current,
            containerSpecs = {width:element.offsetWidth, height:element.offsetHeight},
            windowsList = windowsListRef.current,
            length = windowsList.length

        for (let index = 0; index < length; index++ ) {
            const component = windowsList[index]
            windowsList[index] = React.cloneElement(component, {containerSpecs})
        }
        setPanelState('resized')

    },[])

    const resizeObserverRef = useRef(null)
    // set up and shut down resizeObserver
    useEffect(()=>{

        resizeObserverRef.current = new ResizeObserver(onResize)

        resizeObserverRef.current.observe(panelElementRef.current)

        return () => {
            resizeObserverRef.current.disconnect()
        }

    },[]) 

    useEffect(() => {

        if (panelState != 'ready') {
            setPanelState('ready')
        }

    },[panelState])

    const windowsList = windowsListRef.current

    return <Box data-type = 'workpanel' ref = {panelElementRef} style = {workpanelStyles}>
        {panelState != 'setup' && windowsList}
    </Box>
}

export default Workpanel