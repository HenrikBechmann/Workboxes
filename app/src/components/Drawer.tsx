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

// ----------------------[ static values ]--------------------

const MIN_DRAWER_WIDTH = 250
const MIN_DRAWER_HEIGHT = 100

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
    LOOKUPS:'lookups',
    INFO:'info',
    MESSAGES:'messages',
}

export const useDrawers = () => {

    //-------------------- drawer open functions ----------------
    const openData = () => {
        const component = openDrawer(drawerTypes.DATA, null)
        drawerPropsRef.current[drawerTypes.DATA] = component
        setDrawerState('changedrawers')
    }
    const openLookups = () => {
        drawerPropsRef.current[drawerTypes.LOOKUPS] = openDrawer(drawerTypes.LOOKUPS, null)
        setDrawerState('changedrawers')
    }
    const openInfo = () => {
        drawerPropsRef.current[drawerTypes.INFO] = openDrawer(drawerTypes.INFO, null)
        setDrawerState('changedrawers')
    }
    const openMessages = () => {
        drawerPropsRef.current[drawerTypes.MESSAGES] = openDrawer(drawerTypes.MESSAGES, null)
        setDrawerState('changedrawers')
    }

    const onOpens = {
        openData,
        openLookups,
        openInfo,
        openMessages,
    }

    //-------------------- drawer close functions ----------------
    const onCloseLookups = useCallback(() => {
        drawerPropsRef.current[drawerTypes.LOOKUPS] = 
            closeDrawer(drawerTypes.LOOKUPS)
        setDrawerState('changedrawers')
    },[])
    const onCloseData = useCallback(() => {
        drawerPropsRef.current[drawerTypes.DATA] = 
            closeDrawer(drawerTypes.DATA)
        setDrawerState('changedrawers')
    },[])
    const onCloseMessages = useCallback(() => {
        drawerPropsRef.current[drawerTypes.MESSAGES] = 
            closeDrawer(drawerTypes.MESSAGES)
        setDrawerState('changedrawers')
    },[])
    const onCloseInfo = useCallback(() => {
        drawerPropsRef.current[drawerTypes.INFO] = 
            closeDrawer(drawerTypes.INFO)
        setDrawerState('changedrawers')
    },[])

    const onCloses = {
        lookups:onCloseLookups,
        data:onCloseData,
        messages:onCloseMessages,
        info:onCloseInfo,
    }

    // ---------------------------- state hooks ----------------------------
    const 
        [drawerState, setDrawerState] = useState('setup'), // to collect pageElementRef
        [containerDimensions, setContainerDimensions] = useState(null), // to rerender for drawers on resize
        containerElementRef = useRef(null), // to pass to drawers
        resizeObserverRef = useRef(null), // to disconnect
        {
            drawerTypes, 
            drawerProps, 
            openDrawer,
            closeDrawer,
            updateDimensions,
        } = useDrawerSupport(containerElementRef, onCloses),

    drawerPropsRef = useRef(drawerProps)

    const resizeCallback = useCallback(()=>{ // to trigger drawer resize,
        const containerDimensions = {
            width:containerElementRef.current.offsetWidth,
            height:containerElementRef.current.offsetHeight
        }

        Object.assign(drawerPropsRef.current, updateDimensions(containerDimensions))

        setContainerDimensions(containerDimensions)

        if (drawerState == 'setup') setDrawerState('ready')

    },[drawerState])

    // ------------------------ effect hooks -----------------------
    useEffect(()=>{

        const resizeObserver = new ResizeObserver(resizeCallback)
        resizeObserver.observe(containerElementRef.current) // triggers first drawer sizing
        resizeObserverRef.current = resizeObserver

        return () => {
            resizeObserverRef.current.disconnect()
        }

    },[])

    useEffect(()=>{

        switch (drawerState) {
        case 'setup':
        case 'changedrawers':
            setDrawerState('ready')

        }

    },[drawerState])

    return {
        drawerPropsRef,
        containerElementRef,
        drawerState,
        onOpens,
    }

}

