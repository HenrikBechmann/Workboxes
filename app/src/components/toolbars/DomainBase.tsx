// DomainControl.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'

import {
    Tooltip, Box, Text,
    Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup
} from '@chakra-ui/react'

import domainIcon from '../../../assets/domain_light.png'

const DomainBase = (props) => {

    const { workboxDomainTitle } = props

    const workboxItemIconStyles = {
        width:'24px', 
        height:'24px', 
        borderRadius:'12px',
        opacity:0.7,
    }

   return <Box display = 'flex' flexDirection = 'column' justifyContent = 'center' alignContent = 'center'>
        <Box display = 'flex' flexWrap = 'nowrap' alignItems = 'center'>
            <span>&nbsp;&nbsp;</span>
            <Text fontSize = 'xs'>Base Domain: </Text>
            <img style = {workboxItemIconStyles} src = {domainIcon} />
            <span>&nbsp;&nbsp;</span>
            <Text fontSize = 'xs'>{workboxDomainTitle}</Text>
        </Box>
    </Box>
}

export default DomainBase