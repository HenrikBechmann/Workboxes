// BaseDataEdit.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useMemo, lazy, Suspense } from 'react'

import { useWorkboxHandler } from '../workbox/Workbox'

const DataNoteEdit = lazy(()=> import('./Data_Note_Edit'))

const BaseDataEditController = () => {
    const
        [ workboxHandler, dispatchWorkboxHandler ] = useWorkboxHandler(),
        { editRecord } = workboxHandler,
        workboxType = editRecord?.profile.type.name || workboxHandler.workboxRecord.profile.type.name

    const datacomponent = useMemo(()=> {

        let component
        switch (workboxType) {
        case 'member':
        case 'domain': 
            component = <Suspense><DataNoteEdit /></Suspense>
        }

        return component

    },[workboxType])

    return <>{datacomponent}</>
}

export default BaseDataEditController