// LearnIcon.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import {
  Tooltip, Box,
} from '@chakra-ui/react'

import helpIcon from '../../../assets/help.png'

const smallerIconStyles = {
    height:'18px', 
    width:'18px'
}

const iconWrapperStyles = {
    height: '24px',
    // display:'inline-block',
    opacity:0.7,
    padding:'4px',
}

const LearnIcon = (props) => {

    const { tooltip } = props

    return <Box display = 'flex' flexDirection = 'column' alignItems = 'center' justifyContent = 'center' ml = '6px'>
        <Box style = { iconWrapperStyles } >
            <Tooltip hasArrow label = { tooltip } >
                <img style = { smallerIconStyles } src = { helpIcon } />
            </Tooltip>
        </Box>
        <Box fontSize = 'xs' fontStyle = 'italic'><span>learn</span></Box>
    </Box>

}

export default LearnIcon