// MenuIcon.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'

import {
    Tooltip, Box,
    Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

const MenuIcon = (props) => {

    const { icon, tooltip, caption, menulist } = props

    const workboxIconControlStyles = {
        display:'flex',
        flexDirection:'column',
        flexWrap:'nowrap',
        alignItems:'center',
        padding:'2px',
        borderRadius:'6px',
        marginLeft:'6px',
    } as CSSProperties

    const workboxIconStyles = {
        height:'20px',
        width:'20px',
    }

    const downArrowSpanStyles = {
        opacity:0.5, 
        fontSize:'small',
    }
    
    return <Box style = {workboxIconControlStyles}>
        <Menu>
            <Box display = 'flex' flexDirection = 'column' alignItems = 'center' justifyContent = 'center'>
                <Tooltip hasArrow label = {tooltip} >
                    <MenuButton >
                        <Box display = 'flex' flexDirection = 'row' flexWrap = 'nowrap' alignItems = 'center'>
                            <img style = {workboxIconStyles} src = {icon} />
                            <span style = {downArrowSpanStyles} >▼</span>
                        </Box>
                    </MenuButton>
                </Tooltip>
                {menulist}
                <Box fontSize = 'xs' fontStyle = 'italic'>
                    <span>{caption}</span>
                </Box>
            </Box>
        </Menu>
    </Box> 
}

export default MenuIcon