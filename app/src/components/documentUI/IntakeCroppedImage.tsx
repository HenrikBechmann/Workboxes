// IntakeCroppedImage.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    TODO:
    provide way to clear image
    
*/

import React, {useState, useEffect, useRef, useCallback} from 'react'

import {ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import {
    Box, Button,
} from '@chakra-ui/react'

import {useDropzone} from 'react-dropzone'

import ReactCrop, {type Crop, makeAspectCrop, centerCrop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { useStorage } from '../../system/WorkboxesProvider'
import { useWorkboxHandler } from '../workbox/Workbox'

//     const [src, setSrc] = useState(null);
//     const [crop, setCrop] = useState({ aspect: 16 / 9 });
//     const [image, setImage] = useState(null);
//     const [output, setOutput] = useState(null);

//     const selectImage = (file) => {
//         setSrc(URL.createObjectURL(file));
//     };

//     const cropImageNow = () => {
//         const canvas = document.createElement('canvas');
//         const scaleX = image.naturalWidth / image.width;
//         const scaleY = image.naturalHeight / image.height;
//         canvas.width = crop.width;
//         canvas.height = crop.height;
//         const ctx = canvas.getContext('2d');

//         const pixelRatio = window.devicePixelRatio;
//         canvas.width = crop.width * pixelRatio;
//         canvas.height = crop.height * pixelRatio;
//         ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
//         ctx.imageSmoothingQuality = 'high';

//         ctx.drawImage(
//             image,
//             crop.x * scaleX,
//             crop.y * scaleY,
//             crop.width * scaleX,
//             crop.height * scaleY,
//             0,
//             0,
//             crop.width,
//             crop.height,
//         );

//         // Converting to base64
//         const base64Image = canvas.toDataURL('image/jpeg');
//         setOutput(base64Image);
//     };

// ------------------------------------------

//     return (
//         <div className="App">
//             <center>
//                 <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => {
//                         selectImage(e.target.files[0]);
//                     }}
//                 />
//                 <br />
//                 <br />
                // <div>
                //     {src && (
                //         <div>
                //             <ReactCrop src={src} onImageLoaded={setImage}
                //                 crop={crop} onChange={setCrop} />
                //             <br />
                //             <button onClick={cropImageNow}>Crop</button>
                //             <br />
                //             <br />
                //         </div>
                //     )}
                // </div>
                // <div>{output && <img src={output} />}</div>
//             </center>
//         </div>
//     );



const IntakeCroppedImage = (props) => {

    const 
        storage = useStorage(),
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler(),
        editBaseRecord = workboxHandler.editRecord.document.base,
        [editState,setEditState] = useState('setup'),
        helperText = {
            thumbnail:`This image (sized to 90 x 90 px) is used as a visual representation in resource listings.`
        },
        [error, setError] = useState(''),
        [imgSrc, setImgSrc] = useState(''),
        imgRef = useRef(null),
        [crop, setCrop] = useState<Crop>(),
        // [image, setImage] = useState(null),
        [output, setOutput] = useState(null)

    // onImageLoaded={setImage}
    // TODO check availability of error value for reset in imageElement.setEventListener
    const
        onDrop = useCallback(async (acceptedFiles) => {
            // console.log('acceptedFiles', acceptedFiles)
            const file = acceptedFiles[0]
            if (!file) return

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

            // selectImage(file)

            // const fileRef = file?.name? ref(storage, workboxHandler.editRecord.profile.workbox.id + '/thumbnail/' + file.name):null
            // if (!fileRef) return
            // try {
            //     await uploadBytes(fileRef, file)
            // } catch (error) {
            //     console.log('An error occured uploading file.name', file.name)
            //     alert (error.message) // placeholder
            //     return null
            // }
            // console.log('file has been uploaded', file.name)

            // const url = await getDownloadURL(fileRef)

            // workboxHandler.editRecord.document.base.image.source = url

            // setEditState('uploading')

        }, [error])

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget
        const cropWidthByPercent = (90/width) * 100
        const crop = makeAspectCrop(
            {
                unit: '%',
                width: cropWidthByPercent,
            }, 1, width, height
        )
        const centeredCrop = centerCrop(crop, width, height)
        setCrop(centeredCrop)
    }

    const cropImageNow = () => {
        const 
            image = imgRef.current,
            canvas = document.createElement('canvas'),
            scaleX = image.naturalWidth / image.width,
            scaleY = image.naturalHeight / image.height,
            pixelRatio = window.devicePixelRatio,
            ctx = canvas.getContext('2d')

        canvas.width = crop.width * pixelRatio
        canvas.height = crop.height * pixelRatio

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
        ctx.imageSmoothingQuality = 'high'

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,          
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        )

        // Converting to base64
        const base64Image = canvas.toDataURL('image/jpeg')

        setOutput(base64Image)

    }

    useEffect(()=>{

        (editState == 'ready') && setEditState('ready')

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
                <Box style = {{fontSize:'small', backgroundColor:'#cfcfcf94'}} >Drop the Image here ...</Box> :
                <Box style = {{fontSize:'small', backgroundColor:'#cfcfcf94'}}>Drag 'n' drop an image here, or click to select an image</Box>
            }
            {isDragReject && <div style = {{color:'red',fontSize:'small'}} >file rejected - file must be an image</div>}
            {error && <div style = {{color:'red', fontSize: 'small'}} >{error}</div> }
        </div>                
        <Box fontSize = 'xs' fontStyle = 'italic' borderBottom = '1px solid silver'>
        {helperText.thumbnail}
        </Box>
        <div>
            {( imgSrc && 
                <div>
                    <ReactCrop
                        crop={crop} 
                        onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
                        keepSelection
                        aspect = {1}
                        minWidth = {90}
                    >
                        <img ref = {imgRef} src = {imgSrc} style = {{width:'100%', maxWidth: '700px'}} onLoad = {onImageLoad} />
                    </ReactCrop>
                    <br />
                    <Button onClick={cropImageNow} colorScheme = 'blue'>Crop and upload image</Button>
                    <br />
                    <br />
                </div>
            )}
        </div>
        <Box><img style = {
            {
                width: '90px', 
                height: '90px', 
                border: '1px solid gray', 
                borderRadius: '6px',
                marginTop: '3px',
            }
        } src = {workboxHandler.editRecord.document.base.image.source} /></Box>
    </Box>

}

export default IntakeCroppedImage