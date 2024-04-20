// utilities.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import {merge as _merge, cloneDeep as _cloneDeep} from 'lodash'

export const updateDocumentSchema = (collection, type, source, initialvalues = {}) => {

    let updatedDocument
    if (versionMaps[collection] && versionMaps[collection][type]) {

        const 
          versionData = versionMaps[collection][type],
          latestVersion = versionData.latest_version,
          sourceVersion = source.version

        if (sourceVersion === latestVersion) {

          return source // nothing to do

        }

        const noversion = sourceVersion ?? true
        let startversion
        if (noversion === true) {

          startversion = 0

        } else {

          startversion = sourceVersion + 1

        }

        let transitionDocument = source

        for (let targetVersionNumber = startversion; targetVersionNumber <= latestVersion; targetVersionNumber++) {

          // run transform function if exists - from targetVersion - 1 to targetVersion
          const transform = versionData.functionmap.get(targetVersionNumber)

          transform && transform(transitionDocument)

          // merge new structure/additions
          const updateversion = versionData.datamap.get(targetVersionNumber)

          if (updateversion) {

            transitionDocument = _merge(_cloneDeep(updateversion), _cloneDeep(source))

          }

          transitionDocument.version = updateversion.version

        }

        // finally apply defaults for any properties not represented in source
        transitionDocument = _merge(_cloneDeep(transitionDocument), _cloneDeep(initialvalues))

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
      latest_version:4,
      datamap: new Map(),
      functionmap: new Map(),
    },
  },
  handles: {
    user: {
      latest_version:0,
      datamap: new Map(),
      functionmap: new Map(),
    },
    domain: {
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
  handles: {
    user: [],
    domain: [],
  },
  accounts: {
    standard: [],
  },
  domains: {
    standard: [],
  },
  users: {
    standard: [
      {
        version:1,
        transform: (data) => {
          const { profile } = data
          const {
            is_abandoned,
            first_load,
            fully_registered,
            terms_accepted,
            payment_method,
            user_handle,
            standing_code,
          } = profile
          const flags = {
            is_abandoned,
            first_load,
            fully_registered,
            terms_accepted,
            payment_method,
            user_handle,
            standing_code,
          }
          profile.flags = flags
        }
      },
      {
        version:2,
        transform: (data) => {
          const { profile } = data
          delete profile.is_abandoned
          delete profile.first_load
          delete profile.fully_registered
          delete profile.terms_accepted
          delete profile.payment_method
          delete profile.user_handle
          delete profile.standing_code
        }
      },
      {
        version:4,
        transform: (data) => {
          const { profile } = data
          delete profile.user.handle.id
          delete profile.user.handle.name
        }
      },
    ],
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
      version: 4,
      generation: 0,
      profile: {
        flags: {
          is_abandoned: false,
          first_load: true,
          fully_registered: false,
          terms_accepted: false,
          payment_method: false,
          user_handle:false,
          standing_code:0,
        },
        user: {
          id:null,
          name: null,
          registered_name: null,
          image: {
            source: null,
          },
          handle: {
            plain: null,
            lower_case: null,
          },
          location: null,
          birthdate: null,
          date_joined: null,
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
          location: null,
          date_joined: null,
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
  handles: {
    user: [{
      version: 0,
      generation: 0,
      profile: {
        handle: {
          plain: null,
          lower_case: null,
          name: null, // synchronize with user record
          location: null, // synchronize with user record
        },
        type: {
          name: 'user',
          alias: null,
        },
        owner: {
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
        },
      },
    }],
    domain: [{
      version: 0,
      generation: 0,
      profile: {
        handle: {
          plain: null,
          lower_case: null,
          name: null, // synchronize with domain record
          location: null, // synchronize with domain record
        },
        type: {
          name: 'domain',
          alias: null,
        },
        domain: {
          id: null,
          name: null,
        },
        owner: {
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

        versionMaps[collection][type].functionmap.set(version.version, version.transform)

      }
    }
  }

}())


