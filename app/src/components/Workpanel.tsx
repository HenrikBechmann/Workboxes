// Workpanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, useMemo } from 'react'

import {
    Box
} from '@chakra-ui/react'

import Workwindow from './Workwindow'
import Workbox from './workbox/Workbox'

const workpanelStyles = {
    height:'100%',
    width:'100%',
    minWidth:'700px',
    minHeight:'700px',
} as CSSProperties

let nextSessionID = 0 // used for non-duplicate window component key; also future reference

const Workpanel = (props:any) => {

    const 
        [panelState, setPanelState] = useState('setup'), // setup, resorted, resized, ready
        { startingWindowsSpecsList } = props,
        startingWindowsSpecsListRef = useRef(startingWindowsSpecsList),
        panelElementRef = useRef(null),
        windowsListRef = useRef([]),
        windowsMapRef = useRef(null),
        highestZOrderRef = useRef(0)

    // initialize windows map and list
    useEffect(()=>{

        const windowsMap = new Map()
        windowsMapRef.current = windowsMap

        const startingWindowsSpecs = startingWindowsSpecsListRef.current

        for (const startingspecs of startingWindowsSpecsList) {

            // TODO: anticipate possible transformation
            const specs = {
                window:startingspecs.window,
                workbox:startingspecs.workbox
            }

            addWindow(specs)

        }

    },[])

    const addWindow = (specs) => {

        const sessionID = nextSessionID
        nextSessionID++

        const 
            windowsList = windowsListRef.current,
            windowsMap = windowsMapRef.current,
            record = {
                window:specs.window,
                workbox:specs.workbox,
                sessionID,
            },
            zOrder = ++highestZOrderRef.current,
            component = createWindow(sessionID, specs)

        record.window.zOrder = zOrder
        windowsMap.set(sessionID, record)
        windowsList.push(component)

    }

    // ** private ** only called by addWindow above
    const createWindow = (sessionID, specs) => {
        return <Workwindow 
            key = {sessionID} 
            sessionID = {sessionID} 
            callbacks = {callbacks} 
            containerConfigSpecs = {null}
            {... specs.window}
        >
            <Workbox 
                {...specs.workbox}
            />
        </Workwindow>
    }

    // remove window and update higher zOrders to compensate
    // TODO move minimized windows to compensate
    const removeWindow = (sessionID) => {
        const 
            windowsMap = windowsMapRef.current,
            record = windowsMap.get(sessionID),
            { zOrder } = record.window,
            windowsList = windowsListRef.current,
            numberOfWindows = windowsList.length

        let removeIndex = null
        for (let i = 0; i < numberOfWindows; i++) {
            const component = windowsList[i]
            const currentZOrder = component.props.zOrder
            const currentSessionID = component.props.sessionID
            if (currentSessionID === sessionID) {
                removeIndex = i
            }
            if (zOrder > 0) {
                if (currentZOrder > zOrder) {
                    const newZOrder = currentZOrder - 1
                    windowsList[i] = React.cloneElement(component, {zOrder:newZOrder})
                    windowsMap.get(sessionID).window.zOrder = newZOrder
                }
            }
        }

        if (zOrder > 0) {
            highestZOrderRef.current--
        }
    
        windowsListRef.current.splice(removeIndex, 1)

        windowsMap.delete(sessionID)

        setPanelState('resorted')
    }

    const duplicateWindow = (sessionID) => {

        const record = windowsMapRef.current.get(sessionID)
        record.window = {...record.window}
        record.workbox = {...record.workbox}

        addWindow(record)

    }

// minimizeWindow, normalizeWindow, maximizeWindow
    const minimizeWindow = (sessionID) => {

    }

    const normalizeWindow = (sessionID) => {
        
    }

    const maximizeWindow = (sessionID) => {
        
    }

    const setFocus = (sessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            windowsList = windowsListRef.current,
            numberOfWindows = windowsList.length,
            zOrder = windowsMap.get(sessionID).window.zOrder

        for (let i = 0; i < numberOfWindows; i++) {
            const component = windowsList[i]
            const {zOrder: currentZOrder, sessionID: currentSessionID} = component.props

            if (currentZOrder === zOrder) {
                windowsList[i] = React.cloneElement(component, {zOrder:numberOfWindows})
                windowsMap.get(currentSessionID).window.zOrder = numberOfWindows
            } else if (currentZOrder > zOrder) {
                windowsList[i] = React.cloneElement(component, {zOrder:currentZOrder - 1})
                windowsMap.get(currentSessionID).window.zOrder = currentZOrder - 1
            }
        }
        setPanelState('resorted')
    }

    const callbacks = {
        setFocus,
        removeWindow,
        duplicateWindow,
        minimizeWindow,
        normalizeWindow,
        maximizeWindow,
    }

    const onResize = useCallback(()=>{

        const 
            element = panelElementRef.current,
            containerConfigSpecs = {width:element.offsetWidth, height:element.offsetHeight},
            windowsList = windowsListRef.current,
            length = windowsList.length

        for (let index = 0; index < length; index++ ) {
            const component = windowsList[index]
            windowsList[index] = React.cloneElement(component, {containerConfigSpecs})
        }
        setPanelState('resized')

    },[])

    // set up and shut down resizeObserver
    useEffect(()=>{

        const observer =  new ResizeObserver(onResize)

        observer.observe(panelElementRef.current)

        return () => {
            observer.disconnect()
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