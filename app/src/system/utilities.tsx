// utilities.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import {merge as _merge} from 'lodash'

export const updateDocumentVersion = (collection, type, source) => {

    let updatedDocument
    if (versions[collection] && versions[collection][type]) {
        const latest = versions[collection][type]
        if (source.version !== latest.version) {
            updatedDocument = _merge(latest, source)
        } else {
            updatedDocument = source
        }
    } else {
        updatedDocument = source
    }

    return updatedDocument

}

// always increment version to larger number
const versions = {
    workboxes:{
        collection:{
            version: 0,

        }
    },
    accounts: {
        standard: {
            version: 0,

        }
    },
    users: {
        standard: {
            version: 0,

        }
    },
    domains: {
        standard: {
            version: 0,

        }
    }

}

