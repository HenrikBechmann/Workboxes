// WorkboxPanels.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { 
    useRef, 
    useEffect, 
    useState, 
    useCallback, 
    useContext, 
    CSSProperties, 
    forwardRef 
} from 'react'

import {
    Box
} from '@chakra-ui/react'

import { Resizable } from 'react-resizable'
import "react-resizable/css/styles.css"

import { WorkboxInnerFrameWidthContext } from './Workbox'
import { WindowCallbackContext } from '../Workwindow'

import handleIcon from '../../../assets/handle.png'

const 
    MIN_COVER_FRAME_WIDTH = 250,
    MAX_COVER_FRAME_RATIO = 0.75,
    MIN_CONTENTS_FRAME_WIDTH = 250,
    MIN_CENTRAL_FRAME_WIDTH = MIN_COVER_FRAME_WIDTH + MIN_CONTENTS_FRAME_WIDTH,
    MIN_CONTENT_HEIGHT = 300

const centralPanelStyles = {
    height:'100%',
    borderRadius:'8px',
    backgroundColor:'transparent', 
    position:'relative',
    display:'flex',
    flexWrap: 'nowrap',
    flex: '1 0 auto',
    minWidth: MIN_CENTRAL_FRAME_WIDTH + 'px',
    minHeight: MIN_CONTENT_HEIGHT + 'px',
    transition:'none', // set as needed
    boxSizing: 'border-box',
} as CSSProperties

const coverFrameStyles = {
    flex: '0 0 auto',
    width: '300px',
    minWidth: MIN_COVER_FRAME_WIDTH + 'px',
    position: 'relative',
    transition: 'none', // set as needed
    transitionDelay:'unset',
    borderRadius:'8px',
    overflow: 'hidden',
} as CSSProperties

const coverPanelStyles = {
    height:'100%',
    backgroundColor:'ghostwhite',
    position:'absolute', 
    width:'100%',
    padding: '3px', 
    border: '5px ridge seagreen',
    borderRadius:'8px',
    transition:'box-shadow .3s',
    transitionDelay:'unset',
    boxShadow: 'none',
    boxSizing: 'border-box',
    left: 0,
    right:'auto',
} as CSSProperties

