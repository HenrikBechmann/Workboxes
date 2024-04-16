// utilities.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import {merge as _merge, cloneDeep as _cloneDeep} from 'lodash'

export const updateDocumentVersion = (collection, type, source, defaults = {}) => {

    let updatedDocument
    if (versionMaps[collection] && versionMaps[collection][type]) {
        const 
          versionData = versionMaps[collection][type],
          latestVersion = versionData.latest_version,
          sourceVersion = source.version

        if (sourceVersion === latestVersion) return source // nothing to do

        const noversion = sourceVersion ?? true
        let startversion
        if (noversion === true) {

          startversion = 0

        } else {

          startversion = sourceVersion + 1

        }

        let transitionDocument = source

        for (let versionNumber = startversion; versionNumber <= latestVersion; versionNumber++) {

          // run any transforms

          // merge new structure/additions

          const updateversion = versionData.datamap.get(versionNumber) || {}

          if (updateversion) {

            transitionDocument = _merge(_cloneDeep(updateversion), _cloneDeep(source))

          }

          transitionDocument.version = updateversion.version

        }

        transitionDocument = _merge(_cloneDeep(defaults), _cloneDeep(source))

        updatedDocument = transitionDocument

    } else {

        updatedDocument = source

    }

    return updatedDocument

}

const versionMaps = {
  workboxes: {
    collection: {
      latest_version:0,
      datamap: new Map(),
      functionmap: new Map(),
    },
  },
  accounts: {
    standard: {
      latest_version:0,
      datamap: new Map(),
      functionmap: new Map(),
    },
  },
  domains: {
    standard: {
      latest_version:0,
      datamap: new Map(),
      functionmap: new Map(),
    },
  },
  users: {
    standard: {
      latest_version:0,
      datamap: new Map(),
      functionmap: new Map(),
    },
  },
}

const versionTransforms = {
  workboxes: {
    collection: [],
  },
  accounts: {
    standard: [],
  },
  domains: {
    standard: [],
  },
  users: {
    standard: [],
  },
}

// collection:type. Always increment version to larger number
const versionData = {
  workboxes: {
    collection: [
    {
      version: 0,
      generation: 0,
      profile: {
        is_domainworkbox: null,
        workbox: {
          id:null,
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
    }],
  },
  accounts: {
    standard: [
    {
      version: 0,
      generation: 0,
      profile: {
        account: {
          id:null,
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
          updated_by: {id: null, name: null},
          updated_timestamp: null,
        },
        counts: {
        },
      },
    }],
  },
  users: {
    standard: [
    {
      version: 0,
      generation: 0,
      profile: {
        is_abandoned: false,
        first_load: true,
        fully_registered: false,
        user: {
          id:null,
          name: null,
          image: {
            source: null,
          },
          handle: {
            id: null,
            name: null,
          },
        },
        domain: {
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
    }],
  },
  domains: {
    standard: [
    {
      version: 0,
      generation: 0,
      profile: {
        is_userdomain: null,
        domain: {
          id:null,
          name: null,
          image: {
            source: null,
          },
          handle: {
            plain: null,
            lower_case: null,
          },
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
    }],
  },
};

(function loadVersions (){
  // load versionData
  for (const collection in versionData) {

    const typesHash = versionData[collection]

    for (const type in typesHash) {

      const versionArray = typesHash[type]
      for (const version of versionArray) {

        versionMaps[collection][type].datamap.set(version.version, version)

      }
    }
  }
  // load versionTransforms

  for (const collection in versionTransforms) {

    const typesHash = versionTransforms[collection]

    for (const type in typesHash) {

      const versionArray = typesHash[type]
      for (const version of versionArray) {

        versionMaps[collection][type].functionmap.set(version.version, version)

      }
    }
  }

  // console.log('versionMaps',versionMaps)
}())


