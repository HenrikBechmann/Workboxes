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
    NOTICES:'notices',
}

export const useDrawers = (containerElementRef, onCloses) => {

    const initializedRef = useRef(false)

    const openDrawer = useCallback((drawerType, context)=>{
        const placement = placements[drawerType]
        console.log('openDrawer: drawerType, placement', drawerType, placement)
        return React.cloneElement(componentsRef.current[placement],{isOpen:true, context})
    },[])

    const containerDimensions = {}

    const closeDrawer = useCallback((drawerType) => {
        const placement = placements[drawerType]
        return React.cloneElement(componentsRef.current[placement],{isOpen:false})
    },[])

    const updateDimensions = useCallback((containerDimensions) => {
        return {
            lookups:React.cloneElement(componentsRef.current.top,{containerDimensions}),
            data:React.cloneElement(componentsRef.current.right,{containerDimensions}),
            notices:React.cloneElement(componentsRef.current.bottom,{containerDimensions}),
            info:React.cloneElement(componentsRef.current.left,{containerDimensions}),
        }
    },[])

    const initializeComponents = () => {
        if (!initializedRef.current) {
            return {
                top:<Drawer 
                    key = 'top'
                    isOpen = {false}
                    placement = 'top'
                    containerElementRef = {containerElementRef} 
                    containerDimensions = {containerDimensions}
                    onClose = {onCloses.lookups}
                />,
                right:<Drawer 
                    key = 'right'
                    isOpen = {false}
                    placement = 'right'
                    containerElementRef = {containerElementRef} 
                    containerDimensions = {containerDimensions}
                    onClose = {onCloses.data}
                />,
                bottom:<Drawer
                    key = 'bottom' 
                    placement = 'bottom'
                    isOpen = {false}
                    containerElementRef = {containerElementRef} 
                    containerDimensions = {containerDimensions}
                    onClose = {onCloses.notices}
                />,
                left:<Drawer 
                    key = 'left'
                    isOpen = {false}
                    placement = 'left'
                    containerElementRef = {containerElementRef} 
                    containerDimensions = {containerDimensions}
                    onClose = {onCloses.info}
                />,
            }
        }
    }

    const initializedComponents = initializeComponents()

    const componentsRef = useRef(initializedComponents)

    if (!initializedRef.current) {
        initializedRef.current = true
    }

    const components = componentsRef.current

    const drawers = {
        lookups:components.top,
        data:components.right,
        notices:components.bottom,
        info:components.left,
    }

    const placements = {
        data:'right',
        lookups:'top',
        info:'left',
        notices:'bottom',
    }

    initializedRef.current = true

    return {
        drawerTypes, 
        drawers, 
        openDrawer,
        closeDrawer,
        updateDimensions,
    }

}

export const Drawer = (props) => {

    const
        // props 
        { placement, containerElementRef, containerDimensions, isOpen, onClose, context } = props,
        
        openParm = isOpen?'open':'closed',

        // states
        [openState, setOpenState] = useState('closed'), // or 'open'
        [drawerState, setDrawerState] = useState('setup'),
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

    console.log('placement, containerElementRef, containerDimensions, isOpen, onClose, context\n',
        placement, containerElementRef, containerDimensions, isOpen, onClose, context)

    // for closures
    placementRef.current = placement
    orientationRef.current = ['right','left'].includes(placement)?'horizontal':'vertical'
    drawerLengthRef.current = drawerLength

    // styles
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
                    zIndex:2
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
                    zIndex:3
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
                titleRef.current = 'Notices'
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
                    zIndex:4
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
        // console.log('useMemo: updating styles', {...drawerStyle})
        return [drawerStyle, tabStyle, tabIconStyle]
    },[placement])
    
    //-----------------------------[ drag tab ]-----------------------------

    // initialize drag listeners
    useEffect(()=>{

        const tabElement = tabRef.current
        const pageElement = containerElementRef.current

        if (isMobile) {

            tabElement.addEventListener('touchstart', startDrag)
            pageElement.addEventListener('touchmove', dragMove)
            pageElement.addEventListener('touchend', endDrag)
            pageElement.addEventListener('touchcancel', endDrag)

        } else {

            tabElement.addEventListener('mousedown', startDrag)
            pageElement.addEventListener('mousemove', dragMove)
            pageElement.addEventListener('mouseup', endDrag)

        }

        return () => {

            if (isMobile) {

                tabElement.removeEventListener('touchstart', startDrag)
                pageElement.removeEventListener('touchmove', dragMove)
                pageElement.removeEventListener('touchend', endDrag)
                pageElement.removeEventListener('touchcancel', endDrag)

            } else {

                tabElement.removeEventListener('mousedown', startDrag)
                pageElement.removeEventListener('mousemove', dragMove)
                pageElement.removeEventListener('mouseup', endDrag)

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

        return false;
    }

    //-----------------------------[ end of drag tab section ]-----------------------------

    // update height and width
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

    useEffect(()=>{

        movedLengthRef.current = 0
        drawerLengthRef.current = 0
        calculateDrawerLength()

    },[placement])

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

        switch (drawerState) {
        case 'setup':
        case 'revisedvisibility':
        // case 'revisedlength':
            setDrawerState('ready')
        }

    },[drawerState])

    // update display
    useEffect(()=> {

        if (openParm == 'open') {
            Object.assign(drawerStyleRef.current, {visibility:'visible', opacity:1})
        } else {
            Object.assign(drawerStyleRef.current, {visibility:'hidden', opacity:0})
        }

        setOpenState(openParm)

    }, [openParm])

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
