// ItemControl.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'

import {
    Tooltip, Box, Text,
    Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup
} from '@chakra-ui/react'

import domainIcon from '../../../assets/domain_light.png'

const DomainControl = (props) => {

    const { workboxDomainTitle } = props

    const workboxItemIconStyles = {
        width:'24px', 
        height:'24px', 
        borderRadius:'12px',
        opacity:0.7,
    }

   return <Box display = 'flex' flexDirection = 'column' justifyContent = 'center' alignContent = 'center'>
        <Box display = 'flex' flexWrap = 'nowrap'>
            <span>&nbsp;&nbsp;</span>
            <img style = {workboxItemIconStyles} src = {domainIcon} />
            <span>&nbsp;&nbsp;</span>
            <Text fontSize = 'sm'>{workboxDomainTitle}</Text>
        </Box>
        <Box display = 'flex' justifyContent = 'center' fontSize = 'xs' color = 'gray' fontStyle = 'italic'><span>workbox domain...</span></Box>
    </Box>
}

export default DomainControl