// IntakeCroppedImage.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

// many details of conversions taken from https://www.youtube.com/watch?v=odscV57kToU by Nikita Dev
/*
    TODO:
    provide way to clear image
    
*/

import React, {useState, useRef, useCallback} from 'react'

import {ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import {
    Box, Button, Flex,
} from '@chakra-ui/react'

import {useDropzone} from 'react-dropzone'

import ReactCrop, {type Crop, makeAspectCrop, centerCrop, convertToPixelCrop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { useStorage } from '../../system/WorkboxesProvider'
import { useWorkboxHandler } from '../workbox/Workbox'

const IntakeCroppedImage = (props) => {

    const 
        storage = useStorage(),
        [workboxHandler] = useWorkboxHandler(),

        fileNameRef = useRef(null),
        imageRef = useRef(null),
        previewCanvasRef = useRef(null),
        resizedCanvasRef = useRef(null),

        [error, setError] = useState(''),
        [imgSrc, setImgSrc] = useState(''),
        [pctCrop, setPctCrop] = useState<Crop>(),
        [isOutput, setIsOutput] = useState(false),

        helperText = 'This image (sized to max 90 x 90 px) is used as a visual representation in resource listings.'

    // drop or select image
    const
        onDrop = useCallback(async (acceptedFiles) => {
            // console.log('acceptedFiles', acceptedFiles)
            const file = acceptedFiles[0]
            if (!file) return

            fileNameRef.current = file.name

            const reader = new FileReader()

            reader.addEventListener('load',() => {

                // validate image size
                const imageElement = new Image()
                const imageUrl = reader.result?.toString() || ''
                imageElement.src = imageUrl

                imageElement.addEventListener('load',(e) => {
                    if (error) setError('')
                    const { naturalWidth, naturalHeight } = e.currentTarget as HTMLImageElement
                    if (naturalWidth < 90 || naturalHeight < 90) {
                        setError('image must be at least 90 x 90 pixels.')
                        return setImgSrc('')
                    }
                })

                setImgSrc(imageUrl)

            })

            reader.readAsDataURL(file)

        }, [error]) // TODO check availability of error value for reset in imageElement.setEventListener

    // get dropzone resources
    const
        {getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject} = useDropzone(
            {
                onDrop, // defined above
                multiple:false,
                accept: {
                    'image/*': [],
                }
            }
        )

    // present loaded image with crop outline
    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget
        const cropWidthByPercent = (90/width) * 100
        const pctCrop = makeAspectCrop(
            {
                unit: '%',
                width: cropWidthByPercent,
            }, 1, width, height
        )
        const centeredCrop = centerCrop(pctCrop, width, height)
        setPctCrop(centeredCrop)
    }

    // crop image, by user selection, to the preview canvas
    const cropImage = () => {
        const 
            image = imageRef.current,
            pxCrop = convertToPixelCrop(pctCrop, image.width, image.height ),
            previewCanvas = previewCanvasRef.current,
            scaleX = image.naturalWidth / image.width,
            scaleY = image.naturalHeight / image.height,
            pixelRatio = window.devicePixelRatio,
            ctx = previewCanvas.getContext('2d')

        previewCanvas.width = Math.floor(pxCrop.width * scaleX * pixelRatio)
        previewCanvas.height = Math.floor(pxCrop.height * scaleY * pixelRatio) 

        ctx.scale(pixelRatio, pixelRatio)
        ctx.imageSmoothingQuality = 'high'
        ctx.save()

        const cropX = pxCrop.x * scaleX
        const cropY = pxCrop.y * scaleY

        ctx.translate(-cropX, -cropY)

        ctx.drawImage(
            image,
            0, // sx
            0, // sy
            image.naturalWidth, // sWidth
            image.naturalHeight, // sHeight
            0, // dx
            0, // dy
            image.naturalWidth, // dWidth
            image.naturalHeight, // dHeight
        )

        ctx.restore()

        setIsOutput(true)

    }

    // resize and save image
    const acceptCroppedImage = () => {

        if (!isOutput) return

        const 
            resizedCanvas = resizedCanvasRef.current,
            ctx = resizedCanvas.getContext('2d')

        resizedCanvas.width = 90
        resizedCanvas.height = 90
        ctx.drawImage(
            previewCanvasRef.current,
            0,0,90,90
        )

        resizedCanvas.toBlob(blobCallback)

    }

    // save the cropped image
    async function blobCallback (blob) {

        const 
            fileName = fileNameRef.current,
            { editRecord } = workboxHandler,
            fileRef = ref(storage, editRecord.profile.workbox.id + '/thumbnail/' + fileName)

        if (!fileRef) return

        try {
            await uploadBytes(fileRef, blob)
        } catch (error) {
            console.log('An error occured uploading file.name', fileName)
            alert (error.message) // placeholder
            return null
        }

        const url = await getDownloadURL(fileRef)

        editRecord.document.base.image.source = url

        // reset crop data
        setImgSrc('')
        setPctCrop(null)
        setIsOutput(false)

    } 

    return <Box minWidth = '300px' margin = '3px' padding = '3px' border = '1px dashed silver' >
        New thumbnail image:
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {
                isDragActive 
                    ? <Box style = {{fontSize:'small', backgroundColor:'#cfcfcf94'}} >
                        Drop the new image here ...
                    </Box> 
                    : <Box style = {{fontSize:'small', backgroundColor:'#cfcfcf94'}}>
                        Drag 'n' drop a new image here, or click to select a new image
                    </Box>
            }
            {isDragReject && <div style = {{color:'red',fontSize:'small'}} >
                file rejected - file must be an image
            </div>}
            {error && <div style = {{color:'red', fontSize: 'small'}} >{error}</div> }
        </div>                
        <Box fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
            { helperText }
        </Box>
        <Box>
            {(imgSrc &&
                <Box border = '2px solid black' padding = '3px'>
                    <ReactCrop
                        crop={pctCrop} 
                        onChange={(pixelCrop, percentCrop) => setPctCrop(percentCrop)}
                        keepSelection
                        aspect = {1}
                        minWidth = {90}
                    >
                        <img 
                            ref = {imageRef} 
                            src = {imgSrc} 
                            style = {{width:'100%', maxWidth: '700px'}} 
                            onLoad = {onImageLoad} 
                        />
                    </ReactCrop>
                    <br />
                    <Button onClick={cropImage} colorScheme = 'blue'>Preview cropped image</Button>
                    <br /><br />
                    {pctCrop && <Flex>
                        <canvas 
                            style = {
                                {
                                    width:'90px', 
                                    height:'90px', 
                                    border: '1px solid gray', 
                                    objectFit: 'contain',
                                    marginRight: '3px',
                                }
                            } 
                            ref = {previewCanvasRef} 
                        />
                        <Button 
                            onClick = {acceptCroppedImage}
                            isDisabled = {!isOutput} 
                            colorScheme = 'blue'
                        >
                            Accept cropped image
                        </Button>
                        <canvas 
                            style = {
                                {
                                    width:'90px', 
                                    height:'90px', 
                                    border: '1px solid gray', 
                                    objectFit: 'contain',
                                    marginRight: '3px',
                                    display:'none',
                                }
                            } 
                            ref = {resizedCanvasRef} 
                        />
                    </Flex>}
                </Box>
            )}
        </Box>
        <Box><Flex>
            <img 
                style = {
                    {
                        width: '90px', 
                        height: '90px', 
                        border: '1px solid gray', 
                        borderRadius: '6px',
                        marginTop: '3px',
                    }
                } 
                src = {workboxHandler.editRecord?.document.base.image.source || 
                    workboxHandler.workboxRecord.document.base.image.source} 
            />
            {!pctCrop && <Button margin = '3px' colorScheme = 'blue'>Remove thumbnail</Button>}
        </Flex></Box>
    </Box>
}

export default IntakeCroppedImage
