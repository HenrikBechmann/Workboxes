// WorkboxPanels.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useEffect, CSSProperties, forwardRef } from 'react'

import {
    Box
} from '@chakra-ui/react'

const MIN_PANEL_FRAME_WIDTH = '300px'
const MIN_CENTRAL_FRAME_WIDTH = '590px'

const centralPanelStyles = {
    height:'100%',
    borderRadius:'8px',
    backgroundColor:'transparent', 
    position:'relative',
    display:'flex',
    flexWrap: 'nowrap',
    flex: '1 0 auto',
    minWidth: MIN_CENTRAL_FRAME_WIDTH,
    transition:'width .5s', 
    boxSizing: 'border-box',
} as CSSProperties

const coverFrameStyles = {
    flex: '0 0 auto',
    width: '300px',
    position: 'relative',
    overflow: 'hidden',
    transition:'width .5s', 
    transitionDelay:'unset',
    borderRadius:'8px',
} as CSSProperties

const coverPanelStyles = {
    height:'100%',
    backgroundColor:'ghostwhite',
    position:'absolute', 
    width:'100%',
    padding: '3px', 
    border: '5px ridge gray',
    borderRadius:'8px',
    transition:'box-shadow .5s',
    boxShadow: 'none',
    boxSizing: 'border-box',
} as CSSProperties

const contentsFrameStyles = {
    flex: '1 0 auto',
    width: 'auto',
    position: 'relative',
    overflow: 'hidden',
    transition:'width .5s',
    transitionDelay:'unset',
    borderRadius:'8px',
} as CSSProperties

const contentsPanelStyles = {
    height:'100%',
    backgroundColor:'ghostwhite',
    position:'absolute', 
    width: '100%',
    padding: '3px', 
    border: '5px ridge gray',
    borderRadius:'8px',
    overflow:'auto',
    transition:'box-shadow .5s',
    boxShadow: 'none',
    boxSizing: 'border-box',
    right: 0,
} as CSSProperties

// ================

const settingsPanelStyles = {
    height: '100%',
    width:'0px',
    overflow:'hidden',
    position:'relative',
    transition: 'width 0.5s ease-in-out, opacity 0.5s ease-in-out'
} as CSSProperties

const settingsContentStyles = {
    display:'block', 
    border:'5px solid silver',
    borderRadius:'8px',
    padding:'3px',
    boxSizing:'border-box',
    height: '100%',
    width:'300px',
    position:'relative',
} as CSSProperties

const mirrorPanelStyles = {
    height: '100%',
    width:'0px',
    overflow:'hidden',
    position:'relative',
    transition: 'width .5s ease-in-out, opacity .5s ease-in-out'
} as CSSProperties

const mirrorContentStyles = {
    display:'block', 
    border:'5px solid silver',
    borderRadius:'8px',
    padding:'3px',
    boxSizing:'border-box',
    height: '100%',
    width:'300px',
    position:'relative',
} as CSSProperties