const coverTabStyles = {
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

const coverTabIconStyles = {
    opacity: 0.5,
    height: '24px',
    width: '48px',
    transform: 'rotate(90deg)'
} as CSSProperties

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

export const CentralPanel = (props) => {

    const 
        {
            children, 
            sessionWindowID,
            displayConfigCode, 
            coverFrameElementRef, 
            contentsFrameElementRef, 
            userCoverWidthRef, // set by user through drag tag
            viewSelector,
        } = props,
        previousDisplayConfigCodeRef = useRef(displayConfigCode),
        centralPanelElementRef = useRef(null),
        timeoutRef = useRef(null),
        viewSelectorRef = useRef(null)

        viewSelectorRef.current = viewSelector

    // console.log('running CentralPanel: , viewSelector\n', '-'+sessionWindowID+'-', viewSelector)

    /*
        Respond to change in displayConfigCode; causes direct DOM manipulation.
        Adjusts the CSS of 
        - centralPanelElement: flex, width
        - coverFrameElement: flex, width, minWidth, transition, transitionDelay
        - coverFrameElement.firstChild: width, left, right (panel)
        - contentsFrameElement: flex, width, minWidth, transition, transitionDelay
        - contantsFrameElement.firstChild: width, left, right (panel)

        see useEffect for displayConfigCode
    */
    useEffect(()=>{

        if (previousDisplayConfigCodeRef.current == displayConfigCode) return // startup

        const 
            centralPanelElement = centralPanelElementRef.current, // flex, width
            coverFrameElement = coverFrameElementRef.current, // flex, width, minWidth, transition, transitionDelay
            contentsFrameElement = contentsFrameElementRef.current, // flex, width, minWidth, transition, transitionDelay
            transitionDelay = '0.3s',
            timeout = 800

        coverFrameElement.style.transition = 'width 0.5s'
        contentsFrameElement.style.transition = 'width 0.5s'


        clearTimeout(timeoutRef.current)

        if (displayConfigCode == 'both') {

            // baseline
            coverFrameElement.style.transitionDelay = 'unset'
            contentsFrameElement.style.transitionDelay = 'unset'

            // anticipate config of hidden elements
            if (previousDisplayConfigCodeRef.current == 'contents') { // cover was hidden

                coverFrameElement.firstChild.style.width = userCoverWidthRef.current[viewSelectorRef.current] + 'px'
                coverFrameElement.firstChild.style.left = 0
                coverFrameElement.firstChild.style.right = 'auto'

            } else { // contents was hidden

                contentsFrameElement.firstChild.style.width = 
                    Math.max(MIN_CONTENTS_FRAME_WIDTH,(centralPanelElement.offsetWidth - 
                        userCoverWidthRef.current[viewSelectorRef.current])) + 'px'
                contentsFrameElement.firstChild.style.left = 'auto'
                contentsFrameElement.firstChild.style.right = 0

            }

            // freeze central frame
            centralPanelElement.style.width = centralPanelElement.offsetWidth + 'px'
            centralPanelElement.style.flex = '0 0 auto'

            // freeze cover
            coverFrameElement.style.width = coverFrameElement.offsetWidth + 'px'
            coverFrameElement.style.flex = '0 0 auto'

            // freeze contents
            centralPanelElement.style.minWidth = (MIN_COVER_FRAME_WIDTH + MIN_CONTENTS_FRAME_WIDTH) + 'px'
            contentsFrameElement.style.width = contentsFrameElement.offsetWidth + 'px'
            contentsFrameElement.style.flex = '0 0 auto'

            // set animation targets
            coverFrameElement.style.width = userCoverWidthRef.current + 'px'
            contentsFrameElement.style.width = 
                Math.max(MIN_CONTENTS_FRAME_WIDTH,(centralPanelElement.offsetWidth - 
                    userCoverWidthRef.current[viewSelectorRef.current])) + 'px'

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                coverFrameElement.style.transition = 'none'
                contentsFrameElement.style.transition = 'none'

                // restore contents frame defaults
                contentsFrameElement.style.flex = '1 0 auto'
                contentsFrameElement.style.width = 'auto'
                contentsFrameElement.style.minWidth = MIN_CONTENTS_FRAME_WIDTH + 'px'

                // restore cover frame defaults
                coverFrameElement.style.minWidth = MIN_COVER_FRAME_WIDTH + 'px'

                // restore panel defaults
                contentsFrameElement.firstChild.style.width = '100%'
                coverFrameElement.firstChild.style.width = '100%'

                // restore central panel defaults
                centralPanelElement.style.flex = '1 0 auto'
                centralPanelElement.style.width = 'auto'

            },timeout)

        } else if (displayConfigCode == 'cover') {

            // set transition delay for shadow
            coverFrameElement.style.transitionDelay = transitionDelay
            contentsFrameElement.style.transitionDelay = transitionDelay

            // anticipate config of hidden element
            if (previousDisplayConfigCodeRef.current == 'contents') { // cover was hidden

                coverFrameElement.firstChild.style.width = centralPanelElement.offsetWidth + 'px'
                coverFrameElement.firstChild.style.right = 0
                coverFrameElement.firstChild.style.left = 'auto'

            }

            // freeze central frame
            centralPanelElement.style.minWidth = MIN_COVER_FRAME_WIDTH + 'px'
            centralPanelElement.style.width = centralPanelElement.offsetWidth + 'px'
            centralPanelElement.style.flex = '0 0 auto'

            // freeze cover
            coverFrameElement.style.width = coverFrameElement.offsetWidth + 'px'
            coverFrameElement.style.flex = '0 0 auto'

            // freeze contents frame for hiding
            contentsFrameElement.style.width = contentsFrameElement.offsetWidth + 'px'
            contentsFrameElement.style.flex = '0 0 auto'
            contentsFrameElement.firstChild.style.width = contentsFrameElement.firstChild.offsetWidth + 'px'
            contentsFrameElement.style.minWidth = 0

            // set animation targets
            contentsFrameElement.style.width = 0
            coverFrameElement.style.width = centralPanelElement.offsetWidth + 'px'

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                coverFrameElement.style.transition = 'none'
                contentsFrameElement.style.transition = 'none'
                contentsFrameElement.style.transitionDelay = 'unset'

                // set config for visible frame
                coverFrameElement.style.flex = '1 0 auto'
                coverFrameElement.style.width = 'auto'
                coverFrameElement.style.minWidth = MIN_COVER_FRAME_WIDTH + 'px'

                // set visible panel config
                coverFrameElement.firstChild.style.width = '100%'
                coverFrameElement.firstChild.style.right = 'auto'
                coverFrameElement.firstChild.style.left = 0

                // restore central panel defaults
                centralPanelElement.style.flex = '1 0 auto'
                centralPanelElement.style.width = 'auto'

            },timeout)

        } else { // displayConfigCode == 'contents'

            // set tranision delay for shadow
            coverFrameElement.style.transitionDelay = transitionDelay
            contentsFrameElement.style.transitionDelay = transitionDelay

            // anticipate config of hidden element
            if (previousDisplayConfigCodeRef.current == 'cover') { // contents was hidden

                contentsFrameElement.firstChild.style.width = centralPanelElement.offsetWidth + 'px'
                contentsFrameElement.firstChild.style.right = 'auto'
                contentsFrameElement.firstChild.style.left = 0

            }

            // freeze central frame
            centralPanelElement.style.minWidth = MIN_CONTENTS_FRAME_WIDTH + 'px'
            centralPanelElement.style.width = centralPanelElement.offsetWidth + 'px'
            centralPanelElement.style.flex = '0 0 auto'

            // freeze cover for hiding
            coverFrameElement.style.width = coverFrameElement.offsetWidth + 'px'
            coverFrameElement.style.flex = '0 0 auto'
            coverFrameElement.firstChild.style.width = coverFrameElement.firstChild.offsetWidth + 'px'
            coverFrameElement.style.minWidth = 0

            // freeze contents
            contentsFrameElement.style.width = contentsFrameElement.offsetWidth + 'px'
            contentsFrameElement.style.flex = '0 0 auto'

            // set animation targets
            contentsFrameElement.style.width = centralPanelElement.offsetWidth + 'px'
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

                // restore visible panel config
                contentsFrameElement.firstChild.style.width = '100%'
                contentsFrameElement.firstChild.style.right = 0
                contentsFrameElement.firstChild.style.left = 'auto'

                // restore central panel defaults
                centralPanelElement.style.width = 'auto'
                centralPanelElement.style.flex = '1 0 auto'

            },timeout)
        }

        previousDisplayConfigCodeRef.current = displayConfigCode

    },[displayConfigCode])

    // CentralWidthContext informs CoverPanel
    return <Box 
        data-type = 'central-panel' 
        ref = {centralPanelElementRef} 
        id = 'central-panel' 
        style = {centralPanelStyles}
    >
        {children}
    </Box>
}

