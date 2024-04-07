// DocumentContent.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { 
    useRef, 
    useEffect, 
    useState, 
    useContext, 
    CSSProperties, 
    forwardRef,
    Suspense,
} from 'react'

import {
    Box
} from '@chakra-ui/react'

import documentTypeBundles from './documentTypeBundles'

const DocumentContent = (props) => {

    const 
        {profileData, documentData, documentState} = props,
        standardComponentRef = useRef(null)

    useEffect(()=>{

        standardComponentRef.current =
            React.createElement(documentTypeBundles[profileData.typeName].StandardDocumentSection,{
                profileData, documentData, documentState
            })

    },[])


    return <Box>
        <Suspense>
            {standardComponentRef.current}
        </Suspense>
    </Box>
}

export default DocumentContent