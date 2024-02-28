// Workpanel.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useRef, useEffect, useCallback, CSSProperties, useMemo } from 'react'

import {
    Text, 
    Button, 
    Input, FormControl, FormLabel, FormErrorMessage, FormHelperText,
    Box, VStack, Center
} from '@chakra-ui/react'

import Workwindow from './Workwindow'
import Workbox from './workbox/Workbox'
// import { useUserData } from '../system/FirebaseProviders'

const workpanelStyles = {
    height:'100%',
    width:'100%',
    // position:'absolute',
    // inset: 0,
    minWidth:'700px',
    minHeight:'700px',
} as CSSProperties

// const workboxDefaults = {
//     settings:false,
//     settingsDisabled:false,
//     profile:true,
//     profileDisabled:false,
//     lists:true,
//     listsDisabled:false,
//     swap:false,
//     swapDisabled:false,
// }

let sessionID = 0

const Workpanel = (props:any) => {

    const [panelState, setPanelState] = useState('ready')

    const { panelWindowSpecsList } = props

    // const userData = useUserData()
    // const { displayName, photoURL } = userData.authUser

    const setFocus = (zOrder) => {
        const windowsList = windowsListRef.current
        const numberOfWindows = windowsList.length
        for (let i = 0; i < numberOfWindows; i++) {
            const component = windowsList[i]
            const currentZOrder = component.props.zOrder
            if (currentZOrder === zOrder) {
                windowsList[i] = React.cloneElement(component, {zOrder:numberOfWindows})
            } else if (currentZOrder > zOrder) {
                windowsList[i] = React.cloneElement(component, {zOrder:currentZOrder-1})
            }
        }
        setPanelState('resorted')
    }

    const windowsList = useMemo(()=>{

        const list = []

        for (const spec of panelWindowSpecsList) {
            sessionID++
            list.push(
                <Workwindow 
                    key = {sessionID} 
                    sessionID = {sessionID} 
                    setFocus = {setFocus} 
                    { ... spec.windowSpecs}
                >
                    <Workbox 
                        {...spec.workboxSpecs}
                    />
                </Workwindow>,
            )
        }

        return list


    },[panelWindowSpecsList])

    const windowsListRef = useRef(windowsList)

    // const windowsListRef = useRef([
    //         <Workwindow 
    //             key = {1} 
    //             sessionID = {1} 
    //             setFocus = {setFocus} 
    //             zOrder = {1} 
    //             sizeDefaults = {{width:'600px',height:'400px'}}
    //             locationDefaults = {{top:'20px',left:'20px'}} 
    //         >
    //             <Workbox 
    //                 workboxDefaults = {workboxDefaults} 
    //                 workboxItemIcon = {photoURL} 
    //                 workboxItemTitle = {displayName}
    //                 workboxDomainTitle = 'Henrik Bechmann'
    //                 workboxTypeName = 'Domain'
    //             />
    //         </Workwindow>,
    //         <Workwindow 
    //             key = {2} 
    //             sessionID = {2} 
    //             setFocus = {setFocus} 
    //             zOrder = {2} 
    //             sizeDefaults = {{width:'600px',height:'400px'}}
    //             locationDefaults = {{top:'40px',left:'40px'}} 
    //         >
    //             <Workbox 
    //                 workboxDefaults = {workboxDefaults} 
    //                 workboxItemIcon = {photoURL} 
    //                 workboxItemTitle = {displayName}
    //                 workboxDomainTitle = 'Henrik Bechmann'
    //                 workboxTypeName = 'Domain'
    //             />
    //         </Workwindow>,
    //         <Workwindow 
    //             key = {3} 
    //             sessionID = {3} 
    //             setFocus = {setFocus} 
    //             zOrder = {3}  
    //             sizeDefaults = {{width:'600px',height:'400px'}}
    //             locationDefaults = {{top:'60px',left:'60px'}} 
    //         >
    //             <Workbox 
    //                 workboxDefaults = {workboxDefaults} 
    //                 workboxItemIcon = {photoURL} 
    //                 workboxItemTitle = {displayName}
    //                 workboxDomainTitle = 'Henrik Bechmann'
    //                 workboxTypeName = 'Domain'
    //             />
    //         </Workwindow>,
    //     ])

    useEffect(() => {

        if (panelState == 'resorted') {
            setPanelState('ready')
        }

    },[panelState])


    return <Box data-type = 'workpanel' style = {workpanelStyles}>
        {windowsList}
    </Box>
}

export default Workpanel