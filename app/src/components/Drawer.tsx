// Drawer.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useState, useMemo, useEffect, useLayoutEffect, useCallback, CSSProperties } from 'react'
import { 
    Button, Text, Heading, Box,
    Grid, GridItem, VStack, HStack,
    Center, Tooltip
} from '@chakra-ui/react'

import { isMobile } from '../index'

import handleIcon from '../../assets/handle.png'
import helpIcon from '../../assets/help.png'
import closeIcon from '../../assets/close.png'

// ==========================[ static CSS values ]===============================

const MIN_DRAWER_WIDTH = 250
const MIN_DRAWER_HEIGHT = 100
// for restore after drag-resize and container-resize
// the drawer frame's length is froxen during transition; otherwise set to width:100% and height:100%
const TRANSITION_CSS = 'visibility .4s, opacity .4s, width .4s, height .4s'

const iconWrapperStyles = {
    opacity:0.7,
}

const iconStyles = {
    height:'20px',
    width:'20px',
}

const closeIconStyle = {
    position:'absolute',
    margint:'3px',
    top:0,
    right:0,
    height:'24px',
    width:'24px',
    opacity:0.7,
} as CSSProperties

const smallerIconStyles = {
    height:'18px', 
    width:'18px',
}

const headerBoxStyles = {
    boxSizing: 'border-box',
    display: 'relative',
    height: '100%',
    borderBottom: '1px solid silver'
} as CSSProperties

const subTitleStyles = { 
    whiteSpace: "nowrap",
    overflow: "hidden",
    fontStyle: "italic",
    textOverflow: "ellipsis",
    maxWidth:'100%',
    padding:'0 6px',
    fontSize: 'small',
    color:'gray',
} as CSSProperties

const drawerTypes = {
    DATA:'data',
    LOOKUP:'lookup',
    HELP:'help',
    MESSAGES:'messages',
}

// =============================[ useDrawers ]===========================
// establish drawers for any context

