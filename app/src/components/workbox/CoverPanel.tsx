// WorkboxPanels.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { 
    useRef, 
    useEffect, 
    useState, 
    // useCallback, 
    useContext, 
    CSSProperties, 
    forwardRef 
} from 'react'

import {
    Box,
    Grid, GridItem,
} from '@chakra-ui/react'

import { Resizable } from 'react-resizable'
import "react-resizable/css/styles.css"

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import CoverToolbar from '../toolbars/Toolbar_Cover'

import handleIcon from '../../../assets/handle.png'

import { WorkboxInnerFrameWidthContext } from './Workbox'
import { WindowCallbackContext } from '../Workwindow'

const 
    MIN_COVER_FRAME_WIDTH = 250,
    MAX_COVER_FRAME_RATIO = 0.75,
    MIN_CONTENTS_FRAME_WIDTH = 250

const coverFrameStyles = {
    flex: '0 0 auto',
    width: '300px',
    minWidth: MIN_COVER_FRAME_WIDTH + 'px',
    position: 'relative',
    transition: 'none', // set as needed
    transitionDelay:'unset',
    borderRadius:'8px',
    overflow: 'hidden',
} as CSSProperties

const coverPanelStyles = {
    height:'100%',
    backgroundColor:'ghostwhite',
    position:'absolute', 
    width:'100%',
    // padding: '3px', 
    border: '5px ridge seagreen',
    borderRadius:'8px',
    transition:'box-shadow .3s',
    transitionDelay:'unset',
    boxShadow: 'none',
    boxSizing: 'border-box',
    left: 0,
    right:'auto',
} as CSSProperties

const coverTabStyles = {
    position:'absolute',
    margin: 0,
    backgroundColor:'white',
    border:'1px solid gray',
    display:'flex',
    top:'50%',
    transform:'translateY(-50%)',
    right:'-6px',
    borderRadius: '8px',
    height:'48px',
    width:'24px',
    alignItems:'center',
    opacity: 0.8,
    visibility: 'visible',
    transition: 'opacity 0.3s, visibility 0.3s'
} as CSSProperties

const coverTabIconStyles = {
    opacity: 0.5,
    height: '24px',
    width: '48px',
    transform: 'rotate(90deg)'
} as CSSProperties

const coverGridStyles = {
    height: '100%',
    width: '100%',
    gridTemplateAreas: `"header"
                          "body"`,
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto 1fr',
    borderRadius: "0 0 0 7px",
}  as CSSProperties

const coverHeaderStyles = {
    area: 'header',
    minWidth:0,
    borderRadius:'8px 8px 0 0',
    borderBottom:'1px solid silver',
}

const coverBodyStyles = {
    area: 'body',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '0 0 0 7px',
    minWidth: 0,
} as CSSProperties

const CoverHandle = (props) => {

    // handleAxis for handle selection - n/a here
    const { handleAxis, innerRef, ...rest } = props

    return (
        <Box 
            ref = {innerRef}
            id = 'handle'
            data-type = {'cover-handle'} 
            style = {coverTabStyles} {...rest}>
            <img 
                draggable = "false" 
                style = {coverTabIconStyles} 
                src = {handleIcon} 
            />
        </Box>
    )
}

