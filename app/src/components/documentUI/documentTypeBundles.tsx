// documentTypeBundles.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { lazy } from 'react'

const StandardDocumentSection = lazy(() => import('./StandardDocumentSection'))


const documentTypeBundles = {
    Collection:{
        StandardDocumentSection,
    }
}

export default documentTypeBundles