export const CentralPanel = (props) => {

    const 
        { children, displayCode, workboxContentElementRef, workboxPaddingCount, coverFrameElementRef, contentsFrameElementRef } = props,
        previousDisplayCodeRef = useRef(displayCode),
        centralPanelElementRef = useRef(null),
        firstTimeoutRef = useRef(null)

    useEffect(()=>{

        const 
            centralFrameElement = centralPanelElementRef.current,
            coverFrameElement = coverFrameElementRef.current,
            contentsFrameElement = contentsFrameElementRef.current

        let timeout = 500, transitionDelay = 'unset'

        clearTimeout(firstTimeoutRef.current)

        if (displayCode == 'both') {

            // no delay
            if (previousDisplayCodeRef.current == 'contents') {

                coverFrameElement.firstChild.style.width = '300px'

            } else {

                contentsFrameElement.firstChild.style.width = (centralFrameElement.offsetWidth - 300) + 'px'

            }

            // freeze central frame
            centralFrameElement.style.width = centralFrameElement.offsetWidth + 'px'
            centralFrameElement.style.flex = '0 0 auto'

            // freeeze cover
            coverFrameElement.style.width = coverFrameElement.offsetWidth + 'px'
            coverFrameElement.style.flex = '0 0 auto'

            // freeze contents
            contentsFrameElement.style.width = contentsFrameElement.offsetWidth + 'px'
            contentsFrameElement.style.flex = '0 0 auto'

            // set targets
            coverFrameElement.style.width = '300px'
            contentsFrameElement.style.width = (centralFrameElement.offsetWidth - 300) + 'px'

            // wait for result
            firstTimeoutRef.current = setTimeout(()=>{

                // restore settings for frames
                contentsFrameElement.style.flex = '1 0 auto'
                contentsFrameElement.style.width = 'auto'

                centralFrameElement.style.flex = '1 0 auto'
                centralFrameElement.style.width = 'auto'

                // restore panels
                coverFrameElement.firstChild.style.width = '100%'
                contentsFrameElement.firstChild.style.width = '100%'

            },timeout)

        } else if (displayCode == 'cover') {

            if (previousDisplayCodeRef.current == 'contents') {

                // no delay
                coverFrameElement.firstChild.style.width = centralFrameElement.offsetWidth + 'px'

            } else { // previous is 'both'
                // delay to establish shadow
                transitionDelay = '0.3s'
                coverFrameElement.style.transitionDelay = transitionDelay
                contentsFrameElement.style.transitionDelay = transitionDelay

            }

            // freeze central frame
            centralFrameElement.style.width = centralFrameElement.offsetWidth + 'px'
            centralFrameElement.style.flex = '0 0 auto'

            // freeze contents frame
            contentsFrameElement.style.width = contentsFrameElement.offsetWidth + 'px'
            contentsFrameElement.style.flex = '0 0 auto'

            // freeze contents panel
            contentsFrameElement.firstChild.style.width = contentsFrameElement.firstChild.offsetWidth + 'px'

            // set targets
            contentsFrameElement.style.width = 0
            coverFrameElement.style.width = centralFrameElement.offsetWidth + 'px'

            // wait for result
            firstTimeoutRef.current = setTimeout(()=>{

                if (transitionDelay != 'unset') {
                    coverFrameElement.style.transitionDelay = 'unset'
                    contentsFrameElement.style.transitionDelay = 'unset'
                }

                // restore values for frames
                coverFrameElement.style.width = '100%'
                coverFrameElement.style.flex = '1 0 auto'

                centralFrameElement.style.width = 'auto'
                centralFrameElement.style.flex = '1 0 auto'

                // restore panels
                coverFrameElement.firstChild.style.width = '100%'


            },timeout)

        } else { // displayCode == 'contents'

            if (previousDisplayCodeRef.current == 'cover') {

                // no delay
                contentsFrameElement.firstChild.style.width = centralFrameElement.offsetWidth + 'px'

            } else { // previous is 'both'

                // delay to establish shadow
                transitionDelay = '0.3s'
                coverFrameElement.style.transitionDelay = transitionDelay
                contentsFrameElement.style.transitionDelay = transitionDelay

                contentsFrameElement.style.width = contentsFrameElement.offsetWidth + 'px'

            }

            // freeze central frame
            centralFrameElement.style.width = centralFrameElement.offsetWidth + 'px'
            centralFrameElement.style.flex = '0 0 auto'

            // freeeze cover frame
            coverFrameElement.style.width = coverFrameElement.offsetWidth + 'px'
            coverFrameElement.style.flex = '0 0 auto'

            // freeze cover panel
            coverFrameElement.firstChild.style.width = coverFrameElement.firstChild.offsetWidth + 'px'

            // set targets
            contentsFrameElement.style.width = centralFrameElement.offsetWidth + 'px'
            coverFrameElement.style.width = 0

            // wait for result
            firstTimeoutRef.current = setTimeout(()=>{

                if (transitionDelay != 'unset') {
                    coverFrameElement.style.transitionDelay = 'unset'
                    contentsFrameElement.style.transitionDelay = 'unset'
                }

                // restore values for frames
                contentsFrameElement.style.width = '100%'

                centralFrameElement.style.width = 'auto'
                centralFrameElement.style.flex = '1 0 auto'

                // restore panels
                contentsFrameElement.firstChild.style.width = '100%'

            },timeout)
        }

        previousDisplayCodeRef.current = displayCode

    },[displayCode])

    return <Box ref = {centralPanelElementRef} data-type = 'central-panel' style = {centralPanelStyles}>{children}</Box>
}

