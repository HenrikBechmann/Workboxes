// Toolbar.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useEffect, useLayoutEffect, useCallback, useState, CSSProperties} from 'react'
import { Box } from '@chakra-ui/react'

import navNextIcon from '../../assets/nav_next.png'
import navBeforeIcon from '../../assets/nav_before.png'

// --------------------------- static style values ---------
const menuWrapperStyles = {
    position:'relative',
    height:'40px',
    width:'100%',
} as CSSProperties

const menubarStyles = {
    height:'40px',
    width:'100%',
    display:'flex',
    overflowX:'auto',
    minHeight:0,
    MsOverflowStyle: 'none', /* for Internet Explorer, Edge */
    scrollbarWidth: 'none', /* for Firefox */

} as CSSProperties

const scrollbarStyles = {
    flexBasis:'auto', // these two flex settings allow scroll
    flexShrink:0, // prevent shrink which prevents scroll
    height:'40px',
    minHeight:0,
}  as CSSProperties

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

// ------------------------------- Toolbar component --------------------------------
const Toolbar = (props) => {

    // ----------------------------- state hooks ------------------
    const 
        [toolbarState, setToolbarState] = useState('setup'),
        { children } = props,
        [measurements, setMeasurements] = useState({scrollLeft:null,menubarWidth:null,scrollbarWidth:null}),
        measurementsRef = useRef(measurements),
        menubarRef = useRef(null),
        menubarScrollerRef = useRef(null),
        isMountedRef = useRef(true),
        overflow_leftRef = useRef(false),
        overflow_rightRef = useRef(false),
        resizeObserverRef = useRef(null)

    // -------------------------- effect hooks --------------
    useEffect(() => {
        return () => {
            isMountedRef.current = false
        }
    },[])

    useEffect(()=>{

        isMountedRef.current = true
        menubarRef.current.addEventListener('scroll',onScroll)
        const resizeObserver = new ResizeObserver(onResize)
        resizeObserverRef.current = resizeObserver.observe(menubarRef.current)

        remeasure()

        return () => {

            if (!isMountedRef.current) {
                menubarRef.current && menubarRef.current.removeEventListener('scroll',onScroll)
                resizeObserverRef.current && resizeObserverRef.current.disconnect()
            }

        }

    },[])

    useEffect(()=>{

        setToolbarState('ready')
        remeasure()

    },[toolbarState])


    const onScroll = useCallback(() => {

        remeasure()

    },[])

    const onResize = useCallback(() => {

        remeasure()

    },[])

    // ---------------------------- utility ----------------------------
    const remeasure = () => {

        const 
            measurements = measurementsRef.current,
            menubar = menubarRef.current,
            scrollbar = menubarScrollerRef.current

        if (!menubar || !scrollbar) return

        measurements.scrollLeft = menubar.scrollLeft
        measurements.menubarWidth = menubar.offsetWidth
        measurements.scrollbarWidth = scrollbar.offsetWidth

        overflow_leftRef.current = !(measurements.scrollLeft <= 1)
        overflow_rightRef.current = ((measurements.scrollbarWidth - measurements.scrollLeft) > measurements.menubarWidth + 1)
        setMeasurements({...measurements}) // trigger render

    }

    // ------------------------- render --------------------------
    return (
    <Box data-type = 'toolbar-wrapper' style = {menuWrapperStyles}>
        <Box data-type = 'toolbar' ref = {menubarRef} style = {menubarStyles}>

            {overflow_leftRef.current && <img data-type = 'left-chevron' style = {navBeforeStyles} src = {navBeforeIcon} />}

            <Box data-type = 'toolbar-scroller' ref = {menubarScrollerRef} style = {scrollbarStyles}>
        
                {children}

            </Box>

            {overflow_rightRef.current && <img data-type = 'right-chevron' style = {navNextStyles} src = {navNextIcon} />}
        
        </Box>
    </Box>
    )

}

export default Toolbar