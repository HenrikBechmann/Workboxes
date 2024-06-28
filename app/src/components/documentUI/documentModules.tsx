// documentModules.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { lazy } from 'react'

const DocumentBase = lazy(() => import('./DocumentBase'))


const documentModules = {
    base:DocumentBase,
    section: null,
    member:{
        data:null,
    },
    domain:{
        data:null,
    },
}

export default documentModules
