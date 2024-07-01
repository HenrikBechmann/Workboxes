// ItemControl.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'

import {
    Tooltip, Box, Text,
    Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup
} from '@chakra-ui/react'

const ItemControl = (props) => {

    const { itemIcon, itemTitle } = props

    const workboxItemIconStyles = {
        width:'24px', 
        height:'24px', 
        borderRadius:'12px',
    }

   return <Box display = 'flex' flexDirection = 'column' justifyContent = 'center' alignContent = 'center'>
        <Box display = 'flex' flexWrap = 'nowrap'>
            <span>&nbsp;&nbsp;</span>
            <img style = {workboxItemIconStyles} src = {itemIcon} />
            <span>&nbsp;&nbsp;</span>
            <Text fontSize = 'sm'>{itemTitle}</Text>
        </Box>
        <Box display = 'flex' justifyContent = 'center' fontSize = 'xx-small' color = 'gray' fontStyle = 'italic'><span>workbox name</span></Box>
    </Box>
}

export default ItemControl