// DomainControl.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'

import {
    Tooltip, Box, Text,
    Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup
} from '@chakra-ui/react'

import systemDomainIcon from '../../../../assets/pallet.png'

const DomainControl = (props) => {

    const { domainTitle, domainIcon, caption, response } = props

    const workboxItemIconStyles = {
        width:'24px', 
        height:'24px', 
        borderRadius:'12px',
        opacity:0.7,
    }

    const localCaption = caption || 'domain'

   return <Box 
        cursor = 'pointer' 
        onClick = {response} 
        display = 'flex' 
        flexDirection = 'column' 
        justifyContent = 'center' 
        alignContent = 'center'
    >
        <Box display = 'flex' flexWrap = 'nowrap'>
            <span>&nbsp;&nbsp;</span>
            <img style = {workboxItemIconStyles} src = {systemDomainIcon} />
            <span>&nbsp;&nbsp;</span>
            {domainIcon && <><img style = {workboxItemIconStyles} src = {domainIcon} />
            <span>&nbsp;&nbsp;</span></>}
            <Text fontSize = 'sm'>{domainTitle}</Text>
        </Box>
        <Box display = 'flex' justifyContent = 'center' fontSize = 'xx-small' color = 'gray' fontStyle = 'italic'><span>{localCaption}</span></Box>
    </Box>
}

export default DomainControl