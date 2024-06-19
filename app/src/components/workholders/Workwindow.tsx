// WorkWindow.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, CSSProperties, createContext } from 'react'

import {
    Grid, GridItem,
    Box
} from '@chakra-ui/react'

import Draggable from 'react-draggable'
import { Resizable } from 'react-resizable'
import "react-resizable/css/styles.css"

import WindowTitle from './WindowTitle'

import dragCornerIcon from '../../../assets/drag-corner.png'

export const WindowCallbackContext = createContext(null)

const WINDOW_TRANSITION = 'top .4s, left .4s, width .4s, height .4s'
const WINDOW_MINIMIZED_WIDTH = 250

const windowFrameStyles = {
    top:0,
    left:0,
    position: 'absolute',
    border: '2px solid silver',
    borderRadius: '8px 8px 0 8px',
    boxShadow: '0 2px 7px 3px gainsboro',
} as CSSProperties

const windowGridStyles = {
    height: '100%',
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto 1fr',
    gridTemplateAreas:
        `"header"
         "body"`,
} as CSSProperties

const windowHeaderStyles  = {
    gridArea:'header',
    width: '100%',
    position: 'relative',
    minWidth:0,
}  as CSSProperties

const windowBodyStyles = {
    gridArea: 'body',
    width: '100%',
    position: 'relative',
    borderRadius: '0px 0px 0px 7px',
    minWidth: 0,
} as CSSProperties

const windowContentStyles = {
    position: 'absolute',
    inset: 0, 
    backgroundColor: 'ghostwhite',
    borderRadius: '0 0 0px 7px',
} as CSSProperties

const resizeHandleStyles = {
    position:'absolute',
    bottom:0,
    right:0,
    borderRadius:'0 0 7px 0',
    display:'flex',
    justifyContent: 'right',
    alignItems: 'end',
    padding:'2px',
    height:'24px',
    width: '24px',
} as CSSProperties

const resizeHandleIconStyles = {
    opacity:0.5, 
    height:'12px', 
    width:'12px',
}

// for Resizable
const WindowHandle = (props) => {

    // handleAxis for handle selection - n/a here; remove from rest to avoid warning when passed on to Box
    const { handleAxis, innerRef, windowSessionID, viewDeclaration, ...rest } = props

    return (
        <Box ref = {innerRef} data-type = 'resize-handle' style = {resizeHandleStyles} {...rest}>
            {(viewDeclaration.view != 'minimized') &&
                <img draggable = "false" src = {dragCornerIcon} style = {resizeHandleIconStyles} />
            }
        </Box>
    )
}

