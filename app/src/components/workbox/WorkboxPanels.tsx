// WorkboxPanels.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useEffect, useState, useCallback, createContext, useContext, CSSProperties, forwardRef } from 'react'

import {
    Box
} from '@chakra-ui/react'

import { Resizable } from 'react-resizable'
import "react-resizable/css/styles.css"

import handleIcon from '../../../assets/handle.png'

const MIN_PANEL_FRAME_WIDTH = 250
const MAX_PANEL_FRAME_RATIO = 0.75
const MIN_CENTRAL_FRAME_WIDTH = 590

const centralPanelStyles = {
    height:'100%',
    borderRadius:'8px',
    backgroundColor:'transparent', 
    position:'relative',
    display:'flex',
    flexWrap: 'nowrap',
    flex: '1 0 auto',
    minWidth: MIN_CENTRAL_FRAME_WIDTH + 'px',
    transition:'width .5s', 
    boxSizing: 'border-box',
} as CSSProperties

const coverFrameStyles = {
    flex: '0 0 auto',
    width: '300px',
    position: 'relative',
    transition:'width .5s', 
    transitionDelay:'unset',
    borderRadius:'8px',
    overflow: 'hidden',
} as CSSProperties

const coverPanelStyles = {
    height:'100%',
    backgroundColor:'ghostwhite',
    position:'absolute', 
    width:'100%',
    minWidth: MIN_PANEL_FRAME_WIDTH + 'px',
    padding: '3px', 
    border: '5px ridge gray',
    borderRadius:'8px',
    transition:'box-shadow .3s',
    transitionDelay:'unset',
    boxShadow: 'none',
    boxSizing: 'border-box',
    left: 0,
    right:'auto',
} as CSSProperties

