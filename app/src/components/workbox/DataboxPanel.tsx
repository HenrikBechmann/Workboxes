// DataboxPanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { 
    useRef, 
    useEffect, 
    // useState, 
    // useCallback, 
    // useContext, 
    CSSProperties, 
    forwardRef 
} from 'react'

import {
    Box,
    Grid, GridItem,
} from '@chakra-ui/react'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import DataboxToolbar from '../toolbars/Toolbar_Databox'

const 
    MIN_CONTENTS_FRAME_WIDTH = 250,
    MIN_CONTENT_HEIGHT = 300

const contentsFrameStyles = {
    flex: '1 0 auto',
    width: 'auto',
    minWidth: MIN_CONTENTS_FRAME_WIDTH + 'px',
    minHeight: MIN_CONTENT_HEIGHT + 'px',
    position: 'relative',
    transition:'none', // set as needed
    transitionDelay:'unset',
    borderRadius:'8px',
    overflow: 'hidden',
} as CSSProperties

const contentsPanelStyles = {
    height:'100%',
    backgroundColor:'ghostwhite',
    position:'absolute', 
    width: '100%',
    // padding: '3px', 
    border: '5px ridge gray',
    borderRadius:'8px',
    overflow:'auto',
    transition:'box-shadow .3s',
    transitionDelay:'unset',
    boxShadow: 'none',
    boxSizing: 'border-box',
    left: 'auto',
    right: 0,
} as CSSProperties

const contentsGridStyles = {
    height: '100%',
    width: '100%',
    gridTemplateAreas: `"header"
                          "body"`,
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto 1fr',
    borderRadius: "0 0 0 7px",
}  as CSSProperties

const contentsHeaderStyles = {
    area: 'header',
    minWidth:0,
    borderRadius:'8px 8px 0 0',
    borderBottom:'1px solid silver',
}

const contentsBodyStyles = {
    area: 'body',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '0 0 0 7px',
    minWidth: 0,
} as CSSProperties

const DataboxPanel = forwardRef(function FoldersPanel(props:any, contentsFrameElementRef:any) {
    const 
        { children, displayConfigCode, databoxData } = props,
        contentsPanelElementRef = useRef(null),
        timeoutRef = useRef(null)

    // console.log('databoxData',databoxData)

    useEffect(()=>{

        clearTimeout(timeoutRef.current)

        const 
            element = contentsPanelElementRef.current,
            timeout = 500

        if (displayConfigCode == 'out') {

            timeoutRef.current = setTimeout(()=>{
                element.style.boxShadow = 'none'
            },timeout)

        } else if (displayConfigCode == 'over') {

            element.style.boxShadow = 'none'

        } else { // 'under'

            element.style.boxShadow = '3px 3px 6px 6px inset silver'

        }

    },[displayConfigCode])

    return <Box data-type = 'contents-frame' ref = {contentsFrameElementRef} style = {contentsFrameStyles}>
        <Box data-type = 'contents-panel' ref = {contentsPanelElementRef} style = {contentsPanelStyles}>
                <Grid
                    data-type = 'cover-grid'
                    style = {contentsGridStyles}
                >
                    <GridItem data-type = 'cover-header' style = {contentsHeaderStyles}>
                        <ToolbarFrame toolbarWrapperStyles = {{zIndex:500}}>
                            <DataboxToolbar />
                        </ToolbarFrame>
                    </GridItem>
                    <GridItem data-type = 'cover-body' style = {contentsBodyStyles}>
                        {children}
                    </GridItem>
                </Grid>
        </Box>
    </Box>
})

export default DataboxPanel