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

const defaultWorkboxConfig = {
    settings: {
        show:false,
        disabled:false,
    },
    document: {
        show:true,
        disabled:false,
    },
    itemlist: { 
        show:true,
        disabled:false,
    }
}

const defaultDocumentConfig = {
    mode:'view',
}

const defaultItemlistConfig = {

}

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

let nextWindowSessionID = 0 // used for non-duplicate window component key

const Workpanel = (props:any) => {

    const 
        // windows setup
        { panelID } = props,

        [panelState, setPanelState] = useState('setup'), // setup, configured, resized, ready

        // collect panel data
        [workspaceHandler] = useWorkspaceHandler(),
        {panelRecords, panelControlMap} = workspaceHandler,
        panelControl = panelControlMap.get(panelID),
        panelSelector = panelControl.selector,
        panelRecord = panelRecords[panelSelector.index],

        // track windows and their views
        { windows:panelWindows } = panelRecord,
        windowsComponentListRef = useRef([]),
        windowsDataMapRef = useRef(null),
        windowMaximizedRef = useRef(null),
        windowsMinimizedSetRef = useRef(null),
        highestZOrderRef = useRef(0),// track zOrder scope for assignment

        // panel state; panel panelElement
        panelStateRef = useRef(null),
        panelElementRef = useRef(null)

    panelStateRef.current = panelState

    const startingWindowsSpecsListRef = useRef(panelWindows)

    // initialize windows windowData map, component list, and minimized list; set maximized window if exists
    useEffect(()=>{

        const 
            windowsDataMap = new Map(),
            windowsMinimizedSet = new Set()

        windowsDataMapRef.current = windowsDataMap
        windowsMinimizedSetRef.current = windowsMinimizedSet

        const panelControlRecord = panelControlMap.get(panelID)
        panelControlRecord.functions = {
            showDomainWorkbox,
            showMemberWorkbox,
        }

        const startingWindowsSpecs = startingWindowsSpecsListRef.current

        for (const startingspecs of startingWindowsSpecsListRef.current) {

            addWindow(startingspecs.window, startingspecs.workbox)

        }

    },[])

    const showDomainWorkbox = () => {

        const windowSpecs = {
            zOrder: 1,
            configuration: {top:10,left:10, width:610,height:400},
            view: 'normalized',
        }
        const workboxSpecs = {
            workboxConfig: {...defaultWorkboxConfig},
            documentConfig: {...defaultDocumentConfig},
            itemlistConfig: {...defaultItemlistConfig},
            id:workspaceHandler.panelDomainRecord.profile.workbox.id,
        }

        addWindow(windowSpecs, workboxSpecs)

    }

    const showMemberWorkbox = () => {

        const windowSpecs = {
            zOrder: 1,
            configuration: {top:20,left:20, width:610,height:400},
            view: 'normalized',
        }
        const workboxSpecs = {
            workboxConfig:{...defaultWorkboxConfig},
            documentConfig: {...defaultDocumentConfig},
            itemlistConfig: {...defaultItemlistConfig},
            id:workspaceHandler.panelMemberRecord.profile.workbox.id,
        }

        addWindow(windowSpecs, workboxSpecs)

    }

    // called by initialization and duplicate window (so far)
    const addWindow = (windowSpecs, workboxSpecs) => {

        console.log('addWindow: windowSpecs, workboxSpecs',windowSpecs, workboxSpecs)

        return

        const windowSessionID = nextWindowSessionID
        nextWindowSessionID++

        const 
            windowsComponentList = windowsComponentListRef.current,
            windowsDataMap = windowsDataMapRef.current,
            windowsMinimizedSet = windowsMinimizedSetRef.current,

            windowData = {
                window:windowSpecs,
                workbox:workboxSpecs,
                windowSessionID,
                index:null,
            }

        let 
            zOrder, stackOrder

        // get zOrder and stackOrder values; if minimized, add to set
        if (windowData.window.view !== 'minimized') { // minimized, normalized or maximized

            zOrder = ++highestZOrderRef.current

            stackOrder = null
            // if a maxed component exists, swap zOrders
            if ((windowData.window.view == 'normalized') && windowMaximizedRef.current) {
                const
                    maxedSessionID = windowMaximizedRef.current,
                    maxedWindowRecord = windowsDataMap.get(maxedSessionID),
                    maxedIndex = maxedWindowRecord.index,
                    maxedComponent = windowsComponentList[maxedIndex]

                maxedWindowRecord.window.zOrder = zOrder
                windowsComponentList[maxedIndex] = React.cloneElement(maxedComponent, {zOrder})
                zOrder--
            }

        } else {

            zOrder = 0
            windowsMinimizedSet.add(windowSessionID)
            stackOrder = windowsMinimizedSet.size

        }

        // set windowMaximizedRef if 'maximized'; push any existing maxed window out
        if (windowData.window.view == 'maximized') {
            if (windowMaximizedRef.current) {
                const 
                    maxedSessionID = windowMaximizedRef.current,
                    maxedWindowRecord = windowsDataMap.get(maxedSessionID),
                    maxedIndex = maxedWindowRecord.index,
                    maxedComponent = windowsComponentList[maxedIndex]

                    maxedWindowRecord.window.view = 'normalized'
                    windowsComponentList[maxedIndex] = React.cloneElement(maxedComponent, {
                        viewDeclaration:{
                            view:maxedWindowRecord.window.view,
                            stackOrder:null,
                        }
                    })
            }
            windowMaximizedRef.current = windowSessionID
        }

        // assign zOrder and stackOrder to window record
        windowData.window.zOrder = zOrder
        windowData.window.stackOrder = stackOrder

        // create window component
        const component = _createWindowComponent(windowSessionID, windowData)
        windowsComponentList.push(component)

        // set window index and save window record
        windowData.index = windowsComponentList.length - 1
        windowsDataMap.set(windowSessionID, windowData)

    }

    // ** private ** only called by addWindow above
    const _createWindowComponent = (windowSessionID, specs) => {

        const 
            // required to position window
            panelElement = panelElementRef.current,
            containerDimensionSpecs = { width:panelElement.offsetWidth, height:panelElement.offsetHeight }

        // required to configure window
        const
            { view, stackOrder, ...remainingWindowProps } = specs.window,
            viewDeclaration = {
                view,
                stackOrder,
            }

        return <Workwindow 
            key = { windowSessionID } 
            windowSessionID = { windowSessionID }
            viewDeclaration = { viewDeclaration }
            containerDimensionSpecs = { containerDimensionSpecs }
            windowCallbacks = { windowCallbacks } 
            { ...remainingWindowProps }
        >
            <Workbox 
                workboxSettings = { specs.workbox }
            />        
        </Workwindow>
    }

    // ----------------------------[ data callbacks ]--------------------------

    const dataCallbacks = {

    }

    // -----------------------------[ window callbacks ]-----------------------------

    const setFocus = (windowSessionID) => {

        const 
            windowsDataMap = windowsDataMapRef.current,
            windowsComponentList = windowsComponentListRef.current,
            numberOfWindows = windowsComponentList.length,
            windowData = windowsDataMap.get(windowSessionID),
            zOrder = windowData.window.zOrder

        if (zOrder === 0) return

        let isChange = false
        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowsComponentList[index]
            const {zOrder: subjectZOrder, windowSessionID: subjectSessionID} = component.props

            if (subjectZOrder === 0) continue

            if (subjectZOrder === zOrder) {
                if (zOrder !== highestZOrderRef.current) {

                    isChange = true
                    windowsComponentList[index] = React.cloneElement(component, {zOrder:highestZOrderRef.current})
                    windowsDataMap.get(subjectSessionID).window.zOrder = highestZOrderRef.current

                }

            } else if (subjectZOrder > zOrder) {

                isChange = true
                windowsComponentList[index] = React.cloneElement(component, {zOrder:subjectZOrder - 1})
                windowsDataMap.get(subjectSessionID).window.zOrder = subjectZOrder - 1

            }
        }

        if (isChange) {
            windowsComponentListRef.current = [...windowsComponentList]
            setPanelState('windowsetfocus')
        }

    }

    // remove window and update higher zOrders to compensate, or shuffle minimized windows
    const closeWindow = (windowSessionID) => {

        const 
            windowsDataMap = windowsDataMapRef.current,
            windowsComponentList = windowsComponentListRef.current,
            windowData = windowsDataMap.get(windowSessionID),
            { zOrder } = windowData.window,
            numberOfWindows = windowsComponentList.length

        let indexToRemove = windowData.index


        if (zOrder > 0) { // adjust peer zOrders as necessary
            for (let index = 0; index < numberOfWindows; index++) {
                const 
                    component = windowsComponentList[index],
                    componentZOrder = component.props.zOrder,
                    componentSessionID = component.props.windowSessionID

                if (componentSessionID !== windowSessionID) {
                    if (componentZOrder > zOrder) {
                        const newZOrder = componentZOrder - 1
                        windowsComponentList[index] = React.cloneElement(component, {zOrder:newZOrder})
                        windowsDataMap.get(windowSessionID).window.zOrder = newZOrder
                    }
                }
            }

            highestZOrderRef.current--

        }

        windowsComponentList.splice(indexToRemove, 1)
        updateWindowsListIndexes()

        if (windowMaximizedRef.current === windowSessionID) {
            windowMaximizedRef.current = null
        }
        if (windowsMinimizedSetRef.current.has(windowSessionID)) {
            windowsMinimizedSetRef.current.delete(windowSessionID)
            repositionMinimizedWindows()
        }

        windowsDataMap.delete(windowSessionID)

        windowsComponentListRef.current = [...windowsComponentList] // trigger render
        setPanelState('windowclosed')

    }

    const duplicateWindow = (windowSessionID) => {

        const windowData = windowsDataMapRef.current.get(windowSessionID)
        windowData.window = {...windowData.window}
        windowData.workbox = {...windowData.workbox}

        addWindow(windowData.window, windowData.workbox)

    }

    const minimizeWindow = (windowSessionID) => {

        const 
            windowsDataMap = windowsDataMapRef.current,
            windowData = windowsDataMap.get(windowSessionID),
            windowsComponentList = windowsComponentListRef.current,
            numberOfWindows = windowsComponentList.length

        if (windowData.window.view == 'minimized') return

        if (windowMaximizedRef.current === windowSessionID) {
            windowMaximizedRef.current = null
        }

        windowData.window.view = 'minimized'
        const zOrder = windowData.window.zOrder
        windowsMinimizedSetRef.current.add(windowSessionID)

        const stackOrder = windowsMinimizedSetRef.current.size - 1
        windowData.window.stackOrder = stackOrder

        const viewDeclaration = {view:'minimized', stackOrder}

        for (let index = 0; index < numberOfWindows; index++) {
            const component = windowsComponentList[index]
            const subjectSessionID = component.props.windowSessionID
            if ( subjectSessionID === windowSessionID) {
                windowsComponentList[index] = React.cloneElement(component,{viewDeclaration, zOrder:0})
                windowData.window.zOrder = 0
            } else {
                const indexZOrder = component.props.zOrder
                if ((indexZOrder > 0) && (indexZOrder > zOrder)) {
                    const subjectRecord = windowsDataMap.get(subjectSessionID)
                    subjectRecord.window.zOrder = indexZOrder - 1
                    const subjectViewDeclaration = {view:subjectRecord.window.view,stackOrder:subjectRecord.window.stackOrder}
                    windowsComponentList[index] = React.cloneElement(component,{subjectViewDeclaration, zOrder:indexZOrder - 1})
                }
            }
        }

        highestZOrderRef.current--

        windowsComponentListRef.current = [...windowsComponentList]
        setPanelState('minimizewindow')

    }

    const repositionMinimizedWindows = () => {

        const 
            windowsMinimizedSet = windowsMinimizedSetRef.current,
            windowsDataMap = windowsDataMapRef.current,
            windowsComponentList = windowsComponentListRef.current

        let index = 0

        windowsMinimizedSet.forEach((windowSessionID)=>{
            const windowData = windowsDataMap.get(windowSessionID)

            if (windowData.window.stackOrder !== index) {
                windowData.window.stackOrder = index

                const 
                    component = windowsComponentList[windowData.index],
                    viewDeclaration = component.props.viewDeclaration

                viewDeclaration.stackOrder = index
                windowsComponentList[windowData.index] = React.cloneElement(component, {viewDeclaration:{...viewDeclaration}})
            }
            index++
        })

    }

    const updateWindowsListIndexes = () => {

        const 
            windowsComponentList = windowsComponentListRef.current,
            windowsDataMap = windowsDataMapRef.current,
            numberOfWindows = windowsComponentList.length

        for (let index = 0; index < numberOfWindows; index++) {
            const 
                windowSessionID = windowsComponentList[index].props.windowSessionID,
                windowData = windowsDataMap.get(windowSessionID)

            if (windowData.index !== index) {
                windowData.index = index
            }
        }
    }

    const normalizeWindow = (windowSessionID) => {

        const 
            windowsDataMap = windowsDataMapRef.current,
            windowsComponentList = windowsComponentListRef.current,
            numberOfWindows = windowsComponentList.length,
            windowData = windowsDataMap.get(windowSessionID),
            previousView = windowData.window.view,
            previousZOrder = windowData.window.zOrder

        if (windowData.window.view == 'normalized') return

        if (windowMaximizedRef.current === windowSessionID) {

            windowMaximizedRef.current = null

        }

        windowData.window.view = 'normalized'
        windowData.window.stackOrder = null

        let zOrder
        if (previousView == 'minimized') {

            zOrder = ++highestZOrderRef.current
            windowData.window.zOrder = zOrder

            windowsMinimizedSetRef.current.delete(windowSessionID)
            repositionMinimizedWindows()

        } else {
            zOrder = highestZOrderRef.current
            windowData.window.zOrder = zOrder

            windowsComponentList.forEach((component)=>{
                const subjectSessionID = component.props.windowSessionID
                if ( subjectSessionID !== windowSessionID) {
                    const 
                        subjectRecord = windowsDataMap.get(subjectSessionID),
                        subjectZOrder = subjectRecord.window.zOrder,
                        subjectIndex = subjectRecord.index

                    if (subjectZOrder > 0 && (subjectZOrder > previousZOrder)) {
                        subjectRecord.window.zOrder--
                        windowsComponentList[subjectIndex] = React.createElement(component, {zOrder: subjectZOrder - 1})
                    }
                }
            })
        }

        const 
            viewDeclaration = {view:'normalized',stackOrder:null},
            index = windowData.index,
            component = windowsComponentList[index]

        windowsComponentList[index] = React.cloneElement(component,{viewDeclaration, zOrder})

        windowsComponentListRef.current = [...windowsComponentList]
        setPanelState('normalizewindow')
    }

    const maximizeWindow = (windowSessionID) => {

        const 
            windowsDataMap = windowsDataMapRef.current,
            windowsComponentList = windowsComponentListRef.current,
            numberOfWindows = windowsComponentList.length,
            windowData = windowsDataMap.get(windowSessionID),
            previousZOrder = windowData.window.zOrder,
            previousView = windowData.window.view

        if (previousView == 'maximized') return

        // get any current maximized window out of the way
        if (windowMaximizedRef.current) {

            const maxedSessionID = windowMaximizedRef.current

            windowMaximizedRef.current = null

            const maxedWindowRecord = windowsDataMap.get(maxedSessionID)
            maxedWindowRecord.window.view = 'normalized'

            const 
                maxedIndex = maxedWindowRecord.index,
                component = windowsComponentList[maxedIndex]

            windowsComponentList[maxedIndex] = React.createElement(component, {viewDeclaration:{view:'normalized', stackOrder:null}})
        }

        let zOrder
        if (previousView == 'minimized') {

            zOrder = ++highestZOrderRef.current

            windowsMinimizedSetRef.current.delete(windowSessionID)
            repositionMinimizedWindows()

        } else {
            zOrder = highestZOrderRef.current
            windowData.window.zOrder = zOrder
            windowsComponentList.forEach((component)=>{
                const subjectSessionID = component.props.windowSessionID
                if ( subjectSessionID !== windowSessionID) {
                    const 
                        subjectRecord = windowsDataMap.get(subjectSessionID),
                        subjectZOrder = subjectRecord.window.zOrder,
                        subjectIndex = subjectRecord.index

                    if (subjectZOrder > 0 && (subjectZOrder > previousZOrder)) {
                        subjectRecord.window.zOrder--
                        windowsComponentList[subjectIndex] = React.createElement(component, {zOrder: subjectZOrder - 1})
                    }
                }
            })
        }

        windowData.window.view = 'maximized'
        windowData.window.zOrder = zOrder
        windowMaximizedRef.current = windowSessionID
        const 
            viewDeclaration = {view:'maximized', stackOrder:null},
            index = windowData.index,
            component = windowsComponentList[index]

        if (component.props.windowSessionID === windowSessionID) {
            windowsComponentList[index] = React.cloneElement(component,{viewDeclaration, zOrder})
        }

        windowsComponentListRef.current = [...windowsComponentList]
        setPanelState('maximizewindow')
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
            panelElement = entries[0].target,
            containerDimensionSpecs = {width:panelElement.offsetWidth, height:panelElement.offsetHeight},
            windowsComponentList = windowsComponentListRef.current,
            length = windowsComponentList.length

        for (let index = 0; index < length; index++ ) {
            const component = windowsComponentList[index]
            windowsComponentList[index] = React.cloneElement(component, {containerDimensionSpecs})
        }
        windowsComponentListRef.current = [...windowsComponentList]
        if (panelStateRef.current == 'setup') { // initialize; ongoing updates at Workspace
            const panelDisplayElement = panelElement.closest('#panel-display')
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

    const windowsComponentList = windowsComponentListRef.current
    const windowCount = windowsComponentListRef.current.length

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
            {panelState != 'setup' && windowsComponentList}
            {(panelState != 'setup' && windowCount === 0) && 
                <Box style = {panelMessageStyles} >Tap here to load the default workbox for this panel</Box>
            }
        </Box>
    </Box>
}

export default Workpanel