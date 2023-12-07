// Drawer.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useState, useEffect, useLayoutEffect, CSSProperties } from 'react'
import { 
    Button, Text, Heading, Box,
    Grid, GridItem, VStack, HStack,
    Center, Tooltip
} from '@chakra-ui/react'

import { isMobile } from '../index'

import handleIcon from '../../assets/handle.png'
import helpIcon from '../../assets/help.png'

const MIN_DRAWER_WIDTH = 250
const MIN_DRAWER_HEIGHT = 100

const iconWrapperStyles = {
    opacity:0.7,
}

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

export const Drawer = (props) => {

    const
        // props 
        { placement, containerDimensions, pageElementRef, isOpen, finalFocusRef, span, component, onClose } = props,
        
        // states
        [openState, setOpenState] = useState('open'), // or 'closed'
        [drawerLength, setDrawerLength] = useState(span),
        
        // used for layouts
        placementRef = useRef(placement),

        drawerTabRef = useRef(null),
        
        // styles, set below, first cycle
        drawerStyleRef = useRef(null),
        handleStyleRef = useRef(null),
        handleIconStyleRef = useRef(null),
        
        // control data
        isDraggingRef = useRef(false),
        titleRef = useRef(null),
        containerDimensionsRef = useRef(containerDimensions),
        updatedLengthRef = useRef(null), // for drag operation
        maxLengthRef = useRef(null),
        minLengthRef = useRef(null),
        revisedLengthRef = useRef(0) // user drag

    // lengthRef.current = revisedLengthRef.current || span || 0

    if (!drawerStyleRef.current) { // first time only
        const 
            drawerStyle = {
                position:'absolute',
                backgroundColor:'yellow',
            },
            handleStyle = {
                position:'absolute',
                margin: 0,
                backgroundColor:'yellow',
                border:'1px solid gray',
                display:'flex'
            },
                handleIconStyle = {
                opacity:.5
            }

        switch (placement) {
            case 'right': { // data entry
                titleRef.current = 'Data updates'
                Object.assign(drawerStyle,{
                    height: '100%',
                    top:'auto',
                    right:0,
                    bottom:'auto',
                    left:'auto',
                    borderLeft:'1px solid gray',
                    boxShadow:'-5px 0px 5px 0px silver',
                    borderRadius: '8px 0 0 8px',
                    zIndex:0,
                })
                Object.assign(handleStyle,{
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
                Object.assign(handleIconStyle,{
                    height:'24px',
                    width:'48px',
                    transform:'rotate(90deg)'
                })
                break
            }
            case 'left': { // help
                titleRef.current = 'Information'
                Object.assign(drawerStyle,{
                    height: '100%',
                    top:'auto',
                    right:'auto',
                    bottom:'auto',
                    left:0,
                    borderRight:'1px solid gray',
                    boxShadow:'5px 0 5px 0px silver',
                    borderRadius: '0 8px 8px 0',
                    zIndex:2
                })
                Object.assign(handleStyle,{
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
                Object.assign(handleIconStyle,{
                    height:'24px',
                    width:'24px',
                    transform:'rotate(90deg)'
                })
                break
            }
            case 'top': { // lookup
                titleRef.current = 'Lookups'
                Object.assign(drawerStyle,{
                    width: '100%',
                    top:0,
                    right:'auto',
                    bottom:'auto',
                    left:'auto',
                    borderBottom:'1px solid gray',
                    boxShadow:'0px 5px 5px 0px silver',
                    borderRadius: '0 0 8px 8px',
                    zIndex:1
                })
                Object.assign(handleStyle,{
                    left:'50%',
                    transform:'translateX(-50%)',
                    bottom:'-24px',
                    borderTop:'transparent',
                    borderRadius: '0 0 8px 8px',
                    height:'24px',
                    width:'48px',
                    justifyContent:'center',
                    boxShadow:'0px 5px 5px 0px silver',
                })
                Object.assign(handleIconStyle,{
                    height:'24px',
                    width:'24px',
                })
                break
            }
            case 'bottom': { // message
                titleRef.current = 'Messages'
                Object.assign(drawerStyle,{
                    width: '100%',
                    top:'auto',
                    right:'auto',
                    bottom:0,
                    left:'auto',
                    borderTop:'1px solid gray',
                    boxShadow:'0px -5px 5px 0px silver',
                    borderRadius: '8px 8px 0 0',
                    zIndex:3
                })
                Object.assign(handleStyle,{
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
                Object.assign(handleIconStyle,{
                    height:'24px',
                    width:'24px',
                })
                break
            }
        }
        drawerStyleRef.current = drawerStyle
        handleStyleRef.current = handleStyle
        handleIconStyleRef.current = handleIconStyle
    }

    //-----------------------------[ drag tab ]-----------------------------

    const startDrag = (event) => {
        event.preventDefault()
        event.stopPropagation()

        isDraggingRef.current = true

        console.log('starting drag')

        return false
    }

    const dragMove = (event) => {

        if (!isDraggingRef.current) return

        event.preventDefault(); 
        event.stopPropagation(); 

        console.log('drag move')

        // recalculateLength() needs to be throttled here -- 100 ms?

        return false;

    }

    const endDrag = (event) => {

        if (!isDraggingRef.current) return

        event.preventDefault(); 
        event.stopPropagation(); 

        isDraggingRef.current = false

        console.log('drag end')

        return false;
    }

    // initialize drag listeners
    useEffect(()=>{

        const tabElement = drawerTabRef.current
        const pageElement = pageElementRef.current

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

    //-----------------------------[ end drag tab ]-----------------------------

    const recalculateLength = () => {

        const 
            defaultRatio = isMobile?0.8:0.33,
            maxRatio = 0.9,
            minRatio = isMobile?0.5:0.2,
            containerLength = 
                (['right','left'].includes(placement))
                    ? containerDimensions.width
                    : containerDimensions.height,
            minConst = 
                (['right','left'].includes(placement))
                    ? MIN_DRAWER_WIDTH
                    : MIN_DRAWER_HEIGHT,
            // calculate length and constraints from appropriate container measure
            minLength = Math.max(Math.round(minRatio * containerLength),minConst),
            maxLength = Math.round(maxRatio * containerLength),
            defaultLength = Math.max(Math.round(defaultRatio * containerLength),minLength),
            revisedLength = Math.min(Math.max(revisedLengthRef.current,minLength),maxLength),
            updatedLength = Math.max(defaultLength, revisedLength)

        // save results
        updatedLengthRef.current = updatedLength
        minLengthRef.current = minLength
        maxLengthRef.current = maxLength

        // adjust CSS
        if (['left','right'].includes(placementRef.current)) {
            drawerStyleRef.current = {...drawerStyleRef.current,width:updatedLength + 'px'}
        } else {
            drawerStyleRef.current = {...drawerStyleRef.current,height:updatedLength + 'px'}
        }

        // trigger re-render
        setDrawerLength(defaultLength)

    }

    useLayoutEffect(() => {

        recalculateLength()

    },[containerDimensions])

    useEffect(()=> {

    }, [openState])

    return <div data-type = {'drawer-' + placement} style = {drawerStyleRef.current} >
        <div ref = {drawerTabRef} data-type = {'drawer-handle-' + placement} style = {handleStyleRef.current} >
            <img style = {handleIconStyleRef.current} src = {handleIcon} />
        </div>
        <Grid data-type = 'drawer-grid' height = '100%' width = '100%'
          templateAreas={`"header"
                          "body"
                          "footer"`}
          gridTemplateRows={'44px 1fr 34px'}
          gridTemplateColumns={'100%'}
        >
            <GridItem area={'header'}>
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
            <GridItem data-type = 'body-area' area={'body'}>
                Body
            </GridItem>
            <GridItem area={'footer'}>
                <Box data-type = 'footer-box' p = '3px' borderTop = '1px solid silver' borderBottom = '1px solid silver'>
                    <Button size = 'xs' ml = '6px' colorScheme = "blue" >Done</Button> 
                    <Button size = 'xs' ml = '6px'>Cancel</Button> 
                    <Button size = 'xs' ml = '6px' colorScheme = "blue" >Next</Button>
                </Box>
            </GridItem>
        </Grid>
    </div>
}

export default Drawer
