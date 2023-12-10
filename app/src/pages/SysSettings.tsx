// SysSettings.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text, Button} from '@chakra-ui/react'

// import Drawer from '../components/Drawer'
import { useDrawers } from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties
const SysSettings = (props) => {

    const onCloseLookups = () => {
        drawersRef.current[drawerTypes.LOOKUPS] = 
            closeDrawer(drawerTypes.LOOKUPS)
        setPageState('changedrawers')
    }
    const onCloseData = () => {
        drawersRef.current[drawerTypes.DATA] = 
            closeDrawer(drawerTypes.DATA)
        setPageState('changedrawers')
    }
    const onCloseNotices = () => {
        drawersRef.current[drawerTypes.NOTICES] = 
            closeDrawer(drawerTypes.NOTICES)
        setPageState('changedrawers')
    }
    const onCloseInfo = () => {
        drawersRef.current[drawerTypes.INFO] = 
            closeDrawer(drawerTypes.INFO)
        setPageState('changedrawers')
    }

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
            drawers, 
            openDrawer,
            closeDrawer,
            updateDimensions,
        } = useDrawers(containerElementRef, onCloses),
        drawersRef = useRef(drawers)

    const resizeCallback = useCallback(()=>{ // to trigger drawer resize,
        const containerDimensions = {
            width:containerElementRef.current.offsetWidth,
            height:containerElementRef.current.offsetHeight
        }

        Object.assign(drawersRef.current, updateDimensions(containerDimensions))

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
        // setDrawerPlacement('right')
        const component = openDrawer(drawerTypes.DATA, null)
        drawersRef.current[drawerTypes.DATA] = component
        // console.log('drawerTypes.DATA, component',drawerTypes.DATA, component)
        setPageState('changedrawers')
    }
    const openTop = () => {
        // setDrawerPlacement('top')        
        drawersRef.current[drawerTypes.LOOKUPS] = openDrawer(drawerTypes.LOOKUPS, null)
        setPageState('changedrawers')
    }
    const openLeft = () => {
        // setDrawerPlacement('left')        
        drawersRef.current[drawerTypes.INFO] = openDrawer(drawerTypes.INFO, null)
        setPageState('changedrawers')
    }
    const openBottom = () => {
        // setDrawerPlacement('bottom')        
        drawersRef.current[drawerTypes.NOTICES] = openDrawer(drawerTypes.NOTICES, null)
        setPageState('changedrawers')
    }

    const renderDrawers = drawersRef.current

    return <div ref = {containerElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {(pageState == 'ready') && 
            [renderDrawers.lookups, renderDrawers.data, renderDrawers.notices, renderDrawers.info]
        }
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
