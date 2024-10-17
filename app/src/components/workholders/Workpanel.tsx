// Workpanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    role:
    - display use selected workbox windows
    - manage configuration of workbox windows
*/

import React, { useState, useRef, useEffect, useCallback, CSSProperties, useMemo, lazy, startTransition, Suspense } from 'react'

import {
    Box
} from '@chakra-ui/react'

import { cloneDeep as _cloneDeep } from 'lodash'

const WorkboxWindow = lazy(() => import('./WorkboxWindow'))
const Workbox = lazy(() => import('./../workbox/Workbox'))
import WorkboxHandler from '../../classes/WorkboxHandler'
import {useWorkspaceHandler, useSystemRecords} from '../../system/WorkboxesProvider'

import Loading from '../../system/Loading'

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
        panelElementRef = useRef(null),
        systemRecords = useSystemRecords()

    panelStateRef.current = panelState

    const startingWindowsSpecsRef = useRef(panelWindows)

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

        const startingWindowsSpecs = startingWindowsSpecsRef.current

        for (const startingspecifications of startingWindowsSpecsRef.current) {

            addWindow(startingspecifications.window, startingspecifications.workbox)

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
            windowSpecification = {
                configuration: {
                    layout: {top:10,left:10, width:610,height:400},
                    viewDeclaration: {
                        view: 'normalized',
                        stackOrder: null,
                    },
                },
                // zOrder: nextZOrderRef.current++,
                identity: {
                    titleData,
                }
            },
            workboxSpecification = {
                configuration: _cloneDeep(defaultWorkboxConfig),
                identity: {
                    id:workspaceHandler.panelDomainRecord.profile.workbox.id,
                }
            }

        titleData.type.alias = systemRecords.workboxaliases.aliases[titleData.type.name].name

        addWindow(windowSpecification, workboxSpecification)

        setPanelState('windowadded')

    }

    const showMemberWorkbox = () => {

        const 
            titleData = Object.assign({},
                workspaceHandler.panelMemberRecord.profile.workbox,
                {type:workspaceHandler.panelMemberRecord.profile.workbox_type}),
            windowSpecification = {
                configuration: {
                    layout: {top:20,left:20, width:610,height:400},
                    viewDeclaration: {
                        view: 'normalized',
                        stackOrder: null,
                    },
                },
                identity: {
                    titleData,
                }
            },
            workboxSpecification = {
                configuration: _cloneDeep(defaultWorkboxConfig),
                identity: {
                    id:workspaceHandler.panelMemberRecord.profile.workbox.id,
                    sessionid:null,
                }
            }

        titleData.type.alias = systemRecords.workboxaliases.aliases[titleData.type.name].name

        addWindow(windowSpecification, workboxSpecification)

        setPanelState('windowadded')

    }

    // called by initialization and duplicate window (so far)
    const addWindow = (windowSpecification, workboxSpecification) => {

        const windowSessionID = nextWindowSessionID++
        const workboxSessionID = nextWorkboxSessionID++
        workboxSpecification.identity.sessionid = workboxSessionID

        // viewDeclaration already added by caller
        Object.assign(windowSpecification.configuration, {
            zOrder:null,
        })
        Object.assign(windowSpecification.identity, {
            windowSessionID,
            index:null,
        })

        const 
            windowComponentList = windowComponentListRef.current,
            windowDataMap = windowDataMapRef.current,
            windowMinimizedSet = windowMinimizedSetRef.current

        // console.log('windowData', windowData)

        let 
            zOrder, stackOrder

        // get zOrder and stackOrder values; if minimized, add to set
        if (windowSpecification.configuration.viewDeclaration.view !== 'minimized') { // minimized, normalized or maximized

            zOrder = nextZOrderRef.current++

            stackOrder = null
            // if a maxed component exists, swap zOrders
            if ((windowSpecification.configuration.viewDeclaration.view == 'normalized') && windowMaximizedRef.current) {
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
        if (windowSpecification.configuration.viewDeclaration.view == 'maximized') {
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
        windowSpecification.configuration.zOrder = zOrder
        windowSpecification.configuration.viewDeclaration.stackOrder = stackOrder

        // create window component
        const component = _createWindowComponent(windowSessionID, windowSpecification, workboxSpecification)
        windowComponentList.push(component)

        // set window index and save window record
        windowSpecification.identity.index = windowComponentList.length - 1
        windowDataMap.set(windowSessionID, {window:windowSpecification, workbox:workboxSpecification})

        windowComponentListRef.current = [...windowComponentList]

    }

    // ** private ** only called by addWindow above
    const _createWindowComponent = (windowSessionID, windowSpecification, workboxSpecification) => {

        const 
            // required to position window
            panelElement = panelElementRef.current,
            containerLayout = { width:panelElement.offsetWidth, height:panelElement.offsetHeight },
            // required to configure window
            { viewDeclaration, zOrder, layout } = windowSpecification.configuration,
            { titleData } = windowSpecification.identity

        return <Suspense key = {windowSessionID} fallback = {<Loading />}><WorkboxWindow
            key = { windowSessionID } 
            windowSessionID = { windowSessionID }
            viewDeclaration = { viewDeclaration }
            zOrder = {zOrder}
            containerLayout = { containerLayout }
            windowCallbacks = { windowCallbacks } 
            layout = { layout }
            titleData = { titleData }
        >
            <Workbox 
                version = 'primary'
                workboxSpecification = { workboxSpecification }
            />
        </WorkboxWindow></Suspense>
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
            { window: windowSpecification } = windowDataMap.get(windowSessionID),
            zOrder = windowSpecification.configuration.zOrder

        if (windowSpecification.configuration.viewDeclaration.view == 'minimized') return // stay at bottom
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
            {window: windowSpecification}  = windowDataMap.get(windowSessionID),
            { zOrder } = windowSpecification.configuration,
            indexToRemove = windowSpecification.identity.index

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

        const windowDataMap = windowDataMapRef.current
        const {window: windowSpecification, workbox: workboxSpecification} = _cloneDeep(windowDataMap.get(windowSessionID))

        addWindow(windowSpecification, workboxSpecification)

    }

    const minimizeWindow = (windowSessionID) => {

        const 
            windowDataMap = windowDataMapRef.current,
            {window:windowSpecification} = windowDataMap.get(windowSessionID),
            windowComponentList = windowComponentListRef.current,
            numberOfWindows = windowComponentList.length

        if (windowSpecification.configuration.viewDeclaration.view == 'minimized') return

        if (windowMaximizedRef.current === windowSessionID) {
            windowMaximizedRef.current = null
        }

        windowSpecification.configuration.viewDeclaration.view = 'minimized'
        const zOrder = windowSpecification.configuration.zOrder
        windowMinimizedSetRef.current.add(windowSessionID)

        const stackOrder = windowMinimizedSetRef.current.size - 1
        windowSpecification.configuration.viewDeclaration.stackOrder = stackOrder

        const viewDeclaration = {view:'minimized', stackOrder}

        for (let index = 0; index < numberOfWindows; index++) {
            const suspenseComponent = windowComponentList[index]
            const component = suspenseComponent.props.children
            const subjectSessionID = component.props.windowSessionID
            if ( subjectSessionID === windowSessionID) {
                const cloneComponent = React.cloneElement(component,{viewDeclaration, zOrder:0})
                windowComponentList[index] = React.cloneElement(suspenseComponent,{children:cloneComponent})
                windowSpecification.configuration.zOrder = 0
            } else {
                const indexZOrder = component.props.zOrder
                if ((indexZOrder > 0) && (indexZOrder > zOrder)) {
                    const {window:windowSpecification} = windowDataMap.get(subjectSessionID)
                    windowSpecification.cinfiguration.zOrder = indexZOrder - 1
                    const subjectViewDeclaration = 
                        {view:windowSpecification.configuration.viewDeclaration.view,
                        stackOrder:windowSpecification.configuration.viewDeclaration.stackOrder}
                    const cloneComponent = React.cloneElement(component,{viewDeclaration:subjectViewDeclaration, zOrder:indexZOrder - 1})
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
            const { window: windowSpecification } = windowDataMap.get(windowSessionID)

            if (windowSpecification.configuration.viewDeclaration.stackOrder !== index) {
                windowSpecification.configuration.viewDeclaration.stackOrder = index

                const 
                    suspenseComponent = windowComponentList[windowSpecification.identity.index],
                    component = suspenseComponent.props.children,
                    viewDeclaration = component.props.viewDeclaration

                viewDeclaration.stackOrder = index
                const cloneComponent = React.cloneElement(component, {viewDeclaration:{...viewDeclaration}})
                windowComponentList[windowSpecification.identity.index] = React.cloneElement(suspenseComponent, {children:cloneComponent})
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
                {window: windowSpecification} = windowDataMap.get(windowSessionID)

            if (windowSpecification.identity.index !== index) {
                windowSpecification.identity.index = index
            }
        }
    }

    const normalizeWindow = (windowSessionID) => {

        const 
            windowDataMap = windowDataMapRef.current,
            windowComponentList = windowComponentListRef.current,
            numberOfWindows = windowComponentList.length,
            {window:windowSpecification} = windowDataMap.get(windowSessionID),
            previousView = windowSpecification.configuration.viewDeclaration.view,
            previousZOrder = windowSpecification.configuration.zOrder

        if (windowSpecification.configuration.viewDeclaration.view == 'normalized') return

        if (windowMaximizedRef.current === windowSessionID) {

            windowMaximizedRef.current = null

        }

        windowSpecification.configuration.viewDeclaration.view = 'normalized'
        windowSpecification.configuration.viewDeclaration.stackOrder = null

        let zOrder
        if (previousView == 'minimized') {

            zOrder = nextZOrderRef.current++
            windowSpecification.configuration.zOrder = zOrder

            windowMinimizedSetRef.current.delete(windowSessionID)
            repositionMinimizedWindows()

        } else {
            zOrder = nextZOrderRef.current
            windowSpecification.configuration.zOrder = zOrder

            windowComponentList.forEach((suspenseComponent)=>{
                const component = suspenseComponent.props.children
                const subjectSessionID = component.props.windowSessionID
                if ( subjectSessionID !== windowSessionID) {
                    const 
                        {window:windowSpecification} = windowDataMap.get(subjectSessionID),
                        subjectZOrder = windowSpecification.configuration.zOrder,
                        subjectIndex = windowSpecification.identity.index

                    if (subjectZOrder > 0 && (subjectZOrder > previousZOrder)) {
                        windowSpecification.configuration.zOrder--
                        const cloneComponent = React.createElement(component, {zOrder: subjectZOrder - 1})
                        windowComponentList[subjectIndex] = React.createElement(suspenseComponent,{children:cloneComponent})
                    }
                }
            })
        }

        const 
            viewDeclaration = {view:'normalized',stackOrder:null},
            index = windowSpecification.identity.index,
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
            {window: windowSpecification} = windowDataMap.get(windowSessionID),
            previousZOrder = windowSpecification.configuration.zOrder,
            previousView = windowSpecification.configuration.viewDeclaration.view

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
            windowSpecification.configuration.zOrder = zOrder
            windowComponentList.forEach((suspenseComponent)=>{
                const component = suspenseComponent.props.children
                // console.log('component.props.children',component.props.children.props)
                const subjectSessionID = component.props.windowSessionID
                if ( subjectSessionID !== windowSessionID) {
                    const 
                        {window:windowSpecirication} = windowDataMap.get(subjectSessionID),
                        subjectZOrder = windowSpecirication.configuration.zOrder,
                        subjectIndex = windowSpecirication.identity.index

                    if (subjectZOrder > 0 && (subjectZOrder > previousZOrder)) {
                        windowSpecirication.configuration.zOrder--
                        const cloneComponent = React.createElement(component, {zOrder: subjectZOrder - 1})
                        windowComponentList[subjectIndex] = React.createElement(suspenseComponent, {childre:cloneComponent})
                    }
                }
            })
        }

        windowSpecification.configuration.viewDeclaration.view = 'maximized'
        windowSpecification.configuration.viewDeclaration.stackOrder = null
        windowSpecification.configuration.zOrder = zOrder
        windowMaximizedRef.current = windowSessionID
        const 
            viewDeclaration = {view:'maximized', stackOrder:null},
            index = windowSpecification.identity.index,
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
            containerLayout = {width:panelElement.offsetWidth, height:panelElement.offsetHeight},
            windowComponentList = windowComponentListRef.current,
            length = windowComponentList.length

        for (let index = 0; index < length; index++ ) {
            const suspenseComponent = windowComponentList[index]
            const component = suspenseComponent.props.children
            const cloneComponent = React.cloneElement(component, {containerLayout})
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
