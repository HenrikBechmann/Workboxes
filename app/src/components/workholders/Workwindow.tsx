// WorkWindow.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    The Workwindow must stay inside the dynamically sized Workpane.
    The Eorkwindow can be resized, minimized (to a stack upper left),
    maimized (takes on size of Workpanel viewport), and normalized
    (floating).
    The Workwindow id moveable and stackable (focussed Workwindow on top)
*/

/*
    TODO:
        freeze windowContentElement to minWidth and minHeight when minimized?

*/

import React, { useState, useRef, useEffect, CSSProperties } from 'react'

import {
    Grid, GridItem,
    Box
} from '@chakra-ui/react'

// both Draggable and Resizable apply their dynamics to the existing wrapped element
import Draggable from 'react-draggable'
import { Resizable } from 'react-resizable'
import "react-resizable/css/styles.css"

// contains the titleName elements, and the dynamic controls
import WindowTitle from './WindowTitle'

import dragCornerIcon from '../../../assets/drag-corner.png'

const WINDOW_TRANSITION = 'top .4s, left .4s, width .4s, height .4s'
const WINDOW_MINIMIZED_WIDTH = 250

// the window's outer element
const windowFrameStyles = { //width, height merged dynamically in renderWindowFrameStyles
    top:0,
    left:0,
    position: 'absolute',
    border: '2px solid silver',
    borderRadius: '8px 8px 0 8px',
    boxShadow: '0 2px 7px 3px gainsboro',
} as CSSProperties

// just inside the window frame, holding the window header (for toolbar) and body (for content)
const windowGridStyles = {
    height: '100%',
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto 1fr',
    gridTemplateAreas:
        `"header"
         "body"`,
} as CSSProperties

// CSS for the header portion of the grid
const windowHeaderStyles  = {
    gridArea:'header',
    width: '100%',
    position: 'relative',
    minWidth:0,
}  as CSSProperties

// CSS for the body portion of the grid
const windowBodyStyles = {
    gridArea: 'body',
    width: '100%',
    position: 'relative',
    borderRadius: '0px 0px 0px 7px',
    overflow:'hidden', // experimental
    minWidth: 0,
} as CSSProperties

// the element inside the window body grid element
const windowContentStyles = {
    position: 'absolute',
    inset: 0, 
    backgroundColor: 'ghostwhite',
    borderRadius: '0 0 0px 7px',
} as CSSProperties

// the resize handle bottom right
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

// icon for the resize handle
const resizeHandleIconStyles = {
    opacity:0.5, 
    height:'12px', 
    width:'12px',
}

// WindowHandle is provided for Resizable
const WindowHandle = (props) => {

    // handleAxis for handle selection - n/a here; remove from rest to avoid warning when passed on to Box
    const { handleAxis, innerRef, windowSessionID, viewDeclaration, ...handleAttributes } = props

    return (
        <Box ref = {innerRef} data-type = 'resize-handle' style = {resizeHandleStyles} {...handleAttributes}>
            {(viewDeclaration.view != 'minimized') &&
                <img draggable = "false" src = {dragCornerIcon} style = {resizeHandleIconStyles} />
            }
        </Box>
    )
}

