// Drawer.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useState, useMemo, useEffect, useLayoutEffect, useCallback, CSSProperties } from 'react'
import { 
    Button, Text, Heading, Box,
    Grid, GridItem, VStack, HStack,
    Center, Tooltip
} from '@chakra-ui/react'

import { Resizable } from 'react-resizable'
import "react-resizable/css/styles.css"

import { isMobile } from '../index'

import Workbox from './workbox/Workbox'

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
    margin:'3px',
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
// establish drawers for any container

export const useDrawers = (completeFunctions) => { // callbacks

     const 
        [drawersState, setDrawersState] = useState('setup'), // 'setup' to collect containerElementRef; 'changedrawers', 'ready'
        [containerDimensions, setContainerDimensions] = useState(null), // to rerender drawers on resize
        containerElementRef = useRef(null), // container element, to pass to drawers, instantiated by host
        resizeObserverRef = useRef(null) // for observe container, ref to disconnect

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

    },[])

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
        setDrawerOpenProps(drawerTypes.DATA, context)
        setDrawersState('changedrawers')
    }
    const openLookupDrawer = (context) => {
        setDrawerOpenProps(drawerTypes.LOOKUP, context)
        setDrawersState('changedrawers')
    }
    const openHelpDrawer = (context) => {
        setDrawerOpenProps(drawerTypes.HELP, context)
        setDrawersState('changedrawers')
    }
    const openMessagesDrawer = (context) => {
        setDrawerOpenProps(drawerTypes.MESSAGES, context)
        setDrawersState('changedrawers')
    }

    // bundle
    const openFunctions = {
        openDataDrawer,
        openLookupDrawer,
        openHelpDrawer,
        openMessagesDrawer,
    }

    // close (called by drawer, in response to user action)
    const closeLookup = useCallback(() => {
        setDrawerCloseProp(drawerTypes.LOOKUP)
        completeFunctions.lookup(null) // add context
        setDrawersState('changedrawers')
    },[])
    const closeData = useCallback(() => {
        setDrawerCloseProp(drawerTypes.DATA)
        completeFunctions.data(null)
        setDrawersState('changedrawers')
    },[])
    const closeMessages = useCallback(() => {
        setDrawerCloseProp(drawerTypes.MESSAGES)
        completeFunctions.messages(null)
        setDrawersState('changedrawers')
    },[])
    const closeHelp = useCallback(() => {
        setDrawerCloseProp(drawerTypes.HELP)
        completeFunctions.help(null)
        setDrawersState('changedrawers')
    },[])

    const closeFunctions = {
        lookup:closeLookup,
        data:closeData,
        messages:closeMessages,
        help:closeHelp,
    }

    // utilities
    const setDrawerOpenProps = useCallback((drawerType, context)=>{

        Object.assign(drawerPropsRef.current[drawerType], {isOpen:true, context})

    },[])

    const setDrawerCloseProp = useCallback((drawerType) => {

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
            onClose:closeFunctions.lookup,
            context:null,
        },
        data:{
            isOpen:false,
            placement: 'right',
            containerElementRef,
            containerDimensions,
            onClose: closeFunctions.data,
            context:null,
        },
        messages:{
            placement:'bottom',
            isOpen:false,
            containerElementRef,
            containerDimensions,
            onClose:closeFunctions.messages,
            context:null,
        },
        help:{
            isOpen: false,
            placement:'left',
            containerElementRef,
            containerDimensions,
            onClose:closeFunctions.help,
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

    return { // data for host
        drawerProps:drawerPropsRef.current,
        containerElementRef,
        drawersState,
        openFunctions,
    }

}

// ================================= [ Drawer ] ======================================

const DrawerHandle = (props) => {

    const { placement, tabStyle, tabIconStyle, handleIcon, handleAxis, innerRef, ...rest } = props

    return  <Box ref = {innerRef} data-type = {'drawer-tab-' + placement} style = {tabStyle} {...rest}>
            <img draggable = "false" style = {tabIconStyle} src = {handleIcon} />
        </Box>
}

const resizeAxes = {
    top:'s',
    right:'w',
    bottom:'n',
    left:'e',
}

export const Drawer = (props) => {

    const
        // props 
        { placement, containerElementRef, containerDimensions, isOpen, onClose, context } = props,

        resizeHandleAxis = resizeAxes[placement],
        openParm = isOpen?'open':'closed',

        // ----------------------------- state hooks --------------------------

        // states
        [drawerState, setDrawerState] = useState('setup'), // ('setup'),
        [drawerSpecs, setDrawerSpecs] = useState(() => {
            let height, width
            if (['left','right'].includes(placement)) {
                height = containerDimensions.height
                width = 0
            } else {
                height = 0
                width = containerDimensions.width
            }
            return {height, width}
        }),
        
        // styles, set below, first cycle
        drawerStyleRef = useRef<CSSProperties>({
            position:'absolute',
            backgroundColor:'#ffffcc', // 'yellow',
            boxSizing:'border-box',
            visibility:'hidden',
            transition:TRANSITION_CSS
        }),

        slideBoxStyleRef = useRef<CSSProperties>({
            width:'100%',
            height:'100%',
        }),
        
        // control data
        containerDimensionsRef = useRef(containerDimensions),

        // updated later
        drawerRatioRef = useRef(null),
        movedLengthRef = useRef(0), // based on drag
        maxLengthRef = useRef(null),
        minLengthRef = useRef(null),
        titleRef = useRef(null),

        // updated each cycle
        openParmRef = useRef(null),
        drawerStateRef = useRef(null),
        placementRef = useRef(null),
        orientationRef = useRef(null),
        drawerLengthRef = useRef(null)

    // for closures
    openParmRef.current = openParm
    drawerStateRef.current = drawerState
    placementRef.current = placement
    orientationRef.current = ['right','left'].includes(placement)?'horizontal':'vertical'

    // ------------------------- drawer styles -------------------------

    const [drawerStyle, tabStyle, tabIconStyle, resizableAxis] = useMemo(()=>{

        // core styles
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

        let resizableAxis

        // enhanced styles
        switch (placement) {
            case 'right': { // data entry
                resizableAxis = 'x',
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
                resizableAxis = 'x',
                titleRef.current = 'Learn'
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
                resizableAxis = 'y',
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
            case 'bottom': { // messages
                resizableAxis = 'y',
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
        return [drawerStyle, tabStyle, tabIconStyle, resizableAxis]
    },[placement])
    
    //-----------------------------[ drag tab ]-----------------------------

    const onResizeStart = (event, {size, handle}) => {

        console.log('start resize: node, size, handle', size, handle)

        drawerStyleRef.current.transition = 'unset'

    }

    const onResize = (event, {size, handle}) => {

        console.log('onResize handle, size',handle, size)

        setDrawerSpecs({width:size.width,height:size.height})

    }

    const onResizeStop = (event, {size, handle}) => {

        console.log('stop resize', size, handle)

        drawerStyleRef.current = {...drawerStyleRef.current,transition:TRANSITION_CSS}

    }

    // ------------------------------ effect hooks ----------------------------
    
    // resizing
    const [isResizing, setIsResizing] = useState(false)
    const isResizingRef = useRef(false)
    const resizingTimeoutIDRef = useRef(null)

    useLayoutEffect(() => {

        if (drawerStateRef.current == 'setup') {
            // calculateDrawerLength()
            return
        }

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
                    ? containerDimensions?.width
                    : containerDimensions?.height,
            ratio = drawerRatioRef.current

        movedLengthRef.current = 0
        drawerLengthRef.current = containerLength * ratio

    },[containerDimensions])

    // update drawer state
    useEffect(()=> {

        switch (drawerState) {
        case 'setup':
            setDrawerState('ready')
        }

    },[drawerState])

    // update display
    drawerStyleRef.current = useMemo(()=> {

        console.log('setting drawerStyleRef for placement, openParm', placement, openParm)
        if (['right','left'].includes(placementRef.current)) {

            if (openParm == 'open') {
                Object.assign(drawerStyleRef.current, {visibility:'visible', opacity:1})
                setDrawerSpecs((oldState)=>{return {...oldState,width:MIN_DRAWER_WIDTH}})
            } else {
                Object.assign(drawerStyleRef.current, {visibility:'hidden', opacity:0})
                setDrawerSpecs((oldState)=>{return {...oldState,width:0}})
            }

        } else {

            if (openParm == 'open') {
                Object.assign(drawerStyleRef.current, {visibility:'visible', opacity:1})
                setDrawerSpecs((oldState)=>{return {...oldState,height:MIN_DRAWER_HEIGHT}})
            } else {
                Object.assign(drawerStyleRef.current, {visibility:'hidden', opacity:0})
                setDrawerSpecs((oldState)=>{return {...oldState,height:0}})
            }

        }

        return drawerStyleRef.current

    }, [openParm])

    // ------------------------------ render ---------------------------
    const renderDrawerStyle = {...drawerStyleRef.current}

    console.log('placement, drawerSpecs',placement, drawerSpecs)

    return <Resizable 
        data-inheritedtype = 'resizable' 
        handle = {

            (handleAxis, ref) => <DrawerHandle 
                innerRef = {ref} 
                placement = {placement} 
                tabStyle = {tabStyle} 
                handleAxis = {handleAxis}
                tabIconStyle = {tabIconStyle} 
                handleIcon = {handleIcon} 
            />
        } 
        height = {drawerSpecs.height} 
        width = {drawerSpecs.width} 
        axis = {resizableAxis}
        resizeHandles = {[resizeHandleAxis]}
        minConstraints = {[10, 10]}
        maxConstraints = {[Infinity, Infinity]}
        onResizeStart = {onResizeStart}
        onResize = {onResize}
        onResizeStop = {onResizeStop}

    >
    <Box data-type = {'drawer-' + placement} style = {renderDrawerStyle} width = {drawerSpecs.width + 'px'} height = {drawerSpecs.height + 'px'}>
        {drawerState != 'setup' && <Box data-type = 'slide-box' style = {slideBoxStyleRef.current} ><Box data-type = 'drawer-box' height = '100%' width = '100%'>
        <Grid data-type = 'drawer-grid' height = '100%' width = '100%'
          gridTemplateAreas={`"header"
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
            </GridItem>
            <GridItem data-type = 'footer-area' area = 'footer'>
                <Box data-type = 'footer-box' p = '3px' borderTop = '1px solid silver' borderBottom = '1px solid silver'>
                    {(placement == 'top') && // lookup
                        <>
                            <Button onClick = {onClose} size = 'xs' ml = '6px' colorScheme = "blue" >Done</Button> 
                            <Button onClick = {onClose} size = 'xs' ml = '6px'>Cancel</Button>
                        </>
                    }
                    {(placement == 'right') && // data
                        <>
                            <Button onClick = {onClose} size = 'xs' ml = '6px' colorScheme = "blue" >Apply</Button>
                            <Button onClick = {onClose} size = 'xs' ml = '6px'>Cancel</Button>
                            <Button size = 'xs' ml = '6px' colorScheme = "blue" >Next</Button> 
                            <Button size = 'xs' ml = '6px' colorScheme = "blue" >Previous</Button>
                        </>
                    }
                    {(placement == 'bottom') && // messages
                        <>
                            <Button onClick = {onClose} size = 'xs' ml = '6px' colorScheme = "blue" >OK</Button>
                            <Button onClick = {onClose} size = 'xs' ml = '6px' >Later</Button>
                        </>
                    }
                    {(placement == 'left') && // help
                        <Button onClick = {onClose} size = 'xs' ml = '6px' colorScheme = "blue" >OK</Button>
                    }
                </Box>
            </GridItem>
        </Grid>
        </Box></Box>}
    </Box>
    </Resizable>
}

export default Drawer
