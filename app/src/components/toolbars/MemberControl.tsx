// MemberControl.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'

import {
    Tooltip, Box, Text,
    Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup
} from '@chakra-ui/react'

import systemDomainIcon from '../../../assets/member.png'

const MemberControl = (props) => {

    const { domainTitle, domainIcon, caption } = props

    const workboxItemIconStyles = {
        width:'24px', 
        height:'24px', 
        borderRadius:'12px',
        opacity:0.7,
    }

    const localCaption = caption || 'domain'

   return <Box display = 'flex' flexDirection = 'column' justifyContent = 'center' alignContent = 'center'>
        <Box display = 'flex' flexWrap = 'nowrap'>
            <span>&nbsp;</span>
            <img style = {workboxItemIconStyles} src = {systemDomainIcon} />
            {domainIcon && <><span>&nbsp;</span>
            <img style = {workboxItemIconStyles} src = {domainIcon} /></>}
            <span>&nbsp;</span>
            <Text fontSize = 'sm'>{domainTitle}</Text>
        </Box>
        <Box display = 'flex' justifyContent = 'center' fontSize = 'xs' color = 'gray' fontStyle = 'italic'><span>{localCaption}</span></Box>
    </Box>
}

export default MemberControl
