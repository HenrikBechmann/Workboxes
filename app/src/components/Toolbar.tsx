// Toolbar.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useEffect, useLayoutEffect, useCallback, useState, CSSProperties} from 'react'
import navNextIcon from '../../assets/nav_next.png'
import navBeforeIcon from '../../assets/nav_before.png'

const menubarStyles = {
    height:'30px',
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
    height:'28px',
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

const Toolbar = (props) => {

    const [toolbarState, setToolbarState] = useState('setup')

    const 
        { children } = props,
        [measurements, setMeasurements] = useState({scrollLeft:null,menubarWidth:null,scrollbarWidth:null}),
        measurementsRef = useRef(measurements),
        menubarRef = useRef(null),
        menubarScrollerRef = useRef(null),
        isMountedRef = useRef(true),
        overflow_leftRef = useRef(false),
        overflow_rightRef = useRef(false),
        resizeObserverRef = useRef(null)

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

    const remeasure = () => {

        const 
            measurements = measurementsRef.current,
            menubar = menubarRef.current,
            scrollbar = menubarScrollerRef.current

        if (!menubar || !scrollbar) return

        measurements.scrollLeft = menubar.scrollLeft
        measurements.menubarWidth = menubar.offsetWidth
        measurements.scrollbarWidth = scrollbar.offsetWidth

        overflow_leftRef.current = !(measurements.scrollLeft == 0)
        overflow_rightRef.current = ((measurements.scrollbarWidth - measurements.scrollLeft) > measurements.menubarWidth + 1)
        setMeasurements({...measurements})

    }

    const onScroll = useCallback(() => {

        remeasure()

    },[])

    const onResize = useCallback(() => {

        remeasure()

    },[])

    return <div data-type = 'toolbar' ref = {menubarRef} style = {menubarStyles}>

        {overflow_leftRef.current && <img style = {navBeforeStyles} src = {navBeforeIcon} />}

        <div data-type = 'toolbar-scroller' ref = {menubarScrollerRef} style = {scrollbarStyles}>
    
            {children}

        </div>

        {overflow_rightRef.current && <img style = {navNextStyles} src = {navNextIcon} />}
        
    </div>

}

export default Toolbar