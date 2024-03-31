// SettingsPanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { 
    useRef, 
    useEffect, 
    // useState, 
    // useCallback, 
    // useContext, 
    CSSProperties, 
    // forwardRef 
} from 'react'

import {
    Box
} from '@chakra-ui/react'

const settingsFrameStyles = {
    flex: '0 0 auto',
    width:'0px',
    overflow:'hidden',
    position:'relative',
    transition: 'width 0.5s',
    borderRadius: '8px',
} as CSSProperties

const settingsPanelStyles = {
    border:'5px ridge saddlebrown',
    borderRadius:'8px',
    overflow:'auto',
    padding:'3px',
    boxSizing:'border-box',
    height: '100%',
    width:'300px',
    position:'absolute',
    left:0,
    transition:'box-shadow .3s',
    boxShadow: '3px 3px 6px 6px inset silver'
} as CSSProperties

const SettingsPanel = (props) => {
    const
        { showPanel, children } = props,
        settingsPanelElementRef = useRef(null),
        settingsFrameElementRef = useRef(null),
        showTimeoutRef = useRef(null),
        hideTimeoutRef = useRef(null)

    useEffect(()=>{
        const 
            frameElement = settingsFrameElementRef.current,
            panelElement = settingsPanelElementRef.current,
            showTimeout = 500,
            hideTimeout = 300

        clearTimeout(showTimeoutRef.current)

        if (showPanel) {

            const 
                contentWidth = panelElement.offsetWidth
                frameElement.style.width = contentWidth + 'px'

            showTimeoutRef.current = setTimeout(()=>{
                panelElement.style.boxShadow = 'none'
            },showTimeout)

        } else { // hide

            panelElement.style.boxShadow = '3px 3px 6px 6px inset silver'

            hideTimeoutRef.current = setTimeout(()=>{
                frameElement.style.width = 0
            },hideTimeout)

        }

    },[showPanel])

    return <Box 
        data-type = 'settings-frame' 
        ref = {settingsFrameElementRef} 
        style = {settingsFrameStyles} 
    >
        <Box 
            data-type = 'settings-panel' 
            ref = {settingsPanelElementRef} 
            style = {settingsPanelStyles}
        >
            {children}
        </Box>
    </Box>
}

export default SettingsPanel