export const CoverPanel = forwardRef(function DocumentPanel(props:any, coverFrameElementRef:any) {
    const 
        { children, displayCode } = props,
        previousDisplayCodeRef = useRef(displayCode),
        coverPanelElementRef = useRef(null),
        targetTimeoutRef = useRef(null)

    useEffect(()=>{

        return

        clearTimeout(targetTimeoutRef.current)

        const element = coverPanelElementRef.current

        let timeout = 500

        element.style.transitionDelay = 'unset'

        // const previousTransition = element.style.transition
        if (displayCode == 'out') {

            if (previousDisplayCodeRef.current == 'under') {

                // element.style.transition = 'none'
                element.style.boxShadow = '3px 3px 6px 6px inset silver'

            }

            targetTimeoutRef.current = setTimeout(()=>{
                element.style.transitionDelay = '.5s'
                element.style.boxShadow = 'none'
            },timeout)

        } else if (displayCode == 'over') {


        } else { // 'under'

            element.style.boxShadow = '3px 3px 6px 6px inset silver'

            targetTimeoutRef.current = setTimeout(()=>{
                element.style.transitionDelay = '.5s'
                element.style.boxShadow = 'none'
            },timeout)

        }

        previousDisplayCodeRef.current = displayCode

    },[displayCode])

    return <Box data-type = 'cover-frame' ref = {coverFrameElementRef} style = {coverFrameStyles}>

        <Box data-type = 'cover-panel' ref = {coverPanelElementRef} style = {coverPanelStyles}>{children}</Box>
        
    </Box>
})

export const ContentsPanel = forwardRef(function FoldersPanel(props:any, contentsFrameElementRef:any) {
    const 
        { children, displayCode } = props,
        previousDisplayCodeRef = useRef(displayCode),
        contentsPanelElementRef = useRef(null),
        targetTimeoutRef = useRef(null)

    useEffect(()=>{

        return

        clearTimeout(targetTimeoutRef.current)

        const element = contentsPanelElementRef.current

        let timeout = 500

        element.style.transitionDelay = 'unset'

        if (displayCode == 'out') {

            if (previousDisplayCodeRef.current == 'under') {

                // element.style.transition = 'none'
                element.style.boxShadow = '3px 3px 6px 6px inset silver'

            }

            targetTimeoutRef.current = setTimeout(()=>{
                element.style.transitionDelay = '.5s'
                // element.style.transition = previousTransition
                element.style.boxShadow = 'none'
            },timeout)

        } else if (displayCode == 'over') {


        } else { // 'under'

            element.style.boxShadow = '3px 3px 6px 6px inset silver'

            targetTimeoutRef.current = setTimeout(()=>{
                element.style.transitionDelay = '.5s'
                element.style.boxShadow = 'none'
            },timeout)

        }

        previousDisplayCodeRef.current = displayCode

    },[displayCode])

    return <Box data-type = 'contents-frame' ref = {contentsFrameElementRef} style = {contentsFrameStyles}>
        <Box data-type = 'contents-panel' ref = {contentsPanelElementRef} style = {contentsPanelStyles}> {children}</Box>
    </Box>
})

// ==========================

