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
        // windows setup
        { startingWindowsSpecsList } = props,
        startingWindowsSpecsListRef = useRef(startingWindowsSpecsList),

        // panel state; panel element
        [panelState, setPanelState] = useState('setup'), // setup, configured, resized, ready
        panelElementRef = useRef(null),

        // track windows and their views
        windowsListRef = useRef([]),
        windowsMapRef = useRef(null),
        windowMaximizedRef = useRef(null),
        windowsMinimizedRef = useRef(null),

        // track zOrder scope for assignment
        highestZOrderRef = useRef(0)

    // initialize windows windowRecord map, component list, and minimized list; set maximized window if exists
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

    // called by initialization and duplicate window (so far)
    const addWindow = (specs) => {

        const sessionID = nextSessionID
        nextSessionID++

        const 
            windowsList = windowsListRef.current,
            windowsMap = windowsMapRef.current,
            windowsSet = windowsMinimizedRef.current,

            windowRecord = {
                window:specs.window,
                workbox:specs.workbox,
                sessionID,
                index:null,
            }

        let 
            zOrder, stackOrder

        // get zOrder and stackOrder values; if minimized, add to set
        if (windowRecord.window.view !== 'minimized') { // normalized or maximized

            zOrder = ++highestZOrderRef.current
            stackOrder = null
            // if a maxed component exists, swap zOrders
            if ((windowRecord.window.view == 'normalized') && windowMaximizedRef.current) {
                const
                    maxedSessionID = windowMaximizedRef.current,
                    maxedWindowRecord = windowsMap.get(maxedSessionID),
                    maxedIndex = maxedWindowRecord.index,
                    maxedComponent = windowsList[maxedIndex]

                maxedWindowRecord.window.zOrder = zOrder
                windowsList[maxedIndex] = React.cloneElement(maxedComponent, {zOrder})
                zOrder--
            }

        } else {

            zOrder = 0
            windowsSet.add(sessionID)
            stackOrder = windowsSet.size

        }

        // set windowMaximizedRef if 'maximized'; push any existing maxed window out
        if (windowRecord.window.view == 'maximized') {
            if (windowMaximizedRef.current) {
                const 
                    maxedSessionID = windowMaximizedRef.current,
                    maxedWindowRecord = windowsMap.get(maxedSessionID),
                    maxedIndex = maxedWindowRecord.index,
                    maxedComponent = windowsList[maxedIndex]

                    maxedWindowRecord.window.view = 'normalized'
                    windowsList[maxedIndex] = React.cloneElement(maxedComponent, {
                        viewDeclaration:{
                            view:maxedWindowRecord.window.view,
                            stackOrder:null,
                        }
                    })
            }
            windowMaximizedRef.current = sessionID
        }

        // assign zOrder and stackOrder to window record
        windowRecord.window.zOrder = zOrder
        windowRecord.window.stackOrder = stackOrder

        // create window component
        const component = createWindow(sessionID, windowRecord)
        windowsList.push(component)

        // set window index and save window record
        windowRecord.index = windowsList.length - 1
        windowsMap.set(sessionID, windowRecord)

    }

    // ** private ** only called by addWindow above
    const createWindow = (sessionID, specs) => {

        const 
            // required to position window
            element = panelElementRef.current,
            containerConfigSpecs = { width:element.offsetWidth, height:element.offsetHeight },
            // required to configure window
            { view, stackOrder, ...remainingWindowProps } = specs.window,
            viewDeclaration = {
                view,
                stackOrder,
            }

        // sessionID is passed to Workbox for information only
        return <Workwindow 
            key = { sessionID } 
            sessionID = { sessionID }
            viewDeclaration = { viewDeclaration }
            containerConfigSpecs = { containerConfigSpecs }
            callbacks = { callbacks } 
            { ...remainingWindowProps }
        >
            <Workbox 
                sessionWindowID = {sessionID} {...specs.workbox}
            />
        </Workwindow>
    }

    // remove window and update higher zOrders to compensate, or shuffle minimized windows
    const closeWindow = (sessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            windowsList = windowsListRef.current,
            windowRecord = windowsMap.get(sessionID),
            { zOrder } = windowRecord.window,
            numberOfWindows = windowsList.length

        let indexToRemove = null
        for (let index = 0; index < numberOfWindows; index++) {
            const 
                component = windowsList[index],
                componentZOrder = component.props.zOrder,
                componentSessionID = component.props.sessionID

            if (componentSessionID === sessionID) {
                indexToRemove = index
            }
            if (zOrder > 0) {
                if (componentZOrder > zOrder) {
                    const newZOrder = componentZOrder - 1
                    windowsList[index] = React.cloneElement(component, {zOrder:newZOrder})
                    windowsMap.get(sessionID).window.zOrder = newZOrder
                }
            }
        }

        if (zOrder > 0) {
            highestZOrderRef.current--
        }
    
        windowsList.splice(indexToRemove, 1)
        updateWindowsListIndexes()

        if (windowMaximizedRef.current === sessionID) {
            windowMaximizedRef.current = null
        }
        if (windowsMinimizedRef.current.has(sessionID)) {
            windowsMinimizedRef.current.delete(sessionID)
            repositionMinimizedWindows()
        }

        windowsMap.delete(sessionID)

        windowsListRef.current = [...windowsList] // trigger render
        // console.log('updated windowListRef.current', windowsListRef.current)

        setPanelState('windowclosed')
    }

    const duplicateWindow = (sessionID) => {

        const windowRecord = windowsMapRef.current.get(sessionID)
        windowRecord.window = {...windowRecord.window}
        windowRecord.workbox = {...windowRecord.workbox}

        addWindow(windowRecord)

    }

