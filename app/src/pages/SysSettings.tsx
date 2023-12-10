// SysSettings.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text, Button} from '@chakra-ui/react'

// import Drawer from '../components/Drawer'
import Drawer, { useDrawers } from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties
const SysSettings = (props) => {

    const onCloseLookups = useCallback(() => {
        drawerPropsRef.current[drawerTypes.LOOKUPS] = 
            closeDrawer(drawerTypes.LOOKUPS)
        setPageState('changedrawers')
    },[])
    const onCloseData = useCallback(() => {
        drawerPropsRef.current[drawerTypes.DATA] = 
            closeDrawer(drawerTypes.DATA)
        setPageState('changedrawers')
    },[])
    const onCloseNotices = useCallback(() => {
        drawerPropsRef.current[drawerTypes.NOTICES] = 
            closeDrawer(drawerTypes.NOTICES)
        setPageState('changedrawers')
    },[])
    const onCloseInfo = useCallback(() => {
        drawerPropsRef.current[drawerTypes.INFO] = 
            closeDrawer(drawerTypes.INFO)
        setPageState('changedrawers')
    },[])

    const onCloses = {
        lookups:onCloseLookups,
        data:onCloseData,
        notices:onCloseNotices,
        info:onCloseInfo,
    }

    const 
        [pageState, setPageState] = useState('setup'), // to collect pageElementRef
        [containerDimensions, setContainerDimensions] = useState(null), // to rerender for drawers on resize
        [openState,setOpenState] = useState(false),
        containerElementRef = useRef(null), // to pass to drawers
        resizeObserverRef = useRef(null), // to disconnect
        {
            drawerTypes, 
            drawerProps, 
            openDrawer,
            closeDrawer,
            updateDimensions,
        } = useDrawers(containerElementRef, onCloses),
        drawerPropsRef = useRef(drawerProps)

    const resizeCallback = useCallback(()=>{ // to trigger drawer resize,
        const containerDimensions = {
            width:containerElementRef.current.offsetWidth,
            height:containerElementRef.current.offsetHeight
        }

        Object.assign(drawerPropsRef.current, updateDimensions(containerDimensions))

        setContainerDimensions(containerDimensions)

        if (pageState == 'setup') setPageState('ready')

    },[pageState])

    useEffect(()=>{

        const resizeObserver = new ResizeObserver(resizeCallback)
        resizeObserver.observe(containerElementRef.current) // triggers first drawer sizing
        resizeObserverRef.current = resizeObserver

        return () => {
            resizeObserverRef.current.disconnect()
        }

    },[])

    useEffect(()=>{

        switch (pageState) {
        case 'setup':
        case 'changedrawers':
            setPageState('ready')

        }

    },[pageState])

    const openRight = () => {
        const component = openDrawer(drawerTypes.DATA, null)
        drawerPropsRef.current[drawerTypes.DATA] = component
        setPageState('changedrawers')
    }
    const openTop = () => {
        drawerPropsRef.current[drawerTypes.LOOKUPS] = openDrawer(drawerTypes.LOOKUPS, null)
        setPageState('changedrawers')
    }
    const openLeft = () => {
        drawerPropsRef.current[drawerTypes.INFO] = openDrawer(drawerTypes.INFO, null)
        setPageState('changedrawers')
    }
    const openBottom = () => {
        drawerPropsRef.current[drawerTypes.NOTICES] = openDrawer(drawerTypes.NOTICES, null)
        setPageState('changedrawers')
    }

    const renderProps = drawerPropsRef.current

    console.log('drawerProps.data', drawerProps.data)

    return <div ref = {containerElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {pageState != 'setup' && <>
            <Drawer {...renderProps.lookups} />
            <Drawer {...renderProps.data} />
            <Drawer {...renderProps.notices} />
            <Drawer {...renderProps.info} />
        </>}
        <Text>System settings</Text>
        <>
        <Button onClick = {openRight} >Right</Button> 
        <Button onClick = {openTop }>Top</Button> 
        <Button onClick = {openLeft}>Left</Button> 
        <Button onClick = {openBottom}>Bottom</Button>
        </>
    </div>

}

export default SysSettings
