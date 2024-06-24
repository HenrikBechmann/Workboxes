// PrimaryFrame.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { 
    useRef, 
    useEffect, 
    CSSProperties, 
} from 'react'

import {
    Box
} from '@chakra-ui/react'

import { useWorkboxHandler } from './Workbox'

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

            children, // DocumentFrame and ItemlistFrame
            documentFrameElementRef,
            itemlistFrameElementRef,

        } = props,

        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),

        // triggers state change...
        displayCode = workboxHandler.settings.configuration.content.displaycode, // both, itemlist, document

        // controls
        previousDisplayConfigCodeRef = useRef(displayCode), // determine change being made
        primaryFrameElementRef = useRef(null),
        timeoutRef = useRef(null)

    /*
        Respond to change in displayCode; causes direct DOM manipulation.
        Adjusts the CSS of 
        - primaryFrameElement: flex, width
        - documentFrameElement: flex, width, minWidth, transition, transitionDelay
        - documentFrameElement.firstChild = documentPanelElement: width, left, right (panel) 
        - itemlistFrameElement: flex, width, minWidth, transition, transitionDelay
        - itemlistFrameElement.firstChild = itemlistPanelElement: width, left, right (panel)
        Three cases if displayCode: both, document, itemlist
    */
    useEffect(()=>{

        if (previousDisplayConfigCodeRef.current == displayCode) return // startup

        const
            // elements being manipulated 
            primaryFrameElement = primaryFrameElementRef.current, // flex, width

            documentFrameElement = documentFrameElementRef.current, // flex, width, minWidth, transition, transitionDelay
            documentPanelElement = documentFrameElement.firstChild,

            itemlistFrameElement = itemlistFrameElementRef.current, // flex, width, minWidth, transition, transitionDelay
            itemlistPanelElement = itemlistFrameElement.firstChild,

            // controls
            TRANSITION_DELAY = '0.3s',
            TIMEOUT = 800,
            previousDisplayConfigCode = previousDisplayConfigCodeRef.current, // to manage change

            // workboxHandler settings
            UIDocumentWidth = workboxHandler.dimensions.UIDocumentWidth // user-set width

        clearTimeout(timeoutRef.current) // allows interrupt

        if (displayCode == 'both') {

            // no transition delay for shadows with transtion to both
            documentFrameElement.style.transitionDelay = 'unset'
            itemlistFrameElement.style.transitionDelay = 'unset'

            // animation
            documentFrameElement.style.transition = 'width 0.5s'
            itemlistFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden elements
            if (previousDisplayConfigCode == 'itemlist') { // document was hidden

                documentPanelElement.style.width = UIDocumentWidth + 'px'
                documentPanelElement.style.left = 0
                documentPanelElement.style.right = 'auto'

            } else { // itemlist was hidden

                itemlistPanelElement.style.width = 
                    Math.max(MIN_ITEMLIST_FRAME_WIDTH,
                        (primaryFrameElement.offsetWidth - UIDocumentWidth)) + 'px'
                itemlistPanelElement.style.left = 'auto'
                itemlistPanelElement.style.right = 0

            }

            // set minWidth for primary Element to accommodate both
            primaryFrameElement.style.minWidth = (MIN_DOCUMENT_FRAME_WIDTH + MIN_ITEMLIST_FRAME_WIDTH) + 'px'

            // freeze primary frame
            primaryFrameElement.style.width = primaryFrameElement.offsetWidth + 'px'
            primaryFrameElement.style.flex = '0 0 auto' // grow, shrink, basis

            // freeze document
            documentFrameElement.style.width = documentFrameElement.offsetWidth + 'px'
            documentFrameElement.style.flex = '0 0 auto' // permanent for this displaycode

            // freeze itemlist
            itemlistFrameElement.style.width = itemlistFrameElement.offsetWidth + 'px'
            itemlistFrameElement.style.flex = '0 0 auto'

            // set animation targets
            documentFrameElement.style.width = UIDocumentWidth + 'px'
            itemlistFrameElement.style.width = 
                Math.max(MIN_ITEMLIST_FRAME_WIDTH,(primaryFrameElement.offsetWidth - 
                    UIDocumentWidth)) + 'px'

            // wait for result, then restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                documentFrameElement.style.transition = 'none'
                itemlistFrameElement.style.transition = 'none'

                // restore itemlist frame defaults
                itemlistFrameElement.style.flex = '1 0 auto'
                itemlistFrameElement.style.width = 'auto'
                itemlistFrameElement.style.minWidth = MIN_ITEMLIST_FRAME_WIDTH + 'px'

                // restore document frame defaults
                documentFrameElement.style.minWidth = MIN_DOCUMENT_FRAME_WIDTH + 'px'

                // restore both panel width defaults
                itemlistPanelElement.style.width = '100%'
                documentPanelElement.style.width = '100%'

                // restore primary frame defaults
                primaryFrameElement.style.flex = '1 0 auto'
                primaryFrameElement.style.width = 'auto'

            },TIMEOUT)

        } else if (displayCode == 'document') {

            // set transition delay for shadows
            documentFrameElement.style.transitionDelay = TRANSITION_DELAY
            itemlistFrameElement.style.transitionDelay = TRANSITION_DELAY

            // animation
            documentFrameElement.style.transition = 'width 0.5s'
            itemlistFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden element
            if (previousDisplayConfigCode == 'itemlist') { // document was hidden

                documentPanelElement.style.width = primaryFrameElement.offsetWidth + 'px'
                documentPanelElement.style.left = 'auto'
                documentPanelElement.style.right = 0

            }

            // freeze primary frame
            primaryFrameElement.style.minWidth = MIN_DOCUMENT_FRAME_WIDTH + 'px'
            primaryFrameElement.style.width = primaryFrameElement.offsetWidth + 'px'
            primaryFrameElement.style.flex = '0 0 auto'

            // freeze document
            documentFrameElement.style.width = documentFrameElement.offsetWidth + 'px'
            documentFrameElement.style.flex = '0 0 auto'

            // freeze itemlist frame for hiding
            itemlistFrameElement.style.width = itemlistFrameElement.offsetWidth + 'px'
            itemlistFrameElement.style.flex = '0 0 auto'
            itemlistFrameElement.style.minWidth = 0

            // freeze itemlist panel for hiding
            itemlistPanelElement.style.width = itemlistPanelElement.offsetWidth + 'px'
            
            // set animation targets
            itemlistFrameElement.style.width = 0
            documentFrameElement.style.width = primaryFrameElement.offsetWidth + 'px'

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                documentFrameElement.style.transition = 'none'
                documentFrameElement.style.transitionDelay = 'unset'
                itemlistFrameElement.style.transition = 'none'
                itemlistFrameElement.style.transitionDelay = 'unset'

                // set config for visible frame
                documentFrameElement.style.flex = '1 0 auto'
                documentFrameElement.style.width = 'auto'
                documentFrameElement.style.minWidth = MIN_DOCUMENT_FRAME_WIDTH + 'px'

                // set config for visible panel
                documentPanelElement.style.width = '100%'
                documentPanelElement.style.right = 'auto'
                documentPanelElement.style.left = 0

                // restore primary frame defaults
                primaryFrameElement.style.flex = '1 0 auto'
                primaryFrameElement.style.width = 'auto'

            },TIMEOUT)

        } else { // displayCode == 'itemlist'

            // set transition delay for shadows
            documentFrameElement.style.transitionDelay = TRANSITION_DELAY
            itemlistFrameElement.style.transitionDelay = TRANSITION_DELAY

            // animation
            documentFrameElement.style.transition = 'width 0.5s'
            itemlistFrameElement.style.transition = 'width 0.5s'

            // anticipate config of hidden element
            if (previousDisplayConfigCode == 'document') { // itemlist was hidden

                itemlistPanelElement.style.width = primaryFrameElement.offsetWidth + 'px'
                itemlistPanelElement.style.right = 'auto'
                itemlistPanelElement.style.left = 0

            }

            // freeze primary frame
            primaryFrameElement.style.minWidth = MIN_ITEMLIST_FRAME_WIDTH + 'px'
            primaryFrameElement.style.width = primaryFrameElement.offsetWidth + 'px'
            primaryFrameElement.style.flex = '0 0 auto'

            // freeze itemlist
            itemlistFrameElement.style.width = itemlistFrameElement.offsetWidth + 'px'
            itemlistFrameElement.style.flex = '0 0 auto'

            // freeze document frame for hiding
            documentFrameElement.style.width = documentFrameElement.offsetWidth + 'px'
            documentFrameElement.style.flex = '0 0 auto'
            documentFrameElement.style.minWidth = 0

            // freeze document panel for hiding
            documentPanelElement.style.width = documentPanelElement.offsetWidth + 'px'

            // set animation targets
            itemlistFrameElement.style.width = primaryFrameElement.offsetWidth + 'px'
            documentFrameElement.style.width = 0

            // wait for result; restore defaults
            timeoutRef.current = setTimeout(()=>{

                // restore transition defaults
                documentFrameElement.style.transition = 'none'
                documentFrameElement.style.transitionDelay = 'unset'
                itemlistFrameElement.style.transition = 'none'
                itemlistFrameElement.style.transitionDelay = 'unset'

                // set visible frame config
                itemlistFrameElement.style.width = 'auto'
                itemlistFrameElement.style.flex = '1 0 auto'
                itemlistFrameElement.style.minWidth = MIN_ITEMLIST_FRAME_WIDTH + 'px'

                // restore visible panel config
                itemlistPanelElement.style.width = '100%'
                itemlistPanelElement.style.right = 0
                itemlistPanelElement.style.left = 'auto'

                // restore primary frame defaults
                primaryFrameElement.style.width = 'auto'
                primaryFrameElement.style.flex = '1 0 auto'

            },TIMEOUT)
        }

        previousDisplayConfigCodeRef.current = displayCode

    },[displayCode])

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