const Workwindow = (props) => {

    // console.log('running Workwindow: props', props)

    // --------------------------------[ initialization ]-----------------------------

    const 
        {
            children, 
            windowSpecs, // for this Workwindow 
            windowSessionID, // system control
            zOrder, // inherited; modified by setFocus 
            viewDeclaration, // normalized, maximized, minimized
            windowCallbacks, // change zOrder etc.
            containerDimensionSpecs, // height, width; change can cause repositioning and resizing of window
            type,
        } = props,

        title = windowSpecs.identity.name,
        windowConfig = windowSpecs.configuration,
        windowElementRef = useRef(null),
        titleElementRef = useRef(null),
        titlebarElementRef = useRef(null),
        panelFrameElementRef = useRef(null),

        // basic controls
        isMountedRef = useRef(true),
        isDisabledRef = useRef(false),
        sessionIDRef = useRef(windowSessionID), // future reference

        // state managemement
        [windowState, setWindowState] = useState('setup'), // assure proper internal initialization of resizable (unknown reason)

        // window config varies for normalized, maximized, and minimizex windows
        // top and left numger are translation values; styles are left at 0
        // source of truth for normalized window
        [normalizedWindowConfig, setNormalizedWindowConfig] = useState( 
            {
                top: windowConfig.top, 
                left: windowConfig.left, 
                width: windowConfig.width, 
                height: windowConfig.height
            }
        ),
        normalizedWindowConfigRef = useRef(null),
        reservedWindowConfigRef = useRef({
            width:null,
            height:null,
            top: null,
            left: null,
            view:null,
            inprogress:false,
        }),
        reservedViewDeclaration = reservedWindowConfigRef.current.view,
        viewTransformationInProgress = reservedWindowConfigRef.current.inprogress,
        renderWindowFrameStyles = { // dynamic update of width and height with resizing
            ...windowFrameStyles,
            width:(!reservedViewDeclaration || viewTransformationInProgress)
                ? normalizedWindowConfig.width + 'px'
                : reservedViewDeclaration == 'minimized'
                    ? viewDeclaration.width + 'px'
                    : null, // maximized
            height:(!reservedViewDeclaration || viewTransformationInProgress)
                ? normalizedWindowConfig.height + 'px' 
                : (reservedViewDeclaration == 'minimized')
                    ? viewDeclaration.height + 'px'
                    : null, // maximized
        },
        // latestActiveViewRef = useRef(null),
        previousViewStateRef = useRef(viewDeclaration.view),
        viewDeclarationRef = useRef(null),
        maxConstraintsRef = useRef([700,700]), // default
        transitionTimeoutRef = useRef(null),
        windowCallbackRef = useRef({changeView:null}) // callback set in documentPanel for call after max/norm view change

    normalizedWindowConfigRef.current = normalizedWindowConfig
    viewDeclarationRef.current = viewDeclaration

    // ------------------------------------[ setup effects ]-----------------------------------

    // maintain mounted property in case needed
    useEffect(()=>{

        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }

    },[])

    // set and clear onFocus and onBlur event listeners
    useEffect(()=>{

        if (!isMountedRef.current) return

        panelFrameElementRef.current = windowElementRef.current.closest('#wb-panelframe')
        titlebarElementRef.current = windowElementRef.current.querySelector('#wb-titlebar')

        const windowElement = windowElementRef.current

        const onFocus = (event) => {
            titleElementRef.current.style.backgroundColor = 'lightskyblue'
            windowCallbacks?.setFocus && windowCallbacks.setFocus(windowSessionID)
        }

        const onBlur = (event) => {
            titleElementRef.current && (titleElementRef.current.style.backgroundColor = 'gainsboro')
        }

        windowElement.addEventListener('focus',onFocus)
        windowElement.addEventListener('blur',onBlur)

        return () => {
            windowElement.removeEventListener('focus', onFocus)
            windowElement.removeEventListener('blur', onBlur)
        }

    },[])

    // Resizable requires this assurance of proper internal initialization for first call from any window (unknown reason)
    useEffect(()=>{

        if (!isMountedRef.current) return

        if (windowState != 'ready') setWindowState('ready')

    },[windowState])

    // ----------------------------[ reconfiguration effects ]------------------------

    // apply inherited zOrder on change by parent
    useEffect(()=>{

        if (!isMountedRef.current) return

        let timeout = 0

        if (viewDeclarationRef.current.view == 'minimized') {
            timeout = 500
        }

        setTimeout(()=> {

            windowElementRef.current.style.zIndex = zOrder // TODO bug sometimes current is null

        },timeout) 

    },[zOrder])

    // respond to changed viewDeclaration
    useEffect(()=>{

        clearTimeout(transitionTimeoutRef.current)

        const windowElement = windowElementRef.current
        const normalizedConfig = normalizedWindowConfigRef.current

        if (['maximized','minimized'].includes(viewDeclaration.view)) { // not for normalized, that's below

            // ---------------------------[ update minimized stack order ]--------------------------

            if (viewDeclaration.view == reservedWindowConfigRef.current.view) { // already converted; maybe stackorder change
                if (viewDeclaration.view == 'minimized') { // adjust top position
                    windowElement.style.transition = 'top 0.3s'
                    windowElement.style.top = (viewDeclaration.stackOrder * titlebarElementRef.current.offsetHeight) + 'px'
                    setTimeout(()=>{
                        windowElement.style.transition = null
                    },300)
                }
                return // config changes aleady made
            }

            isDisabledRef.current = true

            // save normalized config for later restoration; save target view, inprogress flag
            reservedWindowConfigRef.current = {
                ...normalizedConfig,
                view:viewDeclaration.view,
                inprogress:true,
            }

            // -----------------------[ transition to maximized view ]-------------------------

            if (viewDeclaration.view == 'maximized') {

                // set base for animation
                windowElement.style.transform = 'none'
                if (previousViewStateRef.current == 'normalized') {

                    windowElement.style.top = normalizedConfig.top + 'px'
                    windowElement.style.left = normalizedConfig.left + 'px'

                }

                // set targets for animation, yielding for base to take effect
                setTimeout(()=>{

                    const panelFrameElement = panelFrameElementRef.current
                    windowElement.style.transition = WINDOW_TRANSITION
                    windowElement.style.top = 0
                    windowElement.style.left = 0
                    windowElement.style.width = panelFrameElement.offsetWidth + 'px'
                    windowElement.style.height = panelFrameElement.offsetHeight + 'px'

                },1)

                // wait for animation completion, adjust CSS, set inprogress false for renderWindowFrameStyles
                transitionTimeoutRef.current = setTimeout(()=>{

                    windowElement.style.transition = null
                    windowElement.style.top = null
                    windowElement.style.left = null
                    windowElement.style.width = null
                    windowElement.style.height = null
                    windowElement.style.inset = 0

                    reservedWindowConfigRef.current.inprogress = false

                    previousViewStateRef.current = 'maximized'

                    setWindowState('activatemaximized')

                    windowCallbackRef.current.changeView() // revert to previous document width

                },501)

            // -----------------------[ transition to minimized view ]-------------------------

            } else { // 'minimized'

                // set base for animation
                windowElement.style.transform = 'none'

                if (previousViewStateRef.current === 'maximized') {

                    windowElement.style.top = 0
                    windowElement.style.left = 0

                } else {

                    windowElement.style.top = normalizedConfig.top + 'px'
                    windowElement.style.left = normalizedConfig.left + 'px'

                }
                // set targets for animation, yielding for base to take effect
                setTimeout(()=>{

                    // const panelFrameElement = panelFrameElementRef.current
                    windowElement.style.transition = WINDOW_TRANSITION
                    windowElement.style.top = (viewDeclaration.stackOrder * titlebarElementRef.current.offsetHeight) + 'px'
                    windowElement.style.left = 0
                    windowElement.style.width = WINDOW_MINIMIZED_WIDTH + 'px'
                    windowElement.style.height = titlebarElementRef.current.offsetHeight + 'px'
                    windowElement.style.overflow = 'hidden'

                },1)

                // wait for animation completion, adjust CSS, set inprogress false for renderWindowFrameStyles
                transitionTimeoutRef.current = setTimeout(()=>{

                    windowElement.style.transition = null

                    reservedWindowConfigRef.current.inprogress = false

                    previousViewStateRef.current = 'minimized'

                    setWindowState('activateminimized')

                },501)

            }

        // -----------------------[ transition to normalized view ]-------------------------

        } else { // 'normalized'

            const reservedWindowConfig = reservedWindowConfigRef.current

            if (!['maximized','minimized'].includes(reservedWindowConfig.view)) return // already normalized

            const windowElement = windowElementRef.current

            // set base styles
            const currentWidth = windowElement.offsetWidth, currentHeight = windowElement.offsetHeight

            if (previousViewStateRef.current === 'maximized') {
    
                windowElement.style.inset = null
                windowElement.style.top = 0
                windowElement.style.left = 0
            }

            windowElement.style.width = currentWidth + 'px'
            windowElement.style.height = currentHeight + 'px'

            reservedWindowConfigRef.current.inprogress = true

            // set targets
            setTimeout(()=>{

                windowElement.style.transition = WINDOW_TRANSITION
                windowElement.style.top = reservedWindowConfig.top + 'px'
                windowElement.style.left = reservedWindowConfig.left + 'px'
                windowElement.style.width = reservedWindowConfig.width + 'px'
                windowElement.style.height = reservedWindowConfig.height + 'px'

            },1)

            // set restored base
            transitionTimeoutRef.current = setTimeout(()=>{

                windowElement.style.transition = null
                windowElement.style.top = 0
                windowElement.style.left = 0
                windowElement.style.transform = `translate(${reservedWindowConfig.left}px,${reservedWindowConfig.top}px)`
                isDisabledRef.current = false

                const {view, inprogress, ...configData} = reservedWindowConfig

                Object.assign(normalizedConfig, configData)

                // reset reserved
                reservedWindowConfigRef.current = {
                    width:null,
                    height:null,
                    top:null,
                    left:null,
                    view:null,
                    inprogress:false,
                }

                previousViewStateRef.current = 'normalized'

                setNormalizedWindowConfig(normalizedConfig)

                setWindowState('activatenormalized')

                windowCallbackRef.current.changeView() // revert to previous document width

            },501)

        }

        setWindowState('viewchange')

    },[viewDeclaration])

    // adjust window size as necessary in changed container size; 
    // responds to new containerDimensionSpecs object
    useEffect(()=>{

        if (!isMountedRef.current) return

        if (!containerDimensionSpecs) return

        const 
            reservedWindowConfig = reservedWindowConfigRef.current,
            normalizedWindowConfig = normalizedWindowConfigRef.current

        let virtualWindowConfig // this is what is updated by change of containerDimensionSpecs
        if (reservedWindowConfig.view) {

            virtualWindowConfig = {
                width: reservedWindowConfig.width,
                height: reservedWindowConfig.height,
                top: reservedWindowConfig.top, // translate value
                left: reservedWindowConfig.left, // translate value
            }

        } else {

            virtualWindowConfig = {
                width: normalizedWindowConfig.width,
                height: normalizedWindowConfig.height,
                top: normalizedWindowConfig.top,
                left: normalizedWindowConfig.left,
            }

        }

        const
            widthFitBoundary = virtualWindowConfig.width + virtualWindowConfig.left,
            heightFitBoundary = virtualWindowConfig.height + virtualWindowConfig.top

        // keep entire window inside panel boundaries
        if (containerDimensionSpecs.width < widthFitBoundary || containerDimensionSpecs.height < heightFitBoundary) {
            // adjustments required

            // adjust left and width
            if (containerDimensionSpecs.width < widthFitBoundary) {
                let widthOversize = widthFitBoundary - containerDimensionSpecs.width
                const 
                    newLeft = Math.max(0,virtualWindowConfig.left - widthOversize),
                    widthShiftApplied = virtualWindowConfig.left - newLeft

                if (widthShiftApplied) {

                    virtualWindowConfig.left = newLeft

                }

                widthOversize -= widthShiftApplied
                virtualWindowConfig.width -= widthOversize

            }

            // adjust top and height
            if (containerDimensionSpecs.height < heightFitBoundary) {
                let heightOverize = heightFitBoundary - containerDimensionSpecs.height
                const 
                    newTop = Math.max(0,virtualWindowConfig.top - heightOverize),
                    heightShiftApplied = virtualWindowConfig.top - newTop

                if (heightShiftApplied) {

                    virtualWindowConfig.top = newTop

                }

                heightOverize -= heightShiftApplied
                virtualWindowConfig.height -= heightOverize

            }

            if (!reservedWindowConfig.view) {

                setNormalizedWindowConfig(virtualWindowConfig)

            } else {

                Object.assign(reservedWindowConfig, virtualWindowConfig)

            }

        }

        maxConstraintsRef.current = [
            containerDimensionSpecs.width - virtualWindowConfig.left, 
            containerDimensionSpecs.height - virtualWindowConfig.top,
        ]

        setWindowState('repositioned')

    },[containerDimensionSpecs])

    // -----------------------------[ resizeable and draggable callbacks ]-----------------------------

    // resizable callbacks...
    const onResizeStart = (event, {size, handle}) => {

        if (!isMountedRef.current) return

        if (isDisabledRef.current) return

        windowElementRef.current.focus()

    }

    const onResize = (event, {size, handle}) => {

        if (!isMountedRef.current) return

        if (isDisabledRef.current) return

        setNormalizedWindowConfig((previousState)=>{
            return {...previousState, width:size.width,height:size.height}})

    }

    // draggable callbacks
    const onDragStart = (e, data) => {

        if (!isMountedRef.current) return

        windowElementRef.current.focus()

    }

    const onDragStop = (e, data) => {

        if (!isMountedRef.current) return

        // undo deltalY which causes scroll and window movement when drag handle (title) selected
        // while window is partially out of view
        if (data.deltaY) {

            panelFrameElementRef.current.scrollTop -= data.deltaY

        }

        setNormalizedWindowConfig((previousState) => {
            return {...previousState, top:data.y - data.deltaY, left: data.x}
        })

        maxConstraintsRef.current = [
            containerDimensionSpecs.width - data.x, 
            containerDimensionSpecs.height - (data.y - data.deltaY),
        ]
    }

    // bounds = '#workpanel' <- alternative
    // this makes no difference to the deltaY shift problem...
    const bounds = {
        top:0, 
        right:containerDimensionSpecs.width - normalizedWindowConfig.width, 
        bottom:containerDimensionSpecs.height - normalizedWindowConfig.height, 
        left:0,
    }

    // render
    return (
    <WindowCallbackContext.Provider value = {windowCallbackRef.current}>
    <Draggable
        defaultPosition = {{x:0,y:0}}
        position = {{x:normalizedWindowConfig.left, y:normalizedWindowConfig.top}}
        handle = '#draghandle'
        bounds = {bounds}
        onStart = {onDragStart}
        onStop = {onDragStop}
        disabled = {isDisabledRef.current}
    >
        <Resizable 
            data-inheritedtype = 'resizable' 
            handle = {

                (handleAxis, ref) => <WindowHandle 
                    windowSessionID = {windowSessionID}
                    innerRef = {ref} 
                    handleAxis = {handleAxis}
                    viewDeclaration = {viewDeclaration}
                />
            } 
            height = {normalizedWindowConfig.height} 
            width = {normalizedWindowConfig.width} 
            axis = 'both'
            resizeHandles = {['se']}
            minConstraints = {[300,300]}
            maxConstraints = {maxConstraintsRef.current}
            onResizeStart = {onResizeStart}
            onResize = {onResize}

        >
            <Box tabIndex = {0} ref = {windowElementRef} data-type = 'window-frame' style = {renderWindowFrameStyles}>
                <Grid 
                    data-type = 'window-grid'
                    style = {windowGridStyles}
                >
                    <GridItem data-type = 'window-header' style = {windowHeaderStyles}>
                        <WindowTitle windowCallbacks = {windowCallbacks} windowSessionID = {windowSessionID} ref = {titleElementRef} type = {type} title = {title}/>
                    </GridItem>
                    <GridItem data-type = 'window-body' style = {windowBodyStyles}>
                        <Box 
                            data-type = 'window-content' 
                            style = {windowContentStyles}
                        >{children}</Box>
                    </GridItem>
                </Grid>
            </Box>
        </Resizable>
    </Draggable>
    </WindowCallbackContext.Provider>)
}

export default Workwindow