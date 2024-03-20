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

const panelMessageStyles = {
    position: 'absolute',
    width: '300px',
    top:'50%',
    left: '50%',
    translate: '-50% -50%',
    color: 'lightgray',
    fontSize: 'x-large',
    fontWeight:'bold',
    fontStyle: 'italic',
} as CSSProperties

let nextSessionID = 0 // used for non-duplicate window component key; also future reference

const Workpanel = (props:any) => {

    const 
        [panelState, setPanelState] = useState('setup'), // setup, configured, resized, ready
        { startingWindowsSpecsList } = props,
        startingWindowsSpecsListRef = useRef(startingWindowsSpecsList),
        panelElementRef = useRef(null),
        windowsListRef = useRef([]),
        windowsMapRef = useRef(null),
        windowMaximizedRef = useRef(null),
        windowsMinimizedRef = useRef(null),
        highestZOrderRef = useRef(0),
        windowCountRef = useRef(0)

    // console.log('running Workpanel', panelState)

    // initialize windows map and list
    useEffect(()=>{

        const 
            windowsMap = new Map(),
            windowsMinimized = new Set()

        windowsMapRef.current = windowsMap
        windowsMinimizedRef.current = windowsMinimized

        const startingWindowsSpecs = startingWindowsSpecsListRef.current

        for (const startingspecs of startingWindowsSpecsList) {

            // TODO: anticipate possible transformation
            const specs = {
                window:startingspecs.window,
                workbox:startingspecs.workbox
            }

            const sessionID = addWindow(specs)
            if (specs.window.view == 'minimized') {
                minimizeWindow(sessionID)
            }
            if (specs.window.view == 'maximized') {
                maximizeWindow(sessionID)
            }

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
            zOrder = ++highestZOrderRef.current

            record.window.zOrder = zOrder

        const component = createWindow(sessionID, record)

        windowsMap.set(sessionID, record)
        windowsList.push(component)

        return sessionID

    }

    // ** private ** only called by addWindow above
    const createWindow = (sessionID, specs) => {

        // console.log('creating window with specs',{...specs.window})

        const element = panelElementRef.current,
        containerConfigSpecs = {width:element.offsetWidth, height:element.offsetHeight}

        return <Workwindow 
            key = {sessionID} 
            sessionID = {sessionID} 
            callbacks = {callbacks} 
            viewData = {{view:specs.window.view}}
            containerConfigSpecs = {containerConfigSpecs}
            {... specs.window}
        >
            <Workbox 
                sessionID = {sessionID} {...specs.workbox}
            />
        </Workwindow>
    }

    // remove window and update higher zOrders to compensate
    // TODO move minimized windows to compensate
    const closeWindow = (sessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            record = windowsMap.get(sessionID)

        // console.log('calling closeWindow: sessionID',sessionID, record, windowsMap)

        const
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
    
        windowsList.splice(removeIndex, 1)

        if (windowMaximizedRef.current === sessionID) {
            windowMaximizedRef.current = null
        }
        if (windowsMinimizedRef.current.has(sessionID)) {
            windowsMinimizedRef.current.delete(sessionID)
            repositionMinimizedWindows()
        }

        windowsMap.delete(sessionID)

        windowsListRef.current = [...windowsList] // trigger render

        // console.log('windowsList, windowsMap',windowsList, windowsMap)

        setPanelState('windowclosed')
    }

    const duplicateWindow = (sessionID) => {

        const record = windowsMapRef.current.get(sessionID)
        record.window = {...record.window}
        record.workbox = {...record.workbox}

        addWindow(record)

    }

// minimizeWindow, normalizeWindow, maximizeWindow
    const minimizeWindow = (sessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            record = windowsMap.get(sessionID),
            windowsList = windowsListRef.current,
            numberOfWindows = windowsList.length

        if (record.window.view == 'minimized') return

    }

    const repositionMinimizedWindows = () => {

    }

    const normalizeWindow = (sessionID) => {
        const 
            windowsMap = windowsMapRef.current,
            record = windowsMap.get(sessionID),
            windowsList = windowsListRef.current,
            numberOfWindows = windowsList.length

        if (record.window.view == 'normalized') return

        if (windowMaximizedRef.current === sessionID) {
            windowMaximizedRef.current = null
        }
        if (windowsMinimizedRef.current.has(sessionID)) {
            windowsMinimizedRef.current.delete(sessionID)
            repositionMinimizedWindows()
        }

        record.window.view = 'normalized'
        const viewData = {view:'normalized'}
        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowsList[index]
            if (component.props.sessionID === sessionID) {
                windowsList[index] = React.cloneElement(component,{viewData})
                break
            }
        }
        windowsListRef.current = [...windowsList]
        setPanelState('normalizeWindow')
    }

    const maximizeWindow = (sessionID) => {
        const 
            windowsMap = windowsMapRef.current,
            record = windowsMap.get(sessionID),
            windowsList = windowsListRef.current,
            numberOfWindows = windowsList.length

        if (record.window.view == 'maximized') return

        if (windowMaximizedRef.current) {
            const sessionID = windowMaximizedRef.current
            windowMaximizedRef.current = null
            normalizeWindow(sessionID)
        }

        record.window.view = 'maximized'
        windowMaximizedRef.current = sessionID
        const viewData = {view:'maximized'}
        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowsList[index]
            if (component.props.sessionID === sessionID) {
                windowsList[index] = React.cloneElement(component,{viewData})
                break
            }
        }
        windowsListRef.current = [...windowsList]
        setPanelState('maximizewindow')
    }

    const setFocus = (sessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            windowsList = windowsListRef.current,
            numberOfWindows = windowsList.length,
            record = windowsMap.get(sessionID),
            zOrder = record.window.zOrder

        // console.log('inside setFocus: sessionID, zOrder',sessionID, zOrder)

        let isChange = false
        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowsList[index]
            const {zOrder: currentZOrder, sessionID: currentSessionID} = component.props

            // console.log('processing currentSessionID, currentZOrder, component', currentSessionID, currentZOrder, component)

            if (currentZOrder === zOrder) {
                if (zOrder !== numberOfWindows) {
                    isChange = true
                    windowsList[index] = React.cloneElement(component, {zOrder:numberOfWindows})
                    windowsMap.get(currentSessionID).window.zOrder = numberOfWindows

                // console.log('set window zOrder to top', numberOfWindows, windowsList[index])

                }

            } else if (currentZOrder > zOrder) {
                windowsList[index] = React.cloneElement(component, {zOrder:currentZOrder - 1})
                windowsMap.get(currentSessionID).window.zOrder = currentZOrder - 1

                // console.log('adjust window zOrder lower', currentZOrder - 1, windowsList[index])

            }
        }

        if (isChange) {
            windowsListRef.current = [...windowsList]
            setPanelState('windowrefocused')
        }

    }

    const callbacks = {
        setFocus,
        closeWindow,
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

        // console.log('Workpanel onResize callback, length, containerConfigSpecs', length, containerConfigSpecs)

        for (let index = 0; index < length; index++ ) {
            const component = windowsList[index]
            windowsList[index] = React.cloneElement(component, {containerConfigSpecs})
        }
        windowsListRef.current = [...windowsList]
        // console.log('updateing windows from panel resize containerConfigSpecs', containerConfigSpecs)
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

    // const windowsList = windowsListRef.current
    const windowCount = windowsListRef.current.length

    // console.log('rendering: panelState, windowsList',panelState, windowsListRef.current)

    return <Box id = 'workpanel' data-type = 'workpanel' ref = {panelElementRef} style = {workpanelStyles}>
        {panelState != 'setup' && windowsListRef.current}
        {(panelState != 'setup' && windowCount === 0) && 
            <Box style = {panelMessageStyles} >Tap here to load the base workbox for this panel</Box>
        }
    </Box>
}

export default Workpanel