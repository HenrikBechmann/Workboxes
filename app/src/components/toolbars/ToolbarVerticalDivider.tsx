// VerticalToolbarDivider.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'
import { Box } from '@chakra-ui/react'

const verticalDividerStyles = {
    height:'20px',
    borderLeft:'1px solid gray', 
    width:'0px', 
    marginLeft:'12px',
    // display:'inline-block',
}

const VerticalToolbarDivider = (props) => {

    return <Box style = {verticalDividerStyles}></Box>

}

export default VerticalToolbarDivider