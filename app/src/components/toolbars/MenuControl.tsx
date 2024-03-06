// SelectionControl.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'

import {
    Tooltip, Box,
    Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup
} from '@chakra-ui/react'

const iconWrapperStyles = {
    display:'inline-block',
    opacity:0.7,
}

const displayNameStyles = {
    display:'flex',
    flexWrap:'nowrap',
    alignItems:'center',
    whiteSpace:'nowrap',
    fontSize:'small', 
    marginLeft:'6px',
    marginRight:'3px', 
} as CSSProperties

const iconStyles = {
    height:'20px',
    width:'20px',
    borderRadius:'10px',
}

const arrowWrapperStyles = {
    display:'flex',
}

const arrowStyles = {
    opacity:0.5, 
    fontSize:'small',
    alignItems:'center',
}

// TODO borderRadius for avatar only
const MenuControl = (props) => {

    const 
        { displayName, avatar, icon, moreStyles, tooltip, caption, menulist, arrowdirection = 'down'} = props,
        iconStylesLocal = {...iconStyles, ...moreStyles},
        moreArrowWrapperStyles = 
            arrowdirection == 'down'
            ? null
            : {transform:'rotate(180deg)'},
        arrowWrapperStylesLocal = {...arrowWrapperStyles, ...moreArrowWrapperStyles}

    return <Box style = {{
        display:'flex',
        flexDirection:'column',
        flexWrap:'nowrap',
        marginLeft:'6px',
        borderRadius:'6px',
        alignItems: 'center',
        justifyContent: 'center',
        }}
    >
        <Menu>
            <Box display = 'flex' flexDirection = 'column' alignItems = 'center' justifyContent = 'center'>
                <Tooltip hasArrow label = {tooltip} >
                    <MenuButton >
                        <Box display = 'flex' flexDirection = 'row' alignItems = 'center'>
                            {icon && <Box style = {iconWrapperStyles}> <img style = {iconStylesLocal} src = {icon} /></Box>}
                            <Box style = {displayNameStyles} >{displayName}</Box>
                            <Box style = {arrowWrapperStylesLocal} ><span style = {arrowStyles}>▼</span></Box>
                        </Box>
                    </MenuButton >
                </Tooltip>
                {menulist}
            <Box fontSize = 'xs' color = 'gray' fontStyle = 'italic'><span>{caption}</span></Box>
        </Box>
        </Menu>
    </Box>

}

export default MenuControl