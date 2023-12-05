// SysSettings.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, { useState, useRef, useEffect, CSSProperties } from 'react'
import {Text} from '@chakra-ui/react'

import Drawer from '../components/Drawer'

const outerStyle = {height: '100%', position:'relative'} as CSSProperties
const SysSettings = (props) => {

    const [pageState, setPageState] = useState('setup')

    const pageElementRef = useRef(null)

    useEffect(()=>{

        if (pageState == 'setup') {
            setPageState('ready')
        }

    },[pageState])

    return <div ref = {pageElementRef} data-type = 'sysadmin-panel' style = {outerStyle}>
        {(pageState == 'ready') && <Drawer placement = 'right' containerRef = {pageElementRef} />}
        <Text>System settings</Text>
    </div>

}

export default SysSettings