export const useDrawers = (onCompleteFunctions) => {

    //---------------------- container resize support ----------------

    const
        [drawersState, setDrawersState] = useState('setup'), // to collect pageElementRef
        [containerDimensions, setContainerDimensions] = useState(null), // to rerender for drawers on resize
        containerElementRef = useRef(null), // to pass to drawers
        resizeObserverRef = useRef(null) // to disconnect

    useEffect(()=>{

        const resizeObserver = new ResizeObserver(resizeCallback)
        resizeObserver.observe(containerElementRef.current) // triggers first drawer sizing
        resizeObserverRef.current = resizeObserver

        return () => {
            resizeObserverRef.current.disconnect()
        }

    },[])

    const resizeCallback = useCallback(()=>{ // to trigger drawer resize,

        const containerDimensions = {
            width:containerElementRef.current.offsetWidth,
            height:containerElementRef.current.offsetHeight
        }

        Object.assign(drawerPropsRef.current, updateDimensions(containerDimensions))

        setContainerDimensions(containerDimensions)

        if (drawersState == 'setup') setDrawersState('ready')

    },[drawersState])

    const updateDimensions = useCallback((containerDimensions) => {

        const drawerProps = drawerPropsRef.current
        Object.assign(drawerProps.data, { containerDimensions })
        Object.assign(drawerProps.lookup, { containerDimensions })
        Object.assign(drawerProps.help, { containerDimensions })
        Object.assign(drawerProps.messages, { containerDimensions })

    },[])

    //-------------------- drawer open and close functions ----------------

    // open (called by host component)
    const openDataDrawer = (context) => {
        openDrawer(drawerTypes.DATA, context)
        setDrawersState('changedrawers')
    }
    const openLookupDrawer = (context) => {
        openDrawer(drawerTypes.LOOKUP, context)
        setDrawersState('changedrawers')
    }
    const openHelpDrawer = (context) => {
        openDrawer(drawerTypes.HELP, context)
        setDrawersState('changedrawers')
    }
    const openMessagesDrawer = (context) => {
        openDrawer(drawerTypes.MESSAGES, context)
        setDrawersState('changedrawers')
    }

    // bundle
    const onOpenFunctions = {
        openDataDrawer,
        openLookupDrawer,
        openHelpDrawer,
        openMessagesDrawer,
    }

    // close (called by drawer, in response to user action)
    const onCloseLookup = useCallback(() => {
        setDrawerCloseState(drawerTypes.LOOKUP)
        onCompleteFunctions.lookup(null) // add context
        setDrawersState('changedrawers')
    },[])
    const onCloseData = useCallback(() => {
        setDrawerCloseState(drawerTypes.DATA)
        onCompleteFunctions.data(null)
        setDrawersState('changedrawers')
    },[])
    const onCloseMessages = useCallback(() => {
        setDrawerCloseState(drawerTypes.MESSAGES)
        onCompleteFunctions.messages(null)
        setDrawersState('changedrawers')
    },[])
    const onCloseHelp = useCallback(() => {
        setDrawerCloseState(drawerTypes.HELP)
        onCompleteFunctions.help(null)
        setDrawersState('changedrawers')
    },[])

    const onCloseFunctions = {
        lookup:onCloseLookup,
        data:onCloseData,
        messages:onCloseMessages,
        help:onCloseHelp,
    }

    // utilities
    const openDrawer = useCallback((drawerType, context)=>{

        Object.assign(drawerPropsRef.current[drawerType], {isOpen:true, context})

    },[])

    const setDrawerCloseState = useCallback((drawerType) => {

        drawerPropsRef.current[drawerType].isOpen = false

    },[])

    // ---------------------------- initialize drawer props ----------------------------

    // initialize drawerProps
    const drawerPropsRef = useRef({
        lookup:{
            isOpen:false,
            placement: 'top',
            containerElementRef,
            containerDimensions,
            onClose:onCloseFunctions.lookup,
            context:null,
        },
        data:{
            isOpen:false,
            placement: 'right',
            containerElementRef,
            containerDimensions,
            onClose: onCloseFunctions.data,
            context:null,
        },
        messages:{
            placement:'bottom',
            isOpen:false,
            containerElementRef,
            containerDimensions,
            onClose:onCloseFunctions.messages,
            context:null,
        },
        help:{
            isOpen: false,
            placement:'left',
            containerElementRef,
            containerDimensions,
            onClose:onCloseFunctions.help,
            context:null,
        },
    })

    // ------------------------ state change -----------------------

    useEffect(()=>{

        switch (drawersState) {
        case 'setup':
        case 'changedrawers':
            setDrawersState('ready')

        }

    },[drawersState])

    return {
        drawerProps:drawerPropsRef.current,
        containerElementRef,
        drawersState,
        onOpenFunctions,
    }

}

// ================================= [ Drawer ] ======================================

