// MembersLayout.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Grid, GridItem } from '@chakra-ui/react'

import ToolbarFrame from '../components/toolbars/Toolbar_Frame'
import ToolbarStandard from '../components/toolbars/Toolbar_Standard'

const bodyStyle = {
    height:'100%',
    display:'relative', 
    backgroundColor:'ghostwhite',
    borderTop:'1px solid lightgray',
    overflow:'hidden', // hide drawers
}

const LayoutMember = (props) => {

    return <Grid 
        data-type = 'layout-member'
        height = '100vh' 
        width = '100vw'
        gridTemplateColumns = '1fr' 
        gridTemplateRows = 'auto 1fr'
        gridTemplateAreas = {`"header"
                              "body"`}
    >
        <GridItem data-type = 'grid-header' gridArea = 'header' width = '100vw'>
            <ToolbarFrame>
                <ToolbarStandard />
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'grid-body' gridArea = 'body' width = '100vw'>        
            <Box data-type = 'members-outlet' style = {bodyStyle}>
                <Outlet />
            </Box>
        </GridItem>
    </Grid>
}

export default LayoutMember