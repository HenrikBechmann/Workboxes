// workwindow.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Grid, GridItem,
    Box
} from '@chakra-ui/react'

import Draggable from 'react-draggable'
import { Resizable } from 'react-resizable'
import "react-resizable/css/styles.css"

import dragCornerIcon from '../../assets/drag-corner.png'
import windowMinimalIcon from '../../assets/window-minimal.png'
import windowFloatIcon from '../../assets/window-float.png'
import windowFullIcon from '../../assets/window-full.png'
import moreVertIcon from '../../assets/more_vert_light.png'

const windowStyles = {
    position: 'absolute',
    border: '2px solid silver',
    borderRadius: '8px 8px 0 8px',
    boxShadow: '0 2px 7px 3px gainsboro',
} as CSSProperties

const titleStyles = {
    width: '100%',
    borderBottom:'2px solid silver',
    borderRadius: '7px 7px 0 0',
    padding: '3px',
    backgroundColor:'gainsboro',
    display: 'grid',
    gridAutoFlow: 'column',
} as CSSProperties

const textBlockStyles = {
    overflow:'clip',
    minWidth:0,
    fontSize:'small', 
    textWrap:'nowrap', 
    textOverflow: 'ellipsis',   
}  as CSSProperties

const windowIconGroupStyles = {
    marginLeft:'auto',
    borderRadius: '0 7px 0 0',
    display:'flex',
} as CSSProperties

const contentStyles = {
    position: 'absolute',
    inset: 0, 
    padding: '3px', 
    backgroundColor: 'ghostwhite',
    borderRadius: '0 0 0px 7px',
} as CSSProperties

