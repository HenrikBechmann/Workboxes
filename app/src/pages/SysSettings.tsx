// SysSettings.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text, Button} from '@chakra-ui/react'

import Drawer from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties
const SysSettings = (props) => {

    const [pageState, setPageState] = useState('setup') // to collect pageElementRef
    const [containerDimensions, setContainerDimensions] = useState(null) // to rerender for drawers on resize
    const [drawerPlacement, setDrawerPlacement] = useState('right')
    const [openState,setOpenState] = useState(false)

    console.log('pageState, drawerPlacement', pageState, drawerPlacement)

    const pageElementRef = useRef(null) // to pass to drawers
    const resizeObserverRef = useRef(null) // to disconnect

    const resizeCallback = useCallback(()=>{ // to trigger drawer resize

        setContainerDimensions({
            width:pageElementRef.current.offsetWidth,
            height:pageElementRef.current.offsetHeight
       })

       if (pageState == 'setup') setPageState('ready')

    },[pageState])

    useEffect(()=>{

        const resizeObserver = new ResizeObserver(resizeCallback)
        resizeObserver.observe(pageElementRef.current) // triggers first drawer sizing
        resizeObserverRef.current = resizeObserver

        return () => {
            resizeObserverRef.current.disconnect()
        }

    },[])

    const openRight = () => {
        setDrawerPlacement('right')        
    }
    const openTop = () => {
        setDrawerPlacement('top')        
    }
    const openLeft = () => {
        setDrawerPlacement('left')        
    }
    const openBottom = () => {
        setDrawerPlacement('bottom')        
    }
    const openDrawer = () => {
        setOpenState(true)
    }
    const closeDrawer = () => {
        setOpenState(false)
    }

    return <div ref = {pageElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {(pageState == 'ready') && 
        <Drawer 
            placement = {drawerPlacement} 
            pageElementRef = {pageElementRef} 
            containerDimensions = {containerDimensions} 
            isOpen = {openState}
            />
        }
        <Text>System settings</Text>
        <Button onClick = {openRight} >Right</Button> 
        <Button onClick = {openTop }>Top</Button> 
        <Button onClick = {openLeft}>Left</Button> 
        <Button onClick = {openBottom}>Bottom</Button>
        <Button onClick = {openDrawer}>Open</Button>
        <Button onClick = {closeDrawer}>Close</Button>
    </div>

}

export default SysSettings