// ----------------------[ useDrawers ]------------------------
// return key values to host

const useDrawerSupport = (containerElementRef, onCloses) => {

    const initializedRef = useRef(false)

    const openDrawer = useCallback((drawerType, context)=>{

        const placement = placements[drawerType]

        Object.assign(componentPropsRef.current[placement], {isOpen:true, context})

        return componentPropsRef.current[placement]

    },[])

    const closeDrawer = useCallback((drawerType) => {

        const placement = placements[drawerType]

        componentPropsRef.current[placement].isOpen = false

        return componentPropsRef.current[placement]

    },[])

    const updateDimensions = useCallback((containerDimensions) => {

        Object.assign(componentPropsRef.current.top, {
            containerDimensions})
        Object.assign(componentPropsRef.current.right, {
            containerDimensions})
        Object.assign(componentPropsRef.current.bottom, {
            containerDimensions})
        Object.assign(componentPropsRef.current.left, {
            containerDimensions})

        const componentProps = componentPropsRef.current
        return {
            lookups:componentProps.top,
            data:componentProps.right,
            messages:componentProps.bottom,
            info:componentProps.left,
        }

    },[])

    const initializeComponents = () => {
        if (!initializedRef.current) {
            const containerDimensions = {} // pre-initialization; updateDimensions is called before first render
            return {
                top:{
                    isOpen:false,
                    placement: 'top',
                    containerElementRef,
                    containerDimensions,
                    onClose:onCloses.lookups
                },
                right:{
                    isOpen:false,
                    placement: 'right',
                    containerElementRef,
                    containerDimensions,
                    onClose: onCloses.data,
                },
                bottom:{
                    placement:'bottom',
                    isOpen:false,
                    containerElementRef,
                    containerDimensions,
                    onClose:onCloses.messages,
                },
                left:{
                    key:'left',
                    isOpen: false,
                    placement:'left',
                    containerElementRef,
                    containerDimensions,
                    onClose:onCloses.info,
                },
            }
        }
    }

    const initializedComponents = initializeComponents()

    const componentPropsRef = useRef(initializedComponents)

    const componentProps = componentPropsRef.current

    const drawerProps = {
        lookups:componentProps.top,
        data:componentProps.right,
        messages:componentProps.bottom,
        info:componentProps.left,
    }

    const placements = {
        data:'right',
        lookups:'top',
        info:'left',
        messages:'bottom',
    }

    initializedRef.current = true

    // used by the host
    return {
        drawerTypes, 
        drawerProps, 
        openDrawer,
        closeDrawer,
        updateDimensions,
    }
}

// -------------------------------[ Drawer ]-----------------------------

