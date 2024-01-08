// Tribalopolis.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef } from 'react'

import Toolbar from '../components/Toolbar'
import ToolbarWorkspace from '../components/ToolbarWorkspace'
import { Box, Grid, GridItem } from '@chakra-ui/react'

// ------------------------- static values --------------------
const workspaceStyle = {
    height: '100%', 
    display:'relative', 
    backgroundColor:'ghostwhite',
    borderTop:'1px solid silver',
    borderBottom:'1px solid silver'
}

// ------------------------ Main component -------------------
export const Main = (props) => {

    return <Grid 
          height = '100%'
          templateAreas={`"body"
                          "footer"`}
          gridTemplateRows={'1fr auto'}
          gridTemplateColumns={'1fr'}
        >
        <GridItem area={'body'}>
            <Box data-type = 'members-outlet' style = {workspaceStyle}>
                Main page
            </Box>
        </GridItem>
        <GridItem area = 'footer'>
            <Toolbar>
                <ToolbarWorkspace />
            </Toolbar>
        </GridItem>
    </Grid>
}

export default Main