// workWindow is called by Workpanel, which maintains an array of Workwindow components
const Workwindow = (props) => {

    // console.log('running Workwindow: props', props)
    // console.log('titleData', props.titleData)

    // --------------------------------[ initialization ]-----------------------------

    const 
        {
            children, 
            configuration, // default position; size, only used to set defaultwindowConfig
            // containerDimensionSpecs can
            // - change dynamicWindowConfiguration (through useEffect for state change)
            // - change maxSizeConstraints for Resizable through useEffect for state change)
            // - helps to set bounds for Draggable
            containerDimensionSpecs, // height, width of Workpanel; change can cause repositioning and resizing of window
            titleData, // workbox titleData, for titleName
            windowCallbacks, // change zOrder etc.
            windowSessionID, // system control, repo access
            viewDeclaration, // object with view = normalized, maximized, minimized; stackOrder for minimized windows
            zOrder, // inherited; modified by setFocus 
        } = props,

        titleName = titleData.name,
        typeAlias = titleData.type?.alias,
        defaultWindowConfig = configuration, // semantics; only used to initialize dynamicWindowConfiguration

        // various elements brought into play
        panelFrameElementRef = useRef(null),
        windowFrameElementRef = useRef(null),
        windowTitlebarElementRef = useRef(null),
        windowTitleElementRef = useRef(null),
        windowContentElementRef = useRef(null), // TODO: needed?

        // basic controls
        isMountedRef = useRef(true), // in case of interruption
        isDraggableDisabledRef = useRef(false), // disabled from maximized and minimized

        // state managemement
        // 'setup' cycle to assure proper internal initialization of resizable (unknown reason)
        [windowState, setWindowState] = useState('setup'), 

        // window configuration (size, position) varies for normalized, maximized, and minimized windows
        // top and left numbers are translation values; styles are left at 0
        // source of truth for normalized window
        // width and height are set in onResize; top and left set in onDragStop
        // both can be changed with state change in useEffects for containerDimensionSpecs, or viewDeclaration.view
        [dynamicWindowConfiguration, setDynamicWindowConfiguration] = useState( 
            {
                top: defaultWindowConfig.top, 
                left: defaultWindowConfig.left, 
                width: defaultWindowConfig.width, 
                height: defaultWindowConfig.height
            }
        ),
        // inside useEffect access for state changes of containerDimensionSpecs and viewDeclaration
        dynamicWindowConfigurationRef = useRef(null), 
        // memory of normalized config, and spec of state, for minimized and maximized
        reservedWindowConfigurationRef = useRef({ 
            width:null,
            height:null,
            top: null,
            left: null,
            view:null,
            inprogress:false,
        }),

        reservedViewDeclaration = reservedWindowConfigurationRef.current.view,
        is_viewTransformationInProgress = reservedWindowConfigurationRef.current.inprogress,
        // dynamic styles based on windowFrameStyles for render
        renderWindowFrameStyles = { // dynamic update of width and height, and with change of mode
            ...windowFrameStyles,
            width:(!reservedViewDeclaration || is_viewTransformationInProgress)
                ? dynamicWindowConfiguration.width + 'px'
                : reservedViewDeclaration == 'minimized'
                    ?  WINDOW_MINIMIZED_WIDTH + 'px'
                    : null, // maximized
            height:(!reservedViewDeclaration || is_viewTransformationInProgress)
                ? dynamicWindowConfiguration.height + 'px' 
                : (reservedViewDeclaration == 'minimized')
                    ? windowTitlebarElementRef.current.offsetHeight + 'px'
                    : null, // maximized
        },
        // to determine nature of transition
        previousViewStateRef = useRef(viewDeclaration.view),
        // for inside closures
        viewDeclarationRef = useRef(null),
        // for Resizable, updated by containerDimensionsSpec state change, Draggable.onDragStop
        maxSizeConstraintsRef = useRef([700,700]), // default
        // for some setTimeout's in viewDeclaration state change
        viewTransitionTimeoutRef = useRef(null)

    // available for closures
    dynamicWindowConfigurationRef.current = dynamicWindowConfiguration
    viewDeclarationRef.current = viewDeclaration

    // ------------------------------------[ setup effects ]-----------------------------------

    // maintain mounted property in case needed
    useEffect(()=>{

        isMountedRef.current = true // compensage for double mount in safe mode
        return () => {
            isMountedRef.current = false
        }

    },[])

    // set and clear onFocus and onBlur event listeners
    useEffect(()=>{

        if (!isMountedRef.current) return

        panelFrameElementRef.current = windowFrameElementRef.current.closest('#wb-panelframe')
        windowTitlebarElementRef.current = windowFrameElementRef.current.querySelector('#wb-titlebar')

        const windowElement = windowFrameElementRef.current

        const onFocus = (event) => {
            windowTitleElementRef.current.style.backgroundColor = 'lightskyblue'
            windowCallbacks?.setFocus && windowCallbacks.setFocus(windowSessionID)
        }

        const onBlur = (event) => {
            windowTitleElementRef.current && (windowTitleElementRef.current.style.backgroundColor = 'gainsboro')
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

    // ----------------------------[ reconfiguration (state change) effects ]------------------------

    // apply inherited zOrder on change by parent
    useEffect(()=>{

        if (!isMountedRef.current) return

        // give time for animation
        const timeout = (viewDeclarationRef.current.view == 'minimized')
            ? 500
            : 0

        setTimeout(()=> {

            isMountedRef.current && (windowFrameElementRef.current.style.zIndex = zOrder)

        },timeout) 

    },[zOrder])

    // --------------
    // respond to changed viewDeclaration
    useEffect(()=>{

        clearTimeout(viewTransitionTimeoutRef.current) // for interrupts

        // aliases
        const windowElement = windowFrameElementRef.current
        const windowConfiguration = dynamicWindowConfigurationRef.current

        if (['maximized','minimized'].includes(viewDeclaration.view)) { // not for normalized, that's below

            // ---------------------------[ update minimized stack order ]--------------------------

            // reservedWindowConfigurationRef must be instantiated if not normalized
            if (viewDeclaration.view == reservedWindowConfigurationRef.current.view) { // already converted; maybe stackorder change
                if (viewDeclaration.view == 'minimized') { // adjust top position
                    windowElement.style.transition = 'top 0.3s'
                    windowElement.style.top = (viewDeclaration.stackOrder * windowTitlebarElementRef.current.offsetHeight) + 'px'
                    setTimeout(()=>{
                        isMountedRef.current && (windowElement.style.transition = null)
                    },300)
                }
                return // view changes aleady made
            }

            isDraggableDisabledRef.current = true

            // save normalized config for later restoration; save target view, inprogress flag
            reservedWindowConfigurationRef.current = {
                ...windowConfiguration, // might have been changed by configurationSpecs state change
                view:viewDeclaration.view,
                inprogress:true,
            }

            // -----------------------[ transition to maximized view ]-------------------------

            if (viewDeclaration.view == 'maximized') {

                // set base for animation
                windowElement.style.transform = 'none'
                if (previousViewStateRef.current == 'normalized') {

                    windowElement.style.top = windowConfiguration.top + 'px'
                    windowElement.style.left = windowConfiguration.left + 'px'

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
                viewTransitionTimeoutRef.current = setTimeout(()=>{

                    if (!isMountedRef.current) return
                    windowElement.style.transition = null
                    windowElement.style.top = null
                    windowElement.style.left = null
                    windowElement.style.width = null
                    windowElement.style.height = null
                    windowElement.style.inset = 0

                    reservedWindowConfigurationRef.current.inprogress = false

                    previousViewStateRef.current = 'maximized'

                    setWindowState('activatemaximized')

                },501)

            // -----------------------[ transition to minimized view ]-------------------------

            } else { // 'minimized'

                // set base for animation
                windowElement.style.transform = 'none'

                if (previousViewStateRef.current === 'maximized') {

                    windowElement.style.top = 0
                    windowElement.style.left = 0

                } else {

                    windowElement.style.top = windowConfiguration.top + 'px'
                    windowElement.style.left = windowConfiguration.left + 'px'

                }
                // set targets for animation, yielding for base to take effect
                setTimeout(()=>{

                    windowElement.style.transition = WINDOW_TRANSITION
                    windowElement.style.top = (viewDeclaration.stackOrder * windowTitlebarElementRef.current.offsetHeight) + 'px'
                    windowElement.style.left = 0
                    windowElement.style.width = WINDOW_MINIMIZED_WIDTH + 'px'
                    windowElement.style.height = windowTitlebarElementRef.current.offsetHeight + 'px'
                    windowElement.style.overflow = 'hidden'

                },1)

                // wait for animation completion, adjust CSS, set inprogress false for renderWindowFrameStyles
                viewTransitionTimeoutRef.current = setTimeout(()=>{

                    if (!isMountedRef.current) return
                    windowElement.style.transition = null

                    reservedWindowConfigurationRef.current.inprogress = false

                    previousViewStateRef.current = 'minimized'

                    setWindowState('activateminimized')

                },501)

            }

        // -----------------------[ transition to normalized view ]-------------------------

        } else { // 'normalized'

            const reservedWindowConfiguration = reservedWindowConfigurationRef.current

            // console.log('switch to normalized: reservedWindowConfiguration', reservedWindowConfiguration)

            // reserved view could be null, which requires no action
            if (reservedWindowConfiguration.view === null) return // already normalized
            // if (!['maximized','minimized'].includes(reservedWindowConfiguration.view)) return // already normalized

            const windowElement = windowFrameElementRef.current

            // set base styles
            const currentWidth = windowElement.offsetWidth, currentHeight = windowElement.offsetHeight

            if (previousViewStateRef.current === 'maximized') {
    
                windowElement.style.inset = null
                windowElement.style.top = 0
                windowElement.style.left = 0
            }

            windowElement.style.width = currentWidth + 'px'
            windowElement.style.height = currentHeight + 'px'

            reservedWindowConfigurationRef.current.inprogress = true

            // set targets
            setTimeout(()=>{

                windowElement.style.transition = WINDOW_TRANSITION
                windowElement.style.top = reservedWindowConfiguration.top + 'px'
                windowElement.style.left = reservedWindowConfiguration.left + 'px'
                windowElement.style.width = reservedWindowConfiguration.width + 'px'
                windowElement.style.height = reservedWindowConfiguration.height + 'px'

            },1)

            // set restored base
            viewTransitionTimeoutRef.current = setTimeout(()=>{

                if (!isMountedRef.current) return
                windowElement.style.transition = null
                windowElement.style.top = 0
                windowElement.style.left = 0
                windowElement.style.transform = `translate(${reservedWindowConfiguration.left}px,${reservedWindowConfiguration.top}px)`
                isDraggableDisabledRef.current = false

                const {view, inprogress, ...configData} = reservedWindowConfiguration

                Object.assign(windowConfiguration, configData)

                // reset reserved
                reservedWindowConfigurationRef.current = {
                    width:null,
                    height:null,
                    top:null,
                    left:null,
                    view:null,
                    inprogress:false,
                }

                // console.log('FINISHED switch to normalized: reservedWindowConfigurationRef', reservedWindowConfigurationRef.current)

                previousViewStateRef.current = 'normalized'

                setDynamicWindowConfiguration(windowConfiguration)

                setWindowState('activatenormalized')

            },501)

        }

        setWindowState('viewchange')

    },[viewDeclaration])

    // --------------
    // adjust window size as necessary to adapt to changed container size; 
    // responds to new containerDimensionSpecs object
    useEffect(()=>{

        if (!isMountedRef.current) return

        if (!containerDimensionSpecs) return

        const 
            reservedWindowConfiguration = reservedWindowConfigurationRef.current,
            windowConfiguration = dynamicWindowConfigurationRef.current

        let virtualWindowConfig // updated by change of containerDimensionSpecs
        if (reservedWindowConfiguration.view) { // can't use dynamic version

            virtualWindowConfig = {
                width: reservedWindowConfiguration.width,
                height: reservedWindowConfiguration.height,
                top: reservedWindowConfiguration.top, // translate value
                left: reservedWindowConfiguration.left, // translate value
            }

        } else {

            virtualWindowConfig = {
                width: windowConfiguration.width,
                height: windowConfiguration.height,
                top: windowConfiguration.top,
                left: windowConfiguration.left,
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
                    leftShiftApplied = virtualWindowConfig.left - newLeft

                if (leftShiftApplied) { // save

                    virtualWindowConfig.left = newLeft

                }

                widthOversize -= leftShiftApplied // remaining oversize
                virtualWindowConfig.width -= widthOversize

            }

            // adjust top and height
            if (containerDimensionSpecs.height < heightFitBoundary) {
                let heightOverize = heightFitBoundary - containerDimensionSpecs.height
                const 
                    newTop = Math.max(0,virtualWindowConfig.top - heightOverize),
                    topShiftApplied = virtualWindowConfig.top - newTop

                if (topShiftApplied) {

                    virtualWindowConfig.top = newTop

                }

                heightOverize -= topShiftApplied // remaining oversize
                virtualWindowConfig.height -= heightOverize

            }

            if (!reservedWindowConfiguration.view) {

                setDynamicWindowConfiguration(virtualWindowConfig)

            } else {

                Object.assign(reservedWindowConfiguration, virtualWindowConfig)

            }

        }

        maxSizeConstraintsRef.current = [
            containerDimensionSpecs.width - virtualWindowConfig.left, 
            containerDimensionSpecs.height - virtualWindowConfig.top,
        ]

        setWindowState('repositioned')

    },[containerDimensionSpecs])

    // -----------------------------[ resizeable and draggable callbacks ]-----------------------------

    // resizable callbacks...
    const onResizeStart = (event, {size, handle}) => {

        if (!isMountedRef.current) return

        if (isDraggableDisabledRef.current) return

        windowFrameElementRef.current.focus()

    }

    const onResize = (event, {size, handle}) => {

        if (!isMountedRef.current) return

        if (isDraggableDisabledRef.current) return

        setDynamicWindowConfiguration((previousState)=>{
            return {...previousState, width:size.width,height:size.height}})

    }

    // draggable callbacks
    const onDragStart = (e, data) => {

        if (!isMountedRef.current) return

        windowFrameElementRef.current.focus()

    }

    const onDragStop = (e, data) => {

        if (!isMountedRef.current) return

        // undo deltalY which causes scroll and window movement when drag handle (titleName) selected
        // while window is partially out of view
        if (data.deltaY) {

            panelFrameElementRef.current.scrollTop -= data.deltaY

        }

        setDynamicWindowConfiguration((previousState) => {
            return {...previousState, top:data.y - data.deltaY, left: data.x}
        })

        maxSizeConstraintsRef.current = [
            containerDimensionSpecs.width - data.x, 
            containerDimensionSpecs.height - (data.y - data.deltaY),
        ]
    }

    // bounds = '#workpanel' <- alternative
    // this makes no difference to the deltaY shift problem...
    const bounds = { // for Draggable
        top:0, 
        right:containerDimensionSpecs.width - dynamicWindowConfiguration.width, 
        bottom:containerDimensionSpecs.height - dynamicWindowConfiguration.height, 
        left:0,
    }

    // render
    return (
    <Draggable
        defaultPosition = {{x:0,y:0}}
        position = {{x:dynamicWindowConfiguration.left, y:dynamicWindowConfiguration.top}}
        handle = '#draghandle'
        bounds = {bounds}
        onStart = {onDragStart}
        onStop = {onDragStop}
        disabled = {isDraggableDisabledRef.current}
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
            height = {dynamicWindowConfiguration.height} 
            width = {dynamicWindowConfiguration.width} 
            axis = 'both'
            resizeHandles = {['se']}
            minConstraints = {[300,300]}
            maxConstraints = {maxSizeConstraintsRef.current}
            onResizeStart = {onResizeStart}
            onResize = {onResize}

        >
            <Box tabIndex = {0} ref = {windowFrameElementRef} data-type = 'window-frame' style = {renderWindowFrameStyles}>
                <Grid 
                    data-type = 'window-grid'
                    style = {windowGridStyles}
                >
                    <GridItem data-type = 'window-header' style = {windowHeaderStyles}>
                        <WindowTitle windowCallbacks = {windowCallbacks} windowSessionID = {windowSessionID} ref = {windowTitleElementRef} type = {typeAlias} title = {titleName}/>
                    </GridItem>
                    <GridItem data-type = 'window-body' style = {windowBodyStyles}>
                        <Box 
                            ref = {windowContentElementRef}
                            data-type = 'window-content' 
                            style = {windowContentStyles}
                        >{children}</Box>
                    </GridItem>
                </Grid>
            </Box>
        </Resizable>
    </Draggable>)
}

export default Workwindow