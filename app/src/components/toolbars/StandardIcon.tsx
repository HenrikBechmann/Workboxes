// StandardIcon.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import {
  Tooltip, Box,
} from '@chakra-ui/react'

const iconStyles = {
    height:'20px',
    width:'20px',
}

const iconWrapperStyles = {
    height: '24px',
    // display:'inline-block',
    opacity:0.7,
    padding:'4px',
}

const LearnIcon = (props) => {

    const { icon, caption, tooltip, isDisabled } = props

    let isDisabledLocal = isDisabled ?? false
    if (!isDisabled) isDisabledLocal = !tooltip

    return <Box display = 'flex' flexDirection = 'column' alignItems = 'center' justifyContent = 'center' ml = '6px'>
        <Box style = { iconWrapperStyles } >
            <Tooltip isDisabled = {isDisabledLocal} hasArrow label = { tooltip } >
                <img style = { iconStyles } src = { icon } />
            </Tooltip>
        </Box>
        <Box fontSize = 'xs' fontStyle = 'italic'><span>{caption}</span></Box>
    </Box>

}

export default LearnIcon