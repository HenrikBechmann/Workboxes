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
        {profileData, documentData, documentConfig, invalidStandardFieldFlagsRef} = props,
        standardComponentRef = useRef(null),
        [contentState,setContentState] = useState('setup'),
        contentStateRef = useRef(null)

    contentStateRef.current = contentState

    useEffect(()=>{

        let standardSection
        const {sections} = documentData
        const sectionCount = sections?.length
        for (let index = 0; index < sectionCount; index++) {
            const section = sections[index]
            if (section.name = 'standard') {
                standardSection = section
                break
            }
        }

        // standardComponentRef.current =
        //     React.createElement(documentTypeBundles[profileData.typeName].StandardDocumentSection,{
        //         profileData, documentData:standardSection, documentConfig
        //     })

    },[])

    useEffect(()=>{

        if (contentState !== 'ready') setContentState('ready')

    },[contentState])

    useEffect(()=>{

        if (contentStateRef.current != 'ready') return
            
        standardComponentRef.current = 
            React.cloneElement(standardComponentRef.current,
                {
                    documentConfig, 
                    invalidStandardFieldFlagsRef
                }
            )
        setContentState('updating')

    },[documentConfig])


    return <Box>
        <Suspense>
            {standardComponentRef.current}
        </Suspense>
    </Box>
}

export default DocumentContent