export const Drawer = (props) => {

    const
        // props 
        { placement, containerElementRef, containerDimensions, isOpen, onClose, context } = props,
        
        openParm = isOpen?'open':'closed',

        // ----------------------------- state hooks --------------------------
        isInitializedRef = useRef(false),

        // states
        [drawerState, setDrawerState] = useState('ready'),
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
            opacity:1,
            visibility:'hidden',
            transition:'visibility .4s, opacity .4s'
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
        minLengthRef = useRef(null)

    // console.log('placement, openParm',placement, openParm, maxLengthRef.current)
    // for closures
    placementRef.current = placement
    orientationRef.current = ['right','left'].includes(placement)?'horizontal':'vertical'
    drawerLengthRef.current = drawerLength

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
                titleRef.current = 'Data updates'
                Object.assign(drawerStyle,{
                    // height: '100%',
                    // width:'auto',
                    top:'auto',
                    right:0,
                    bottom:'auto',
                    left:'auto',
                    borderLeft:'1px solid gray',
                    boxShadow:'-5px 0px 5px 0px silver',
                    borderRadius: '8px 0 0 8px',
                    zIndex:1,
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
                titleRef.current = 'Information'
                Object.assign(drawerStyle,{
                    // height: '100%',
                    // width:'auto',
                    top:'auto',
                    right:'auto',
                    bottom:'auto',
                    left:0,
                    borderRight:'1px solid gray',
                    boxShadow:'5px 0 5px 0px silver',
                    borderRadius: '0 8px 8px 0',
                    zIndex:4
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
                titleRef.current = 'Lookups'
                Object.assign(drawerStyle,{
                    // width: '100%',
                    // height:'auto',
                    top:0,
                    right:'auto',
                    bottom:'auto',
                    left:'auto',
                    borderBottom:'1px solid gray',
                    boxShadow:'0px 5px 5px 0px silver',
                    borderRadius: '0 0 8px 8px',
                    zIndex:2
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
                    // width: '100%',
                    // height:'auto',
                    top:'auto',
                    right:'auto',
                    bottom:0,
                    left:'auto',
                    borderTop:'1px solid gray',
                    boxShadow:'0px -5px 5px 0px silver',
                    borderRadius: '8px 8px 0 0',
                    zIndex:3
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

        return false;
    }

    //-----------------------------[ end of drag tab section ]-----------------------------

    // -------------------- utility: caclulate drawer length -----------------------------
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

        // adjust CSS
        if (['left','right'].includes(placementRef.current)) {
            drawerStyleRef.current = Object.assign(drawerStyleRef.current,{width:updatedLength + 'px', height:'100%'})
        } else {
            drawerStyleRef.current = Object.assign(drawerStyleRef.current,{height:updatedLength + 'px', width:'100%'})
        }

        drawerRatioRef.current = updatedLength/containerLength
        setDrawerLength(updatedLength)

    }

    // ------------------------------ effect hooks ----------------------------
    useLayoutEffect(() => {

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

        // if (drawerState)

        switch (drawerState) {
        // case 'setup':
        case 'revisedvisibility':
        // case 'revisedlength':
            setDrawerState('ready')
        }

    },[drawerState])

    // update display
    drawerStyleRef.current = useMemo(()=> {

        // console.log('change opacity, placement: openParm',openParm, placement)

        if (openParm == 'open') {
            Object.assign(drawerStyleRef.current, {visibility:'visible', opacity:1})
        } else {
            Object.assign(drawerStyleRef.current, {visibility:'hidden', opacity:0})
        }

        return drawerStyleRef.current

        // setOpenState(openParm)

    }, [openParm])

    // ------------------------------ render ---------------------------
    const renderDrawerStyle = {...drawerStyleRef.current}

    return <div data-type = {'drawer-' + placement} style = {renderDrawerStyle} >
        <div ref = {tabRef} data-type = {'drawer-tab-' + placement} style = {tabStyle} >
            <img style = {tabIconStyle} src = {handleIcon} />
        </div>
        {drawerState != 'setup' && <Grid data-type = 'drawer-grid' height = '100%' width = '100%'
          templateAreas={`"header"
                          "body"
                          "footer"`}
          gridTemplateRows={'44px 1fr 34px'}
          gridTemplateColumns={'100%'}
        >
            <GridItem area = 'header'>
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
            <GridItem data-type = 'body-area' area = 'body'>
                Body
            </GridItem>
            <GridItem area = 'footer'>
                <Box data-type = 'footer-box' p = '3px' borderTop = '1px solid silver' borderBottom = '1px solid silver'>
                    <Button onClick = {onClose} size = 'xs' ml = '6px' colorScheme = "blue" >Done</Button> 
                    {['right', 'top'].includes(placement) && <Button onClick = {onClose} size = 'xs' ml = '6px'>Cancel</Button>}
                    {(placement == 'right') && <Button size = 'xs' ml = '6px' colorScheme = "blue" >Next</Button>}
                </Box>
            </GridItem>
        </Grid>}
    </div>
}

export default Drawer