const CoverPanel = forwardRef(function CoverPanel(props:any, coverFrameElementRef:any) {
    const 
        { children, displayConfigCode, userCoverWidthRef, sessionWindowID, viewSelector } = props, // userCoverWidthRef informs "friends"
        displayCodeRef = useRef(null),
        coverPanelElementRef = useRef(null),
        centralPanelElementRef = useRef(null), // for direct config updates
        targetTimeoutRef = useRef(null),
        [coverResizeWidth, setCoverResizeWidth] = useState(userCoverWidthRef.current[viewSelector]),
        observerTimeoutRef = useRef(null),
        workboxInnerFrameWidthFromContext = useContext(WorkboxInnerFrameWidthContext),
        handleRef = useRef(null),
        viewSelectorRef = useRef(null),
        windowCallbackContext = useContext(WindowCallbackContext),
        windowCallbackContextRef = useRef(windowCallbackContext),
        constraintsRef = useRef({
            minX:MIN_COVER_FRAME_WIDTH,
            minY:coverFrameElementRef.current?.offsetHeight || 0,
            maxX:700,
            maxY:coverFrameElementRef.current?.offsetHeight || 0,
        }),
        workboxInnerFrameWidthFromContextRef = useRef(null)

    workboxInnerFrameWidthFromContextRef.current = workboxInnerFrameWidthFromContext
    displayCodeRef.current = displayConfigCode
    viewSelectorRef.current = viewSelector

    useEffect(()=>{

        centralPanelElementRef.current = coverPanelElementRef.current.closest('#central-panel')
        handleRef.current = centralPanelElementRef.current.querySelector('#handle')

    },[])

    useEffect(()=>{

        const 
            viewWidth = userCoverWidthRef.current[viewSelector],
            viewTrigger = viewSelector

        windowCallbackContextRef.current.changeView = ()=>{

            const constraints = {
                minX:MIN_COVER_FRAME_WIDTH,
                minY:coverFrameElementRef.current?.offsetHeight || 0,
                maxX: Math.min(
                    workboxInnerFrameWidthFromContextRef.current * MAX_COVER_FRAME_RATIO,
                    workboxInnerFrameWidthFromContextRef.current - MIN_CONTENTS_FRAME_WIDTH),
                maxY:coverFrameElementRef.current?.offsetHeight || 0,
            }
            constraintsRef.current = constraints

            const appliedWidth = Math.min(constraints.maxX, viewWidth)

            coverFrameElementRef.current.style.transition = 'width 0.3s'
            coverFrameElementRef.current.style.width = appliedWidth + 'px'
            userCoverWidthRef.current[viewTrigger] = appliedWidth

            setTimeout(()=>{
                coverFrameElementRef.current.style.transition = 'none'
                setCoverResizeWidth(appliedWidth)
            },300)

        }

    },[viewSelector])

    useEffect(()=>{

        if (workboxInnerFrameWidthFromContext === 0) return

        const centralPanelWidth = centralPanelElementRef.current.offsetWidth
        const coverWidth = 
            displayCodeRef.current == 'out'
                ? coverFrameElementRef.current.offsetWidth
                : userCoverWidthRef.current[viewSelectorRef.current]

        clearTimeout(observerTimeoutRef.current)

        const calculatedMaxCoverWidth = 
            Math.min(
                workboxInnerFrameWidthFromContext * MAX_COVER_FRAME_RATIO,
                workboxInnerFrameWidthFromContext - MIN_CONTENTS_FRAME_WIDTH)

        if (calculatedMaxCoverWidth < coverWidth) {

            const newWidth = Math.max(MIN_COVER_FRAME_WIDTH, calculatedMaxCoverWidth)

            if (coverFrameElementRef.current.style.transition != 'none') coverFrameElementRef.current.style.transition = 'none'
            displayCodeRef.current == 'out' && (coverFrameElementRef.current.style.width = newWidth + 'px')

            userCoverWidthRef.current[viewSelectorRef.current] = newWidth

            if (coverFrameElementRef.current.style.transition == 'none') {
                setTimeout(()=>{
                    coverFrameElementRef.current.style.transition = 'width 0.5s'
                },1)
            }

            setCoverResizeWidth(newWidth) // coerce render

        }

        const constraints = {
            minX:MIN_COVER_FRAME_WIDTH,
            minY:coverFrameElementRef.current?.offsetHeight || 0,
            maxX: calculatedMaxCoverWidth,
            maxY:coverFrameElementRef.current?.offsetHeight || 0,
        }
        constraintsRef.current = constraints

    },[workboxInnerFrameWidthFromContext])

    useEffect(()=>{

        clearTimeout(targetTimeoutRef.current)

        const 
            element = coverPanelElementRef.current,
            timeout = 500

        if (displayConfigCode == 'out') {

            targetTimeoutRef.current = setTimeout(()=>{
                element.style.boxShadow = 'none'
                handleRef.current.style.opacity = 0.8
                handleRef.current.style.visibility = 'visible'
            },timeout)

        } else if (displayConfigCode == 'over') {

            element.style.boxShadow = 'none'
            handleRef.current.style.opacity = 0
            handleRef.current.style.visibility = 'hidden'

        } else { // 'under'

            element.style.boxShadow = '3px 3px 6px 6px inset silver'
            handleRef.current.style.opacity = 0
            handleRef.current.style.visibility = 'hidden'

        }

    },[displayConfigCode])

    // resizable callbacks...
    const onResizeStart = () => {
        coverFrameElementRef.current.style.transition = 'none'
        const constraints = {
            minX:MIN_COVER_FRAME_WIDTH,
            minY:coverFrameElementRef.current?.offsetHeight || 0,
            maxX: Math.min(
                workboxInnerFrameWidthFromContext * MAX_COVER_FRAME_RATIO,
                workboxInnerFrameWidthFromContext - MIN_CONTENTS_FRAME_WIDTH),
            maxY:coverFrameElementRef.current?.offsetHeight || 0,
        }
        constraintsRef.current = constraints

    }

    const onResize = (event, {size, handle}) => {

        coverFrameElementRef.current.style.width = size.width + 'px'
        setCoverResizeWidth(size.width)

    }

    const onResizeStop = (e,{size, handle}) => {
        coverFrameElementRef.current.style.transition = 'width 0.5s'

        userCoverWidthRef.current[viewSelectorRef.current] = size.width
        setCoverResizeWidth(size.width)

    }

    return (
    <Resizable 
        data-inheritedtype = 'resizable' 
        handle = {

            (handleAxis, ref) => {
                return <CoverHandle 
                    innerRef = {ref} 
                    handleAxis = {handleAxis}
                />}

        } 
        axis = 'x'
        height = {coverFrameElementRef.current?.offsetHeight || 0} 
        width = {coverResizeWidth}
        resizeHandles = {['e']}
        minConstraints = {[constraintsRef.current.minX,constraintsRef.current.minY]}
        maxConstraints = {[constraintsRef.current.maxX,constraintsRef.current.maxY]}
        onResizeStart = {onResizeStart}
        onResize = {onResize}
        onResizeStop = {onResizeStop}

    >
        <Box data-type = 'cover-frame' ref = {coverFrameElementRef} style = {coverFrameStyles}>

            <Box data-type = 'cover-panel' ref = {coverPanelElementRef} style = {coverPanelStyles}>

    <Grid
        data-type = 'cover-grid'
        style = {coverGridStyles}
    >
        <GridItem data-type = 'cover-header' style = {coverHeaderStyles}>
            <ToolbarFrame>
                <CoverToolbar />
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'cover-body' style = {coverBodyStyles}>
            {children}
        </GridItem>
    </Grid>

            </Box>
            
        </Box>
    </Resizable>)
})

                    // workboxConfig = {workboxConfig} 
                    // setWorkboxConfig = {setWorkboxConfig} 
                    // itemIcon = {itemIcon} 
                    // itemTitle = {itemTitle}
                    // domainTitle = {domainTitle}
                    // typeName = {typeName}


export default CoverPanel