// BaseDataEdit.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import { useWorkboxHandler } from '../workbox/Workbox'

const BaseDataEdit = () => {
    const
        [workboxHandler, dispatchWorkboxHandler] = useWorkboxHandler()

    return <div>base data edit</div>
}

export default BaseDataEdit