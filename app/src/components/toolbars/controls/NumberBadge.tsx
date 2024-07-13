// NumberBadge.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { CSSProperties } from 'react'

import {
  Box,
} from '@chakra-ui/react'

const numberBadgeStyles = {
    height:'11px',
    padding:'0 2px 0 2px',
    borderRadius: '5px',
    position:'absolute',
    right:0,
    top: 0,
    fontSize: '9px',
    textAlign: 'center',
    backgroundColor: 'blue',
    color:'white',
    lineHeight: '11px',
    fontWeight: 'bold',
} as CSSProperties

const NumberBadge = (props) => {
    const { number } = props
    return <Box data-type = 'numberbadge' style = {numberBadgeStyles}>{ number }</Box>
}

export default NumberBadge