const CoverHandle = (props) => {

    // handleAxis for handle selection - n/a here
    const { handleAxis, innerRef, ...rest } = props

    return (
        <Box 
            ref = {innerRef}
            id = 'handle'
            data-type = {'cover-handle'} 
            style = {coverTabStyles} {...rest}>
            <img 
                draggable = "false" 
                style = {coverTabIconStyles} 
                src = {handleIcon} 
            />
        </Box>
    )
}

export const CoverPanel = forwardRef(function CoverPanel(props:any, coverFrameElementRef:any) {
    const 
        { children, displayConfigCode, userCoverWidthRef, sessionWindowID, viewSelector } = props, // userCoverWidthRef informs "friends"
        displayCodeRef = useRef(null),
        coverPanelElementRef = useRef(null),
        centralPanelElementRef = useRef(null), // for direct config updates
        targetTimeoutRef = useRef(null),
        [coverResizeWidth, setCoverResizeWidth] = useState(userCoverWidthRef.current[viewSelector]),
        observerTimeoutRef = useRef(null),
        workboxInnerFrameWidthFromContext = useContext(WorkboxInnerFrameWidthContext),
        handleRef = useRef(null),
        viewSelectorRef = useRef(null),
        windowCallbackContext = useContext(WindowCallbackContext),
        windowCallbackContextRef = useRef(windowCallbackContext),
        constraintsRef = useRef({
            minX:MIN_COVER_FRAME_WIDTH,
            minY:coverFrameElementRef.current?.offsetHeight || 0,
            maxX:700,
            maxY:coverFrameElementRef.current?.offsetHeight || 0,
        }),
        workboxInnerFrameWidthFromContextRef = useRef(null)

    workboxInnerFrameWidthFromContextRef.current = workboxInnerFrameWidthFromContext
    displayCodeRef.current = displayConfigCode
    viewSelectorRef.current = viewSelector

    // console.log('running CoverPanel: , viewSelector, coverResizeWidth, userCoverWidthRef.current[viewSelector]\n', 
    //     '-'+sessionWindowID+'-', viewSelector, coverResizeWidth, userCoverWidthRef.current[viewSelector])

    useEffect(()=>{

        centralPanelElementRef.current = coverPanelElementRef.current.closest('#central-panel')
        handleRef.current = centralPanelElementRef.current.querySelector('#handle')

    },[])

    useEffect(()=>{

        // console.log('switching coverPanel view, userCoverWidthRef','-'+sessionWindowID+'-', viewSelector, {...userCoverWidthRef.current})
        const 
            viewWidth = userCoverWidthRef.current[viewSelector],
            viewTrigger = viewSelector

        windowCallbackContextRef.current.changeView = ()=>{

            const constraints = {
                minX:MIN_COVER_FRAME_WIDTH,
                minY:coverFrameElementRef.current?.offsetHeight || 0,
                maxX: Math.min(
                    workboxInnerFrameWidthFromContextRef.current * MAX_COVER_FRAME_RATIO,
                    workboxInnerFrameWidthFromContextRef.current - MIN_CONTENTS_FRAME_WIDTH),
                maxY:coverFrameElementRef.current?.offsetHeight || 0,
            }
            constraintsRef.current = constraints
            const appliedWidth = Math.min(constraints.maxX, viewWidth)
            // console.log('updating cover resize width', '-'+sessionWindowID+'-',viewSelector, userCoverWidthRef.current)
            coverFrameElementRef.current.style.width = appliedWidth + 'px'
            // console.log('coverFrameElementRef.current.style.width',coverFrameElementRef.current.style.width)
            userCoverWidthRef.current[viewTrigger] = appliedWidth
            setCoverResizeWidth(appliedWidth)

        }

    },[viewSelector])

    useEffect(()=>{

        if (workboxInnerFrameWidthFromContext === 0) return

        // console.log('updating from workboxInnerFrameWidthFromContext',
        //     '-' + sessionWindowID + '-',workboxInnerFrameWidthFromContext)

        const centralPanelWidth = centralPanelElementRef.current.offsetWidth
        const coverWidth = 
            displayCodeRef.current == 'out'
                ? coverFrameElementRef.current.offsetWidth
                : userCoverWidthRef.current[viewSelectorRef.current]

        clearTimeout(observerTimeoutRef.current)

        const calculatedMaxCoverWidth = 
            Math.min(
                workboxInnerFrameWidthFromContext * MAX_COVER_FRAME_RATIO,
                workboxInnerFrameWidthFromContext - MIN_CONTENTS_FRAME_WIDTH)

        if (calculatedMaxCoverWidth < coverWidth) {

            const newWidth = Math.max(MIN_COVER_FRAME_WIDTH, calculatedMaxCoverWidth)

            if (coverFrameElementRef.current.style.transition != 'none') coverFrameElementRef.current.style.transition = 'none'
            displayCodeRef.current == 'out' && (coverFrameElementRef.current.style.width = newWidth + 'px')

            userCoverWidthRef.current[viewSelectorRef.current] = newWidth

            // console.log('setting userCoverWidthRef.current[viewSelector] for workbox inner frame\n',
            //     '-'+sessionWindowID+'-',viewSelectorRef.current, userCoverWidthRef.current )

            if (coverFrameElementRef.current.style.transition == 'none') {
                setTimeout(()=>{
                    coverFrameElementRef.current.style.transition = 'width 0.5s'
                },1)
            }

            setCoverResizeWidth(newWidth) // coerce render

        }

        const constraints = {
            minX:MIN_COVER_FRAME_WIDTH,
            minY:coverFrameElementRef.current?.offsetHeight || 0,
            maxX: calculatedMaxCoverWidth,
            maxY:coverFrameElementRef.current?.offsetHeight || 0,
        }
        constraintsRef.current = constraints

    },[workboxInnerFrameWidthFromContext])

    useEffect(()=>{

        clearTimeout(targetTimeoutRef.current)

        const 
            element = coverPanelElementRef.current,
            timeout = 500

        if (displayConfigCode == 'out') {

            targetTimeoutRef.current = setTimeout(()=>{
                element.style.boxShadow = 'none'
                handleRef.current.style.opacity = 0.8
                handleRef.current.style.visibility = 'visible'
            },timeout)

        } else if (displayConfigCode == 'over') {

            element.style.boxShadow = 'none'
            handleRef.current.style.opacity = 0
            handleRef.current.style.visibility = 'hidden'

        } else { // 'under'

            element.style.boxShadow = '3px 3px 6px 6px inset silver'
            handleRef.current.style.opacity = 0
            handleRef.current.style.visibility = 'hidden'

        }

    },[displayConfigCode])

    // resizable callbacks...
    const onResizeStart = () => {
        coverFrameElementRef.current.style.transition = 'none'
        const constraints = {
            minX:MIN_COVER_FRAME_WIDTH,
            minY:coverFrameElementRef.current?.offsetHeight || 0,
            maxX: Math.min(
                workboxInnerFrameWidthFromContext * MAX_COVER_FRAME_RATIO,
                workboxInnerFrameWidthFromContext - MIN_CONTENTS_FRAME_WIDTH),
            maxY:coverFrameElementRef.current?.offsetHeight || 0,
        }
        constraintsRef.current = constraints

        // console.log('onResizeStart constraints', constraints)

    }

    const onResize = (event, {size, handle}) => {

        coverFrameElementRef.current.style.width = size.width + 'px'
        setCoverResizeWidth(size.width)

    }

    const onResizeStop = (e,{size, handle}) => {
        coverFrameElementRef.current.style.transition = 'width 0.5s'

        userCoverWidthRef.current[viewSelectorRef.current] = size.width
        setCoverResizeWidth(size.width)

        // console.log('setting userCoverWidthRef.current[viewSelectorRef.current] for resize\n',
        //         '-'+sessionWindowID+'-',viewSelectorRef.current, userCoverWidthRef.current )

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
        height = {coverFrameElementRef.current?.offsetHeight || 0} 
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
        { children, displayConfigCode } = props,
        contentsPanelElementRef = useRef(null),
        timeoutRef = useRef(null)

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
        <Box data-type = 'contents-panel' ref = {contentsPanelElementRef} style = {contentsPanelStyles}> {children}</Box>
    </Box>
})

export const SettingsPanel = (props) => {
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

