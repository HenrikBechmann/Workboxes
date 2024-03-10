// WorkboxPanels.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useEffect, useState, useCallback, createContext, useContext, CSSProperties, forwardRef } from 'react'

import {
    Box
} from '@chakra-ui/react'

import { Resizable } from 'react-resizable'
import "react-resizable/css/styles.css"

import handleIcon from '../../../assets/handle.png'

const MIN_COVER_FRAME_WIDTH = 250
const MAX_COVER_FRAME_RATIO = 0.75
const MIN_CONTENTS_FRAME_WIDTH = 250
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
    transition:'none', //'width .5s', 
    boxSizing: 'border-box',
} as CSSProperties

const coverFrameStyles = {
    flex: '0 0 auto',
    width: '300px',
    position: 'relative',
    transition: 'none', // width .5s', 
    transitionDelay:'unset',
    borderRadius:'8px',
    overflow: 'hidden',
} as CSSProperties

const coverPanelStyles = {
    height:'100%',
    backgroundColor:'ghostwhite',
    position:'absolute', 
    width:'100%',
    minWidth: MIN_COVER_FRAME_WIDTH + 'px',
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
    minWidth: MIN_CONTENTS_FRAME_WIDTH + 'px',
    position: 'relative',
    transition:'none', //'width .5s', 
    // transition:'width .5s',
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


/*
    Adjusts the CSS of 
    - centralPanelElement: flex, width
    - coverFrameElement: flex, width, minWidth, transition, transitionDelay
    - coverFrameElement.firstChild: width, left, right
    - contentsFrameElement: flex, width, minWidth, transition, transitionDelay
    - contantsFrameElement.firstChild: width, left, right

    

    see useEffect for displayCode
*/
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

    // respond to change in displayCode
    useEffect(()=>{

        if (previousDisplayCodeRef.current == displayCode) return // startup

        const 
            centralFrameElement = centralPanelElementRef.current,
            coverFrameElement = coverFrameElementRef.current,
            contentsFrameElement = contentsFrameElementRef.current,
            transitionDelay = '0.3s'

        coverFrameElement.style.transition = 'width 0.5s'
        contentsFrameElement.style.transition = 'width 0.5s'

        let timeout = 800

        clearTimeout(timeoutRef.current)

        if (displayCode == 'both') {

            // anticipate config of hidden elements
            if (previousDisplayCodeRef.current == 'contents') { // cover was hidden

                coverFrameElement.firstChild.style.width = coverWidthRef.current + 'px'
                coverFrameElement.firstChild.style.left = 0
                coverFrameElement.firstChild.style.right = 'auto'

            } else { // contents was hidden

                contentsFrameElement.firstChild.style.width = Math.max(MIN_CONTENTS_FRAME_WIDTH,(centralFrameElement.offsetWidth - coverWidthRef.current)) + 'px'
                contentsFrameElement.firstChild.style.left = 'auto'
                contentsFrameElement.firstChild.style.right = 0

            }

            // freeze central frame
            centralFrameElement.style.width = centralFrameElement.offsetWidth + 'px'
            centralFrameElement.style.flex = '0 0 auto'

            // freeze cover
            coverFrameElement.style.width = coverFrameElement.offsetWidth + 'px'
            coverFrameElement.style.flex = '0 0 auto'

            // freeze contents
            contentsFrameElement.style.width = contentsFrameElement.offsetWidth + 'px'
            contentsFrameElement.style.flex = '0 0 auto'

            // set targets
            coverFrameElement.style.width = coverWidthRef.current + 'px'
            contentsFrameElement.style.width = 
                Math.max(MIN_CONTENTS_FRAME_WIDTH,(centralFrameElement.offsetWidth - coverWidthRef.current)) + 'px'

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                coverFrameElement.style.transition = 'none'
                coverFrameElement.style.transitionDelay = 'unset'
                contentsFrameElement.style.transition = 'none'
                contentsFrameElement.style.transitionDelay = 'unset'

                // restore contents frame defaults
                contentsFrameElement.style.flex = '1 0 auto'
                contentsFrameElement.style.width = 'auto'
                contentsFrameElement.style.minWidth = MIN_CONTENTS_FRAME_WIDTH + 'px'

                // restore panel defaults
                contentsFrameElement.firstChild.style.width = '100%'
                coverFrameElement.firstChild.style.width = '100%'

                // restore central panel defaults
                centralFrameElement.style.flex = '1 0 auto'
                centralFrameElement.style.width = 'auto'

            },timeout)

        } else if (displayCode == 'cover') {

            // set tranision delay for shadow
            coverFrameElement.style.transitionDelay = transitionDelay
            contentsFrameElement.style.transitionDelay = transitionDelay

            // anticipate config of hidden element
            if (previousDisplayCodeRef.current == 'contents') { // cover was hidden

                coverFrameElement.firstChild.style.width = centralFrameElement.offsetWidth + 'px'
                coverFrameElement.firstChild.style.right = 0
                coverFrameElement.firstChild.style.left = 'auto'

            }

            // freeze central frame
            centralFrameElement.style.width = centralFrameElement.offsetWidth + 'px'
            centralFrameElement.style.flex = '0 0 auto'

            // freeze cover
            coverFrameElement.style.width = coverFrameElement.offsetWidth + 'px'
            coverFrameElement.style.flex = '0 0 auto'

            // freeze contents for hiding
            contentsFrameElement.style.width = contentsFrameElement.offsetWidth + 'px'
            contentsFrameElement.style.flex = '0 0 auto'
            contentsFrameElement.firstChild.style.width = contentsFrameElement.firstChild.offsetWidth + 'px'
            contentsFrameElement.style.minWidth = 0

            // set targets
            contentsFrameElement.style.width = 0
            coverFrameElement.style.width = centralFrameElement.offsetWidth + 'px'

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                coverFrameElement.style.transition = 'none'
                contentsFrameElement.style.transition = 'none'
                contentsFrameElement.style.transitionDelay = 'unset'

                // restore values for visible frame
                coverFrameElement.style.flex = '1 0 auto'
                coverFrameElement.style.width = 'auto'

                // set visible panel config
                coverFrameElement.firstChild.style.width = '100%'
                coverFrameElement.firstChild.style.right = 'auto'
                coverFrameElement.firstChild.style.left = 0

                // restore central panel defaults
                centralFrameElement.style.flex = '1 0 auto'
                centralFrameElement.style.width = 'auto'

            },timeout)

        } else { // displayCode == 'contents'

            // set tranision delay for shadow
            coverFrameElement.style.transitionDelay = transitionDelay
            contentsFrameElement.style.transitionDelay = transitionDelay

            // anticipate config of hidden element
            if (previousDisplayCodeRef.current == 'cover') { // contents was hidden

                contentsFrameElement.firstChild.style.width = centralFrameElement.offsetWidth + 'px'
                contentsFrameElement.firstChild.style.right = 'auto'
                contentsFrameElement.firstChild.style.left = 0

            }

            // freeze central frame
            centralFrameElement.style.width = centralFrameElement.offsetWidth + 'px'
            centralFrameElement.style.flex = '0 0 auto'

            // freeze cover for hiding
            coverFrameElement.style.width = coverFrameElement.offsetWidth + 'px'
            coverFrameElement.style.flex = '0 0 auto'
            coverFrameElement.firstChild.style.width = coverFrameElement.firstChild.offsetWidth + 'px'

            // freeze contents
            contentsFrameElement.style.width = contentsFrameElement.offsetWidth + 'px'
            contentsFrameElement.style.flex = '0 0 auto'

            // set targets
            contentsFrameElement.style.width = centralFrameElement.offsetWidth + 'px'
            coverFrameElement.style.width = 0

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                coverFrameElement.style.transition = 'none'
                coverFrameElement.style.transitionDelay = 'unset'
                contentsFrameElement.style.transition = 'none'

                // set visible frame config
                contentsFrameElement.style.width = 'auto'
                contentsFrameElement.style.flex = '1 0 auto'
                contentsFrameElement.style.minWidth = MIN_CONTENTS_FRAME_WIDTH + 'px'

                // restore visible panel defaults
                contentsFrameElement.firstChild.style.width = '100%'
                contentsFrameElement.firstChild.style.right = 0
                contentsFrameElement.firstChild.style.left = 'auto'

                // restore central panel defaults
                centralFrameElement.style.width = 'auto'
                centralFrameElement.style.flex = '1 0 auto'

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
        displayCodeRef = useRef(null),
        coverPanelElementRef = useRef(null),
        centralPanelElementRef = useRef(null),
        targetTimeoutRef = useRef(null),
        [coverResizeWidth, setCoverResizeWidth] = useState(coverWidthRef.current),
        observerTimeoutRef = useRef(null),
        centralWidthContext = useContext(CentralWidthContext),
        handleRef = useRef(null)

    displayCodeRef.current = displayCode

    useEffect(()=>{

        centralPanelElementRef.current = coverPanelElementRef.current.closest('#central-panel')
        handleRef.current = centralPanelElementRef.current.querySelector('#handle')

    },[])

    useEffect(()=>{

        const centralWidth = centralPanelElementRef.current.offsetWidth
        const coverWidth = 
            displayCodeRef.current == 'out'
                ? coverFrameElementRef.current.offsetWidth
                : coverWidthRef.current

        clearTimeout(observerTimeoutRef.current)

        const calculatedMaxCentralWidth = coverWidth * 1/MAX_COVER_FRAME_RATIO

        if (centralWidth < calculatedMaxCentralWidth) {

            const newWidth = centralWidth * MAX_COVER_FRAME_RATIO

            // if (coverFrameElementRef.current.style.transition != 'none') coverFrameElementRef.current.style.transition = 'none'
            displayCodeRef.current == 'out' && (coverFrameElementRef.current.style.width = newWidth + 'px')
            coverWidthRef.current = newWidth

            setCoverResizeWidth(newWidth)

        }

        const constraints = {
            minX:MIN_COVER_FRAME_WIDTH,
            minY:coverFrameElementRef.current?.offsetHeight || 0,
            maxX:centralPanelElementRef.current.offsetWidth * MAX_COVER_FRAME_RATIO,
            maxY:coverFrameElementRef.current?.offsetHeight || 0,
        }
        constraintsRef.current = constraints

        // observerTimeoutRef.current = setTimeout(()=>{
        //     if (coverFrameElementRef.current.style.transition == 'none') coverFrameElementRef.current.style.transition = 'width 0.5s'
        // },500)

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
        minX:MIN_COVER_FRAME_WIDTH,
        minY:coverFrameElementRef.current?.offsetHeight || 0,
        maxX:700,
        maxY:coverFrameElementRef.current?.offsetHeight || 0,
    })

    // resizable callbacks...
    const onResizeStart = () => {
        coverFrameElementRef.current.style.transition = 'none'
        const constraints = {
            minX:MIN_COVER_FRAME_WIDTH,
            minY:coverFrameElementRef.current?.offsetHeight || 0,
            maxX:centralPanelElementRef.current.offsetWidth * MAX_COVER_FRAME_RATIO,
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

