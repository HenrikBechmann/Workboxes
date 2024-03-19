// WorkWindow.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, CSSProperties } from 'react'

import {
    Grid, GridItem,
    Box
} from '@chakra-ui/react'

import Draggable from 'react-draggable'
import { Resizable } from 'react-resizable'
import "react-resizable/css/styles.css"

import WindowTitle from './WindowTitle'

import dragCornerIcon from '../../assets/drag-corner.png'

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

const WindowHandle = (props) => {

    // handleAxis for handle selection - n/a here; remove from rest to avoid warning when passed on to Box
    const { handleAxis, innerRef, sessionID, ...rest } = props

    // console.log('WindowHandle drag props', sessionID, rest)

    return (
        <Box ref = {innerRef} data-type = 'resize-handle' style = {resizeHandleStyles} {...rest}>
            <img draggable = "false" src = {dragCornerIcon} style = {resizeHandleIconStyles} />
        </Box>
    )
}

const Workwindow = (props) => {

    const 
        {
            children, 
            configDefaults, // for this Workwindow 
            sessionID, // system control
            zOrder, // inherited; modified by setFocus 
            viewData, // normalized, maximized, minimized
            callbacks, // change zOrder etc.
            containerConfigSpecs // height, width; change can cause repositioning and resizing of window
        } = props,
        isMountedRef = useRef(true),
        isDisabledRef = useRef(false),
        sessionIDRef = useRef(sessionID), // future reference
        [windowState, setWindowState] = useState('setup'), // assure proper internal initialization of resizable (unknown reason)
        [windowConfigSpecs, setWindowConfigSpecs] = useState( // top and left are translation values; styles are left at 0
            {
                top:parseInt(configDefaults.top), 
                left: parseInt(configDefaults.left), 
                width:parseInt(configDefaults.width), 
                height:parseInt(configDefaults.height)
            }
        ),
        windowConfigSpecsRef = useRef(null),
        windowElementRef = useRef(null),
        titleElementRef = useRef(null),
        panelFrameElementRef = useRef(null),
        dynamicConfigSnapshotRef = useRef({
            width:null,
            height:null,
            top: null,
            left: null,
            transform:null,
            view:null,
        }),
        // isDraggingRef = useRef(false),
        appliedWindowFrameStyles = { // dynamic update with resizing
            ...windowFrameStyles,
            width:windowConfigSpecs.width + 'px', 
            height:windowConfigSpecs.height + 'px',
            transform:'none'
        },
        maxConstraintsRef = useRef([700,700]), // default
        transitionTimeoutRef = useRef(null)

    // console.log('running Workwindow: sessionID, windowState, viewData, isDisabled',
    //     sessionID, windowState, viewData, isDisabledRef.current)

    windowConfigSpecsRef.current = windowConfigSpecs

    useEffect(()=>{

        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }

    },[])

    // set and clear onFocus and onBlur event listeners
    useEffect(()=>{

        if (!isMountedRef.current) return

        panelFrameElementRef.current = windowElementRef.current.closest('#panelframe')

        const element = windowElementRef.current

        const onFocus = (event) => {
            titleElementRef.current.style.backgroundColor = 'lightskyblue'
            callbacks?.setFocus && callbacks.setFocus(sessionID)
        }

        const onBlur = (event) => {
            titleElementRef.current && (titleElementRef.current.style.backgroundColor = 'gainsboro')
        }

        element.addEventListener('focus',onFocus)
        element.addEventListener('blur',onBlur)

        return () => {
            element.removeEventListener('focus', onFocus)
            element.removeEventListener('blur', onBlur)
        }

    },[])

    useEffect(()=>{

        clearTimeout(transitionTimeoutRef.current)

        const element = windowElementRef.current
        const windowConfig = windowConfigSpecsRef.current

        if (['maximized','minimized'].includes(viewData.view)) {

            if (viewData.view == dynamicConfigSnapshotRef.current.view) return // changes aleady made

            isDisabledRef.current = true
            dynamicConfigSnapshotRef.current = {
                width: element.offsetWidth,
                height: element.offsetHeight,
                top: windowConfig.top,
                left: windowConfig.left,
                transform: element.style.transform,
                view:viewData.view
            }
            const panelElement = panelFrameElementRef.current

            if (viewData.view == 'maximized') {
                element.style.transform = 'none'
                element.style.top = windowConfig.top + 'px'
                element.style.left = windowConfig.left + 'px'

                setTimeout(()=>{

                    element.style.transition = 'top .5s, left .5s, width .5s, height .5s'
                    element.style.top = '0px'
                    element.style.left = '0px'
                    element.style.width = panelElement.offsetWidth + 'px'
                    element.style.height = panelElement.offsetHeight + 'px'


                },1)

                transitionTimeoutRef.current = setTimeout(()=>{

                    element.style.transition = null
                    element.style.top = null
                    element.style.left = null
                    element.style.width = null
                    element.style.height = null
                    element.style.inset = 0

                },501)

            } else { // 'minimized'

            }

        } else { // 'normalized'

            const savedConfig = dynamicConfigSnapshotRef.current

            if (!['maximized','minimized'].includes(savedConfig.view)) return // already normalized

            const element = windowElementRef.current

            // set base styles
            const currentWidth = element.offsetWidth, currentHeight = element.offsetHeight
            element.style.inset = null
            element.style.top = 0
            element.style.left = 0
            element.style.width = currentWidth + 'px'
            element.style.height = currentHeight + 'px'

            // set targets
            setTimeout(()=>{

                element.style.transition = 'top .5s, left .5s, width .5s, height .5s'
                element.style.top = savedConfig.top + 'px'
                element.style.left = savedConfig.left + 'px'
                element.style.width = savedConfig.width + 'px'
                element.style.height = savedConfig.height + 'px'

            },1)

            transitionTimeoutRef.current = setTimeout(()=>{

                element.style.transition = null
                element.style.top = 0
                element.style.left = 0
                element.style.transform = savedConfig.transform
                isDisabledRef.current = false

                dynamicConfigSnapshotRef.current = {
                    width:null,
                    height:null,
                    top:null,
                    left:null,
                    transform:null,
                    view:null,                    
                }

                setWindowState('enabledynamics')

            },501)

        }

        setWindowState('viewchange')

    },[viewData])

    // apply inherited zOrder on change by parent
    useEffect(()=>{

        if (!isMountedRef.current) return

        windowElementRef.current.style.zIndex = zOrder

    },[zOrder])

    // resizable requires this assurance of proper internal initialization for first call from any window (unknown reason)
    useEffect(()=>{

        if (!isMountedRef.current) return

        if (windowState != 'ready') setWindowState('ready')

    },[windowState])

    // adjust window size to fit in container size; responds to new containerConfigSpecs object
    useEffect(()=>{

        if (!isMountedRef.current) return

        if (!containerConfigSpecs) return

        const 
            element = windowElementRef.current,
            windowConfig = {
                width: element.offsetWidth,
                height: element.offsetHeight,
                top: windowConfigSpecsRef.current.top, // translate value
                left: windowConfigSpecsRef.current.left, // translate value
            },
            widthFitBound = windowConfig.width + windowConfig.left,
            heightFitBound = windowConfig.height + windowConfig.top

        // keep entire window inside panel boundaries
        if (containerConfigSpecs.width < widthFitBound || containerConfigSpecs.height < heightFitBound) {
            // adjustment required
            let newWidth, newHeight, newLeft, newTop, widthDelta, heightDelta, widthApplied, heightApplied
            if (containerConfigSpecs.width < widthFitBound) {
                widthDelta = widthFitBound - containerConfigSpecs.width
                newLeft = Math.max(0,windowConfig.left - widthDelta)
                widthApplied = windowConfig.left - newLeft
                if (widthApplied) {
                    windowConfig.left = newLeft
                }
                widthDelta -= widthApplied
                newWidth = windowConfig.width - widthDelta
            } else {
                newLeft = windowConfig.left
                newWidth = windowConfig.width
            }

            if (containerConfigSpecs.height < heightFitBound) {
                heightDelta = heightFitBound - containerConfigSpecs.height
                newTop = Math.max(0,windowConfig.top - heightDelta)
                heightApplied = windowConfig.top - newTop
                if (heightApplied) {
                    windowConfig.top = newTop
                }
                heightDelta -= heightApplied
                newHeight = windowConfig.height - heightDelta
            } else {
                newTop = windowConfig.top
                newHeight = windowConfig.height
            }

            const adjustedWindowSpecs = {top:newTop, left:newLeft, width:newWidth, height:newHeight}

            maxConstraintsRef.current = [
                containerConfigSpecs.width - newLeft, 
                containerConfigSpecs.height - newTop,
            ]

            setWindowConfigSpecs(adjustedWindowSpecs)

        } else {

            maxConstraintsRef.current = [
                containerConfigSpecs.width - windowConfigSpecsRef.current.left, 
                containerConfigSpecs.height - windowConfigSpecsRef.current.top,
            ]

        }

        setWindowState('repositioned')

    },[containerConfigSpecs])

    // resizable callbacks...
    const onResizeStart = (event, {size, handle}) => {

        if (!isMountedRef.current) return

        if (isDisabledRef.current) return

        windowElementRef.current.focus()

    }

    const onResize = (event, {size, handle}) => {

        if (!isMountedRef.current) return

        if (isDisabledRef.current) return

        setWindowConfigSpecs((previousState)=>{
            return {...previousState, width:size.width,height:size.height}})

    }

    // draggable callbacks
    const onDragStart = (e, data) => {

        if (!isMountedRef.current) return

        windowElementRef.current.focus()

    }

    // TODO: try setting bounds:{left, top, right, bottom} instead of a search handle
    const onDragStop = (e, data) => {

        if (!isMountedRef.current) return

        // undo deltalY which causes scroll and window movement when drag handle (title) selected
        // while window is partially out of view
        if (data.deltaY) {
            // console.log('updating DeltaY',data.deltaY)
            panelFrameElementRef.current.scrollTop -= data.deltaY
        }

        setWindowConfigSpecs((previousState) => {
            return {...previousState, top:data.y - data.deltaY, left: data.x}
        })

        maxConstraintsRef.current = [
            containerConfigSpecs.width - data.x, 
            containerConfigSpecs.height - (data.y - data.deltaY),
        ]
    }

    // bounds = '#workpanel' <- alternative
    // this makes no difference to the deltaY shift problem...
    const bounds = {
        top:0, 
        right:containerConfigSpecs.width - windowConfigSpecs.width, 
        bottom:containerConfigSpecs.height - windowConfigSpecs.height, 
        left:0,
    }

    // render
    return (
    <Draggable
        defaultPosition = {{x:0,y:0}}
        position = {{x:windowConfigSpecs.left, y:windowConfigSpecs.top}}
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
                    sessionID = {sessionID}
                    innerRef = {ref} 
                    handleAxis = {handleAxis}
                />
            } 
            height = {windowConfigSpecs.height} 
            width = {windowConfigSpecs.width} 
            axis = 'both'
            resizeHandles = {['se']}
            minConstraints = {[300,300]}
            maxConstraints = {maxConstraintsRef.current}
            onResizeStart = {onResizeStart}
            onResize = {onResize}

        >
            <Box tabIndex = {0} ref = {windowElementRef} data-type = 'window-frame' style = {appliedWindowFrameStyles}>
                <Grid 
                    data-type = 'window-grid'
                    style = {windowGridStyles}
                >
                    <GridItem data-type = 'window-header' style = {windowHeaderStyles}>
                        <WindowTitle callbacks = {callbacks} sessionID = {sessionID} ref = {titleElementRef} />
                    </GridItem>
                    <GridItem data-type = 'window-body' style = {windowBodyStyles}>
                        <Box 
                            data-type = 'window-content' 
                            style = {windowContentStyles}
                        >{children}</Box>
                        <Box data-type = 'resize-handle' style = {resizeHandleStyles}>
                            <img src = {dragCornerIcon} style = {resizeHandleIconStyles} />
                        </Box>
                    </GridItem>
                </Grid>
            </Box>
        </Resizable>
    </Draggable>)
}

export default Workwindow