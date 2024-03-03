// WorkboxPanels.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useEffect, CSSProperties, forwardRef } from 'react'

import {
    Box
} from '@chakra-ui/react'

const centralPanelStyles = {
    height:'100%',
    borderRadius:'8px',
    backgroundColor:'transparent', 
    position:'relative',
    display:'flex',
    flex: '1 0 auto'
} as CSSProperties

const coverFrameStyles = {
    flex: '0 0 auto',
    minWidth: '250px',
    width: '250px',
    position: 'relative',
    overflow: 'hidden',
    transition:'box-shadow .5s', 
    borderRadius:'8px',
} as CSSProperties

const coverPanelStyles = {
    height:'100%',
    backgroundColor:'ghostwhite',
    position:'absolute', 
    inset:0, 
    minWidth:'250px',
    padding: '3px', 
    border: '5px ridge gray',
    borderRadius:'8px',
    boxShadow: 'none',
} as CSSProperties

const contentsFrameStyles = {
    flex: '1 0 auto',
    minWidth: '250px',
    position: 'relative',
    overflow: 'hidden',
    transition:'box-shadow .5s',
    borderRadius:'8px',
} as CSSProperties

const contentsPanelStyles = {
    height:'100%',
    backgroundColor:'ghostwhite',
    position:'absolute', 
    inset:0, 
    minWidth:'250px',
    padding: '3px', 
    border: '5px ridge gray',
    borderRadius:'8px',
    overflow:'auto',
    boxShadow: 'none',
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
    width:'250px',
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
    width:'250px',
    position:'relative',
} as CSSProperties


export const CentralPanel = (props) => {

    const 
        { children, displayCode, coverFrameElementRef, contentsFrameElementRef } = props,
        previousDisplayCodeRef = useRef(displayCode),
        timeoutRef = useRef(null)

//     useEffect(()=>{

//         let timeout = 500
//         clearTimeout(timeoutRef.current)

//         if (displayCode == 'both') {

//             const width = (coverFrameElementRef.current.offsetWidth + contentsFrameElementRef.current.offsetWidth) + 'px'
//             ref.current.style.width = width    

//         } else if (displayCode == 'cover') {

//             if (previousDisplayCodeRef.current == 'contents') {

//                 timeout = 800

//                 ref.current.style.width = 
//                     (coverFrameElementRef.current.offsetWidth + contentsFrameElementRef.current.offsetWidth) + 'px'

//             }

//             timeoutRef.current = setTimeout(()=>{
//                 ref.current.style.width = 
//                     coverFrameElementRef.current.offsetWidth + 'px'
//             },timeout)

//         } else { // displayCode == 'contents'

//             if (previousDisplayCodeRef.current == 'cover') {

//                 timeout = 800

//                 ref.current.style.width = 
//                     (coverFrameElementRef.current.offsetWidth + contentsFrameElementRef.current.offsetWidth) + 'px'

//             }

//             timeoutRef.current = setTimeout(()=>{
//                 ref.current.style.width = 
//                     contentsFrameElementRef.current.offsetWidth + 'px'
//             },timeout)

//         }

//         previousDisplayCodeRef.current = displayCode

//     },[displayCode])

    return <Box data-type = 'central-panel' style = {centralPanelStyles}>{children}</Box>
}

export const CoverPanel = forwardRef(function DocumentPanel(props:any, coverFrameElementRef:any) {
    const 
        { children, displayCode } = props,
        previousDisplayCodeRef = useRef(displayCode),
        coverPanelElementRef = useRef(null),
        targetTimeoutRef = useRef(null)

    console.log('CoverPanel displayCode', displayCode)

    useEffect(()=>{

        clearTimeout(targetTimeoutRef.current)

        let timeout = 500

        if (displayCode == 'out') {

            targetTimeoutRef.current = setTimeout(()=>{
                coverFrameElementRef.current.style.zIndex = 0
                coverPanelElementRef.current.style.boxShadow = 'none'
            },timeout)

        } else if (displayCode == 'over') {

            if (previousDisplayCodeRef.current == 'out') {
                timeout = 0
            }

            targetTimeoutRef.current = setTimeout(()=>{
                coverFrameElementRef.current.style.zIndex = 1
                coverPanelElementRef.current.style.boxShadow = 'none'
            },timeout)

        } else { // 'under'

            if (previousDisplayCodeRef.current == 'out') {
                timeout = 0
            }

            targetTimeoutRef.current = setTimeout(()=>{
                coverFrameElementRef.current.style.zIndex = 0
                coverPanelElementRef.current.style.boxShadow = '3px 3px 6px 6px inset silver'
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

    console.log('ContentsPanel displayCode', displayCode)

    useEffect(()=>{

        clearTimeout(targetTimeoutRef.current)

        let timeout = 500

        if (displayCode == 'out') {

            targetTimeoutRef.current = setTimeout(()=>{
                contentsFrameElementRef.current.style.zIndex = 0
                contentsPanelElementRef.current.style.boxShadow = 'none'
            },timeout)

        } else if (displayCode == 'over') {

            if (previousDisplayCodeRef.current == 'out') {
                timeout = 0
            }

            targetTimeoutRef.current = setTimeout(()=>{
                contentsFrameElementRef.current.style.zIndex = 1
                contentsPanelElementRef.current.style.boxShadow = 'none'
            },timeout)

        } else { // 'under'

            if (previousDisplayCodeRef.current == 'out') {
                timeout = 0
            }

            targetTimeoutRef.current = setTimeout(()=>{
                contentsFrameElementRef.current.style.zIndex = 0
                contentsPanelElementRef.current.style.boxShadow = '3px 3px 6px 6px inset silver'
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