export const SettingsPanel = (props) => {
    const
        {showPanel, children} = props,
        localPropertiesPanelStylesRef = useRef(settingsPanelStyles),
        contentRef = useRef(null),
        panelRef = useRef(null),
        previousTransitioningValueRef = useRef(showPanel),
        transitioningCountRef = useRef(0),
        firstTimeoutRef = useRef(null),
        secondTimeoutRef = useRef(null),
        thirdTimeoutRef = useRef(null)

    if (showPanel !== previousTransitioningValueRef.current) {
        transitioningCountRef.current++
        clearTimeout(firstTimeoutRef.current)
        clearTimeout(secondTimeoutRef.current)
        clearTimeout(thirdTimeoutRef.current)
    }
    previousTransitioningValueRef.current = showPanel

    useEffect(()=>{

        const contentWidth = contentRef.current.offsetWidth
        panelRef.current.style.width = contentWidth + 'px'
        if (!showPanel) {
            firstTimeoutRef.current = setTimeout(()=>{
                panelRef.current.style.width = '0px'
                panelRef.current.style.opacity = 0
                secondTimeoutRef.current = setTimeout(()=>{
                    localPropertiesPanelStylesRef.current = {...localPropertiesPanelStylesRef.current,width:'0px',opacity:0}
                },500)
            },50) // time for base to set
        } else {
            panelRef.current.style.opacity = 1
            thirdTimeoutRef.current = setTimeout(()=>{
                panelRef.current.style.width = 'auto'
                panelRef.current.style.opacity = 1
                localPropertiesPanelStylesRef.current = {...localPropertiesPanelStylesRef.current,width:'auto',opacity:1}
            },500)
        }

    },[showPanel, transitioningCountRef.current])

    return <Box data-type = 'settings-panel' ref = {panelRef} style = {localPropertiesPanelStylesRef.current} >
        <Box data-type = 'settings-content' ref = {contentRef} style = {settingsContentStyles}>
            {children}
        </Box>
    </Box>
}

export const MirrorPanel = (props) => {
    const
        {showPanel, children} = props,
        localMirrorPanelStylesRef = useRef(mirrorPanelStyles),
        contentRef = useRef(null),
        panelRef = useRef(null),
        previousTransitioningValueRef = useRef(showPanel),
        transitioningCountRef = useRef(0),
        firstTimeoutRef = useRef(null),
        secondTimeoutRef = useRef(null),
        thirdTimeoutRef = useRef(null)

    if (showPanel !== previousTransitioningValueRef.current) {
        transitioningCountRef.current++
        clearTimeout(firstTimeoutRef.current)
        clearTimeout(secondTimeoutRef.current)
        clearTimeout(thirdTimeoutRef.current)
    }
    previousTransitioningValueRef.current = showPanel

    useEffect(()=>{

        const contentWidth = contentRef.current.offsetWidth
        panelRef.current.style.width = contentWidth + 'px'
        if (!showPanel) {
            firstTimeoutRef.current = setTimeout(()=>{
                panelRef.current.style.width = '0px'
                panelRef.current.style.opacity = 0
                secondTimeoutRef.current = setTimeout(()=>{
                    localMirrorPanelStylesRef.current = {...localMirrorPanelStylesRef.current,width:'0px',opacity:0}
                },500)
            },50) // time for base to set
        } else {
            panelRef.current.style.opacity = 1
            thirdTimeoutRef.current = setTimeout(()=>{
                panelRef.current.style.width = 'auto'
                panelRef.current.style.opacity = 1
                localMirrorPanelStylesRef.current = {...localMirrorPanelStylesRef.current,width:'auto',opacity:1}
            },500)
        }

    },[showPanel, transitioningCountRef.current])

    return <Box data-type = 'mirror-panel' ref = {panelRef} style = {localMirrorPanelStylesRef.current} >
        <Box data-type = 'mirror-content' ref = {contentRef} style = {mirrorContentStyles}>
            {children}
        </Box>
    </Box>
}

