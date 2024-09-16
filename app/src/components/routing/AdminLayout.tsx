// SysadminLaout.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React, {lazy} from 'react'
import { Outlet as RouterOutput } from 'react-router-dom'
import { Box, Grid, GridItem } from '@chakra-ui/react'

const ToolbarFrame = lazy(() => import('../toolbars/Toolbar_Frame'))
const ToolbarStandard = lazy(() => import('../toolbars/Toolbar_Standard'))

const bodyStyle = {
    height:'100%',
    display:'relative', 
    backgroundColor:'aliceblue',
    borderTop:'1px solid lightgray',
    overflow:'hidden', // hide drawers
}

const SysadminLayout = (props) => {

    return <Grid 
        data-type = 'layout-sysadmin'
        height = '100vh' 
        width = '100vw'
        gridTemplateColumns = '1fr' 
        gridTemplateRows = 'auto 1fr'
        gridTemplateAreas = {`"header"
                              "body"`}
    >
        <GridItem data-type = 'grid-header' gridArea = 'header'  width = '100vw'>
            <ToolbarFrame>
                <ToolbarStandard />
            </ToolbarFrame>
        </GridItem>
        <GridItem data-type = 'grid-body' gridArea = 'body' width = '100vw'>        
            <Box data-type = 'sysadmin-outlet' style = {bodyStyle}>
                <RouterOutput />
            </Box>
        </GridItem>
    </Grid>
}

export default SysadminLayout