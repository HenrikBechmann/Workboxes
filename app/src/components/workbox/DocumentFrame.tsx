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

import { useWorkboxHandler } from './Workbox'

import DocumentContent from '../documentUI/DocumentContent'

import handleIcon from '../../../assets/handle.png'

const 
    MIN_PRIMARY_FRAME_HEIGHT = 300,
    MIN_DOCUMENT_FRAME_WIDTH = 250,
    MAX_DOCUMENT_FRAME_RATIO = 0.75,
    MIN_ITEMLIST_FRAME_WIDTH = 250

const documentFrameStyles = {
    flex: '0 0 auto',
    width: '300px',
    minWidth: MIN_DOCUMENT_FRAME_WIDTH + 'px',
    minHeight: MIN_PRIMARY_FRAME_HEIGHT + 'px',
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

const DocumentFrame = forwardRef(function DocumentFrame(props:any, documentFrameElementRef:any) {
    const 
        // props
        {
            displayCode, 
            // UIDocumentWidthRef, // UIDocumentWidthRef informs "friends"
            // windowSessionID, 
            viewSetting, 
            profileData,
            documentData, 
            defaultDocumentState,
        } = props, 
        // context
        UIDocumentWidthRef = useRef(null),
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        // persistence
        documentPanelElementRef = useRef(null),
        primaryFrameElementRef = useRef(null), // for direct config updates
        targetTimeoutRef = useRef(null),
        observerTimeoutRef = useRef(null),
        handleRef = useRef(null),
        constraintsRef = useRef({
            minX:MIN_DOCUMENT_FRAME_WIDTH,
            minY:documentFrameElementRef.current?.offsetHeight || 0,
            maxX:700,
            maxY:documentFrameElementRef.current?.offsetHeight || 0,
        }),
        // windowCallbacksRef = useRef(w),
        // state
        [documentConfig, setDocumentState] = useState(defaultDocumentState),
        invalidStandardFieldFlagsRef = useRef({name:false, description:false,image:false,summary:false})

    // scope
    const
        workboxInnerFrameWidthRef = useRef(null),
        displayCodeRef = useRef(null),
        viewSettingRef = useRef(null)

    UIDocumentWidthRef.current = workboxHandler.dimensions.UIDocumentWidth
    const
        [documentResizeWidth, setDocumentResizeWidth] = useState(UIDocumentWidthRef.current[viewSetting])

    workboxInnerFrameWidthRef.current = workboxHandler.dimensions.innerFrameWidth
    displayCodeRef.current = displayCode
    viewSettingRef.current = viewSetting

    // console.log('document profileData, documentData',profileData, documentData)

    useEffect(()=>{

        primaryFrameElementRef.current = documentPanelElementRef.current.closest('#primary-frame')
        handleRef.current = primaryFrameElementRef.current.querySelector('#handle')

    },[])

    // useEffect(()=>{

    //     const 
    //         viewWidth = UIDocumentWidthRef.current[viewSetting],
    //         viewTrigger = viewSetting

        // windowCallbackContextRef.current.changeView = () => {

        //     const constraints = {
        //         minX:MIN_DOCUMENT_FRAME_WIDTH,
        //         minY:documentFrameElementRef.current?.offsetHeight || 0,
        //         maxX: Math.min(
        //             workboxInnerFrameWidthRef.current * MAX_DOCUMENT_FRAME_RATIO,
        //             workboxInnerFrameWidthRef.current - MIN_ITEMLIST_FRAME_WIDTH),
        //         maxY:documentFrameElementRef.current?.offsetHeight || 0,
        //     }
        //     constraintsRef.current = constraints

        //     const appliedWidth = Math.min(constraints.maxX, viewWidth)

        //     documentFrameElementRef.current.style.transition = 'width 0.3s'
        //     documentFrameElementRef.current.style.width = appliedWidth + 'px'
        //     UIDocumentWidthRef.current[viewTrigger] = appliedWidth

        //     setTimeout(()=>{
        //         documentFrameElementRef.current.style.transition = 'none'
        //         setDocumentResizeWidth(appliedWidth)
        //     },300)

        // }

    // },[viewSetting])

    // useEffect(()=>{

    //     const primaryFrameWidth = primaryFrameElementRef.current.offsetWidth
    //     if (primaryFrameWidth === 0) return

    //     const documentWidth = 
    //         displayCodeRef.current == 'out'
    //             ? documentFrameElementRef.current.offsetWidth
    //             : UIDocumentWidthRef.current[viewSettingRef.current]

    //     clearTimeout(observerTimeoutRef.current)

    //     const calculatedMaxDocumentWidth = 
    //         Math.min(
    //             primaryFrameWidth * MAX_DOCUMENT_FRAME_RATIO,
    //             primaryFrameWidth - MIN_ITEMLIST_FRAME_WIDTH)

    //     if (calculatedMaxDocumentWidth < documentWidth) {

    //         const newWidth = Math.max(MIN_DOCUMENT_FRAME_WIDTH, calculatedMaxDocumentWidth)

    //         if (documentFrameElementRef.current.style.transition != 'none') documentFrameElementRef.current.style.transition = 'none'
    //         displayCodeRef.current == 'out' && (documentFrameElementRef.current.style.width = newWidth + 'px')

    //         UIDocumentWidthRef.current[viewSettingRef.current] = newWidth

    //         if (documentFrameElementRef.current.style.transition == 'none') {
    //             setTimeout(()=>{
    //                 documentFrameElementRef.current.style.transition = 'width 0.5s'
    //             },1)
    //         }

    //         setDocumentResizeWidth(newWidth) // coerce render

    //     }

    //     const constraints = {
    //         minX:MIN_DOCUMENT_FRAME_WIDTH,
    //         minY:documentFrameElementRef.current?.offsetHeight || 0,
    //         maxX: calculatedMaxDocumentWidth,
    //         maxY:documentFrameElementRef.current?.offsetHeight || 0,
    //     }
    //     constraintsRef.current = constraints

    // },[workboxHandler])

    useEffect(()=>{

        clearTimeout(targetTimeoutRef.current)

        const 
            element = documentPanelElementRef.current,
            timeout = 500

        if (displayCode == 'out') {

            targetTimeoutRef.current = setTimeout(()=>{
                element.style.boxShadow = 'none'
                handleRef.current.style.opacity = 0.8
                handleRef.current.style.visibility = 'visible'
            },timeout)

        } else if (displayCode == 'over') {

            element.style.boxShadow = 'none'
            handleRef.current.style.opacity = 0
            handleRef.current.style.visibility = 'hidden'

        } else { // 'under'

            element.style.boxShadow = '3px 3px 6px 6px inset silver'
            handleRef.current.style.opacity = 0
            handleRef.current.style.visibility = 'hidden'

        }

    },[displayCode])

    // resizable callbacks...
    const onResizeStart = () => {
        documentFrameElementRef.current.style.transition = 'none'
        const primaryFrameWidth = primaryFrameElementRef.current.offsetWidth
        const constraints = {
            minX:MIN_DOCUMENT_FRAME_WIDTH,
            minY:documentFrameElementRef.current?.offsetHeight || 0,
            maxX: Math.min(
                primaryFrameWidth * MAX_DOCUMENT_FRAME_RATIO,
                primaryFrameWidth - MIN_ITEMLIST_FRAME_WIDTH),
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

        UIDocumentWidthRef.current[viewSettingRef.current] = size.width
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
        width = {300/*documentResizeWidth*/}
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
                                documentConfig = {documentConfig} 
                                setDocumentState = {setDocumentState}
                                invalidStandardFieldFlagsRef = {invalidStandardFieldFlagsRef}
                            />
                        </ToolbarFrame>
                    </GridItem>
                    <GridItem data-type = 'document-body' style = {documentBodyStyles}>
                        <DocumentContent 
                            profileData = {profileData} 
                            documentData = {documentData} 
                            documentConfig = {documentConfig}
                            invalidStandardFieldFlagsRef = {invalidStandardFieldFlagsRef}
                        />
                    </GridItem>
                </Grid>

            </Box>
            
        </Box>
    </Resizable>)
})

export default DocumentFrame