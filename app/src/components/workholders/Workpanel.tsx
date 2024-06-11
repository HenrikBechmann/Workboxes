// Workpanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, useMemo } from 'react'

import {
    Box
} from '@chakra-ui/react'

import Workwindow from './Workwindow'
import Workbox from './../workbox/Workbox'
import WorkboxHandler from '../../classes/WorkboxHandler'
import {useWorkspaceHandler} from '../../system/WorkboxesProvider'

const workpanelStyles = {
    height:'100%',
    width:'100%',
    minWidth:'700px',
    minHeight:'700px',
    border: '2px ridge silver',
    borderRadius: '8px',
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

let nextWindowSessionID = 0 // used for non-duplicate window component key; also future reference
let nextWorkboxSessionID = 0

const Workpanel = (props:any) => {

    const 
        // windows setup
        {   // children, 
            workboxComponentMapRef, 
            workboxHandlerMapRef, 
            panelID,
        } = props,

        [panelState, setPanelState] = useState('setup'), // setup, configured, resized, ready

        [workspaceHandler] = useWorkspaceHandler(),
        {panelRecords, panelControlMap} = workspaceHandler,
        panelControl = panelControlMap.get(panelID),
        panelSelector = panelControl.selector,

        panelRecord = panelRecords[panelSelector.index],

        // track windows and their views
        { windows:panelwindows } = panelRecord,
        windowComponentListRef = useRef([]),
        windowsMapRef = useRef(null),
        windowMaximizedRef = useRef(null),
        windowsMinimizedRef = useRef(null),
        highestZOrderRef = useRef(0),// track zOrder scope for assignment

        // panel state; panel element
        panelStateRef = useRef(null),
        panelElementRef = useRef(null)

    panelStateRef.current = panelState

    const startingWindowsSpecsListRef = useRef(panelwindows)

    // initialize windows windowRecord map, component list, and minimized list; set maximized window if exists
    useEffect(()=>{

        const 
            windowsMap = new Map(),
            windowsMinimized = new Set()

        windowsMapRef.current = windowsMap
        windowsMinimizedRef.current = windowsMinimized

        const panelControlRecord = panelControlMap.get(panelID)
        panelControlRecord.functions = {
            showDomainWorkbox,
            showMemberWorkbox,
        }

        const startingWindowsSpecs = startingWindowsSpecsListRef.current

        for (const startingspecs of startingWindowsSpecsListRef.current) {

            // TODO: anticipate possible transformation
            const specs = {
                window:startingspecs.window,
                workbox:startingspecs.workbox
            }

            addWindow(specs)

        }

    },[])

    const showDomainWorkbox = () => {
        alert('show domain workbox ' + panelSelector.name)
    }

    const showMemberWorkbox = () => {
        alert('show member workbox ' + panelSelector.name)
    }

    // called by initialization and duplicate window (so far)
    const addWindow = (specs) => {

        const windowSessionID = nextWindowSessionID
        nextWindowSessionID++

        const 
            windowComponentList = windowComponentListRef.current,
            windowsMap = windowsMapRef.current,
            windowsSet = windowsMinimizedRef.current,

            windowRecord = {
                window:specs.window,
                workbox:specs.workbox,
                windowSessionID,
                index:null,
            }

        let 
            zOrder, stackOrder

        // get zOrder and stackOrder values; if minimized, add to set
        if (windowRecord.window.view !== 'minimized') { // minimized, normalized or maximized

            zOrder = ++highestZOrderRef.current

            stackOrder = null
            // if a maxed component exists, swap zOrders
            if ((windowRecord.window.view == 'normalized') && windowMaximizedRef.current) {
                const
                    maxedSessionID = windowMaximizedRef.current,
                    maxedWindowRecord = windowsMap.get(maxedSessionID),
                    maxedIndex = maxedWindowRecord.index,
                    maxedComponent = windowComponentList[maxedIndex]

                maxedWindowRecord.window.zOrder = zOrder
                windowComponentList[maxedIndex] = React.cloneElement(maxedComponent, {zOrder})
                zOrder--
            }

        } else {

            zOrder = 0
            windowsSet.add(windowSessionID)
            stackOrder = windowsSet.size

        }

        // set windowMaximizedRef if 'maximized'; push any existing maxed window out
        if (windowRecord.window.view == 'maximized') {
            if (windowMaximizedRef.current) {
                const 
                    maxedSessionID = windowMaximizedRef.current,
                    maxedWindowRecord = windowsMap.get(maxedSessionID),
                    maxedIndex = maxedWindowRecord.index,
                    maxedComponent = windowComponentList[maxedIndex]

                    maxedWindowRecord.window.view = 'normalized'
                    windowComponentList[maxedIndex] = React.cloneElement(maxedComponent, {
                        viewDeclaration:{
                            view:maxedWindowRecord.window.view,
                            stackOrder:null,
                        }
                    })
            }
            windowMaximizedRef.current = windowSessionID
        }

        // assign zOrder and stackOrder to window record
        windowRecord.window.zOrder = zOrder
        windowRecord.window.stackOrder = stackOrder

        // create window component
        const component = createWindow(windowSessionID, windowRecord)
        windowComponentList.push(component)

        // set window index and save window record
        windowRecord.index = windowComponentList.length - 1
        windowsMap.set(windowSessionID, windowRecord)

    }

    // ** private ** only called by addWindow above
    const createWindow = (windowSessionID, specs) => {

        const 
            // required to position window
            element = panelElementRef.current,
            containerDimensionSpecs = { width:element.offsetWidth, height:element.offsetHeight },
            workboxHandler = new WorkboxHandler(specs.workbox),
            workdata = workboxHandler.getData(),
            { profile } = workdata

        const workboxSessionID = nextWorkboxSessionID++
        
        workboxHandlerMapRef.current.set(workboxSessionID, workboxHandler)

        specs.window.title = profile.itemName
        specs.window.type = profile.typeName

        // required to configure window
        const
            { view, stackOrder, ...remainingWindowProps } = specs.window,
            viewDeclaration = {
                view,
                stackOrder,
            }

        const workboxComponent = <Workbox 
                workboxSessionID = {workboxSessionID}
                defaultWorkboxState = { specs.workbox.defaultWorkboxState }
                defaultDocumentState = { specs.workbox.defaultDocumentState }
                defaultItemlistState = { specs.workbox.defaultItemlistState }
                data = { workdata }
                dataCallbacks = {dataCallbacks}
            />
        workboxComponentMapRef.current.set(workboxSessionID,workboxComponent)

        return <Workwindow 
            key = { windowSessionID } 
            windowSessionID = { windowSessionID }
            viewDeclaration = { viewDeclaration }
            containerDimensionSpecs = { containerDimensionSpecs }
            windowCallbacks = { windowCallbacks } 
            { ...remainingWindowProps }
        >
            {workboxComponentMapRef.current.get(workboxSessionID)}
        </Workwindow>
    }

    // ----------------------------[ data callbacks ]--------------------------

    const dataCallbacks = {

    }

    // -----------------------------[ window callbacks ]-----------------------------

    // remove window and update higher zOrders to compensate, or shuffle minimized windows
    const closeWindow = (windowSessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            windowComponentList = windowComponentListRef.current,
            windowRecord = windowsMap.get(windowSessionID),
            { zOrder } = windowRecord.window,
            numberOfWindows = windowComponentList.length

        let indexToRemove = windowRecord.index


        if (zOrder > 0) { // adjust peer zOrders as necessary
            for (let index = 0; index < numberOfWindows; index++) {
                const 
                    component = windowComponentList[index],
                    componentZOrder = component.props.zOrder,
                    componentSessionID = component.props.windowSessionID

                if (componentSessionID !== windowSessionID) {
                    if (componentZOrder > zOrder) {
                        const newZOrder = componentZOrder - 1
                        windowComponentList[index] = React.cloneElement(component, {zOrder:newZOrder})
                        windowsMap.get(windowSessionID).window.zOrder = newZOrder
                    }
                }
            }

            highestZOrderRef.current--

        }

        windowComponentList.splice(indexToRemove, 1)
        updateWindowsListIndexes()

        if (windowMaximizedRef.current === windowSessionID) {
            windowMaximizedRef.current = null
        }
        if (windowsMinimizedRef.current.has(windowSessionID)) {
            windowsMinimizedRef.current.delete(windowSessionID)
            repositionMinimizedWindows()
        }

        windowsMap.delete(windowSessionID)

        windowComponentListRef.current = [...windowComponentList] // trigger render
        setPanelState('windowclosed')

    }

    const duplicateWindow = (windowSessionID) => {

        const windowRecord = windowsMapRef.current.get(windowSessionID)
        windowRecord.window = {...windowRecord.window}
        windowRecord.workbox = {...windowRecord.workbox}

        addWindow(windowRecord)

    }

    const minimizeWindow = (windowSessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            windowRecord = windowsMap.get(windowSessionID),
            windowComponentList = windowComponentListRef.current,
            numberOfWindows = windowComponentList.length

        if (windowRecord.window.view == 'minimized') return

        if (windowMaximizedRef.current === windowSessionID) {
            windowMaximizedRef.current = null
        }

        windowRecord.window.view = 'minimized'
        const zOrder = windowRecord.window.zOrder
        windowsMinimizedRef.current.add(windowSessionID)

        const stackOrder = windowsMinimizedRef.current.size - 1
        windowRecord.window.stackOrder = stackOrder

        const viewDeclaration = {view:'minimized', stackOrder}

        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowComponentList[index]
            const subjectSessionID = component.props.windowSessionID
            if ( subjectSessionID === windowSessionID) {
                windowComponentList[index] = React.cloneElement(component,{viewDeclaration, zOrder:0})
                windowRecord.window.zOrder = 0
            } else {
                const indexZOrder = component.props.zOrder
                if ((indexZOrder > 0) && (indexZOrder > zOrder)) {
                    const subjectRecord = windowsMap.get(subjectSessionID)
                    subjectRecord.window.zOrder = indexZOrder - 1
                    const subjectViewDeclaration = {view:subjectRecord.window.view,stackOrder:subjectRecord.window.stackOrder}
                    windowComponentList[index] = React.cloneElement(component,{subjectViewDeclaration, zOrder:indexZOrder - 1})
                }
            }
        }

        highestZOrderRef.current--

        windowComponentListRef.current = [...windowComponentList]
        setPanelState('minimizewindow')

    }

    const repositionMinimizedWindows = () => {

        const 
            windowsSet = windowsMinimizedRef.current,
            windowsMap = windowsMapRef.current,
            windowComponentList = windowComponentListRef.current

        let index = 0

        windowsSet.forEach((windowSessionID)=>{
            const windowRecord = windowsMap.get(windowSessionID)

            if (windowRecord.window.stackOrder !== index) {
                windowRecord.window.stackOrder = index

                const 
                    component = windowComponentList[windowRecord.index],
                    viewDeclaration = component.props.viewDeclaration

                viewDeclaration.stackOrder = index
                windowComponentList[windowRecord.index] = React.cloneElement(component, {viewDeclaration:{...viewDeclaration}})
            }
            index++
        })

    }

    const updateWindowsListIndexes = () => {

        const 
            windowComponentList = windowComponentListRef.current,
            windowsMap = windowsMapRef.current,
            numberOfWindows = windowComponentList.length

        for (let index = 0; index < numberOfWindows; index++) {
            const 
                windowSessionID = windowComponentList[index].props.windowSessionID,
                windowRecord = windowsMap.get(windowSessionID)

            if (windowRecord.index !== index) {
                windowRecord.index = index
            }
        }
    }

    const normalizeWindow = (windowSessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            windowComponentList = windowComponentListRef.current,
            numberOfWindows = windowComponentList.length,
            windowRecord = windowsMap.get(windowSessionID),
            previousView = windowRecord.window.view,
            previousZOrder = windowRecord.window.zOrder

        if (windowRecord.window.view == 'normalized') return

        if (windowMaximizedRef.current === windowSessionID) {

            windowMaximizedRef.current = null

        }

        windowRecord.window.view = 'normalized'
        windowRecord.window.stackOrder = null

        let zOrder
        if (previousView == 'minimized') {

            zOrder = ++highestZOrderRef.current
            windowRecord.window.zOrder = zOrder

            windowsMinimizedRef.current.delete(windowSessionID)
            repositionMinimizedWindows()

        } else {
            zOrder = highestZOrderRef.current
            windowRecord.window.zOrder = zOrder

            windowComponentList.forEach((component)=>{
                const subjectSessionID = component.props.windowSessionID
                if ( subjectSessionID !== windowSessionID) {
                    const 
                        subjectRecord = windowsMap.get(subjectSessionID),
                        subjectZOrder = subjectRecord.window.zOrder,
                        subjectIndex = subjectRecord.index

                    if (subjectZOrder > 0 && (subjectZOrder > previousZOrder)) {
                        subjectRecord.window.zOrder--
                        windowComponentList[subjectIndex] = React.createElement(component, {zOrder: subjectZOrder - 1})
                    }
                }
            })
        }

        const 
            viewDeclaration = {view:'normalized',stackOrder:null},
            index = windowRecord.index,
            component = windowComponentList[index]

        windowComponentList[index] = React.cloneElement(component,{viewDeclaration, zOrder})

        windowComponentListRef.current = [...windowComponentList]
        setPanelState('normalizewindow')
    }

    const maximizeWindow = (windowSessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            windowComponentList = windowComponentListRef.current,
            numberOfWindows = windowComponentList.length,
            windowRecord = windowsMap.get(windowSessionID),
            previousZOrder = windowRecord.window.zOrder,
            previousView = windowRecord.window.view

        if (previousView == 'maximized') return

        // get any current maximized window out of the way
        if (windowMaximizedRef.current) {

            const maxedSessionID = windowMaximizedRef.current

            windowMaximizedRef.current = null

            const maxedWindowRecord = windowsMap.get(maxedSessionID)
            maxedWindowRecord.window.view = 'normalized'

            const 
                maxedIndex = maxedWindowRecord.index,
                component = windowComponentList[maxedIndex]

            windowComponentList[maxedIndex] = React.createElement(component, {viewDeclaration:{view:'normalized', stackOrder:null}})
        }

        let zOrder
        if (previousView == 'minimized') {

            zOrder = ++highestZOrderRef.current

            windowsMinimizedRef.current.delete(windowSessionID)
            repositionMinimizedWindows()

        } else {
            zOrder = highestZOrderRef.current
            windowRecord.window.zOrder = zOrder
            windowComponentList.forEach((component)=>{
                const subjectSessionID = component.props.windowSessionID
                if ( subjectSessionID !== windowSessionID) {
                    const 
                        subjectRecord = windowsMap.get(subjectSessionID),
                        subjectZOrder = subjectRecord.window.zOrder,
                        subjectIndex = subjectRecord.index

                    if (subjectZOrder > 0 && (subjectZOrder > previousZOrder)) {
                        subjectRecord.window.zOrder--
                        windowComponentList[subjectIndex] = React.createElement(component, {zOrder: subjectZOrder - 1})
                    }
                }
            })
        }

        windowRecord.window.view = 'maximized'
        windowRecord.window.zOrder = zOrder
        windowMaximizedRef.current = windowSessionID
        const 
            viewDeclaration = {view:'maximized', stackOrder:null},
            index = windowRecord.index,
            component = windowComponentList[index]

        if (component.props.windowSessionID === windowSessionID) {
            windowComponentList[index] = React.cloneElement(component,{viewDeclaration, zOrder})
        }

        windowComponentListRef.current = [...windowComponentList]
        setPanelState('maximizewindow')
    }

    const setFocus = (windowSessionID) => {

        const 
            windowsMap = windowsMapRef.current,
            windowComponentList = windowComponentListRef.current,
            numberOfWindows = windowComponentList.length,
            windowRecord = windowsMap.get(windowSessionID),
            zOrder = windowRecord.window.zOrder

        if (zOrder === 0) return

        let isChange = false
        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowComponentList[index]
            const {zOrder: subjectZOrder, windowSessionID: subjectSessionID} = component.props

            if (subjectZOrder === 0) continue

            if (subjectZOrder === zOrder) {
                if (zOrder !== highestZOrderRef.current) {

                    isChange = true
                    windowComponentList[index] = React.cloneElement(component, {zOrder:highestZOrderRef.current})
                    windowsMap.get(subjectSessionID).window.zOrder = highestZOrderRef.current

                }

            } else if (subjectZOrder > zOrder) {

                isChange = true
                windowComponentList[index] = React.cloneElement(component, {zOrder:subjectZOrder - 1})
                windowsMap.get(subjectSessionID).window.zOrder = subjectZOrder - 1

            }
        }

        if (isChange) {
            windowComponentListRef.current = [...windowComponentList]
            setPanelState('windowsetfocus')
        }

    }

    const windowCallbacks = {
        setFocus,
        closeWindow,
        duplicateWindow,
        minimizeWindow,
        normalizeWindow,
        maximizeWindow,
    }

    // ----------------------------------[ end of windowCallbacks ]-------------------------------

    const onResize = useCallback((entries)=>{

        const 
            element = entries[0].target,
            containerDimensionSpecs = {width:element.offsetWidth, height:element.offsetHeight},
            windowComponentList = windowComponentListRef.current,
            length = windowComponentList.length

        for (let index = 0; index < length; index++ ) {
            const component = windowComponentList[index]
            windowComponentList[index] = React.cloneElement(component, {containerDimensionSpecs})
        }
        windowComponentListRef.current = [...windowComponentList]
        if (panelStateRef.current == 'setup') { // initialize; ongoing updates at Workspace
            const panelDisplayElement = element.closest('#panel-display')
            if (!panelDisplayElement) return
            document.documentElement.style.setProperty('--wb_panel_display_height',(panelDisplayElement.offsetHeight - 10) + 'px')
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

    const windowComponentList = windowComponentListRef.current
    const windowCount = windowComponentListRef.current.length

    return <Box 
        id = 'panel-display' 
        data-type = 'panel-display' 
        width='var(--wb_panel_width)' 
        height =' 100%' 
        overflow = 'auto' 
        minWidth = {0} 
        position = 'relative'
    >
        <Box id = 'workpanel' data-type = 'workpanel' ref = {panelElementRef} style = {workpanelStyles}>
            {panelState != 'setup' && windowComponentList}
            {(panelState != 'setup' && windowCount === 0) && 
                <Box style = {panelMessageStyles} >Tap here to load the default workbox for this panel</Box>
            }
        </Box>
    </Box>
}

export default Workpanel