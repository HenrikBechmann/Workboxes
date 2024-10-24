// BaseDataDisplay.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useMemo, lazy, Suspense } from 'react'

import { useWorkboxHandler } from '../workbox/Workbox'

const DataNoteDisplay = lazy(()=> import('./Data_Note_Display'))

import Loading from '../../system/Loading'

const BaseDataDisplayController = () => {
    const
        [ workboxHandler ] = useWorkboxHandler(),
        { workboxRecord } = workboxHandler,
        workboxType = workboxRecord.profile.type.name

    const datacomponent = useMemo(()=> {

        let component
        switch (workboxType) {
        case 'member':
        case 'groupdomain': 
        case 'domain': 
            component = <Suspense fallback = {<Loading />}><DataNoteDisplay /></Suspense>
        }

        return component

    },[workboxType])

    return <>{datacomponent}</>
}

export default BaseDataDisplayController