// StandardDocumentSection.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import {
    Box,
} from '@chakra-ui/react'

const StandardDisplay = (props) => {
    const {documentData} = props
    const { data } = documentData

    const name = data.alias || data.name
    const { description, image, summary } = data

    return <Box>
        <Box>
            {name}
        </Box>
        <Box>
            {description}
        </Box>
        <Box>
            {image}
        </Box>
        <Box>
            {summary}
        </Box>
    </Box>
}

const StandardDocumentSection = (props) => {

    const {profileData, documentData, documentState} = props

    console.log('documentData',documentData)

    return <Box>
        {documentState.mode == 'view'? <StandardDisplay documentData = {documentData} />: null}
    </Box>
}

export default StandardDocumentSection