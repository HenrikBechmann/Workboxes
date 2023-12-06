// SysSettings.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text} from '@chakra-ui/react'

import Drawer from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties
const SysSettings = (props) => {

    const [pageState, setPageState] = useState('setup')
    const [containerDimensions, setContainerDimensions] = useState(null)

    const pageElementRef = useRef(null)
    const resizeObserverRef = useRef(null)

    const resizeCallback = useCallback(()=>{

        setContainerDimensions({
            width:pageElementRef.current.offsetWidth,
            height:pageElementRef.current.offsetHeight
       })
    },[])

    useEffect(()=>{

        const resizeObserver = new ResizeObserver(resizeCallback)
        resizeObserver.observe(pageElementRef.current)
        resizeObserverRef.current = resizeObserver
        return () => {
            resizeObserverRef.current.disconnect()
        }

    },[])

    useEffect(()=>{

        if (pageState == 'setup') {
            setPageState('ready')
        }

    },[pageState])

    return <div ref = {pageElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {(pageState == 'ready') && <Drawer placement = 'right' containerDimensions = {containerDimensions} />}
        <Text>System settings</Text>
    </div>

}

export default SysSettings
