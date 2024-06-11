// DocumentPanels.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { 
    useRef, 
    useEffect, 
    useState, 
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
import DocumentToolbar from '../toolbars/Toolbar_Document'

import handleIcon from '../../../assets/handle.png'

import { WorkboxInnerFrameWidthContext } from './Workbox'
import { WindowCallbackContext } from '../workholders/Workwindow'
import DocumentContent from '../documentUI/DocumentContent'

const 
    MIN_COVER_FRAME_WIDTH = 250,
    MAX_COVER_FRAME_RATIO = 0.75,
    MIN_CONTENTS_FRAME_WIDTH = 250

const documentFrameStyles = {
    flex: '0 0 auto',
    width: '300px',
    minWidth: MIN_COVER_FRAME_WIDTH + 'px',
    position: 'relative',
    transition: 'none', // set as needed
    transitionDelay:'unset',
    borderRadius:'8px',
    overflow: 'hidden',
} as CSSProperties

const documentPanelStyles = {
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

const documentTabStyles = {
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

const documentTabIconStyles = {
    opacity: 0.5,
    height: '24px',
    width: '48px',
    transform: 'rotate(90deg)'
} as CSSProperties

const documentGridStyles = {
    height: '100%',
    width: '100%',
    gridTemplateAreas: `"header"
                          "body"`,
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto 1fr',
    borderRadius: "0 0 0 7px",
}  as CSSProperties

const documentHeaderStyles = {
    area: 'header',
    minWidth:0,
    borderRadius:'8px 8px 0 0',
    borderBottom:'1px solid silver',
}

const documentBodyStyles = {
    area: 'body',
    position: 'relative',
    overflow: 'auto',
    borderRadius: '0 0 0 7px',
    minWidth: 0,
} as CSSProperties

const DocumentHandle = (props) => {

    // handleAxis for handle selection - n/a here
    const { handleAxis, innerRef, ...rest } = props

    return (
        <Box 
            ref = {innerRef}
            id = 'handle'
            data-type = {'document-handle'} 
            style = {documentTabStyles} {...rest}>
            <img 
                draggable = "false" 
                style = {documentTabIconStyles} 
                src = {handleIcon} 
            />
        </Box>
    )
}

const DocumentPanel = forwardRef(function DocumentPanel(props:any, documentFrameElementRef:any) {
    const 
        // props
        {
            displayConfigCode, 
            userDocumentWidthRef, // userDocumentWidthRef informs "friends"
            // windowSessionID, 
            viewSelector, 
            profileData,
            documentData, 
            defaultDocumentState,
        } = props, 
        // context
        workboxInnerFrameWidthFromContext = useContext(WorkboxInnerFrameWidthContext),
        windowCallbackContext = useContext(WindowCallbackContext),
        // persistence
        documentPanelElementRef = useRef(null),
        centralPanelElementRef = useRef(null), // for direct config updates
        targetTimeoutRef = useRef(null),
        observerTimeoutRef = useRef(null),
        handleRef = useRef(null),
        constraintsRef = useRef({
            minX:MIN_COVER_FRAME_WIDTH,
            minY:documentFrameElementRef.current?.offsetHeight || 0,
            maxX:700,
            maxY:documentFrameElementRef.current?.offsetHeight || 0,
        }),
        windowCallbackContextRef = useRef(windowCallbackContext),
        // state
        [documentResizeWidth, setDocumentResizeWidth] = useState(userDocumentWidthRef.current[viewSelector]),
        [documentState, setDocumentState] = useState(defaultDocumentState),
        invalidStandardFieldFlagsRef = useRef({name:false, description:false,image:false,summary:false})

    // scope
    const
        workboxInnerFrameWidthFromContextRef = useRef(null),
        displayCodeRef = useRef(null),
        viewSelectorRef = useRef(null)

    workboxInnerFrameWidthFromContextRef.current = workboxInnerFrameWidthFromContext
    displayCodeRef.current = displayConfigCode
    viewSelectorRef.current = viewSelector

    // console.log('document profileData, documentData',profileData, documentData)

    useEffect(()=>{

        centralPanelElementRef.current = documentPanelElementRef.current.closest('#central-panel')
        handleRef.current = centralPanelElementRef.current.querySelector('#handle')

    },[])

    useEffect(()=>{

        const 
            viewWidth = userDocumentWidthRef.current[viewSelector],
            viewTrigger = viewSelector

        windowCallbackContextRef.current.changeView = ()=>{

            const constraints = {
                minX:MIN_COVER_FRAME_WIDTH,
                minY:documentFrameElementRef.current?.offsetHeight || 0,
                maxX: Math.min(
                    workboxInnerFrameWidthFromContextRef.current * MAX_COVER_FRAME_RATIO,
                    workboxInnerFrameWidthFromContextRef.current - MIN_CONTENTS_FRAME_WIDTH),
                maxY:documentFrameElementRef.current?.offsetHeight || 0,
            }
            constraintsRef.current = constraints

            const appliedWidth = Math.min(constraints.maxX, viewWidth)

            documentFrameElementRef.current.style.transition = 'width 0.3s'
            documentFrameElementRef.current.style.width = appliedWidth + 'px'
            userDocumentWidthRef.current[viewTrigger] = appliedWidth

            setTimeout(()=>{
                documentFrameElementRef.current.style.transition = 'none'
                setDocumentResizeWidth(appliedWidth)
            },300)

        }

    },[viewSelector])

    useEffect(()=>{

        if (workboxInnerFrameWidthFromContext === 0) return

        const centralPanelWidth = centralPanelElementRef.current.offsetWidth
        const documentWidth = 
            displayCodeRef.current == 'out'
                ? documentFrameElementRef.current.offsetWidth
                : userDocumentWidthRef.current[viewSelectorRef.current]

        clearTimeout(observerTimeoutRef.current)

        const calculatedMaxDocumentWidth = 
            Math.min(
                workboxInnerFrameWidthFromContext * MAX_COVER_FRAME_RATIO,
                workboxInnerFrameWidthFromContext - MIN_CONTENTS_FRAME_WIDTH)

        if (calculatedMaxDocumentWidth < documentWidth) {

            const newWidth = Math.max(MIN_COVER_FRAME_WIDTH, calculatedMaxDocumentWidth)

            if (documentFrameElementRef.current.style.transition != 'none') documentFrameElementRef.current.style.transition = 'none'
            displayCodeRef.current == 'out' && (documentFrameElementRef.current.style.width = newWidth + 'px')

            userDocumentWidthRef.current[viewSelectorRef.current] = newWidth

            if (documentFrameElementRef.current.style.transition == 'none') {
                setTimeout(()=>{
                    documentFrameElementRef.current.style.transition = 'width 0.5s'
                },1)
            }

            setDocumentResizeWidth(newWidth) // coerce render

        }

        const constraints = {
            minX:MIN_COVER_FRAME_WIDTH,
            minY:documentFrameElementRef.current?.offsetHeight || 0,
            maxX: calculatedMaxDocumentWidth,
            maxY:documentFrameElementRef.current?.offsetHeight || 0,
        }
        constraintsRef.current = constraints

    },[workboxInnerFrameWidthFromContext])

    useEffect(()=>{

        clearTimeout(targetTimeoutRef.current)

        const 
            element = documentPanelElementRef.current,
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
        documentFrameElementRef.current.style.transition = 'none'
        const constraints = {
            minX:MIN_COVER_FRAME_WIDTH,
            minY:documentFrameElementRef.current?.offsetHeight || 0,
            maxX: Math.min(
                workboxInnerFrameWidthFromContext * MAX_COVER_FRAME_RATIO,
                workboxInnerFrameWidthFromContext - MIN_CONTENTS_FRAME_WIDTH),
            maxY:documentFrameElementRef.current?.offsetHeight || 0,
        }
        constraintsRef.current = constraints

    }

    const onResize = (event, {size, handle}) => {

        documentFrameElementRef.current.style.width = size.width + 'px'
        setDocumentResizeWidth(size.width)

    }

    const onResizeStop = (e,{size, handle}) => {
        documentFrameElementRef.current.style.transition = 'width 0.5s'

        userDocumentWidthRef.current[viewSelectorRef.current] = size.width
        setDocumentResizeWidth(size.width)

    }

    return (
    <Resizable 
        data-inheritedtype = 'resizable' 
        handle = {

            (handleAxis, ref) => {
                return <DocumentHandle 
                    innerRef = {ref} 
                    handleAxis = {handleAxis}
                />}

        } 
        axis = 'x'
        height = {documentFrameElementRef.current?.offsetHeight || 0} 
        width = {documentResizeWidth}
        resizeHandles = {['e']}
        minConstraints = {[constraintsRef.current.minX,constraintsRef.current.minY]}
        maxConstraints = {[constraintsRef.current.maxX,constraintsRef.current.maxY]}
        onResizeStart = {onResizeStart}
        onResize = {onResize}
        onResizeStop = {onResizeStop}

    >
        <Box data-type = 'document-frame' ref = {documentFrameElementRef} style = {documentFrameStyles}>

            <Box data-type = 'document-panel' ref = {documentPanelElementRef} style = {documentPanelStyles}>

                <Grid
                    data-type = 'document-grid'
                    style = {documentGridStyles}
                >
                    <GridItem data-type = 'document-header' style = {documentHeaderStyles}>
                        <ToolbarFrame toolbarWrapperStyles = {{zIndex:500}}>
                            <DocumentToolbar 
                                documentState = {documentState} 
                                setDocumentState = {setDocumentState}
                                invalidStandardFieldFlagsRef = {invalidStandardFieldFlagsRef}
                            />
                        </ToolbarFrame>
                    </GridItem>
                    <GridItem data-type = 'document-body' style = {documentBodyStyles}>
                        <DocumentContent 
                            profileData = {profileData} 
                            documentData = {documentData} 
                            documentState = {documentState}
                            invalidStandardFieldFlagsRef = {invalidStandardFieldFlagsRef}
                        />
                    </GridItem>
                </Grid>

            </Box>
            
        </Box>
    </Resizable>)
})

export default DocumentPanel