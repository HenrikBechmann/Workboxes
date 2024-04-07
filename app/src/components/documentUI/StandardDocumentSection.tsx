// StandardDocumentSection.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import {
    Box,
} from '@chakra-ui/react'

const StandardDocumentSection = (props) => {

    const {profileData, documentData, documentState} = props

    const content = 
        documentState.mode == 'view'
        ? 'Standard Section'
        : 'Standard Section (editing)'

    return <Box>
        {content}
    </Box>
}

export default StandardDocumentSection