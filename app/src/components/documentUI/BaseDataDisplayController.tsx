// BaseDataDisplay.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useMemo, lazy, Suspense } from 'react'

import { useWorkboxHandler } from '../workbox/Workbox'

const DataNoteDisplay = lazy(()=> import('./Data_Note_Display'))

const BaseDataDisplayController = () => {
    const
        [ workboxHandler, dispatchWorkboxHandler ] = useWorkboxHandler(),
        { workboxRecord } = workboxHandler,
        workboxType = workboxRecord.profile.type.name

    const datacomponent = useMemo(()=> {

        let component
        switch (workboxType) {
        case 'member':
        case 'domain': 
            component = <Suspense><DataNoteDisplay /></Suspense>
        }

        return component

    },[workboxType])

    return <>{datacomponent}</>
}

export default BaseDataDisplayController