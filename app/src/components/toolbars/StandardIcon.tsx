// StandardIcon.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef} from 'react'

import {
  Tooltip, Box,
} from '@chakra-ui/react'

const baseIconStyles = {
    height:'20px',
    width:'20px',
}

const iconWrapperStyles = {
    height: '24px',
    // display:'inline-block',
    opacity:0.7,
    padding:'4px',
}

const StandardIcon = (props) => {

    const { icon, caption, tooltip, response, iconStyles, isDisabledTooltip = false, isDisabled = false } = props

    const iconStylesRef = useRef({...baseIconStyles, ...iconStyles})

    let isDisabledTooltipLocal = isDisabledTooltip
    if (!isDisabledTooltip) isDisabledTooltipLocal = !tooltip

    const opacity = isDisabled
        ? 0.5
        :1

    return <Box display = 'flex' flexDirection = 'column' alignItems = 'center' justifyContent = 'center' ml = '6px' opacity = {opacity}>
        <Box style = { iconWrapperStyles } onClick = {!isDisabled?response:null} >
            <Tooltip isDisabled = {isDisabledTooltipLocal} hasArrow label = { tooltip } >
                <img style = { iconStylesRef.current } src = { icon } />
            </Tooltip>
        </Box>
        <Box fontSize = 'xs' color = 'gray' fontStyle = 'italic'><span>{caption}</span></Box>
    </Box>

}

export default StandardIcon