export const Drawer = (props) => {

    const
        // props 
        { placement, containerElementRef, containerDimensions, isOpen, onClose, context } = props,
        
        openParm = isOpen?'open':'closed',

        // ----------------------------- state hooks --------------------------
        isInitializedRef = useRef(false),

        // states
        [drawerState, setDrawerState] = useState('ready'),
        drawerStateRef = useRef(drawerState),
        [drawerLength, setDrawerLength] = useState(0),
        drawerRatioRef = useRef(null),
        
        // used for layouts
        placementRef = useRef(null),
        orientationRef = useRef(null),

        tabRef = useRef(null),
        
        // styles, set below, first cycle
        drawerStyleRef = useRef<CSSProperties>({
            position:'absolute',
            backgroundColor:'#ffffcc', // 'yellow',
            boxSizing:'border-box',
            // opacity:0,
            visibility:'hidden',
            // width:0,
            transition:TRANSITION_CSS
        }),

        slideStyleRef = useRef<CSSProperties>({
            width:'100%',
            height:'100%',
        }),
        
        // control data
        isDraggingRef = useRef(false),
        moveTimeoutIDRef = useRef(null),
        dragContainerRectRef = useRef(null), 
        titleRef = useRef(null),
        containerDimensionsRef = useRef(containerDimensions),

        drawerLengthRef = useRef(0), // set and revised after first cycle (setup)
        movedLengthRef = useRef(0), // based on drag
        maxLengthRef = useRef(null),
        minLengthRef = useRef(null),
        openParmRef = useRef(openParm)

    // console.log('openParm', openParm, placement)

    // console.log('placement, openParm',placement, openParm, maxLengthRef.current)
    // for closures
    drawerStateRef.current = drawerState
    placementRef.current = placement
    orientationRef.current = ['right','left'].includes(placement)?'horizontal':'vertical'
    drawerLengthRef.current = drawerLength
    openParmRef.current = openParm

    // ------------------------- core styles -------------------------
    const [drawerStyle, tabStyle, tabIconStyle] = useMemo(()=>{

        const 
            drawerStyle = drawerStyleRef.current,
            tabStyle = {
                position:'absolute',
                margin: 0,
                backgroundColor:'#ffffcc', //'yellow',
                borderTop:'1px solid gray',
                borderRight:'1px solid gray',
                borderBottom:'1px solid gray',
                borderLeft:'1px solid gray',
                display:'flex'
            } as CSSProperties,
            tabIconStyle = {
                opacity:.5
            }

        switch (placement) {
            case 'right': { // data entry
                titleRef.current = 'Edit'
                Object.assign(drawerStyle,{
                    top:'auto',
                    right:0,
                    bottom:'auto',
                    left:'auto',
                    borderLeft:'1px solid gray',
                    boxShadow:'-5px 0px 5px 0px silver',
                    borderRadius: '8px 0 0 8px',
                    zIndex:101,
                })
                Object.assign(tabStyle,{
                    top:'50%',
                    transform:'translateY(-50%)',
                    left:'-24px',
                    borderRight:'transparent',
                    borderRadius: '8px 0 0 8px',
                    height:'48px',
                    width:'24px',
                    alignItems:'center',
                    boxShadow:'-5px 0px 5px 0px silver',
                })
                Object.assign(tabIconStyle,{
                    height:'24px',
                    width:'48px',
                    transform:'rotate(90deg)'
                })
                break
            }
            case 'left': { // help
                titleRef.current = 'Help'
                Object.assign(drawerStyle,{
                    top:'auto',
                    right:'auto',
                    bottom:'auto',
                    left:0,
                    borderRight:'1px solid gray',
                    boxShadow:'5px 0 5px 0px silver',
                    borderRadius: '0 8px 8px 0',
                    zIndex:104
                })
                Object.assign(tabStyle,{
                    top:'50%',
                    transform:'translateY(-50%)',
                    right:'-24px',
                    borderLeft:'transparent',
                    borderRadius: '0 8px 8px 0',
                    height:'48px',
                    width:'24px',
                    alignItems:'center',
                    boxShadow:'5px 0 5px 0px silver',
                })
                Object.assign(tabIconStyle,{
                    height:'24px',
                    width:'24px',
                    transform:'rotate(90deg)'
                })
                break
            }
            case 'top': { // lookup
                titleRef.current = 'Lookup'
                Object.assign(drawerStyle,{
                    top:0,
                    right:'auto',
                    bottom:'auto',
                    left:'auto',
                    borderBottom:'1px solid gray',
                    boxShadow:'0px 5px 5px 0px silver',
                    borderRadius: '0 0 8px 8px',
                    zIndex:102
                })
                Object.assign(tabStyle,{
                    left:'50%',
                    transform:'translateX(-50%)',
                    bottom:'-24px',
                    borderTop:'transparent',
                    borderRadius: '0 0 8px 8px',
                    height:'25px', // anomalous by 1px
                    width:'48px',
                    justifyContent:'center',
                    boxShadow:'0px 5px 5px 0px silver',
                })
                Object.assign(tabIconStyle,{
                    height:'24px',
                    width:'24px',
                })
                break
            }
            case 'bottom': { // message
                titleRef.current = 'Messages'
                Object.assign(drawerStyle,{
                    top:'auto',
                    right:'auto',
                    bottom:0,
                    left:'auto',
                    borderTop:'1px solid gray',
                    boxShadow:'0px -5px 5px 0px silver',
                    borderRadius: '8px 8px 0 0',
                    zIndex:103
                })
                Object.assign(tabStyle,{
                    left:'50%',
                    transform:'translateX(-50%)',
                    top:'-24px',
                    borderBottom:'transparent',
                    borderRadius: '8px 8px 0 0',
                    height:'24px',
                    width:'48px',
                    justifyContent:'center',
                    boxShadow:'0px -5px 5px 0px silver',
                })
                Object.assign(tabIconStyle,{
                    height:'24px',
                    width:'24px',
                })
                break
            }
        }
        return [drawerStyle, tabStyle, tabIconStyle]
    },[placement])
    
    //-----------------------------[ drag tab ]-----------------------------

    // initialize drag listeners
    useEffect(()=>{

        const tabElement = tabRef.current

        if (isMobile) {

            tabElement.addEventListener('touchstart', startDrag)

        } else {

            tabElement.addEventListener('mousedown', startDrag)

        }

        isInitializedRef.current = true

        return () => {

            if (isMobile) {

                tabElement.removeEventListener('touchstart', startDrag)

            } else {

                tabElement.removeEventListener('mousedown', startDrag)

            }

        }

    },[])

    const startDrag = (event) => {
        event.preventDefault()
        event.stopPropagation()

        isDraggingRef.current = true
        dragContainerRectRef.current = containerElementRef.current.getBoundingClientRect()
        movedLengthRef.current = 0
        // console.log('starting drag')
        const pageElement = containerElementRef.current
        if (isMobile) {

            pageElement.addEventListener('touchmove', dragMove)
            pageElement.addEventListener('touchend', endDrag)
            pageElement.addEventListener('touchcancel', endDrag)

        } else {

            pageElement.addEventListener('mousemove', dragMove)
            pageElement.addEventListener('mouseup', endDrag)

        }

        drawerStyleRef.current.transition = 'unset'

        return false
    }

    const dragMove = (event) => {

        if (!isDraggingRef.current) return

        event.preventDefault(); 
        event.stopPropagation(); 

        // console.log('drag move')

        let clientX, clientY
        if (!isMobile) {
            // mousemove
            clientX = event.clientX
            clientY = event.clientY
        } else {
            // touchmove - assuming a single touchpoint
            clientX = event.changedTouches[0].clientX
            clientY = event.changedTouches[0].clientY
        }

        const 
            pageX = dragContainerRectRef.current.x,
            pageY = dragContainerRectRef.current.y,
            pageWidth = dragContainerRectRef.current.width,
            pageHeight = dragContainerRectRef.current.height,
            placement = placementRef.current,
            orientation = orientationRef.current

        let length
        if (orientation == 'horizontal') {
            if (placement == 'right') {
                length = pageWidth - (clientX - pageX)
            } else {
                length = clientX - pageX
            }
        } else {
            if (placement == 'top') {
                length = clientY - pageY
            } else {
                length = pageHeight - (clientY - pageY)
            }
        }

        const newLength = Math.min(Math.max(length, minLengthRef.current),maxLengthRef.current)

        movedLengthRef.current = newLength

        clearTimeout(moveTimeoutIDRef.current)

        moveTimeoutIDRef.current = setTimeout(()=>{ // in case drag past page

            isDraggingRef.current = false
            dragContainerRectRef.current = null

        },500)

        calculateDrawerLength()

        return false;

    }

    const endDrag = (event) => {

        if (!isDraggingRef.current) return

        event.preventDefault(); 
        event.stopPropagation(); 

        clearTimeout(moveTimeoutIDRef.current)
        isDraggingRef.current = false
        dragContainerRectRef.current = null
        // console.log('drag end')
        const pageElement = containerElementRef.current
        if (isMobile) {

            pageElement.removeEventListener('touchmove', dragMove)
            pageElement.removeEventListener('touchend', endDrag)
            pageElement.removeEventListener('touchcancel', endDrag)

        } else {

            pageElement.removeEventListener('mousemove', dragMove)
            pageElement.removeEventListener('mouseup', endDrag)

        }

        drawerStyleRef.current = {...drawerStyleRef.current,transition:TRANSITION_CSS}

        return false;
    }

    //-----------------------------[ end of drag tab section ]-----------------------------

    // -------------------- utility: calculate drawer length -----------------------------
    const calculateDrawerLength = () => {

        const 
            drawerLength = drawerLengthRef.current,
            defaultRatio = isMobile?0.8:0.33,
            maxRatio = 0.9,
            minRatio = isMobile?0.5:0.2,
            containerLength = 
                (['right','left'].includes(placementRef.current))
                    ? containerDimensions.width
                    : containerDimensions.height,
            minConst = 
                (['right','left'].includes(placementRef.current))
                    ? MIN_DRAWER_WIDTH
                    : MIN_DRAWER_HEIGHT,

            // calculate length and constraints from appropriate container measure
            minLength = Math.max(Math.round(minRatio * containerLength),minConst),
            maxLength = Math.round(maxRatio * containerLength),
            defaultLength = Math.max(Math.round(defaultRatio * containerLength),minLength),
            movedLength = movedLengthRef.current

        let updatedLength
        if (movedLength >= minLength && movedLength <= maxLength) {
            updatedLength = movedLength
        } else if (drawerLength >= minLength && drawerLength <= maxLength) {
            updatedLength = drawerLength
        } else {
            updatedLength = defaultLength
        }

        // save results
        minLengthRef.current = minLength
        maxLengthRef.current = maxLength

        let updateLength
        if (openParmRef.current == 'closed') {
            updateLength = 0 // hide
        } else {
            updateLength = updatedLength
        }

        // adjust CSS
        if (['left','right'].includes(placementRef.current)) {
            drawerStyleRef.current = Object.assign(drawerStyleRef.current,{width:updateLength + 'px', height:'100%'})
        } else {
            drawerStyleRef.current = Object.assign(drawerStyleRef.current,{height:updateLength + 'px', width:'100%'})
        }

        drawerRatioRef.current = updateLength === 0? 0:updatedLength/containerLength
        setDrawerLength(updatedLength)

    }

    const [isResizing, setIsResizing] = useState(false)
    const isResizingRef = useRef(false)
    const resizingTimeoutIDRef = useRef(null)

    // ------------------------------ effect hooks ----------------------------
    
    // resizing
    useLayoutEffect(() => {

        if (drawerStateRef.current == 'setup') return

        if (!isResizingRef.current) {
            setIsResizing(true)
            isResizingRef.current = true
            drawerStyleRef.current.transition = 'unset'
        }

        clearTimeout(resizingTimeoutIDRef.current)

        resizingTimeoutIDRef.current = setTimeout(()=>{
            isResizingRef.current = false
            drawerStyleRef.current.transition = TRANSITION_CSS
            setIsResizing(false)
        },1000)

        const
            containerLength = 
                (['right','left'].includes(placementRef.current))
                    ? containerDimensions.width
                    : containerDimensions.height,
            ratio = drawerRatioRef.current

        movedLengthRef.current = 0
        drawerLengthRef.current = containerLength * ratio

        calculateDrawerLength()

    },[containerDimensions])

    useEffect(()=> {

        switch (drawerState) {
        // case 'setup':
        case 'revisedvisibility':
        // case 'revisedlength':
            setDrawerState('ready')
        }

    },[drawerState])

    // update display
    drawerStyleRef.current = useMemo(()=> {

        if (['right','left'].includes(placementRef.current)) {

            if (openParm == 'open') {
                Object.assign(drawerStyleRef.current, {visibility:'visible', opacity:1, width:drawerLengthRef.current, height:'100%'})
            } else {
                Object.assign(drawerStyleRef.current, {visibility:'hidden', opacity:0, width:0, height:'100%'})
            }

        } else {

            if (openParm == 'open') {
                Object.assign(drawerStyleRef.current, {visibility:'visible', opacity:1, height:drawerLengthRef.current, width:'100%'})
            } else {
                Object.assign(drawerStyleRef.current, {visibility:'hidden', opacity:0, height:0, width:'100%'})
            }

        }

        return drawerStyleRef.current

        // setOpenState(openParm)

    }, [openParm])

    // ------------------------------ render ---------------------------
    const renderDrawerStyle = {...drawerStyleRef.current}

    return <Box data-type = {'drawer-' + placement} style = {renderDrawerStyle} >
        <Box ref = {tabRef} data-type = {'drawer-tab-' + placement} style = {tabStyle} >
            <img style = {tabIconStyle} src = {handleIcon} />
        </Box>
        {drawerState != 'setup' && <Box data-type = 'slide-box' style = {slideStyleRef.current} ><Box data-type = 'drawer-box' height = '100%' width = '100%'>
        <Grid data-type = 'drawer-grid' height = '100%' width = '100%'
          templateAreas={`"header"
                          "body"
                          "footer"`}
          gridTemplateRows={'44px 1fr 34px'}
          gridTemplateColumns={'100%'}
        >
            <GridItem data-type = 'header-area' area = 'header'>
            <Box onClick = {onClose} style = {closeIconStyle} >
                <Tooltip hasArrow label = "close the drawer">
                  <img style = {iconStyles} src = {closeIcon} />
                </Tooltip>                
            </Box>
            <Box data-type = 'header-box' style = {headerBoxStyles} >
              <Center>
                  <VStack data-type = 'sysadmin-header' spacing = '0.1rem' maxWidth = '100%'>
                  <HStack alignItems = "center" >
                      <Heading as = 'h4' mt = '3px' lineHeight = {1} fontSize = 'md'>{titleRef.current}</Heading>
                      <Box mt = "3px" style = {iconWrapperStyles} >
                          <Tooltip hasArrow label = {`Explain the "${titleRef.current}" drawer`}>
                              <img style = {smallerIconStyles} src = {helpIcon} />
                          </Tooltip>
                      </Box>
                  </HStack>
                  
                  <Box style = {subTitleStyles}>
                      Internal system properties Internal system properties Internal system properties Internal system properties</Box>
                  </VStack>
              </Center>
            </Box>
            </GridItem>
            <GridItem data-type = 'body-area' area = 'body' position = 'relative'>
                {props.children}
            </GridItem>
            <GridItem data-type = 'footer-area' area = 'footer'>
                <Box data-type = 'footer-box' p = '3px' borderTop = '1px solid silver' borderBottom = '1px solid silver'>
                    {(placement == 'top') && 
                        <>
                            <Button onClick = {onClose} size = 'xs' ml = '6px' colorScheme = "blue" >Done</Button> 
                            <Button onClick = {onClose} size = 'xs' ml = '6px'>Cancel</Button>
                        </>
                    }
                    {(placement == 'right') && 
                        <>
                            <Button onClick = {onClose} size = 'xs' ml = '6px' colorScheme = "blue" >Apply</Button>
                            <Button onClick = {onClose} size = 'xs' ml = '6px'>Cancel</Button>
                            <Button size = 'xs' ml = '6px' colorScheme = "blue" >Next</Button> 
                            <Button size = 'xs' ml = '6px' colorScheme = "blue" >Previous</Button>
                        </>
                    }
                    {(placement == 'bottom') && 
                        <>
                            <Button onClick = {onClose} size = 'xs' ml = '6px' colorScheme = "blue" >OK</Button>
                            <Button onClick = {onClose} size = 'xs' ml = '6px' >Later</Button>
                        </>
                    }
                    {(placement == 'left') && 
                        <Button onClick = {onClose} size = 'xs' ml = '6px' colorScheme = "blue" >OK</Button>
                    }
                </Box>
            </GridItem>
        </Grid>
        </Box></Box>}
    </Box>
}

export default Drawer