const handleStyles = {
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

const handleIconStyles = {
    opacity:0.5, 
    height:'12px', 
    width:'12px',
}

const WindowHandle = (props) => {

    // handleAxis for handle selection - n/a here
    const { handleAxis, innerRef, ...rest } = props

    return (
        <Box ref = {innerRef} data-type = 'resize-handle' style = {handleStyles} {...rest}>
            <img draggable = "false" src = {dragCornerIcon} style = {handleIconStyles} />
        </Box>
    )
}

const Workwindow = (props) => {

    const 
        {children, configDefaults, sessionID, zOrder, setFocus, containerSpecs} = props,
        [windowState, setWindowState] = useState('setup'), // assure proper internal initialization of resizable (!)
        [windowConfigSpecs, setWindowConfigSpecs] = useState(
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
        zOrderRef = useRef(null),
        localWindowStyles = {
            ...windowStyles,
            width:windowConfigSpecs.width + 'px', 
            height:windowConfigSpecs.height + 'px',
            transform:'none'
        },
        localTitleStylesRef = useRef(titleStyles),
        maxConstraintsRef = useRef([700,700]) // default

    zOrderRef.current = zOrder
    windowConfigSpecsRef.current = windowConfigSpecs

    // set onFocus and onBlur event listeners
    useEffect(()=>{

        const element = windowElementRef.current

        const onFocus = (event) => {
            setFocus && setFocus(zOrderRef.current)
            titleElementRef.current.style.backgroundColor = 'lightskyblue'
        }

        const onBlur = (event) => {
            titleElementRef.current.style.backgroundColor = 'gainsboro'
        }

        element.addEventListener('focus',onFocus)

        element.addEventListener('blur',onBlur)

        return () => {
            element.removeEventListener('focus', onFocus)
            element.removeEventListener('blur', onBlur)
        }

    },[])

    // apply inherited zOrder on change
    useEffect(()=>{

        windowElementRef.current.style.zIndex = zOrder

    },[zOrder])

    // resizable requires this assurance of proper internal initialization for first call from any window
    useEffect(()=>{

        if (windowState != 'ready') setWindowState('ready')

    },[windowState])

    // adjust window size to fit in container size
    useEffect(()=>{

        if (!containerSpecs) return

        const element = windowElementRef.current
        const windowSpecs = {
            width: windowConfigSpecs.width,
            height: windowConfigSpecs.height,
            top: windowConfigSpecs.top,
            left: windowConfigSpecs.left,
        }

        const widthBound = windowSpecs.width + windowSpecs.left
        const heightBound = windowSpecs.height + windowSpecs.top

        if (containerSpecs.width < widthBound || containerSpecs.height < heightBound) {
            // adjustment required
            let newWidth, newHeight, newLeft, newTop, widthDelta, heightDelta, widthApplied, heightApplied
            if (containerSpecs.width < widthBound) {
                widthDelta = widthBound - containerSpecs.width
                newLeft = Math.max(0,windowSpecs.left - widthDelta)
                widthApplied = windowSpecs.left - newLeft
                if (widthApplied) {
                    windowSpecs.left = newLeft
                }
                widthDelta -= widthApplied
                newWidth = windowSpecs.width - widthDelta
            } else {
                newLeft = windowSpecs.left
                newWidth = windowSpecs.width
            }

            if (containerSpecs.height < heightBound) {
                heightDelta = heightBound - containerSpecs.height
                newTop = Math.max(0,windowSpecs.top - heightDelta)
                heightApplied = windowSpecs.top - newTop
                if (heightApplied) {
                    windowSpecs.top = newTop
                }
                heightDelta -= heightApplied
                newHeight = windowSpecs.height - heightDelta
            } else {
                newTop = windowSpecs.top
                newHeight = windowSpecs.height
            }

            const adjustedWindowSpecs = {top:newTop, left:newLeft, width:newWidth, height:newHeight}

            setWindowConfigSpecs(adjustedWindowSpecs)

        }

        // maintain window resize within bounds
        maxConstraintsRef.current = [
            containerSpecs.width - windowConfigSpecsRef.current.left, 
            containerSpecs.height - windowConfigSpecsRef.current.top,
        ]
        setWindowState('repositioned')

    },[containerSpecs])

    // resiable callbacks...
    const onResizeStart = (event, {size, handle}) => {

        windowElementRef.current.focus()

    }

    const onResize = (event, {size, handle}) => {

        setWindowConfigSpecs((oldState)=>{
            return {...oldState, width:size.width,height:size.height}})

    }

    const onResizeStop = () => {

    }

    // draggable callback
    const onDragStart = (e, data) => {

        windowElementRef.current.focus()

    }

    const onDragStop = (e, data) => {

        setWindowConfigSpecs((oldState) => {
            return {...oldState, top:data.y, left: data.x}
        })
        maxConstraintsRef.current = [
            containerSpecs.width - data.x, 
            containerSpecs.height - data.y,
        ]
    }

    // render
    return (
    <Draggable
        defaultPosition = {{x:0,y:0}}
        position = {{x:windowConfigSpecs.left, y:windowConfigSpecs.top}}
        handle = '#title'
        bounds = 'parent'
        onStart = {onDragStart}
        onStop = {onDragStop}
    >
        <Resizable 
            data-inheritedtype = 'resizable' 
            handle = {

                (handleAxis, ref) => <WindowHandle 
                    innerRef = {ref} 
                    handleAxis = {handleAxis}
                />
            } 
            height = {windowConfigSpecs.height} 
            width = {windowConfigSpecs.width} 
            axis = 'both'
            resizeHandles = {['se']}
            minConstraints = {[200,200]}
            maxConstraints = {maxConstraintsRef.current}
            onResizeStart = {onResizeStart}
            onResize = {onResize}
            onResizeStop = {onResizeStop}

        >
            <Box tabIndex = {0} ref = {windowElementRef} data-type = 'window-frame' style = {localWindowStyles}>
                <Grid 
                    data-type = 'window-grid'
                    height = '100%' 
                    gridTemplateColumns = '1fr' 
                    gridTemplateRows = 'auto 1fr'
                    gridTemplateAreas = {`"header"
                                          "body"`}
                >
                    <GridItem data-type = 'window-header' gridArea = 'header' width = '100%' position = 'relative'>
                        <Box ref = {titleElementRef} id = 'title' data-type = 'window-title' style = {titleStyles}>
                            <Box data-type = 'text-block' style = {textBlockStyles}>
                                Henrik Bechmann (Domain)
                            </Box>
                            <Box data-type = 'window-icon-group' style = {windowIconGroupStyles}>
                                <img src = {windowMinimalIcon} />
                                <img src = {windowFloatIcon} />
                                <img src = {windowFullIcon} />
                                <img src = {moreVertIcon} />
                            </Box>
                        </Box>
                    </GridItem>
                    <GridItem data-type = 'window-body' gridArea = 'body' width = '100%' position = 'relative' borderRadius = '0px 0px 0px 7px'>
                        <Box 
                            data-type = 'window-content' 
                            style = {contentStyles}
                        >{children}</Box>
                        <Box data-type = 'resize-handle' style = {handleStyles}>
                            <img src = {dragCornerIcon} style = {handleIconStyles} />
                        </Box>
                    </GridItem>
                </Grid>
            </Box>
        </Resizable>
    </Draggable>)

} 

export default Workwindow