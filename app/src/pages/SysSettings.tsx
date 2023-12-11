// SysSettings.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text, Button} from '@chakra-ui/react'

// import Drawer from '../components/Drawer'
import Drawer, { useDrawerSupport } from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties
const SysSettings = (props) => {

    // //-------------------- drawer open functions ----------------
    // const openRight = () => {
    //     const component = openDrawer(drawerTypes.DATA, null)
    //     drawerPropsRef.current[drawerTypes.DATA] = component
    //     setPageState('changedrawers')
    // }
    // const openTop = () => {
    //     drawerPropsRef.current[drawerTypes.LOOKUPS] = openDrawer(drawerTypes.LOOKUPS, null)
    //     setPageState('changedrawers')
    // }
    // const openLeft = () => {
    //     drawerPropsRef.current[drawerTypes.INFO] = openDrawer(drawerTypes.INFO, null)
    //     setPageState('changedrawers')
    // }
    // const openBottom = () => {
    //     drawerPropsRef.current[drawerTypes.NOTICES] = openDrawer(drawerTypes.NOTICES, null)
    //     setPageState('changedrawers')
    // }

    // //-------------------- drawer close functions ----------------
    // const onCloseLookups = useCallback(() => {
    //     drawerPropsRef.current[drawerTypes.LOOKUPS] = 
    //         closeDrawer(drawerTypes.LOOKUPS)
    //     setPageState('changedrawers')
    // },[])
    // const onCloseData = useCallback(() => {
    //     drawerPropsRef.current[drawerTypes.DATA] = 
    //         closeDrawer(drawerTypes.DATA)
    //     setPageState('changedrawers')
    // },[])
    // const onCloseNotices = useCallback(() => {
    //     drawerPropsRef.current[drawerTypes.NOTICES] = 
    //         closeDrawer(drawerTypes.NOTICES)
    //     setPageState('changedrawers')
    // },[])
    // const onCloseInfo = useCallback(() => {
    //     drawerPropsRef.current[drawerTypes.INFO] = 
    //         closeDrawer(drawerTypes.INFO)
    //     setPageState('changedrawers')
    // },[])

    // const onCloses = {
    //     lookups:onCloseLookups,
    //     data:onCloseData,
    //     notices:onCloseNotices,
    //     info:onCloseInfo,
    // }

    // // ---------------------------- state hooks ----------------------------
    // const 
    //     [pageState, setPageState] = useState('setup'), // to collect pageElementRef
    //     [containerDimensions, setContainerDimensions] = useState(null), // to rerender for drawers on resize
    //     containerElementRef = useRef(null), // to pass to drawers
    //     resizeObserverRef = useRef(null), // to disconnect
    //     {
    //         drawerTypes, 
    //         drawerProps, 
    //         openDrawer,
    //         closeDrawer,
    //         updateDimensions,
    //     } = useDrawers(containerElementRef, onCloses),

    // drawerPropsRef = useRef(drawerProps)

    // const resizeCallback = useCallback(()=>{ // to trigger drawer resize,
    //     const containerDimensions = {
    //         width:containerElementRef.current.offsetWidth,
    //         height:containerElementRef.current.offsetHeight
    //     }

    //     Object.assign(drawerPropsRef.current, updateDimensions(containerDimensions))

    //     setContainerDimensions(containerDimensions)

    //     if (pageState == 'setup') setPageState('ready')

    // },[pageState])

    // // ------------------------ effect hooks -----------------------
    // useEffect(()=>{

    //     const resizeObserver = new ResizeObserver(resizeCallback)
    //     resizeObserver.observe(containerElementRef.current) // triggers first drawer sizing
    //     resizeObserverRef.current = resizeObserver

    //     return () => {
    //         resizeObserverRef.current.disconnect()
    //     }

    // },[])

    // useEffect(()=>{

    //     switch (pageState) {
    //     case 'setup':
    //     case 'changedrawers':
    //         setPageState('ready')

    //     }

    // },[pageState])

   const {
        drawerPropsRef,
        containerElementRef,
        pageState,
        onOpens,
    } = useDrawerSupport()

    // --------------------------- render --------------------
    const renderProps = drawerPropsRef.current

    return <div ref = {containerElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {pageState != 'setup' && <>
            <Drawer {...renderProps.lookups} />
            <Drawer {...renderProps.data} />
            <Drawer {...renderProps.notices} />
            <Drawer {...renderProps.info} />
        </>}
        <Text>System settings</Text>
        <>
        <Button onClick = {onOpens.openRight} >Right</Button> 
        <Button onClick = {onOpens.openTop }>Top</Button> 
        <Button onClick = {onOpens.openLeft}>Left</Button> 
        <Button onClick = {onOpens.openBottom}>Bottom</Button>
        </>
    </div>

}

export default SysSettings
