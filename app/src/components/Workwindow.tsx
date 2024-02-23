// workwindow.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import {
    Box
} from '@chakra-ui/react'

const Workwindow = (props) => {
    const {children} = props
    return <Box data-type = 'workwindow'>{children}</Box>
} 

export default Workwindow