const coverTabStyle = {
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

const coverTabIconStyle = {
    opacity: 0.5,
    height: '24px',
    width: '48px',
    transform: 'rotate(90deg)'
} as CSSProperties

const contentsFrameStyles = {
    flex: '1 0 auto',
    width: 'auto',
    position: 'relative',
    transition:'width .5s',
    transitionDelay:'unset',
    borderRadius:'8px',
    overflow: 'hidden',
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
    transition:'box-shadow .3s',
    transitionDelay:'unset',
    boxShadow: 'none',
    boxSizing: 'border-box',
    left: 'auto',
    right: 0,
} as CSSProperties

const settingsFrameStyles = {
    flex: '0 0 auto',
    // height: '100%',
    width:'0px',
    overflow:'hidden',
    position:'relative',
    transition: 'width 0.5s',
    borderRadius: '8px',
} as CSSProperties

const settingsPanelStyles = {
    // display:'block', 
    border:'5px ridge silver',
    borderRadius:'8px',
    overflow:'auto',
    padding:'3px',
    boxSizing:'border-box',
    height: '100%',
    width:'300px',
    position:'absolute',
    left:0,
} as CSSProperties

const CentralWidthContext = createContext(null)

export const CentralPanel = (props) => {

    const 
        { children, displayCode, workboxContentElementRef, coverFrameElementRef, contentsFrameElementRef, coverWidthRef } = props,
        previousDisplayCodeRef = useRef(displayCode),
        centralPanelElementRef = useRef(null),
        timeoutRef = useRef(null),
        [centralWidth, setCentralWidth] = useState(0)

    const resizeCallback = useCallback(()=> {

        const centralWidth = centralPanelElementRef.current.offsetWidth

        setCentralWidth(centralWidth)

    },[])

    useEffect(()=>{

        const observer = new ResizeObserver(resizeCallback)
        observer.observe(centralPanelElementRef.current)

        return () => {
            observer.disconnect()
        }

    },[])

    useEffect(()=>{

        const 
            centralFrameElement = centralPanelElementRef.current,
            coverFrameElement = coverFrameElementRef.current,
            contentsFrameElement = contentsFrameElementRef.current

        let timeout = 500, transitionDelay = 'unset'

        clearTimeout(timeoutRef.current)

        if (displayCode == 'both') {

            // anticipate size
            if (previousDisplayCodeRef.current == 'contents') {

                coverFrameElement.firstChild.style.width = coverWidthRef.current + 'px'

            } else {

                contentsFrameElement.firstChild.style.width = (centralFrameElement.offsetWidth - coverWidthRef.current) + 'px'

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
            coverFrameElement.style.width = coverWidthRef.current + 'px'
            contentsFrameElement.style.width = (centralFrameElement.offsetWidth - coverWidthRef.current) + 'px'

            // wait for result
            timeoutRef.current = setTimeout(()=>{

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

            // delay to establish shadow
            transitionDelay = '0.3s'
            coverFrameElement.style.transitionDelay = transitionDelay
            contentsFrameElement.style.transitionDelay = transitionDelay
            timeout = 800

            if (previousDisplayCodeRef.current == 'contents') {

                coverFrameElement.firstChild.style.width = centralFrameElement.offsetWidth + 'px'
                coverFrameElement.firstChild.style.right = 0
                coverFrameElement.firstChild.style.left = 'auto'

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
            timeoutRef.current = setTimeout(()=>{

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
                coverFrameElement.firstChild.style.right = 'auto'
                coverFrameElement.firstChild.style.left = 0


            },timeout)

        } else { // displayCode == 'contents'

            // delay to establish shadow
            transitionDelay = '0.3s'
            coverFrameElement.style.transitionDelay = transitionDelay
            contentsFrameElement.style.transitionDelay = transitionDelay
            timeout = 800
            contentsFrameElement.firstChild.style.right = 'auto'
            contentsFrameElement.firstChild.style.left = 0

            if (previousDisplayCodeRef.current == 'cover') {

                contentsFrameElement.firstChild.style.width = centralFrameElement.offsetWidth + 'px'

            } else { // previous is 'both'

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
            timeoutRef.current = setTimeout(()=>{

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
                contentsFrameElement.firstChild.style.right = 0
                contentsFrameElement.firstChild.style.left = 'auto'

            },timeout)
        }

        previousDisplayCodeRef.current = displayCode

    },[displayCode])

    return <CentralWidthContext.Provider value = {centralWidth} >
        <Box ref = {centralPanelElementRef} data-type = 'central-panel' id = 'central-panel' style = {centralPanelStyles}>{children}</Box>
    </CentralWidthContext.Provider>
}

const CoverHandle = (props) => {

    // handleAxis for handle selection - n/a here
    const { handleAxis, innerRef, ...rest } = props

    return (
        <Box 
            ref = {innerRef}
            id = 'handle'
            data-type = {'cover-handle'} 
            style = {coverTabStyle} {...rest}>
            <img 
                draggable = "false" 
                style = {coverTabIconStyle} 
                src = {handleIcon} 
            />
        </Box>
    )
}

export const CoverPanel = forwardRef(function DocumentPanel(props:any, coverFrameElementRef:any) {
    const 
        { children, displayCode, coverWidthRef } = props,
        coverPanelElementRef = useRef(null),
        centralPanelElementRef = useRef(null),
        targetTimeoutRef = useRef(null),
        [coverResizeWidth, setCoverResizeWidth] = useState(coverWidthRef.current),
        observerTimeoutRef = useRef(null),
        centralWidthContext = useContext(CentralWidthContext),
        handleRef = useRef(null)


    useEffect(()=>{

        centralPanelElementRef.current = coverPanelElementRef.current.closest('#central-panel')
        handleRef.current = centralPanelElementRef.current.querySelector('#handle')

    },[])

    useEffect(()=>{

        const centralWidth = centralPanelElementRef.current.offsetWidth
        const coverWidth = coverFrameElementRef.current.offsetWidth

        clearTimeout(observerTimeoutRef.current)

        if (centralWidth < (coverWidth * 1/MAX_PANEL_FRAME_RATIO)) {

            const newWidth = centralWidth * MAX_PANEL_FRAME_RATIO

            if (coverFrameElementRef.current.style.transition != 'none') coverFrameElementRef.current.style.transition = 'none'
            coverFrameElementRef.current.style.width = newWidth + 'px'
            coverWidthRef.current = newWidth

            setCoverResizeWidth(newWidth)

        }

        const constraints = {
            minX:MIN_PANEL_FRAME_WIDTH,
            minY:coverFrameElementRef.current?.offsetHeight || 0,
            maxX:centralPanelElementRef.current.offsetWidth * MAX_PANEL_FRAME_RATIO,
            maxY:coverFrameElementRef.current?.offsetHeight || 0,
        }
        constraintsRef.current = constraints

        observerTimeoutRef.current = setTimeout(()=>{
            if (coverFrameElementRef.current.style.transition == 'none') coverFrameElementRef.current.style.transition = 'width 0.5s'
        },500)

    },[centralWidthContext])

    useEffect(()=>{

        clearTimeout(targetTimeoutRef.current)

        const element = coverPanelElementRef.current

        let timeout = 500

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

    const constraintsRef = useRef({
        minX:MIN_PANEL_FRAME_WIDTH,
        minY:coverFrameElementRef.current?.offsetHeight || 0,
        maxX:700,
        maxY:coverFrameElementRef.current?.offsetHeight || 0,
    })

    // resizable callbacks...
    const onResizeStart = () => {
        coverFrameElementRef.current.style.transition = 'none'
        const constraints = {
            minX:MIN_PANEL_FRAME_WIDTH,
            minY:coverFrameElementRef.current?.offsetHeight || 0,
            maxX:centralPanelElementRef.current.offsetWidth * MAX_PANEL_FRAME_RATIO,
            maxY:coverFrameElementRef.current?.offsetHeight || 0,
        }
        constraintsRef.current = constraints
    }

    const onResize = (event, {size, handle}) => {

        coverFrameElementRef.current.style.width = size.width + 'px'
        setCoverResizeWidth(size.width)

    }

    const onResizeStop = (e,{size, handle}) => {
        coverFrameElementRef.current.style.transition = 'width 0.5s'
        coverWidthRef.current = size.width
    }

    return (
    <Resizable 
        data-inheritedtype = 'resizable' 
        handle = {

            (handleAxis, ref) => {
                return <CoverHandle 
                    innerRef = {ref} 
                    handleAxis = {handleAxis}
                />}

        } 
        axis = 'x'
        height = {coverFrameElementRef.current?.offsetHeigth || 0} 
        width = {coverResizeWidth}
        resizeHandles = {['e']}
        minConstraints = {[constraintsRef.current.minX,constraintsRef.current.minY]}
        maxConstraints = {[constraintsRef.current.maxX,constraintsRef.current.maxY]}
        onResizeStart = {onResizeStart}
        onResize = {onResize}
        onResizeStop = {onResizeStop}

    >
        <Box data-type = 'cover-frame' ref = {coverFrameElementRef} style = {coverFrameStyles}>

            <Box data-type = 'cover-panel' ref = {coverPanelElementRef} style = {coverPanelStyles}>{children}</Box>
            
        </Box>
    </Resizable>)
})

export const ContentsPanel = forwardRef(function FoldersPanel(props:any, contentsFrameElementRef:any) {
    const 
        { children, displayCode } = props,
        contentsPanelElementRef = useRef(null),
        targetTimeoutRef = useRef(null)

    useEffect(()=>{

        clearTimeout(targetTimeoutRef.current)

        const element = contentsPanelElementRef.current

        let timeout = 500

        if (displayCode == 'out') {

            targetTimeoutRef.current = setTimeout(()=>{
                element.style.boxShadow = 'none'
            },timeout)

        } else if (displayCode == 'over') {

            element.style.boxShadow = 'none'

        } else { // 'under'

            element.style.boxShadow = '3px 3px 6px 6px inset silver'

        }

    },[displayCode])

    return <Box data-type = 'contents-frame' ref = {contentsFrameElementRef} style = {contentsFrameStyles}>
        <Box data-type = 'contents-panel' ref = {contentsPanelElementRef} style = {contentsPanelStyles}> {children}</Box>
    </Box>
})

export const SettingsPanel = (props) => {
    const
        {showPanel, children} = props,
        settingsPanelElementRef = useRef(null),
        settingsFrameElementRef = useRef(null)
        // timeoutRef = useRef(null)

    useEffect(()=>{

        // clearTimeout(timeoutRef.current)
        if (!showPanel) {
            settingsFrameElementRef.current.style.width = 0
        } else {
            const contentWidth = settingsPanelElementRef.current.offsetWidth
            settingsFrameElementRef.current.style.width = contentWidth + 'px'
        }

    },[showPanel])

    return <Box data-type = 'settings-frame' ref = {settingsFrameElementRef} style = {settingsFrameStyles} >
        <Box data-type = 'settings-panel' ref = {settingsPanelElementRef} style = {settingsPanelStyles}>
            {children}
        </Box>
    </Box>
}

