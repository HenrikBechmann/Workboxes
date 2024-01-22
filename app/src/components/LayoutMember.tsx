// MembersLayout.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Grid, GridItem } from '@chakra-ui/react'

import ToolbarFrame from '../components/toolbars/ToolbarFrame'
import ToolbarStandard from '../components/toolbars/StandardToolbar'

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
        gridTemplateColumns = '1fr' 
        gridTemplateRows = 'auto 1fr'
        gridTemplateAreas = {`"header"
                              "body"`}
    >
        <GridItem data-type = 'grid-header' gridArea = 'header'>
            <ToolbarFrame>
                <ToolbarStandard />
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'grid-body' gridArea = 'body'>        
            <Box data-type = 'members-outlet' style = {bodyStyle}>
                <Outlet />
            </Box>
        </GridItem>
    </Grid>
}

export default LayoutMember