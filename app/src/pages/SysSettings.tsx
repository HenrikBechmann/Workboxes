// SysSettings.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'
import {Text} from '@chakra-ui/react'

import Drawer from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties
const SysSettings = (props) => {

    const [pageState, setPageState] = useState('setup') // to collect pageElementRef
    const [containerDimensions, setContainerDimensions] = useState(null) // to rerender for drawers on resize

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

    // useEffect(()=>{

    //     if (pageState == 'setup') { // first cycle only
    //         setPageState('ready')
    //     }

    // },[pageState])

    return <div ref = {pageElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {(pageState == 'ready') && <Drawer placement = 'right' containerDimensions = {containerDimensions} />}
        <Text>System settings</Text>
    </div>

}

export default SysSettings
