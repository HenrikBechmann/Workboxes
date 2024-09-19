// Workpanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, useMemo, lazy, startTransition, Suspense } from 'react'

import {
    Box
} from '@chakra-ui/react'

import { cloneDeep as _cloneDeep } from 'lodash'

const Workwindow = lazy(() => import('./Workwindow'))
const Workbox = lazy(() => import('./../workbox/Workbox'))
import WorkboxHandler from '../../classes/WorkboxHandler'
import {useWorkspaceHandler} from '../../system/WorkboxesProvider'

const defaultWorkboxConfig = {
    content: {
        displaycode:'both',
    },
    document: {
        displaycode:'out',
        mode:'view', // view, insert, edit, remove, reorder
        show:false,
    },
    resources: { 
        displaycode:'out',
        mode: 'view', // view, drill, insert, edit, remove, drag
        show:false,
    },
    both: {
        show: true,
    },
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
let nextWorkboxSessionID = 0

const Workpanel = (props:any) => {

    const 
        // windows setup
        { panelID } = props

    // console.log('Workpanel: panelID',panelID)

    const

        [panelState, setPanelState] = useState('setup'), // setup, configured, resized, ready, windowadded

        // collect panel data
        [workspaceHandler] = useWorkspaceHandler(),
        {panelRecords, panelControlMap} = workspaceHandler,
        panelControl = panelControlMap.get(panelID),
        panelSelector = panelControl.panel,
        panelRecord = panelRecords[panelSelector.index],

        // track windows and their views
        { windows:panelWindows } = panelRecord,
        windowComponentListRef = useRef([]),
        windowDataMapRef = useRef(null),
        windowMaximizedRef = useRef(null),
        windowMinimizedSetRef = useRef(null),
        nextZOrderRef = useRef(1), // track zOrder scope for assignment; leave "0" for minimized

        // panel state; panelElement
        panelStateRef = useRef(null),
        panelElementRef = useRef(null)

    panelStateRef.current = panelState

    // console.log('panelControlMap',panelControlMap)

    const startingWindowsSpecsListRef = useRef(panelWindows)

    // initialize windows windowData map, component list, and minimized list; set maximized window if exists
    useEffect(()=>{

        const 
            windowDataMap = new Map(),
            windowMinimizedSet = new Set()

        windowDataMapRef.current = windowDataMap
        windowMinimizedSetRef.current = windowMinimizedSet

        const panelControlRecord = panelControlMap.get(panelID)
        panelControlRecord.functions = {
            showDomainWorkbox,
            showMemberWorkbox,
            updateDomainData,
            updateMemberData,
        }

        const startingWindowsSpecs = startingWindowsSpecsListRef.current

        for (const startingspecs of startingWindowsSpecsListRef.current) {

            addWindow(startingspecs.window, startingspecs.workbox)

        }

    },[])

    const updateDomainData = (domainRecord) => {
        console.log('updating domain data', domainRecord)
    }


    const updateMemberData = (memberRecord) => {
        console.log('updating member data', memberRecord)
    }

    const showDomainWorkbox = () => {

        const 
            titleData = Object.assign({},
                workspaceHandler.panelDomainRecord.profile.workbox,
                {type:workspaceHandler.panelDomainRecord.profile.workbox_type}),
            windowSpecs = {
                configuration: {top:10,left:10, width:610,height:400},
                viewDeclaration: {
                    view: 'normalized',
                    stackOrder: null,
                },
                // zOrder: nextZOrderRef.current++,
                titleData,
            },
            workboxSpecs = {
                settings: _cloneDeep(defaultWorkboxConfig),
                workbox: {
                    id:workspaceHandler.panelDomainRecord.profile.workbox.id,
                }
            }

        addWindow(windowSpecs, workboxSpecs)

        setPanelState('windowadded')

    }

    const showMemberWorkbox = () => {

        // console.log('workspaceHandler.panelMemberRecord.profile',workspaceHandler.panelMemberRecord.profile)

        const 
            titleData = Object.assign({},
                workspaceHandler.panelMemberRecord.profile.workbox,
                {type:workspaceHandler.panelMemberRecord.profile.workbox_type}),
            windowSpecs = {
                configuration: {top:20,left:20, width:610,height:400},
                viewDeclaration: {
                    view: 'normalized',
                    stackOrder: null,
                },
                titleData,
            },
            workboxSpecs = {
                settings: _cloneDeep(defaultWorkboxConfig),
                workbox: {
                    id:workspaceHandler.panelMemberRecord.profile.workbox.id,
                }
            }

        addWindow(windowSpecs, workboxSpecs)

        setPanelState('windowadded')

    }

    // called by initialization and duplicate window (so far)
    const addWindow = (windowSpecs, workboxSpecs) => {

        const windowSessionID = nextWindowSessionID++
        const workboxSessionID = nextWorkboxSessionID++
        workboxSpecs.workbox.sessionid = workboxSessionID

        // viewDeclaration already added by caller
        Object.assign(windowSpecs, {
            windowSessionID,
            index:null,
            zOrder:null,
        })

        const 
            windowComponentList = windowComponentListRef.current,
            windowDataMap = windowDataMapRef.current,
            windowMinimizedSet = windowMinimizedSetRef.current,

            windowData = {
                window:windowSpecs,
                workbox:workboxSpecs,
            }

        // console.log('windowData', windowData)

        let 
            zOrder, stackOrder

        // get zOrder and stackOrder values; if minimized, add to set
        if (windowData.window.viewDeclaration.view !== 'minimized') { // minimized, normalized or maximized

            zOrder = nextZOrderRef.current++

            stackOrder = null
            // if a maxed component exists, swap zOrders
            if ((windowData.window.viewDeclaration.view == 'normalized') && windowMaximizedRef.current) {
                const
                    maxedSessionID = windowMaximizedRef.current,
                    maxedWindowRecord = windowDataMap.get(maxedSessionID),
                    maxedIndex = maxedWindowRecord.index,
                    maxedSuspenseComponent = windowComponentList[maxedIndex],
                    maxedComponent = maxedSuspenseComponent.props.children

                maxedWindowRecord.window.zOrder = zOrder
                const cloneMaxedComponent = React.cloneElement(maxedComponent, {zOrder})
                windowComponentList[maxedIndex] = React.cloneElement(maxedSuspenseComponent, {children:cloneMaxedComponent})
                zOrder--
            }

        } else {

            zOrder = 0
            windowMinimizedSet.add(windowSessionID)
            stackOrder = windowMinimizedSet.size

        }

        // set windowMaximizedRef if 'maximized'; push any existing maxed window out
        if (windowData.window.viewDeclaration.view == 'maximized') {
            if (windowMaximizedRef.current) {
                const 
                    maxedSessionID = windowMaximizedRef.current,
                    maxedWindowRecord = windowDataMap.get(maxedSessionID),
                    maxedIndex = maxedWindowRecord.index,
                    maxedSuspenseComponent = windowComponentList[maxedIndex],
                    maxedComponent = maxedSuspenseComponent.props.children

                maxedWindowRecord.window.viewDeclaration.view = 'normalized'
                const cloneMaxedComponent = React.cloneElement(maxedComponent, {
                    viewDeclaration:{
                        view:maxedWindowRecord.window.viewDeclaration.view,
                        stackOrder:null,
                    }})
                windowComponentList[maxedIndex] = React.cloneElement(maxedSuspenseComponent,{children:cloneMaxedComponent})
            }
            windowMaximizedRef.current = windowSessionID
        }

        // assign zOrder and stackOrder to window record
        windowData.window.zOrder = zOrder
        windowData.window.viewDeclaration.stackOrder = stackOrder

        // create window component
        const component = _createWindowComponent(windowSessionID, windowData)
        windowComponentList.push(component)

        // set window index and save window record
        windowData.window.index = windowComponentList.length - 1
        windowDataMap.set(windowSessionID, windowData)

        windowComponentListRef.current = [...windowComponentList]

        // console.log('widowDataMap, windowComponentList', windowDataMap, windowComponentList)

    }

    // ** private ** only called by addWindow above
    const _createWindowComponent = (windowSessionID, windowData) => {

        const 
            // required to position window
            panelElement = panelElementRef.current,
            containerDimensionSpecs = { width:panelElement.offsetWidth, height:panelElement.offsetHeight },
            // required to configure window
            { viewDeclaration, zOrder, configuration, titleData } = windowData.window

        return <Suspense key = {windowSessionID}><Workwindow
            key = { windowSessionID } 
            windowSessionID = { windowSessionID }
            viewDeclaration = { viewDeclaration }
            zOrder = {zOrder}
            containerDimensionSpecs = { containerDimensionSpecs }
            windowCallbacks = { windowCallbacks } 
            configuration = { configuration }
            titleData = { titleData }
        >
            <Workbox 
                workboxSettings = { windowData.workbox }
            />
        </Workwindow></Suspense>
    }

    // ----------------------------[ data callbacks ]--------------------------

    const dataCallbacks = {

    }

    // -----------------------------[ window callbacks ]-----------------------------

    const setFocus = (windowSessionID) => {

        const 
            windowDataMap = windowDataMapRef.current,
            windowComponentList = windowComponentListRef.current,
            numberOfWindows = windowComponentList.length,
            windowData = windowDataMap.get(windowSessionID),
            zOrder = windowData.window.zOrder

        if (windowData.window.viewDeclaration.view == 'minimized') return // stay at bottom
        if (zOrder === (nextZOrderRef.current - 1)) return // already at the top

        let isChange = false
        for (let index = 0; index < numberOfWindows; index++) {
            const suspenseComponent = windowComponentList[index]
            const component = suspenseComponent.props.children
            const {zOrder: subjectZOrder, windowSessionID: subjectSessionID} = component.props

            if (subjectZOrder === zOrder) {
                if (zOrder !== (nextZOrderRef.current - 1)) {

                    isChange = true
                    const cloneComponent = React.cloneElement(component, {zOrder:nextZOrderRef.current - 1})
                    windowComponentList[index] = React.cloneElement(suspenseComponent, {children:cloneComponent})
                    windowDataMap.get(subjectSessionID).window.zOrder = nextZOrderRef.current -1

                }

            } else if (subjectZOrder > zOrder) {

                isChange = true
                const cloneComponent = React.cloneElement(component, {zOrder:subjectZOrder - 1})
                windowComponentList[index] = React.cloneElement(suspenseComponent, {children:cloneComponent})
                windowDataMap.get(subjectSessionID).window.zOrder = subjectZOrder - 1

            }
        }

        if (isChange) {
            windowComponentListRef.current = [...windowComponentList]
            setPanelState('windowsetfocus')
        }

    }

    // remove window and update higher zOrders to compensate, or shuffle minimized windows
    const closeWindow = (windowSessionID) => {

        const 
            windowDataMap = windowDataMapRef.current,
            windowComponentList = windowComponentListRef.current,
            windowData = windowDataMap.get(windowSessionID),
            { zOrder } = windowData.window,
            indexToRemove = windowData.window.index

        // console.log('indexToRemove, windowSessionID, windowData, windowDataMap, windowComponentList',
        //     indexToRemove, windowSessionID, windowData, windowDataMap, windowComponentList)

        windowComponentList.splice(indexToRemove, 1)
        windowDataMap.delete(windowSessionID)
        const numberOfWindows = windowComponentList.length
        updateWindowsListIndexes()

        if (windowMaximizedRef.current === windowSessionID) {
            windowMaximizedRef.current = null
        }
        if (windowMinimizedSetRef.current.has(windowSessionID)) {
            windowMinimizedSetRef.current.delete(windowSessionID)
            repositionMinimizedWindows()
        }

        if (zOrder > 0) { // adjust peer zOrders as necessary
            for (let index = 0; index < numberOfWindows; index++) {
                const 
                    suspenseComponent = windowComponentList[index],
                    component = suspenseComponent.props.children,
                    componentZOrder = component.props.zOrder,
                    componentSessionID = component.props.windowSessionID

                if (componentSessionID !== windowSessionID) {
                    if (componentZOrder > zOrder) {
                        const newZOrder = componentZOrder - 1
                        const cloneComponent = React.cloneElement(component, {zOrder:newZOrder})
                        windowComponentList[index] = React.cloneElement(suspenseComponent,{children:cloneComponent})
                        windowDataMap.get(windowSessionID).window.zOrder = newZOrder
                    }
                }
            }

            nextZOrderRef.current--

        }

        windowComponentListRef.current = [...windowComponentList] // trigger render
        setPanelState('windowclosed')

    }

    const duplicateWindow = (windowSessionID) => {

        const windowData = _cloneDeep(windowDataMapRef.current.get(windowSessionID))

        addWindow(windowData.window, windowData.workbox)

    }

    const minimizeWindow = (windowSessionID) => {

        const 
            windowDataMap = windowDataMapRef.current,
            windowData = windowDataMap.get(windowSessionID),
            windowComponentList = windowComponentListRef.current,
            numberOfWindows = windowComponentList.length

        if (windowData.window.viewDeclaration.view == 'minimized') return

        if (windowMaximizedRef.current === windowSessionID) {
            windowMaximizedRef.current = null
        }

        windowData.window.viewDeclaration.view = 'minimized'
        const zOrder = windowData.window.zOrder
        windowMinimizedSetRef.current.add(windowSessionID)

        const stackOrder = windowMinimizedSetRef.current.size - 1
        windowData.window.viewDeclaration.stackOrder = stackOrder

        const viewDeclaration = {view:'minimized', stackOrder}

        for (let index = 0; index < numberOfWindows; index++) {
            const suspenseComponent = windowComponentList[index]
            const component = suspenseComponent.props.children
            const subjectSessionID = component.props.windowSessionID
            if ( subjectSessionID === windowSessionID) {
                const cloneComponent = React.cloneElement(component,{viewDeclaration, zOrder:0})
                windowComponentList[index] = React.cloneElement(suspenseComponent,{children:cloneComponent})
                windowData.window.zOrder = 0
            } else {
                const indexZOrder = component.props.zOrder
                if ((indexZOrder > 0) && (indexZOrder > zOrder)) {
                    const subjectRecord = windowDataMap.get(subjectSessionID)
                    subjectRecord.window.zOrder = indexZOrder - 1
                    const subjectViewDeclaration = 
                        {view:subjectRecord.window.viewDeclaration.view,stackOrder:subjectRecord.window.viewDeclaration.stackOrder}
                    const cloneComponent = React.cloneElement(component,{subjectViewDeclaration, zOrder:indexZOrder - 1})
                    windowComponentList[index] = React.cloneElement(suspenseComponent, {children: cloneComponent})
                }
            }
        }

        nextZOrderRef.current--

        windowComponentListRef.current = [...windowComponentList]
        setPanelState('minimizewindow')

    }

    const repositionMinimizedWindows = () => {

        const 
            windowMinimizedSet = windowMinimizedSetRef.current,
            windowDataMap = windowDataMapRef.current,
            windowComponentList = windowComponentListRef.current

        let index = 0

        windowMinimizedSet.forEach((windowSessionID)=>{
            const windowData = windowDataMap.get(windowSessionID)

            if (windowData.window.viewDeclaration.stackOrder !== index) {
                windowData.window.viewDeclaration.stackOrder = index

                const 
                    suspenseComponent = windowComponentList[windowData.window.index],
                    component = suspenseComponent.props.children,
                    viewDeclaration = component.props.viewDeclaration

                viewDeclaration.stackOrder = index
                const cloneComponent = React.cloneElement(component, {viewDeclaration:{...viewDeclaration}})
                windowComponentList[windowData.window.index] = React.cloneElement(suspenseComponent, {children:cloneComponent})
            }
            index++
        })

    }

    const updateWindowsListIndexes = () => {

        const 
            windowComponentList = windowComponentListRef.current,
            windowDataMap = windowDataMapRef.current,
            numberOfWindows = windowComponentList.length

        // console.log('numberOfWindows, windowDataMap, windowComponentList', 
        //     numberOfWindows, windowDataMap, windowComponentList)

        for (let index = 0; index < numberOfWindows; index++) {
            const 
                windowSessionID = windowComponentList[index].props.children.props.windowSessionID,
                windowData = windowDataMap.get(windowSessionID)

            // console.log('index, windowSessionID, windowData',
            //     index, windowSessionID, windowData)

            if (windowData.window.index !== index) {
                windowData.window.index = index
            }
        }
    }

    const normalizeWindow = (windowSessionID) => {

        const 
            windowDataMap = windowDataMapRef.current,
            windowComponentList = windowComponentListRef.current,
            numberOfWindows = windowComponentList.length,
            windowData = windowDataMap.get(windowSessionID),
            previousView = windowData.window.viewDeclaration.view,
            previousZOrder = windowData.window.zOrder

        if (windowData.window.viewDeclaration.view == 'normalized') return

        if (windowMaximizedRef.current === windowSessionID) {

            windowMaximizedRef.current = null

        }

        windowData.window.viewDeclaration.view = 'normalized'
        windowData.window.viewDeclaration.stackOrder = null

        let zOrder
        if (previousView == 'minimized') {

            zOrder = nextZOrderRef.current++
            windowData.window.zOrder = zOrder

            windowMinimizedSetRef.current.delete(windowSessionID)
            repositionMinimizedWindows()

        } else {
            zOrder = nextZOrderRef.current
            windowData.window.zOrder = zOrder

            windowComponentList.forEach((suspenseComponent)=>{
                const component = suspenseComponent.props.children
                const subjectSessionID = component.props.windowSessionID
                if ( subjectSessionID !== windowSessionID) {
                    const 
                        subjectRecord = windowDataMap.get(subjectSessionID),
                        subjectZOrder = subjectRecord.window.zOrder,
                        subjectIndex = subjectRecord.index

                    if (subjectZOrder > 0 && (subjectZOrder > previousZOrder)) {
                        subjectRecord.window.zOrder--
                        const cloneComponent = React.createElement(component, {zOrder: subjectZOrder - 1})
                        windowComponentList[subjectIndex] = React.createElement(suspenseComponent,{children:cloneComponent})
                    }
                }
            })
        }

        const 
            viewDeclaration = {view:'normalized',stackOrder:null},
            index = windowData.window.index,
            suspenseComponent = windowComponentList[index],
            component = suspenseComponent.props.children

        // console.log('index, windowData, windowComponentList',index, windowData, windowComponentList)

        const cloneComponent = React.cloneElement(component,{viewDeclaration, zOrder})
        windowComponentList[index] = React.cloneElement(suspenseComponent,{children:cloneComponent})

        windowComponentListRef.current = [...windowComponentList]
        setPanelState('normalizewindow')
    }

    const maximizeWindow = (windowSessionID) => {

        const 
            windowDataMap = windowDataMapRef.current,
            windowComponentList = windowComponentListRef.current,
            numberOfWindows = windowComponentList.length,
            windowData = windowDataMap.get(windowSessionID),
            previousZOrder = windowData.window.zOrder,
            previousView = windowData.window.viewDeclaration.view

        // console.log('maximizeWindow: windowSessionID, windowData',windowSessionID, windowData)

        if (previousView == 'maximized') return

        // get any current maximized window out of the way
        if (windowMaximizedRef.current) {

            const maxedSessionID = windowMaximizedRef.current

            windowMaximizedRef.current = null

            const maxedWindowRecord = windowDataMap.get(maxedSessionID)
            maxedWindowRecord.window.viewDeclaration.view = 'normalized'

            const 
                maxedIndex = maxedWindowRecord.index,
                component = windowComponentList[maxedIndex]

            windowComponentList[maxedIndex] = React.createElement(component, {viewDeclaration:{view:'normalized', stackOrder:null}})
        }

        let zOrder
        if (previousView == 'minimized') {

            zOrder = nextZOrderRef.current++

            windowMinimizedSetRef.current.delete(windowSessionID)
            repositionMinimizedWindows()

        } else {
            zOrder = nextZOrderRef.current
            windowData.window.zOrder = zOrder
            windowComponentList.forEach((suspenseComponent)=>{
                const component = suspenseComponent.props.children
                // console.log('component.props.children',component.props.children.props)
                const subjectSessionID = component.props.windowSessionID
                if ( subjectSessionID !== windowSessionID) {
                    const 
                        subjectRecord = windowDataMap.get(subjectSessionID),
                        subjectZOrder = subjectRecord.window.zOrder,
                        subjectIndex = subjectRecord.index

                    if (subjectZOrder > 0 && (subjectZOrder > previousZOrder)) {
                        subjectRecord.window.zOrder--
                        const cloneComponent = React.createElement(component, {zOrder: subjectZOrder - 1})
                        windowComponentList[subjectIndex] = React.createElement(suspenseComponent, {childre:cloneComponent})
                    }
                }
            })
        }

        windowData.window.viewDeclaration.view = 'maximized'
        windowData.window.viewDeclaration.stackOrder = null
        windowData.window.zOrder = zOrder
        windowMaximizedRef.current = windowSessionID
        const 
            viewDeclaration = {view:'maximized', stackOrder:null},
            index = windowData.window.index,
            suspenseComponent = windowComponentList[index],
            component = suspenseComponent.props.children

        // console.log('index, component, windowComponentList',index, component, windowComponentList)

        if (component.props.windowSessionID === windowSessionID) {
            const cloneComponent = React.cloneElement(component,{viewDeclaration, zOrder})
            windowComponentList[index] = React.cloneElement(suspenseComponent, {children:cloneComponent})
        }

        windowComponentListRef.current = [...windowComponentList]
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
            windowComponentList = windowComponentListRef.current,
            length = windowComponentList.length

        for (let index = 0; index < length; index++ ) {
            const suspenseComponent = windowComponentList[index]
            const component = suspenseComponent.props.children
            const cloneComponent = React.cloneElement(component, {containerDimensionSpecs})
            windowComponentList[index] = React.cloneElement(suspenseComponent, {children:cloneComponent})
        }
        windowComponentListRef.current = [...windowComponentList]
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

        // console.log('panelState reduction', panelState)
        if (panelState != 'ready') {
            setPanelState('ready')
        }

    },[panelState])

    const windowComponentList = [...windowComponentListRef.current]
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
            {(panelState != 'setup') && windowComponentList}
            {(panelState != 'setup' && windowCount === 0) && 
                <Box style = {panelMessageStyles} >
                    To load a workbox tap the domain workbox or your domain member workbox in the panel toolbar below
                </Box>
            }
        </Box>
    </Box>
}

export default Workpanel
