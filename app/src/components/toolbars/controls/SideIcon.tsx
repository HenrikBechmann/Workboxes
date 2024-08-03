// SideIcon.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, CSSProperties} from 'react'

import {
  Tooltip, Box,
} from '@chakra-ui/react'
import dialogIcon from '../../../../assets/dialog.png'
import infoIcon from '../../../../assets/info.png'

import NumberBadge from './NumberBadge'

const baseIconStyles = {
    height:'20px',
    width:'20px',
}

const numberBadgeStyles = {
    height:'11px',
    padding:'0 2px 0 2px',
    borderRadius: '5px',
    position:'absolute',
    right:0,
    top: 0,
    fontSize: '9px',
    textAlign: 'center',
    backgroundColor: 'blue',
    color:'white',
    lineHeight: '11px',
    fontWeight: 'bold',
} as CSSProperties

const iconWrapperStyles = {
    height: '24px',
    // display:'inline-block',
    // opacity:0.7,
    padding:'0px',
    position:'relative',
} as CSSProperties

const SideIcon = (props) => {

    const { 
        icon, 
        caption, 
        tooltip, 
        response, 
        iconStyles = {}, 
        numberBadgeCount, 
        isDisabledTooltip = false, 
        isDisabled = false, 
        isDialog = false, 
        isInfo = false,
        emphasis = false,
        highlight = false,
    } = props

    const iconStylesRef = useRef({...baseIconStyles, ...iconStyles})

    const isDisabledType = (isInfo)

    let isDisabledTooltipLocal = isDisabledTooltip
    if (!isDisabledTooltip) isDisabledTooltipLocal = !tooltip

    const opacity = (isDisabled || isDisabledType)
        ? 0.5
        :1
    const isNumberBadgeCount = numberBadgeCount ?? false

    // padding = {highlight?'3px':'0px'}
        // ml = '6px' 

    return <Box 
        data-type = 'standardicon' 
        display = 'flex' 
        flexDirection = 'column' 
        alignItems = 'center' 
        justifyContent = 'center' 
        opacity = {opacity}
        backgroundColor = {highlight?'cyan':'transparent'}
        borderRadius = {highlight?'8px':'0px'}
    >
        <Box style = { iconWrapperStyles } onClick = {!(isDisabled || isDisabledType)?response:null} >
            {isInfo && 
                <img style = {{borderRadius: '7px', backgroundColor: 'lightyellow', 
                    height:'14px', width:'14px', position:'absolute',right:0, top:0}} src = { infoIcon } />
            }
            {isDialog && 
                <img style = {{height:'14px', width:'14px', backgroundColor: 'lightyellow', 
                    position:'absolute',right:0, top:0,  opacity: '0.5'}} src = { dialogIcon }/>
            }
            {(isNumberBadgeCount !== false) && <NumberBadge number = {numberBadgeCount} />}
            <Tooltip isDisabled = {isDisabledTooltipLocal} hasArrow label = { tooltip } >
                <img style = { iconStylesRef.current } src = { icon } />
            </Tooltip>
        </Box>
        <Box 
            fontSize = 'xx-small' 
            color = {emphasis?'black':'gray'}
            fontStyle = 'italic' 
            fontWeight = {emphasis?'bold':'normal'}
        >
            <span>{caption}</span>
        </Box>
    </Box>

}

export default SideIcon