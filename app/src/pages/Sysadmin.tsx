// Sysadmin.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
import React from 'react'

import { useNavigate } from 'react-router-dom'

import { Button, Text } from '@chakra-ui/react'

const outerStyle = {height: '100%', display:'relative', backgroundColor:'gray'}

const Sysadmin = (props) => {

    const navigate = useNavigate()

    const gotoSettings = () => {
        navigate('/sysadmin/settings')
    }

    const gotoMetadata = () => {
        navigate('/sysadmin/metadata')
    }

    const gotoUserControls = () => {
        navigate('/sysadmin/usercontrols')
    }

    const gotoHelpPanels = () => {
        navigate('/sysadmin/helppanels')
    }

    return <div data-type = 'sysadmin' style = {outerStyle}>

        <Text>System administration</Text>
        <Button m = {3} onClick = {gotoSettings}> Settings </Button>
        <Button m = {3} onClick = {gotoMetadata}> Metadata </Button>
        <Button m = {3} onClick = {gotoUserControls}> User Controls </Button>
        <Button m = {3} onClick = {gotoHelpPanels}> Help Panels </Button>

    </div>

}

export default Sysadmin