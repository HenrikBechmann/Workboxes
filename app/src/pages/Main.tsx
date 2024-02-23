// Main.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef } from 'react'

import Workspace from '../components/Workspace'
import { Box } from '@chakra-ui/react'

// ------------------------- static values --------------------
// const workspaceStyle = {
//     height: '100%', 
//     display:'relative', 
//     backgroundColor:'ghostwhite',
//     borderTop:'1px solid silver',
//     borderBottom:'1px solid silver'
// }

// ------------------------ Main component -------------------
// <Box 
//     data-type = 'page-liner'
//     height = '100%' 
//     position = 'absolute' 
//     inset = '0' 
//     overflow = 'hidden'
// >
//     <Box data-type = 'page-container' overflow = 'auto' height = '100%' position = 'relative'>
//         <Box data-type = 'page-content' width = '100%' display = 'flex' flexWrap = 'wrap'>
//         </Box>
//     </Box>
// </Box>

export const Main = (props) => {

    return <Box data-type = 'main-page-content' position = 'absolute' inset = {0}>
        <Workspace></Workspace>
    </Box>
}

export default Main
