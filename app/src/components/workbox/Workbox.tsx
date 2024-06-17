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

export const WorkboxHandlerContext = createContext(null)
import { WORKBOX_CONTENT_TOTAL_PADDING_WIDTH } from './WorkboxContent'

import WorkboxHandler from '../../classes/WorkboxHandler'

import { ViewSettingContext } from '../workholders/Workwindow'

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

export const useWorkboxHandler = () => {

    const 
        workboxHandlerContext = useContext(WorkboxHandlerContext),
        workboxHandler = workboxHandlerContext.current,
        { setWorkboxHandlerContext } = workboxHandler,
        dispatchWorkboxHandler = (trigger?) => {
            workboxHandler.trigger = trigger
            const newWorkboxHandlerContext = {...workboxHandlerContext} // coerce dispatch
            setWorkboxHandlerContext(newWorkboxHandlerContext)
        }

    return [workboxHandler, dispatchWorkboxHandler]

}

const Workbox = (props) => {
    const 
        { workboxSettings } = props,
        workboxID = workboxSettings.id,

        [workboxState, setWorkboxState] = useState('setup'),
        [workboxConfig, setWorkboxConfig] = useState(null),

        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        viewSettingContext = useContext(ViewSettingContext), // to pass to content component
        [workboxHandlerContext, setWorkboxHandlerContext] = useState({ current: null }),
        
        workboxFrameElementRef = useRef(null),
        [workboxInnerFrameWidth, setWorkboxInnerFrameWidth] = useState(0),

        {workbox:contentSettings, document:documentSettings, itemlist: itemlistSettings} = workboxSettings,

        { profile, document, itemlist } = workboxSettings,
        { name:itemName } = profile.workbox,
        { source:itemIcon } = profile.workbox.image,
        { name:domainName } = profile.domain,
        { source:domainIcon } = profile.domain.image,
        { name:typeName } = profile.type

    useEffect(()=>{

        setWorkboxHandlerContext({current:new WorkboxHandler(workboxID)})
        setWorkboxState('ready')

    },[])

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


    return <WorkboxHandlerContext.Provider value = {workboxHandlerContext} >
    <Grid
        data-type = 'workbox-grid'
        style = {workboxGridStyles}
    >
        <GridItem data-type = 'workbox-header' style = {workboxHeaderStyles}>
            <ToolbarFrame scrollerStyles = {{margin:'auto'}}>
                {(workboxState == 'ready') && <WorkboxToolbar 
                    workboxConfig = {workboxConfig} 
                    setWorkboxState = {setWorkboxState} 
                    itemTitle = {itemName}
                    itemIcon = {itemIcon} 
                    domainTitle = {domainName}
                    domainIcon = {domainIcon}
                    typeName = {typeName}
                />}
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'workbox-body' style = {workboxBodyStyles}>
            <Box data-type = 'workbox-frame' ref = {workboxFrameElementRef} style = {workboxFrameStyles} >
                {(workboxState == 'ready') && <WorkboxContent 
                    viewSetting = {viewSettingContext} 
                    workboxConfig = {workboxConfig} 
                    profileData = {profile}
                    documentData = {document}
                    itemlistData = {itemlist}
                    defaultDocumentState = {contentSettings.document}
                    defaultItemlistState = {contentSettings.Itemlist}
                />}
            </Box>
        </GridItem>
    </Grid>
    </WorkboxHandlerContext.Provider>
}

export default Workbox