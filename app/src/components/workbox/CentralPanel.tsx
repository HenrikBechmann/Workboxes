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
            documentFrameElementRef, 
            databoxFrameElementRef, 
            userDocumentWidthRef, // set by user through drag tag
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
        - documentFrameElement: flex, width, minWidth, transition, transitionDelay
        - documentFrameElement.firstChild: width, left, right (panel)
        - databoxFrameElement: flex, width, minWidth, transition, transitionDelay
        - contantsFrameElement.firstChild: width, left, right (panel)

        see useEffect for displayConfigCode
    */
    useEffect(()=>{

        if (previousDisplayConfigCodeRef.current == displayConfigCode) return // startup

        const 
            centralPanelElement = centralPanelElementRef.current, // flex, width
            documentFrameElement = documentFrameElementRef.current, // flex, width, minWidth, transition, transitionDelay
            databoxFrameElement = databoxFrameElementRef.current, // flex, width, minWidth, transition, transitionDelay
            transitionDelay = '0.3s',
            timeout = 800,
            previousDisplayConfigCode = previousDisplayConfigCodeRef.current

        clearTimeout(timeoutRef.current)

        if (displayConfigCode == 'both') {

            // baseline
            documentFrameElement.style.transitionDelay = 'unset'
            databoxFrameElement.style.transitionDelay = 'unset'

            documentFrameElement.style.transition = 'width 0.5s'
            databoxFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden elements
            if (previousDisplayConfigCode == 'databox') { // document was hidden

                documentFrameElement.firstChild.style.width = userDocumentWidthRef.current[viewSelectorRef.current] + 'px'
                documentFrameElement.firstChild.style.left = 0
                documentFrameElement.firstChild.style.right = 'auto'

            } else { // databox was hidden

                databoxFrameElement.firstChild.style.width = 
                    Math.max(MIN_CONTENTS_FRAME_WIDTH,(centralPanelElement.offsetWidth - 
                        userDocumentWidthRef.current[viewSelectorRef.current])) + 'px'
                databoxFrameElement.firstChild.style.left = 'auto'
                databoxFrameElement.firstChild.style.right = 0

            }

            // freeze central frame
            centralPanelElement.style.width = centralPanelElement.offsetWidth + 'px'
            centralPanelElement.style.flex = '0 0 auto'

            // freeze document
            documentFrameElement.style.width = documentFrameElement.offsetWidth + 'px'
            documentFrameElement.style.flex = '0 0 auto'

            // freeze databox
            centralPanelElement.style.minWidth = (MIN_COVER_FRAME_WIDTH + MIN_CONTENTS_FRAME_WIDTH) + 'px'
            databoxFrameElement.style.width = databoxFrameElement.offsetWidth + 'px'
            databoxFrameElement.style.flex = '0 0 auto'

            // set animation targets
            documentFrameElement.style.width = userDocumentWidthRef.current[viewSelectorRef.current] + 'px'
            databoxFrameElement.style.width = 
                Math.max(MIN_CONTENTS_FRAME_WIDTH,(centralPanelElement.offsetWidth - 
                    userDocumentWidthRef.current[viewSelectorRef.current])) + 'px'

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                documentFrameElement.style.transition = 'none'
                databoxFrameElement.style.transition = 'none'

                // restore databox frame defaults
                databoxFrameElement.style.flex = '1 0 auto'
                databoxFrameElement.style.width = 'auto'
                databoxFrameElement.style.minWidth = MIN_CONTENTS_FRAME_WIDTH + 'px'

                // restore document frame defaults
                documentFrameElement.style.minWidth = MIN_COVER_FRAME_WIDTH + 'px'

                // restore panel defaults
                databoxFrameElement.firstChild.style.width = '100%'
                documentFrameElement.firstChild.style.width = '100%'

                // restore central panel defaults
                centralPanelElement.style.flex = '1 0 auto'
                centralPanelElement.style.width = 'auto'

            },timeout)

        } else if (displayConfigCode == 'document') {

            // set transition delay for shadow
            documentFrameElement.style.transitionDelay = transitionDelay
            databoxFrameElement.style.transitionDelay = transitionDelay

            documentFrameElement.style.transition = 'width 0.5s'
            databoxFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden element
            if (previousDisplayConfigCode == 'databox') { // document was hidden

                documentFrameElement.firstChild.style.width = centralPanelElement.offsetWidth + 'px'
                documentFrameElement.firstChild.style.right = 0
                documentFrameElement.firstChild.style.left = 'auto'

            }

            // freeze central frame
            centralPanelElement.style.minWidth = MIN_COVER_FRAME_WIDTH + 'px'
            centralPanelElement.style.width = centralPanelElement.offsetWidth + 'px'
            centralPanelElement.style.flex = '0 0 auto'

            // freeze document
            documentFrameElement.style.width = documentFrameElement.offsetWidth + 'px'
            documentFrameElement.style.flex = '0 0 auto'

            // freeze databox frame for hiding
            databoxFrameElement.style.width = databoxFrameElement.offsetWidth + 'px'
            databoxFrameElement.style.flex = '0 0 auto'
            databoxFrameElement.firstChild.style.width = databoxFrameElement.firstChild.offsetWidth + 'px'
            databoxFrameElement.style.minWidth = 0

            // set animation targets
            databoxFrameElement.style.width = 0
            documentFrameElement.style.width = centralPanelElement.offsetWidth + 'px'

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                documentFrameElement.style.transition = 'none'
                databoxFrameElement.style.transition = 'none'
                databoxFrameElement.style.transitionDelay = 'unset'

                // set config for visible frame
                documentFrameElement.style.flex = '1 0 auto'
                documentFrameElement.style.width = 'auto'
                documentFrameElement.style.minWidth = MIN_COVER_FRAME_WIDTH + 'px'

                // set visible panel config
                documentFrameElement.firstChild.style.width = '100%'
                documentFrameElement.firstChild.style.right = 'auto'
                documentFrameElement.firstChild.style.left = 0

                // restore central panel defaults
                centralPanelElement.style.flex = '1 0 auto'
                centralPanelElement.style.width = 'auto'

            },timeout)

        } else { // displayConfigCode == 'databox'

            // set tranision delay for shadow
            documentFrameElement.style.transitionDelay = transitionDelay
            databoxFrameElement.style.transitionDelay = transitionDelay

            documentFrameElement.style.transition = 'width 0.5s'
            databoxFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden element
            if (previousDisplayConfigCode == 'document') { // databox was hidden

                databoxFrameElement.firstChild.style.width = centralPanelElement.offsetWidth + 'px'
                databoxFrameElement.firstChild.style.right = 'auto'
                databoxFrameElement.firstChild.style.left = 0

            }

            // freeze central frame
            centralPanelElement.style.minWidth = MIN_CONTENTS_FRAME_WIDTH + 'px'
            centralPanelElement.style.width = centralPanelElement.offsetWidth + 'px'
            centralPanelElement.style.flex = '0 0 auto'

            // freeze document for hiding
            documentFrameElement.style.width = documentFrameElement.offsetWidth + 'px'
            documentFrameElement.style.flex = '0 0 auto'
            documentFrameElement.firstChild.style.width = documentFrameElement.firstChild.offsetWidth + 'px'
            documentFrameElement.style.minWidth = 0

            // freeze databox
            databoxFrameElement.style.width = databoxFrameElement.offsetWidth + 'px'
            databoxFrameElement.style.flex = '0 0 auto'

            // set animation targets
            databoxFrameElement.style.width = centralPanelElement.offsetWidth + 'px'
            documentFrameElement.style.width = 0

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                documentFrameElement.style.transition = 'none'
                documentFrameElement.style.transitionDelay = 'unset'
                databoxFrameElement.style.transition = 'none'

                // set visible frame config
                databoxFrameElement.style.width = 'auto'
                databoxFrameElement.style.flex = '1 0 auto'
                databoxFrameElement.style.minWidth = MIN_CONTENTS_FRAME_WIDTH + 'px'

                // restore visible panel config
                databoxFrameElement.firstChild.style.width = '100%'
                databoxFrameElement.firstChild.style.right = 0
                databoxFrameElement.firstChild.style.left = 'auto'

                // restore central panel defaults
                centralPanelElement.style.width = 'auto'
                centralPanelElement.style.flex = '1 0 auto'

            },timeout)
        }

        previousDisplayConfigCodeRef.current = displayConfigCode

    },[displayConfigCode])

    // CentralWidthContext informs DocumentPanel
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
