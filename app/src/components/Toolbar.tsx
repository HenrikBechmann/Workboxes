// Toolbar.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useEffect, useLayoutEffect, useCallback, useState, CSSProperties} from 'react'
import navNextIcon from '../../assets/nav_next.png'
import navBeforeIcon from '../../assets/nav_before.png'

const menubarStyles = {
    overflow:'auto',
    height:'28px',
    width:'100%',
    display:'relative',
}

const scrollbarStyles = {
    height:'28px',
}

const navBeforeStyles = {
    position:'absolute',
    left:'0px',
    top:'2px',
    opacity:0.75
} as CSSProperties

const navNextStyles = {
    position:'absolute',
    right:'0px',
    top:'2px',
    opacity:0.75
} as CSSProperties

const Toolbar = (props) => {

    const 
        menubarRef = useRef(null),
        menubarScrollerRef = useRef(null),
        isMountedRef = useRef(true),
        overflow_leftRef = useRef(false),
        overflow_rightRef = useRef(false),
        [measurements, setMeasurements] = useState({scrollLeft:null,menubarWidth:null,scrollbarWidth:null}),
        measurementsRef = useRef(measurements)

    useEffect(()=>{

        isMountedRef.current = true
        menubarRef.current.addEventListener('scroll',onScroll)
        onScroll()
        return () => {
            if (!isMountedRef.current) {
                menubarRef.current.removeEventListener('scroll',onScroll)
            }
        }

    },[])

    const onScroll = useCallback(() => {

        const measurements = measurementsRef.current
        const menubar = menubarRef.current
        const scrollbar = menubarScrollerRef.current

        measurements.scrollLeft = menubar.scrollLeft
        measurements.menubarWidth = menubar.offsetWidth
        measurements.scrollbarWidth = scrollbar.offsetWidth

        overflow_leftRef.current = !!measurements.scrollLeft
        overflow_rightRef.current = (
            (measurements.scrollbarWidth - measurements.scrollLeft) > measurements.menubarWidth)
        setMeasurements({...measurements})

    },[])

    useLayoutEffect(()=>{

    },[measurements])

    return <div data-type = 'toolbar' ref = {menubarRef} style = {menubarStyles}>
        {overflow_leftRef.current && <img style = {navBeforeStyles} src = {navBeforeIcon} />}
        <div data-type = 'toolbar-scroller' ref = {menubarScrollerRef} style = {scrollbarStyles}>
    
        Toolbar

        </div>
        {overflow_rightRef.current && <img style = {navNextStyles} src = {navNextIcon} />}
    </div>

}

export default Toolbar