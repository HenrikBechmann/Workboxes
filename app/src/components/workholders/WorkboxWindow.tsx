// Workwindow.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    role: display full Workbox
    The Workwindow must stay inside the dynamically sized Workpane.
    The Workwindow can be resized, minimized (to a stack upper left),
    maimized (takes on size of Workpanel viewport), and normalized
    (floating).
    The Workwindow id moveable and stackable (focussed Workwindow on top)
*/

/*
    TODO:
        freeze windowContentElement to minWidth and minHeight when minimized?

*/

import React, { useState, useRef, useEffect, CSSProperties, Suspense, lazy } from 'react'

import {
    Grid, GridItem,
    Box
} from '@chakra-ui/react'

// both Draggable and Resizable apply their dynamics to the existing wrapped element
import Draggable from 'react-draggable'
import { Resizable } from 'react-resizable'
import "react-resizable/css/styles.css"

import { useWorkspaceHandler } from '../../system/WorkboxesProvider'

// contains the titleName elements, and the dynamic controls
const WindowTitle = lazy(() => import('./WindowTitle'))

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
const WorkboxWindow = (props) => {

    // console.log('running Workwindow: props', props)
    // console.log('titleData', props.titleData)

    // --------------------------------[ initialization ]-----------------------------

    const 
        {
            children, 
            layout, // default position; size, only used to set defaultwindowConfig
            // containerLayout can
            // - change dynamicWindowConfiguration (through useEffect for state change)
            // - change maxSizeConstraints for Resizable through useEffect for state change)
            // - helps to set bounds for Draggable
            containerLayout, // height, width of Workpanel; change can cause repositioning and resizing of window
            titleData, // workbox titleData, for titleName, workboxID
            windowCallbacks, // change zOrder etc.
            windowSessionID, // system control, repo access
            viewDeclaration, // object with view = normalized, maximized, minimized; stackOrder for minimized windows
            zOrder, // inherited; modified by setFocus 
        } = props,

        [workspaceHandler] = useWorkspaceHandler(),

        titleName = titleData.name,
        typeAlias = titleData.type?.alias,
        workboxID = titleData.id,
        workboxSubscriptionControlDataRef = useRef(null),
        defaultWindowLayout = layout, // semantics; only used to initialize dynamicWindowConfiguration

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
        // both can be changed with state change in useEffects for containerLayout, or viewDeclaration.view
        [dynamicWindowLayout, setDynamicWindowLayout] = useState( 
            {
                top: defaultWindowLayout.top, 
                left: defaultWindowLayout.left, 
                width: defaultWindowLayout.width, 
                height: defaultWindowLayout.height
            }
        ),
        // inside useEffect access for state changes of containerLayout and viewDeclaration
        dynamicWindowLayoutRef = useRef(null), 
        // memory of normalized config, and spec of state, for minimized and maximized
        reservedWindowConfigurationRef = useRef({
            layout: {
                width:null,
                height:null,
                top: null,
                left: null,
            },
            view:null,
            inprogress:false,
        }),

        reservedViewDeclaration = reservedWindowConfigurationRef.current.view,
        is_viewTransformationInProgress = reservedWindowConfigurationRef.current.inprogress,
        // dynamic styles based on windowFrameStyles for render
        renderWindowFrameStyles = { // dynamic update of width and height, and with change of mode
            ...windowFrameStyles,
            width:(!reservedViewDeclaration || is_viewTransformationInProgress)
                ? dynamicWindowLayout.width + 'px'
                : reservedViewDeclaration == 'minimized'
                    ?  WINDOW_MINIMIZED_WIDTH + 'px'
                    : null, // maximized
            height:(!reservedViewDeclaration || is_viewTransformationInProgress)
                ? dynamicWindowLayout.height + 'px' 
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
    dynamicWindowLayoutRef.current = dynamicWindowLayout
    viewDeclarationRef.current = viewDeclaration

    // ------------------------------------[ setup effects ]-----------------------------------

    // maintain mounted property in case needed
    useEffect(()=>{

        isMountedRef.current = true // compensage for double mount in safe mode
        return () => {
            isMountedRef.current = false
        }

    },[])

    const updateWorkboxData = (workboxRecord) => {
        // console.log('WorkWindow.updateWorkboxData: workboxRecord', workboxRecord)
        titleData.name = workboxRecord.profile.workbox.name
        setWindowState('workboxrecordupdate')
    }

    async function subscribeToWorkboxRecord() {
        const workboxSubscriptionControlData = {
            functions:{
                updateWorkboxData,
            },
            workbox: {
                id: titleData.id,
                name: titleData.name,
            },
            subscriptionindex: 'workwindow.' + windowSessionID
        }

        workboxSubscriptionControlDataRef.current = workboxSubscriptionControlData
        await workspaceHandler.subscribeToWorkboxRecord(workboxSubscriptionControlData)
    }

    async function unsubscribeFromWorkboxRecord() {
        const workboxSubscriptionControlData = workboxSubscriptionControlDataRef.current
        await workspaceHandler.unsubscribeFromWorkboxRecord(workboxSubscriptionControlData)
    }

    useEffect(()=>{

        subscribeToWorkboxRecord()

        return () => {
            // console.log('Workwindow unmount unsubscribe',workboxSubscriptionControlData)
            unsubscribeFromWorkboxRecord()
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
        const windowLayout = dynamicWindowLayoutRef.current

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
                layout:{...windowLayout}, // might have been changed by configurationSpecs state change
                view:viewDeclaration.view,
                inprogress:true,
            }

            // -----------------------[ transition to maximized view ]-------------------------

            if (viewDeclaration.view == 'maximized') {

                // set base for animation
                windowElement.style.transform = 'none'
                if (previousViewStateRef.current == 'normalized') {

                    windowElement.style.top = windowLayout.top + 'px'
                    windowElement.style.left = windowLayout.left + 'px'

                }

                // set targets for animation, yielding for base to take effect
                setTimeout(()=>{

                    const panelFrameElement = panelFrameElementRef.current
                    Object.assign(windowElement.style,
                        {
                            transition: WINDOW_TRANSITION,
                            top: 0,
                            left: 0,
                            width: panelFrameElement.offsetWidth + 'px',
                            height: panelFrameElement.offsetHeight + 'px',
                        }
                    )

                },1)

                // wait for animation completion, adjust CSS, set inprogress false for renderWindowFrameStyles
                viewTransitionTimeoutRef.current = setTimeout(()=>{

                    if (!isMountedRef.current) return

                    Object.assign(windowElement.style,{
                        transition: null,
                        top: null,
                        left: null,
                        width: null,
                        height: null,
                        inset: 0,
                    })

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

                    windowElement.style.top = windowLayout.top + 'px'
                    windowElement.style.left = windowLayout.left + 'px'

                }
                // set targets for animation, yielding for base to take effect
                setTimeout(()=>{

                    Object.assign(windowElement.style,
                        {
                            transition: WINDOW_TRANSITION,
                            top: (viewDeclaration.stackOrder * windowTitlebarElementRef.current.offsetHeight) + 'px',
                            left: 0,
                            width: WINDOW_MINIMIZED_WIDTH + 'px',
                            height: windowTitlebarElementRef.current.offsetHeight + 'px',
                            overflow: 'hidden',
                        }
                    )
                    
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
    
                Object.assign(windowElement.style,{
                    inset: null,
                    top: 0,
                    left: 0,
                })

            }

            Object.assign(windowElement.style,{
                width: currentWidth + 'px',
                height: currentHeight + 'px',
            })

            // windowElement.style.width = currentWidth + 'px'
            // windowElement.style.height = currentHeight + 'px'

            reservedWindowConfigurationRef.current.inprogress = true

            // set targets
            setTimeout(()=>{

                const reservedLayout = reservedWindowConfiguration.layout

                Object.assign(windowElement.style,{
                    transition: WINDOW_TRANSITION,
                    top: reservedLayout.top + 'px',
                    left: reservedLayout.left + 'px',
                    width: reservedLayout.width + 'px',
                    height: reservedLayout.height + 'px',
                })

            },1)

            // set restored base
            viewTransitionTimeoutRef.current = setTimeout(()=>{

                if (!isMountedRef.current) return

                Object.assign(windowElement.style,{
                    transition: null,
                    top: 0,
                    left: 0,
                    transform: `translate(${reservedWindowConfiguration.layout.left}px,${reservedWindowConfiguration.layout.top}px)`,
                })

                isDraggableDisabledRef.current = false

                const {view, inprogress, layout:layoutData} = reservedWindowConfiguration


                Object.assign(windowLayout, {...layoutData})

                // reset reserved
                reservedWindowConfigurationRef.current = {
                    layout:{
                        width:null,
                        height:null,
                        top:null,
                        left:null,
                    },
                    view:null,
                    inprogress:false,
                }

                // console.log('FINISHED switch to normalized: reservedWindowConfigurationRef', reservedWindowConfigurationRef.current)

                previousViewStateRef.current = 'normalized'

                setDynamicWindowLayout(windowLayout)

                setWindowState('activatenormalized')

            },501)

        }

        setWindowState('viewchange')

    },[viewDeclaration])

    // --------------
    // adjust window size as necessary to adapt to changed container size; 
    // responds to new containerLayout object
    useEffect(()=>{

        if (!isMountedRef.current) return

        if (!containerLayout) return

        const 
            reservedWindowConfiguration = reservedWindowConfigurationRef.current,
            windowLayout = dynamicWindowLayoutRef.current

        let virtualWindowLayout // updated by change of containerLayout
        if (reservedWindowConfiguration.view) { // can't use dynamic version

            const reservedLayout = reservedWindowConfiguration.layout
            virtualWindowLayout = {
                width: reservedLayout.width,
                height: reservedLayout.height,
                top: reservedLayout.top, // translate value
                left: reservedLayout.left, // translate value
            }

        } else {

            virtualWindowLayout = {
                width: windowLayout.width,
                height: windowLayout.height,
                top: windowLayout.top,
                left: windowLayout.left,
            }

        }

        const
            widthFitBoundary = virtualWindowLayout.width + virtualWindowLayout.left,
            heightFitBoundary = virtualWindowLayout.height + virtualWindowLayout.top

        // keep entire window inside panel boundaries
        if (containerLayout.width < widthFitBoundary || containerLayout.height < heightFitBoundary) {
            // adjustments required

            // adjust left and width
            if (containerLayout.width < widthFitBoundary) {
                let widthOversize = widthFitBoundary - containerLayout.width
                const 
                    newLeft = Math.max(0,virtualWindowLayout.left - widthOversize),
                    leftShiftApplied = virtualWindowLayout.left - newLeft

                if (leftShiftApplied) { // save

                    virtualWindowLayout.left = newLeft

                }

                widthOversize -= leftShiftApplied // remaining oversize
                virtualWindowLayout.width -= widthOversize

            }

            // adjust top and height
            if (containerLayout.height < heightFitBoundary) {
                let heightOverize = heightFitBoundary - containerLayout.height
                const 
                    newTop = Math.max(0,virtualWindowLayout.top - heightOverize),
                    topShiftApplied = virtualWindowLayout.top - newTop

                if (topShiftApplied) {

                    virtualWindowLayout.top = newTop

                }

                heightOverize -= topShiftApplied // remaining oversize
                virtualWindowLayout.height -= heightOverize

            }

            if (!reservedWindowConfiguration.view) {

                setDynamicWindowLayout(virtualWindowLayout)

            } else {

                Object.assign(reservedWindowConfiguration.layout, virtualWindowLayout)

            }

        }

        maxSizeConstraintsRef.current = [
            containerLayout.width - virtualWindowLayout.left, 
            containerLayout.height - virtualWindowLayout.top,
        ]

        setWindowState('repositioned')

    },[containerLayout])

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

        setDynamicWindowLayout((previousState)=>{
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

        setDynamicWindowLayout((previousState) => {
            return {...previousState, top:data.y - data.deltaY, left: data.x}
        })

        maxSizeConstraintsRef.current = [
            containerLayout.width - data.x, 
            containerLayout.height - (data.y - data.deltaY),
        ]
    }

    // bounds = '#workpanel' <- alternative
    // this makes no difference to the deltaY shift problem...
    const bounds = { // for Draggable
        top:0, 
        right:containerLayout.width - dynamicWindowLayout.width, 
        bottom:containerLayout.height - dynamicWindowLayout.height, 
        left:0,
    }

    // render
    return (
    <Draggable
        nodeRef = {windowFrameElementRef} // avoid findDomNode deprecated warning
        defaultPosition = {{x:0,y:0}}
        position = {{x:dynamicWindowLayout.left, y:dynamicWindowLayout.top}}
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
            height = {dynamicWindowLayout.height} 
            width = {dynamicWindowLayout.width} 
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
                        <Suspense><WindowTitle 
                            windowCallbacks = {windowCallbacks} 
                            windowSessionID = {windowSessionID} 
                            ref = {windowTitleElementRef} 
                            type = {typeAlias} 
                            title = {titleName}/>
                        </Suspense>
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

export default WorkboxWindow