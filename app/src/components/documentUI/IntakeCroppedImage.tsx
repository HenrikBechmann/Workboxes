// IntakeCroppedImage.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useEffect, useCallback} from 'react'

import {ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import {
    Box,
    // FormControl, FormLabel, FormHelperText, FormErrorMessage,
    // Flex, HStack,
    // Input, Textarea, Heading
} from '@chakra-ui/react'

import {useDropzone} from 'react-dropzone'

import { useStorage } from '../../system/WorkboxesProvider'
import { useWorkboxHandler } from '../workbox/Workbox'

const IntakeCroppedImage = (props) => {

    const 
        storage = useStorage(),
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        editBaseRecord = workboxHandler.editRecord.document.base,
        [editState,setEditState] = useState('setup'),
        helperText = {
            thumbnail:`This image (sized to 90 x 90 px) is used as a visual representation in resource listings.`
        }

    const
        onDrop = useCallback(async (acceptedFiles) => {
            console.log('acceptedFiles', acceptedFiles)
            const file = acceptedFiles[0]
            const fileRef = file?.name? ref(storage, workboxHandler.editRecord.profile.workbox.id + '/thumbnail/' + file.name):null
            if (!fileRef) return
            try {
                await uploadBytes(fileRef, file)
            } catch (error) {
                console.log('An error occured uploading file.name', file.name)
                alert (error.message) // placeholder
                return null
            }
            console.log('file has been uploaded', file.name)

            const url = await getDownloadURL(fileRef)

            workboxHandler.editRecord.document.base.image.source = url

            setEditState('uploading')

        }, [])

    useEffect(()=>{

        setEditState('ready')

    },[editState])

    const
        {getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject} = useDropzone(
            {
                onDrop, 
                multiple:false,
                accept: {
                    'image/*': [],
                }
            }
        )

    return <Box minWidth = '300px' margin = '3px' padding = '3px' border = '1px dashed silver' >
        Thumbnail image:
        <div {...getRootProps()}>
            <input {...getInputProps()} />
        {
            isDragActive ?
                <p style = {{fontSize:'small'}} >Drop the Image here ...</p> :
                <p style = {{fontSize:'small'}}>Drag 'n' drop an image here, or click to select an image</p>
            }
            {isDragReject && <div style = {{color:'red',fontSize:'small'}} >file rejected - file must be an image</div>}
        </div>                
        <Box fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
        {helperText.thumbnail}
        </Box>
        <Box><img style = {{width: '90px', height: '90px'}} src = {workboxHandler.editRecord.document.base.image.source} /></Box>
    </Box>

}

export default IntakeCroppedImage