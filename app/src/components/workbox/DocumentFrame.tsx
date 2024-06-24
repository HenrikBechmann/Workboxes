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

const documentGridHeaderStyles = {
    area: 'header',
    minWidth:0,
    borderRadius:'8px 8px 0 0',
    borderBottom:'1px solid silver',
}

const documentGridBodyStyles = {
    area: 'body',
    position: 'relative',
    overflow: 'auto',
    borderRadius: '0 0 0 7px',
    minWidth: 0,
} as CSSProperties

const DocumentHandle = (props) => {

    // handleAxis for handle selection - n/a here
    const { handleAxis, innerRef, ...handleAttributes } = props

    return (
        <Box 
            ref = {innerRef}
            id = 'handle'
            data-type = {'document-handle'} 
            style = {documentTabStyles} {...handleAttributes}>
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
        // context
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        displayCode = workboxHandler.settings.configuration.document.displaycode, // out, over, under

        // elements
        documentPanelElementRef = useRef(null),
        primaryFrameElementRef = useRef(null), // for direct config updates
        handleElementRef = useRef(null),

        // timeouts
        targetTimeoutRef = useRef(null),
        observerTimeoutRef = useRef(null),

        // Resizable constraints
        constraintsRef = useRef({
            minX:MIN_DOCUMENT_FRAME_WIDTH,
            minY:documentFrameElementRef.current?.offsetHeight || 0,
            maxX:700,
            maxY:documentFrameElementRef.current?.offsetHeight || 0,
        }),
        // persistence
        invalidStandardFieldFlagsRef = useRef({name:false, description:false,image:false,summary:false}),
        // state
        [documentConfig, setDocumentConfig] = useState(workboxHandler.settings.configuration.document),
        [UIDocumentWidth, setUIDocumentWidth] = useState(workboxHandler.dimensions.UIDocumentWidth)

    useEffect(()=>{

        primaryFrameElementRef.current = documentPanelElementRef.current.closest('#primary-frame')
        handleElementRef.current = primaryFrameElementRef.current.querySelector('#handle')

    },[])

    useEffect(()=>{

        clearTimeout(targetTimeoutRef.current)

        const 
            element = documentPanelElementRef.current,
            TIMEOUT = 500

        if (displayCode == 'out') {

            targetTimeoutRef.current = setTimeout(()=>{
                element.style.boxShadow = 'none'
                handleElementRef.current.style.opacity = 0.8
                handleElementRef.current.style.visibility = 'visible'
            },TIMEOUT)

        } else if (displayCode == 'over') {

            element.style.boxShadow = 'none'
            handleElementRef.current.style.opacity = 0
            handleElementRef.current.style.visibility = 'hidden'

        } else { // 'under'

            element.style.boxShadow = '3px 3px 6px 6px inset silver'
            handleElementRef.current.style.opacity = 0
            handleElementRef.current.style.visibility = 'hidden'

        }

    },[displayCode])

    // Resizable callbacks...
    const onResizeStart = () => {
        documentFrameElementRef.current.style.transition = 'none'
        const primaryFrameWidth = primaryFrameElementRef.current.offsetWidth
        const constraints = {
            minX:MIN_DOCUMENT_FRAME_WIDTH,
            minY:documentFrameElementRef.current.offsetHeight,
            maxX: Math.min(
                primaryFrameWidth * MAX_DOCUMENT_FRAME_RATIO,
                primaryFrameWidth - MIN_ITEMLIST_FRAME_WIDTH),
            maxY:documentFrameElementRef.current.offsetHeight,
        }
        constraintsRef.current = constraints

    }

    const onResize = (event, {size, handle}) => {

        documentFrameElementRef.current.style.width = size.width + 'px'
        setUIDocumentWidth(size.width)

    }

    const onResizeStop = (e,{size, handle}) => {
        documentFrameElementRef.current.style.transition = 'width 0.5s'

        workboxHandler.dimensions.UIDocumentWidth = size.width
        workboxHandler.dimensions.UIDocumentWidthRatio = 
            workboxHandler.dimensions.UIDocumentWidth/workboxHandler.dimensions.primaryFrameWidth
        setUIDocumentWidth(size.width)

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
        width = {UIDocumentWidth}
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
                    <GridItem data-type = 'document-header' style = {documentGridHeaderStyles}>
                        <ToolbarFrame toolbarWrapperStyles = {{zIndex:500}}>
                            <DocumentToolbar 
                                documentConfig = {documentConfig} 
                                setDocumentConfig = {setDocumentConfig}
                                invalidStandardFieldFlagsRef = {invalidStandardFieldFlagsRef}
                            />
                        </ToolbarFrame>
                    </GridItem>
                    <GridItem data-type = 'document-body' style = {documentGridBodyStyles}>
                        <DocumentContent                             documentConfig = {documentConfig}
                            invalidStandardFieldFlagsRef = {invalidStandardFieldFlagsRef}
                        />
                    </GridItem>
                </Grid>

            </Box>
            
        </Box>
    </Resizable>)
})

export default DocumentFrame