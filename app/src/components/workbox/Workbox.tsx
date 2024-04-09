// Workbox.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, createContext, CSSProperties, useContext } from 'react'

import {
    Box,
    Grid, GridItem
} from '@chakra-ui/react'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import WorkboxToolbar from '../toolbars/Toolbar_Workbox'
import WorkboxContent from './WorkboxContent'

export const WorkboxInnerFrameWidthContext = createContext(null)
import { WORKBOX_CONTENT_TOTAL_PADDING_WIDTH } from './WorkboxContent'

import { ViewSelectorContext } from '../Workwindow'

const workboxFrameStyles = {
    position:'absolute',
    inset:0,
    overflow:'auto',
    borderRadius: '0 0 0 7px'
} as CSSProperties

const workboxGridStyles = {
    height: '100%',
    width: '100%',
    gridTemplateAreas: `"header"
                          "body"`,
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto 1fr',
    borderRadius: "0 0 0 7px",
}  as CSSProperties

const workboxHeaderStyles = {
    area: 'header',
    minWidth:0,
}

const workboxBodyStyles = {
    area: 'body',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '0 0 0 7px',
    minWidth: 0,
} as CSSProperties

const Workbox = (props) => {
    const 
        {
            sessionWindowID,
            defaultWorkboxState,
            defaultDocumentState,
            defaultDataboxState,
            data,

        } = props,
        viewSelectorContext = useContext(ViewSelectorContext), // to pass to content component
        [workboxState, setWorkboxState] = useState({...defaultWorkboxState}),
        workboxFrameElementRef = useRef(null),
        [workboxInnerFrameWidth, setWorkboxInnerFrameWidth] = useState(0),
        { profile:profileData, document:documentData, databox:databoxData } = data,
        { itemName, itemIcon, domainName, domainIcon, typeName } = profileData

    // console.log('data', '-'+sessionWindowID+'-',data)

    // update the width of this panel on resize
    const resizeObserverCallback = useCallback(()=> {

        const workboxInnerFrameWidth = workboxFrameElementRef.current.offsetWidth - WORKBOX_CONTENT_TOTAL_PADDING_WIDTH

        setWorkboxInnerFrameWidth(workboxInnerFrameWidth)

    },[])

    // setup and shutdown resizeObserver
    useEffect(()=>{

        const observer = new ResizeObserver(resizeObserverCallback)
        observer.observe(workboxFrameElementRef.current)

        return () => {
            observer.disconnect()
        }

    },[])


    return <WorkboxInnerFrameWidthContext.Provider value = {workboxInnerFrameWidth} >
    <Grid
        data-type = 'workbox-grid'
        style = {workboxGridStyles}
    >
        <GridItem data-type = 'workbox-header' style = {workboxHeaderStyles}>
            <ToolbarFrame scrollerStyles = {{margin:'auto'}}>
                <WorkboxToolbar 
                    workboxState = {workboxState} 
                    setWorkboxState = {setWorkboxState} 
                    itemTitle = {itemName}
                    itemIcon = {itemIcon} 
                    domainTitle = {domainName}
                    domainIcon = {domainIcon}
                    typeName = {typeName}
                />
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'workbox-body' style = {workboxBodyStyles}>
            <Box data-type = 'workbox-frame' ref = {workboxFrameElementRef} style = {workboxFrameStyles} >
                <WorkboxContent 
                    viewSelector = {viewSelectorContext} 
                    sessionWindowID = {sessionWindowID} 
                    workboxState = {workboxState} 
                    profileData = {profileData}
                    documentData = {documentData}
                    databoxData = {databoxData}
                    defaultDocumentState = {defaultDocumentState}
                    defaultDataboxState = {defaultDataboxState}
                />
            </Box>
        </GridItem>
    </Grid>
    </WorkboxInnerFrameWidthContext.Provider>
}

export default Workbox