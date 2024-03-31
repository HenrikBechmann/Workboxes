// CentralPanel.tsx
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

const 
    MIN_COVER_FRAME_WIDTH = 250,
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

const CentralPanel = (props) => {

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
            timeout = 800,
            previousDisplayConfigCode = previousDisplayConfigCodeRef.current

        clearTimeout(timeoutRef.current)

        if (displayConfigCode == 'both') {

            // baseline
            coverFrameElement.style.transitionDelay = 'unset'
            contentsFrameElement.style.transitionDelay = 'unset'

            coverFrameElement.style.transition = 'width 0.5s'
            contentsFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden elements
            if (previousDisplayConfigCode == 'contents') { // cover was hidden

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
            coverFrameElement.style.width = userCoverWidthRef.current[viewSelectorRef.current] + 'px'
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

            coverFrameElement.style.transition = 'width 0.5s'
            contentsFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden element
            if (previousDisplayConfigCode == 'contents') { // cover was hidden

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

            coverFrameElement.style.transition = 'width 0.5s'
            contentsFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden element
            if (previousDisplayConfigCode == 'cover') { // contents was hidden

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

export default CentralPanel
