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
        { startingWindowsSpecsList } = props,
        startingWindowsSpecsListRef = useRef(startingWindowsSpecsList),

        [panelState, setPanelState] = useState('setup'), // setup, configured, resized, ready

        panelElementRef = useRef(null),

        windowsListRef = useRef([]),
        windowsMapRef = useRef(null),
        windowMaximizedRef = useRef(null),
        windowsMinimizedRef = useRef(null),

        highestZOrderRef = useRef(0)

    // initialize windows record map, component list, and minimized list; set maximized window if exists
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

            addWindow(specs)

        }

    },[])

    const addWindow = (specs) => {

        const sessionID = nextSessionID
        nextSessionID++

        const 
            windowsList = windowsListRef.current,
            windowsMap = windowsMapRef.current,
            windowsSet = windowsMinimizedRef.current,

            record = {
                window:specs.window,
                workbox:specs.workbox,
                sessionID,
                index:null,
            }

        let 
            zOrder, stackOrder

        // set zOrder and stackOrder
        if (record.window.view !== 'minimized') {

            zOrder = ++highestZOrderRef.current
            stackOrder = null
            // if a maxed component exists, swap zOrders
            if ((record.window.view == 'normalized') && windowMaximizedRef.current) {
                const
                    maxedSessionID = windowMaximizedRef.current,
                    maxedRecord = windowsMap.get(maxedSessionID),
                    maxedIndex = maxedRecord.index,
                    maxedComponent = windowsList[maxedIndex]

                maxedRecord.window.zOrder = zOrder
                windowsList[maxedIndex] = React.cloneElement(maxedComponent, {zOrder})
                zOrder--
            }

        } else {

            zOrder = 0
            windowsSet.add(sessionID)
            stackOrder = windowsSet.size

        }

        // set windowMaximizedRef if 'maximized'; push any existing maxed window out
        if (record.window.view == 'maximized') {
            if (windowMaximizedRef.current) {
                const 
                    maxedSessionID = windowMaximizedRef.current,
                    maxedRecord = windowsMap.get(maxedSessionID),
                    maxedIndex = maxedRecord.index,
                    maxedComponent = windowsList[maxedIndex]

                    maxedRecord.window.view = 'normalized'
                    windowsList[maxedIndex] = React.cloneElement(maxedComponent, {viewDeclaration:{view:maxedRecord.window.view}})
            }
            windowMaximizedRef.current = sessionID
        }

        record.window.zOrder = zOrder
        record.window.stackOrder = stackOrder

        const component = createWindow(sessionID, record)

        windowsMap.set(sessionID, record)
        windowsList.push(component)
        record.index = windowsList.length - 1

    }

    // ** private ** only called by addWindow above
    const createWindow = (sessionID, specs) => {

        const 
            element = panelElementRef.current,
            containerConfigSpecs = { width:element.offsetWidth, height:element.offsetHeight },
            { view, stackOrder, ...remaining } = specs.window,
            viewDeclaration = {
                view,
                stackOrder,
            }

        // sessionID is passed to Workbox for information only
        return <Workwindow 
            key = { sessionID } 
            callbacks = { callbacks } 
            sessionID = { sessionID }
            viewDeclaration = { viewDeclaration }
            containerConfigSpecs = { containerConfigSpecs }
            { ...remaining }
        >
            <Workbox 
                sessionWindowID = {sessionID} {...specs.workbox}
            />
        </Workwindow>
    }

    // remove window and update higher zOrders to compensate
    // TODO move minimized windows to compensate
    const closeWindow = (sessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            record = windowsMap.get(sessionID)

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

        if (windowMaximizedRef.current === sessionID) {
            windowMaximizedRef.current = null
        }

        record.window.view = 'minimized'
        const subjectZOrder = record.window.zOrder
        windowsMinimizedRef.current.add(sessionID)
        const stackOrder = windowsMinimizedRef.current.size - 1
        const viewDeclaration = {view:'minimized', stackOrder}
        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowsList[index]
            if (component.props.sessionID === sessionID) {
                windowsList[index] = React.cloneElement(component,{viewDeclaration, zOrder:0})
            } else {
                const indexZOrder = component.props.zOrder
                if (indexZOrder > 0 && indexZOrder > subjectZOrder) {
                    windowsList[index] = React.cloneElement(component,{viewDeclaration, zOrder:indexZOrder - 1})
                }
            }
        }
        windowsListRef.current = [...windowsList]
        setPanelState('minimizewindow')

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

        const previousView = record.window.view
        record.window.view = 'normalized'
        const viewDeclaration = {view:'normalized'}
        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowsList[index]
            if (component.props.sessionID === sessionID) {
                windowsList[index] = React.cloneElement(component,{viewDeclaration})
                break
            }
        }
        windowsListRef.current = [...windowsList]
        setPanelState('normalizewindow')
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
        const viewDeclaration = {view:'maximized'}
        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowsList[index]
            if (component.props.sessionID === sessionID) {
                windowsList[index] = React.cloneElement(component,{viewDeclaration})
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

        let isChange = false
        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowsList[index]
            const {zOrder: currentZOrder, sessionID: currentSessionID} = component.props

            if (currentZOrder === zOrder) {
                if (zOrder !== numberOfWindows) {

                    isChange = true
                    windowsList[index] = React.cloneElement(component, {zOrder:numberOfWindows})
                    windowsMap.get(currentSessionID).window.zOrder = numberOfWindows

                }

            } else if (currentZOrder > zOrder) {
                windowsList[index] = React.cloneElement(component, {zOrder:currentZOrder - 1})
                windowsMap.get(currentSessionID).window.zOrder = currentZOrder - 1

            }
        }

        if (isChange) {
            windowsListRef.current = [...windowsList]
            setPanelState('windowsetfocus')
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

    return <Box id = 'workpanel' data-type = 'workpanel' ref = {panelElementRef} style = {workpanelStyles}>
        {panelState != 'setup' && windowsListRef.current}
        {(panelState != 'setup' && windowCount === 0) && 
            <Box style = {panelMessageStyles} >Tap here to load the base workbox for this panel</Box>
        }
    </Box>
}

export default Workpanel