// minimizeWindow, normalizeWindow, maximizeWindow
    const minimizeWindow = (sessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            windowRecord = windowsMap.get(sessionID),
            windowsList = windowsListRef.current,
            numberOfWindows = windowsList.length

        if (windowRecord.window.view == 'minimized') return

        if (windowMaximizedRef.current === sessionID) {
            windowMaximizedRef.current = null
        }

        windowRecord.window.view = 'minimized'
        const subjectZOrder = windowRecord.window.zOrder
        windowsMinimizedRef.current.add(sessionID)

        const stackOrder = windowsMinimizedRef.current.size - 1
        windowRecord.window.stackOrder = stackOrder

        const viewDeclaration = {view:'minimized', stackOrder}

        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowsList[index]
            if (component.props.sessionID === sessionID) {
                windowsList[index] = React.cloneElement(component,{viewDeclaration, zOrder:0})
            } else {
                const indexZOrder = component.props.zOrder
                if ((indexZOrder > 0) && (indexZOrder > subjectZOrder)) {
                    windowsList[index] = React.cloneElement(component,{viewDeclaration, zOrder:indexZOrder - 1})
                    windowRecord.window.zOrder = indexZOrder - 1
                }
            }
        }

        highestZOrderRef.current--

        windowsListRef.current = [...windowsList]
        setPanelState('minimizewindow')

    }

    const repositionMinimizedWindows = () => {

        // console.log('repositioning minimized windows')

        const 
            windowsSet = windowsMinimizedRef.current,
            windowsMap = windowsMapRef.current,
            windowsList = windowsListRef.current
            let index = 0

        windowsSet.forEach((sessionID)=>{
            const windowRecord = windowsMap.get(sessionID)
            // console.log('windowRecord.window.stackOrder, index', windowRecord.window.stackOrder, index)
            if (windowRecord.window.stackOrder !== index) {
                // console.log('updating stackorder', index)
                windowRecord.window.stackOrder = index
                const component = windowsList[windowRecord.index]
                const viewDeclaration = component.props.viewDeclaration
                // console.log('found viewDeclaration', {...viewDeclaration})
                viewDeclaration.stackOrder = index
                // console.log('updated viewDeclaration', {...viewDeclaration})
                windowsList[windowRecord.index] = React.cloneElement(component, {viewDeclaration:{...viewDeclaration}})
            }
            index++
        })

    }

    const updateWindowsListIndexes = () => {
        const 
            windowsList = windowsListRef.current,
            windowsMap = windowsMapRef.current,
            numberOfWindows = windowsList.length

        for (let index = 0; index < numberOfWindows; index++) {
            const 
                sessionID = windowsList[index].props.sessionID,
                windowRecord = windowsMap.get(sessionID)

            if (windowRecord.index !== index) {
                windowRecord.index = index
            }
        }
    }

    const normalizeWindow = (sessionID) => {
        const 
            windowsMap = windowsMapRef.current,
            windowRecord = windowsMap.get(sessionID),
            windowsList = windowsListRef.current,
            numberOfWindows = windowsList.length

        if (windowRecord.window.view == 'normalized') return

        if (windowMaximizedRef.current === sessionID) {
            windowMaximizedRef.current = null
        }
        if (windowsMinimizedRef.current.has(sessionID)) {
            windowsMinimizedRef.current.delete(sessionID)
            windowRecord.window.zOrder = windowsList.length - 1
            repositionMinimizedWindows()
        }

        windowRecord.window.view = 'normalized'
        const zOrder = windowRecord.window.zOrder
        windowRecord.window.stackOrder = null


        const 
            viewDeclaration = {view:'normalized',stackOrder:null},
            index = windowRecord.index,
            component = windowsList[index]

        windowsList[index] = React.cloneElement(component,{viewDeclaration, zOrder})

        windowsListRef.current = [...windowsList]
        setPanelState('normalizewindow')
    }

    const maximizeWindow = (sessionID) => {
        const 
            windowsMap = windowsMapRef.current,
            windowRecord = windowsMap.get(sessionID),
            windowsList = windowsListRef.current,
            numberOfWindows = windowsList.length

        if (windowRecord.window.view == 'maximized') return

        if (windowMaximizedRef.current) {
            const maxedSessionID = windowMaximizedRef.current

            windowMaximizedRef.current = null

            const maxedWindowRecord = windowsMap.get(maxedSessionID)
            maxedWindowRecord.window.view = 'normalized'
            const maxedIndex = maxedWindowRecord.index
            const component = windowsList[maxedIndex]
            windowsList[maxedIndex] = React.createElement(component, {viewDeclaration:{view:'normalized', stackOrder:null}})
        }

        windowRecord.window.view = 'maximized'
        windowMaximizedRef.current = sessionID
        const 
            viewDeclaration = {view:'maximized', stackOrder:null},
            index = windowRecord.index,
            component = windowsList[index]

        if (component.props.sessionID === sessionID) {
            windowsList[index] = React.cloneElement(component,{viewDeclaration})
        }
        windowsListRef.current = [...windowsList]
        setPanelState('maximizewindow')
    }

    const setFocus = (sessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            windowsList = windowsListRef.current,
            numberOfWindows = windowsList.length,
            windowRecord = windowsMap.get(sessionID),
            zOrder = windowRecord.window.zOrder

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

        for (let index = 0; index < length; index++ ) {
            const component = windowsList[index]
            windowsList[index] = React.cloneElement(component, {containerConfigSpecs})
        }
        windowsListRef.current = [...windowsList]
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
    const windowCount = windowsListRef.current.length

    return <Box id = 'workpanel' data-type = 'workpanel' ref = {panelElementRef} style = {workpanelStyles}>
        {panelState != 'setup' && windowsList}
        {(panelState != 'setup' && windowCount === 0) && 
            <Box style = {panelMessageStyles} >Tap here to load the base workbox for this panel</Box>
        }
    </Box>
}

export default Workpanel