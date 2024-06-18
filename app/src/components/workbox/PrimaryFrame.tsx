// PrimaryFrame.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { 
    useRef, 
    useEffect, 
    // useState, 
    // useCallback, 
    // useContext, 
    CSSProperties, 
} from 'react'

import {
    Box
} from '@chakra-ui/react'

const 
    MIN_DOCUMENT_FRAME_WIDTH = 250,
    MIN_ITEMLIST_FRAME_WIDTH = 250,
    MIN_PRIMARY_FRAME_WIDTH = MIN_DOCUMENT_FRAME_WIDTH + MIN_ITEMLIST_FRAME_WIDTH,
    MIN_PRIMARY_FRAME_HEIGHT = 300

const primaryFrameStyles = {
    height:'100%',
    borderRadius:'8px',
    backgroundColor:'transparent', 
    position:'relative',
    display:'flex',
    flexWrap: 'nowrap',
    flex: '1 0 auto',
    minWidth: MIN_PRIMARY_FRAME_WIDTH + 'px',
    minHeight: MIN_PRIMARY_FRAME_HEIGHT + 'px',
    transition:'none', // set as needed
    boxSizing: 'border-box',
} as CSSProperties

const PrimaryFrame = (props) => {

    const 
        {
            children, 
            // windowSessionID,
            displayConfigCode, 
            documentFrameElementRef, 
            itemlistFrameElementRef, 
            UIDocumentWidthRef, // set by user through drag tag
            viewSetting,
        } = props,
        previousDisplayConfigCodeRef = useRef(displayConfigCode),
        primaryFrameElementRef = useRef(null),
        timeoutRef = useRef(null),
        viewSettingRef = useRef(null)

        viewSettingRef.current = viewSetting

    /*
        Respond to change in displayConfigCode; causes direct DOM manipulation.
        Adjusts the CSS of 
        - centralPanelElement: flex, width
        - documentFrameElement: flex, width, minWidth, transition, transitionDelay
        - documentFrameElement.firstChild: width, left, right (panel)
        - itemlistFrameElement: flex, width, minWidth, transition, transitionDelay
        - contantsFrameElement.firstChild: width, left, right (panel)

        see useEffect for displayConfigCode
    */
    useEffect(()=>{

        if (previousDisplayConfigCodeRef.current == displayConfigCode) return // startup

        const 
            centralPanelElement = primaryFrameElementRef.current, // flex, width
            documentFrameElement = documentFrameElementRef.current, // flex, width, minWidth, transition, transitionDelay
            itemlistFrameElement = itemlistFrameElementRef.current, // flex, width, minWidth, transition, transitionDelay
            transitionDelay = '0.3s',
            timeout = 800,
            previousDisplayConfigCode = previousDisplayConfigCodeRef.current

        clearTimeout(timeoutRef.current)

        if (displayConfigCode == 'both') {

            // baseline
            documentFrameElement.style.transitionDelay = 'unset'
            itemlistFrameElement.style.transitionDelay = 'unset'

            documentFrameElement.style.transition = 'width 0.5s'
            itemlistFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden elements
            if (previousDisplayConfigCode == 'itembox') { // document was hidden

                documentFrameElement.firstChild.style.width = UIDocumentWidthRef.current[viewSettingRef.current] + 'px'
                documentFrameElement.firstChild.style.left = 0
                documentFrameElement.firstChild.style.right = 'auto'

            } else { // itembox was hidden

                itemlistFrameElement.firstChild.style.width = 
                    Math.max(MIN_ITEMLIST_FRAME_WIDTH,(centralPanelElement.offsetWidth - 
                        UIDocumentWidthRef.current[viewSettingRef.current])) + 'px'
                itemlistFrameElement.firstChild.style.left = 'auto'
                itemlistFrameElement.firstChild.style.right = 0

            }

            // freeze central frame
            centralPanelElement.style.width = centralPanelElement.offsetWidth + 'px'
            centralPanelElement.style.flex = '0 0 auto'

            // freeze document
            documentFrameElement.style.width = documentFrameElement.offsetWidth + 'px'
            documentFrameElement.style.flex = '0 0 auto'

            // freeze itembox
            centralPanelElement.style.minWidth = (MIN_DOCUMENT_FRAME_WIDTH + MIN_ITEMLIST_FRAME_WIDTH) + 'px'
            itemlistFrameElement.style.width = itemlistFrameElement.offsetWidth + 'px'
            itemlistFrameElement.style.flex = '0 0 auto'

            // set animation targets
            documentFrameElement.style.width = UIDocumentWidthRef.current[viewSettingRef.current] + 'px'
            itemlistFrameElement.style.width = 
                Math.max(MIN_ITEMLIST_FRAME_WIDTH,(centralPanelElement.offsetWidth - 
                    UIDocumentWidthRef.current[viewSettingRef.current])) + 'px'

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                documentFrameElement.style.transition = 'none'
                itemlistFrameElement.style.transition = 'none'

                // restore itembox frame defaults
                itemlistFrameElement.style.flex = '1 0 auto'
                itemlistFrameElement.style.width = 'auto'
                itemlistFrameElement.style.minWidth = MIN_ITEMLIST_FRAME_WIDTH + 'px'

                // restore document frame defaults
                documentFrameElement.style.minWidth = MIN_DOCUMENT_FRAME_WIDTH + 'px'

                // restore panel defaults
                itemlistFrameElement.firstChild.style.width = '100%'
                documentFrameElement.firstChild.style.width = '100%'

                // restore central panel defaults
                centralPanelElement.style.flex = '1 0 auto'
                centralPanelElement.style.width = 'auto'

            },timeout)

        } else if (displayConfigCode == 'document') {

            // set transition delay for shadow
            documentFrameElement.style.transitionDelay = transitionDelay
            itemlistFrameElement.style.transitionDelay = transitionDelay

            documentFrameElement.style.transition = 'width 0.5s'
            itemlistFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden element
            if (previousDisplayConfigCode == 'itembox') { // document was hidden

                documentFrameElement.firstChild.style.width = centralPanelElement.offsetWidth + 'px'
                documentFrameElement.firstChild.style.right = 0
                documentFrameElement.firstChild.style.left = 'auto'

            }

            // freeze central frame
            centralPanelElement.style.minWidth = MIN_DOCUMENT_FRAME_WIDTH + 'px'
            centralPanelElement.style.width = centralPanelElement.offsetWidth + 'px'
            centralPanelElement.style.flex = '0 0 auto'

            // freeze document
            documentFrameElement.style.width = documentFrameElement.offsetWidth + 'px'
            documentFrameElement.style.flex = '0 0 auto'

            // freeze itembox frame for hiding
            itemlistFrameElement.style.width = itemlistFrameElement.offsetWidth + 'px'
            itemlistFrameElement.style.flex = '0 0 auto'
            itemlistFrameElement.firstChild.style.width = itemlistFrameElement.firstChild.offsetWidth + 'px'
            itemlistFrameElement.style.minWidth = 0

            // set animation targets
            itemlistFrameElement.style.width = 0
            documentFrameElement.style.width = centralPanelElement.offsetWidth + 'px'

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                documentFrameElement.style.transition = 'none'
                itemlistFrameElement.style.transition = 'none'
                itemlistFrameElement.style.transitionDelay = 'unset'

                // set config for visible frame
                documentFrameElement.style.flex = '1 0 auto'
                documentFrameElement.style.width = 'auto'
                documentFrameElement.style.minWidth = MIN_DOCUMENT_FRAME_WIDTH + 'px'

                // set visible panel config
                documentFrameElement.firstChild.style.width = '100%'
                documentFrameElement.firstChild.style.right = 'auto'
                documentFrameElement.firstChild.style.left = 0

                // restore central panel defaults
                centralPanelElement.style.flex = '1 0 auto'
                centralPanelElement.style.width = 'auto'

            },timeout)

        } else { // displayConfigCode == 'itembox'

            // set tranision delay for shadow
            documentFrameElement.style.transitionDelay = transitionDelay
            itemlistFrameElement.style.transitionDelay = transitionDelay

            documentFrameElement.style.transition = 'width 0.5s'
            itemlistFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden element
            if (previousDisplayConfigCode == 'document') { // itembox was hidden

                itemlistFrameElement.firstChild.style.width = centralPanelElement.offsetWidth + 'px'
                itemlistFrameElement.firstChild.style.right = 'auto'
                itemlistFrameElement.firstChild.style.left = 0

            }

            // freeze central frame
            centralPanelElement.style.minWidth = MIN_ITEMLIST_FRAME_WIDTH + 'px'
            centralPanelElement.style.width = centralPanelElement.offsetWidth + 'px'
            centralPanelElement.style.flex = '0 0 auto'

            // freeze document for hiding
            documentFrameElement.style.width = documentFrameElement.offsetWidth + 'px'
            documentFrameElement.style.flex = '0 0 auto'
            documentFrameElement.firstChild.style.width = documentFrameElement.firstChild.offsetWidth + 'px'
            documentFrameElement.style.minWidth = 0

            // freeze itembox
            itemlistFrameElement.style.width = itemlistFrameElement.offsetWidth + 'px'
            itemlistFrameElement.style.flex = '0 0 auto'

            // set animation targets
            itemlistFrameElement.style.width = centralPanelElement.offsetWidth + 'px'
            documentFrameElement.style.width = 0

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                documentFrameElement.style.transition = 'none'
                documentFrameElement.style.transitionDelay = 'unset'
                itemlistFrameElement.style.transition = 'none'

                // set visible frame config
                itemlistFrameElement.style.width = 'auto'
                itemlistFrameElement.style.flex = '1 0 auto'
                itemlistFrameElement.style.minWidth = MIN_ITEMLIST_FRAME_WIDTH + 'px'

                // restore visible panel config
                itemlistFrameElement.firstChild.style.width = '100%'
                itemlistFrameElement.firstChild.style.right = 0
                itemlistFrameElement.firstChild.style.left = 'auto'

                // restore central panel defaults
                centralPanelElement.style.width = 'auto'
                centralPanelElement.style.flex = '1 0 auto'

            },timeout)
        }

        previousDisplayConfigCodeRef.current = displayConfigCode

    },[displayConfigCode])

    // CentralWidthContext informs DocumentFrame
    return <Box 
        data-type = 'primary-frame' 
        ref = {primaryFrameElementRef} 
        id = 'primary-frame' 
        style = {primaryFrameStyles}
    >
        {children}
    </Box>
}

export default PrimaryFrame
