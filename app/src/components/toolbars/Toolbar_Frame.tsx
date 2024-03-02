// ToolbarFrame.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useEffect, useLayoutEffect, useCallback, useState, CSSProperties} from 'react'
import { Box } from '@chakra-ui/react'

import navNextIcon from '../../../assets/nav_next.png'
import navBeforeIcon from '../../../assets/nav_before.png'

// --------------------------- static style values ---------
const menuWrapperStyles = {
    position:'relative',
    width:'100%',
} as CSSProperties

const menubarStyles = {
    // height:'40px',
    width:'100%',
    display:'flex',
    overflowX:'auto',
    minHeight:0,
    MsOverflowStyle: 'none', /* for Internet Explorer, Edge */
    scrollbarWidth: 'none', /* for Firefox */

} as CSSProperties

const scrollbarStyles = {
    flex:'0 0 auto',
    // flexBasis:'auto', // these two flex settings allow scroll
    // flexShrink:0, // prevent shrink which prevents scroll
    minHeight:0,
}  as CSSProperties

const navBeforeStyles = {
    // zIndex:1,
    position:'absolute',
    left:'0px',
    top:'3px',
    width:'20px',
    height:'32px',
    opacity:0.75,
    overflow:'clip',
    backgroundColor:'white',
    border:'2px solid gray',
    borderLeft:'transparent',
    boxSizing:'border-box',
    borderRadius:'0 16px 16px 0',
} as CSSProperties

const navBeforeIconStyles = {
    position:'absolute',
    left:'0',
    top:'0px',
    height:'24px',
    width:'24px',
} as CSSProperties

const navAfterIconStyles = {
    position:'absolute',
    right:'0px',
    top:'0px',
    height:'24px',
    width:'24px',
} as CSSProperties

const navNextStyles = {
    // zIndex:1,
    position:'absolute',
    right:'0px',
    top:'3px',
    width:'20px',
    height:'32px',
    opacity:0.75,
    overflow:'clip',
    backgroundColor:'white',
    border:'2px solid gray',
    borderRight:'transparent',
    boxSizing:'border-box',
    borderRadius:'16px 0 0 16px',
} as CSSProperties

// ------------------------------- ToolbarFrame component --------------------------------
const ToolbarFrame = (props) => {

    // ----------------------------- state hooks ------------------
    const 
        [toolbarState, setToolbarState] = useState('setup'),
        { children, scrollerStyles } = props,
        [measurements, setMeasurements] = useState({scrollLeft:null,menubarWidth:null,scrollbarWidth:null}),
        measurementsRef = useRef(measurements),
        menubarRef = useRef(null),
        menubarScrollerRef = useRef(null),
        isMountedRef = useRef(true),
        overflow_leftRef = useRef(false),
        overflow_rightRef = useRef(false),
        resizeObserverRef = useRef(null)

    const scrollbarStylesRef = useRef({...scrollbarStyles, ...scrollerStyles})

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

            <Box data-type = 'toolbar-scroller' ref = {menubarScrollerRef} style = {scrollbarStylesRef.current}>
        
                {children}

            </Box>

            {overflow_leftRef.current && 
                <Box style = {navBeforeStyles} ><Box width = '24px' height = '24px' top = '2px' position = 'absolute' right = '0px'>
                    <img data-type = 'left-chevron' style = {navBeforeIconStyles} src = {navBeforeIcon} />
                </Box></Box>
            }

            {overflow_rightRef.current && 
                <Box style = {navNextStyles} ><Box width = '24px' height = '24px' top = '2px' position = 'absolute' left = '0px'>
                    <img data-type = 'right-chevron' style = {navAfterIconStyles} src = {navNextIcon} />
                </Box></Box>
            }
        
        </Box>
    </Box>
    )

}

export default ToolbarFrame