// WorkboxPanels.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, forwardRef } from 'react'

import {
    Box
} from '@chakra-ui/react'

const workboxPanelBaseStyles = {
    height:'100%',
    backgroundColor:'ghostwhite',
    borderRadius:'8px',
}

const centralPanelStyles = {
    backgroundColor:'transparent', 
    position:'relative',
    display:'flex',
    flex: '1 0 auto'
} as CSSProperties

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


// export const CentralPanel = forwardRef(function CentralPanel(props:any, ref:any) {
export const CentralPanel = (props) => {

    const 
        { children, targetDisplay, documentElementRef, foldersElementRef } = props,
        displayStateRef = useRef(targetDisplay),
        appliedCentralPanelStyles = {...workboxPanelBaseStyles, ...centralPanelStyles} as CSSProperties,
        timeoutRef = useRef(null)

//     useEffect(()=>{

//         let timeout = 500
//         clearTimeout(timeoutRef.current)

//         if (targetDisplay == 'both') {

//             const width = (documentElementRef.current.offsetWidth + foldersElementRef.current.offsetWidth) + 'px'
//             ref.current.style.width = width    

//         } else if (targetDisplay == 'document') {

//             if (displayStateRef.current == 'folders') {

//                 timeout = 800

//                 ref.current.style.width = 
//                     (documentElementRef.current.offsetWidth + foldersElementRef.current.offsetWidth) + 'px'

//             }

//             timeoutRef.current = setTimeout(()=>{
//                 ref.current.style.width = 
//                     documentElementRef.current.offsetWidth + 'px'
//             },timeout)

//         } else { // targetDisplay == 'folders'

//             if (displayStateRef.current == 'document') {

//                 timeout = 800

//                 ref.current.style.width = 
//                     (documentElementRef.current.offsetWidth + foldersElementRef.current.offsetWidth) + 'px'

//             }

//             timeoutRef.current = setTimeout(()=>{
//                 ref.current.style.width = 
//                     foldersElementRef.current.offsetWidth + 'px'
//             },timeout)

//         }

//         displayStateRef.current = targetDisplay

//     },[targetDisplay])

    return <Box data-type = 'central-panel' style = {appliedCentralPanelStyles}>{children}</Box>
}

export const CoverPanel = forwardRef(function DocumentPanel(props:any, ref:any) {
    const 
        { children, targetDisplay } = props,
        coverPanelStyles = {width:'250px', flex:'0 0 auto', padding: '3px', transition:'box-shadow .5s', border: '5px ridge gray', minWidth: '250px',
} as CSSProperties,
        displayStateRef = useRef(targetDisplay),
        appliedCoverPanelStylesRef = useRef({...workboxPanelBaseStyles, ...coverPanelStyles, visibility:'hidden'} as CSSProperties),
        visibilityTimeoutRef = useRef(null),
        targetTimeoutRef = useRef(null)

    useEffect(()=>{

        clearTimeout(visibilityTimeoutRef.current)
        clearTimeout(targetTimeoutRef.current)

        let timeout = 500

        if (appliedCoverPanelStylesRef.current.visibility == 'hidden') {

            const localTimeout = targetDisplay == 'under'?timeout:0

            visibilityTimeoutRef.current = setTimeout(()=>{
                appliedCoverPanelStylesRef.current = {...appliedCoverPanelStylesRef.current, visibility:'visible'}
            },localTimeout)

        }

        if (targetDisplay == 'out') {

            targetTimeoutRef.current = setTimeout(()=>{
                ref.current.style.zIndex = 0
                ref.current.style.boxShadow = 'none'
            },timeout)

        } else if (targetDisplay == 'over') {

            if (displayStateRef.current == 'out') {
                timeout = 0
            }

            targetTimeoutRef.current = setTimeout(()=>{
                ref.current.style.zIndex = 1
                ref.current.style.boxShadow = 'none'
            },timeout)

        } else { // 'under'

            if (displayStateRef.current == 'out') {
                timeout = 0
            }

            targetTimeoutRef.current = setTimeout(()=>{
                ref.current.style.zIndex = 0
                ref.current.style.boxShadow = '3px 3px 6px 6px inset silver'
            },timeout)

        }

        displayStateRef.current = targetDisplay

    },[targetDisplay])

    return <Box ref = {ref} data-type = 'document-panel' style = {appliedCoverPanelStylesRef.current}>{children}</Box>
})

export const ContentsPanel = forwardRef(function FoldersPanel(props:any, ref:any) {
    const 
        { children, targetDisplay } = props,
        contentsPanelStyles = {flex:'1 0 auto', minWidth:'250px',padding: '3px', transition:'box-shadow .5s', border: '5px ridge gray',
} as CSSProperties,
        displayStateRef = useRef(targetDisplay),
        appliedContentsStylesRef = useRef({...workboxPanelBaseStyles, ...contentsPanelStyles, visibility:'hidden'} as CSSProperties),
        visibilityTimeoutRef = useRef(null),
        targetTimeoutRef = useRef(null)

    useEffect(()=>{

        clearTimeout(visibilityTimeoutRef.current)
        clearTimeout(targetTimeoutRef.current)

        let timeout = 500

        if (appliedContentsStylesRef.current.visibility == 'hidden') {

            const localTimeout = targetDisplay == 'under'?timeout:0

            visibilityTimeoutRef.current = setTimeout(()=>{
                appliedContentsStylesRef.current = {...appliedContentsStylesRef.current, visibility:'visible'}
            },localTimeout)

        }

        if (targetDisplay == 'out') {

            targetTimeoutRef.current = setTimeout(()=>{
                ref.current.style.zIndex = 0
                ref.current.style.boxShadow = 'none'
            },timeout)

        } else if (targetDisplay == 'over') {

            if (displayStateRef.current == 'out') {
                timeout = 0
            }

            targetTimeoutRef.current = setTimeout(()=>{
                ref.current.style.zIndex = 1
                ref.current.style.boxShadow = 'none'
            },timeout)

        } else { // 'under'

            if (displayStateRef.current == 'out') {
                timeout = 0
            }

            targetTimeoutRef.current = setTimeout(()=>{
                ref.current.style.zIndex = 0
                ref.current.style.boxShadow = '3px 3px 6px 6px inset silver'
            },timeout)

        }

        displayStateRef.current = targetDisplay

    },[targetDisplay])

    return <Box ref = {ref} data-type = 'folders-panel' style = {appliedContentsStylesRef.current}> {children}</Box>

})

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

    return <Box data-type = 'properties-panel' ref = {panelRef} style = {localPropertiesPanelStylesRef.current} >
        <Box data-type = 'properties-content' ref = {contentRef} style = {settingsContentStyles}>
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

