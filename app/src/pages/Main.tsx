// Tribalopolis.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef } from 'react'

import Toolbar from '../components/Toolbar'
import ToolbarWorkspace from '../components/ToolbarWorkspace'
import { Box, Grid, GridItem } from '@chakra-ui/react'

// ------------------------- static values --------------------
// const workspaceStyle = {
//     height: '100%', 
//     display:'relative', 
//     backgroundColor:'ghostwhite',
//     borderTop:'1px solid silver',
//     borderBottom:'1px solid silver'
// }

// ------------------------ Main component -------------------
export const Main = (props) => {

    return <Grid 
          date-type = 'page'
          height = '100%'
          templateAreas={`"body"
                          "footer"`}
          gridTemplateRows={'1fr auto'}
          gridTemplateColumns={'1fr'}
        >
        <GridItem data-type = 'page-body' area={'body'}>
            <Box data-type = 'page-frame' height = '100%' position = 'relative'>
                <Box 
                    data-type = 'page-liner'
                    height = '100%' 
                    position = 'absolute' 
                    inset = '0' 
                    overflow = 'hidden'
                >
                    <Box data-type = 'page-container' overflow = 'auto' height = '100%' position = 'relative'>
                        <Box data-type = 'page-content' width = '100%' display = 'flex' flexWrap = 'wrap'>
                            Main page
                        </Box>
                    </Box>
                </Box>
            </Box>
        </GridItem>
        <GridItem area = 'footer'>
            <Box borderTop = '1px solid lightgray' width = '100%'>
                <Toolbar>
                    <ToolbarWorkspace />
                </Toolbar>
            </Box>
        </GridItem>
    </Grid>
}

export default Main
