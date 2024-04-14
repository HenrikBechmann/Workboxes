// utilities.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import {merge as _merge} from 'lodash'

export const updateDocumentVersion = (collection, type, source, defaults = {}) => {

    let updatedDocument
    if (versions[collection] && versions[collection][type]) {
        const latest = versions[collection][type]
        if (source.version !== latest.version) {

            updatedDocument = _merge(latest, defaults, source)

            updatedDocument[collection][type].profile.version = 
              versions[collection][type].profile.version
              
        } else {
            updatedDocument = source
        }
    } else {
        updatedDocument = source
    }

    return updatedDocument

}

// collection:type. Always increment version to larger number
const versions = {
  workboxes:{
    collection:{
      version: 0,
      generation: 0,
      profile: {
        is_domainworkbox: null,
        workbox: {
          name: null,
          image: {
            source: null,
          },
        },
        owner: {
          id: null,
          name: null,
        },
        domain: {
          id: null,
          name: null,
        },
        type: {
          name: "container",
          alias: "Container",
          image: {
            source: null,
          },
        },
        commits: {
          created_by: {
            id: null,
            name: null,
          },
          created_timestamp: null,
          updated_by: {id: null, name: null},
          updated_timestamp: null,
        },
        read_role: null,
        write_role: null,
        counts: {
          links: 0,
          references: 0,
        },
      },
      document: {
        sections: [
          {
            name: "standard",
            alias: "Standard",
            position: 0,
            data: {
              name: null,
              image: {
                source: null,
              },
              description: null,
              summary: null,
            },
          },
        ],
      },
      databox: {
        accepts: [],
        links: {
          cached: null,
          cache: [],
        },
      },
    }
  },
  accounts: {
    standard: {
      version: 0,
      generation: 0,
      profile: {
        account: {
          name: null,
          image: {
            source: null,
          },
        },
        owner: {
          id: null,
          name: null,
        },
        commits: {
          created_by: {
            id: null,
            name: null,
          },
          created_timestamp: null,
          updated_by: {id: null, handle: null, name: null},
          updated_timestamp: null,
        },
        counts: {
        },
      },
    }
  },
  users: {
    standard: {
      version: 0,
      generation: 0,
      profile: {
        is_abandoned: false,
        user: {
          name: null,
          image: {
            source: null,
          },
        },
        domain: {
          id: null,
          name: null,
        },
        handle: {
          id: null,
          name: null,
        },
        account: {
          id: null,
          name: null,
        },
        commits: {
          created_by: {
            id: null,
            name: null,
          },
          created_timestamp: null,
          updated_by: {
            id: null, 
            name: null
          },
          updated_timestamp: null,
        },
        counts: {
        },
      },
    }
  },
  domains: {
    standard: {
      version: 0,
      generation: 0,
      profile: {
        is_userdomain: null,
        domain: {
          name: null,
          image: {
            source: null,
          },
        },
        handle: {
          id: null,
          name: null,
        },
        owner: {
          id: null,
          name: null,
        },
        administrator: {
          id: null,
          name: null,
        },
        workbox: {
          id: null,
          name: null,
        },
        commits: {
          created_by: {
            id: null, 
            name: null
          },
          created_timestamp: null,
          updated_by: {
            id: null, 
            name: null
          },
          updated_timestamp: null,
        },
        counts: {
          members: 0,
          workboxes: 0,
        },
      },
    }
  },
}

