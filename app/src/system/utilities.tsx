// utilities.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import {merge as _merge, cloneDeep as _cloneDeep} from 'lodash'

export const copyVersionDataToFirestore = () => {

}

export const updateDocumentSchema = (collection, type, document, initialvalues = {}) => {

    // console.log('updateDocumentSchema: collection, type, document, initialvalues', 
    //   collection, type, {...document}, initialvalues)

    let updatedDocument
    if (versionMaps[collection] && versionMaps[collection][type]) {

        const 
          versionData = versionMaps[collection][type],
          latestVersion = versionData.latest_version,
          sourceVersion = document.version

        if (sourceVersion === latestVersion) {

          return document // nothing to do

        }

        const noversion = sourceVersion ?? true
        let startversion
        if (noversion === true) {

          startversion = latestVersion

        } else {

          startversion = sourceVersion + 1

        }

        let transitionDocument = document

        for (let targetVersionNumber = startversion; targetVersionNumber <= latestVersion; targetVersionNumber++) {

          // run transform function if exists - from targetVersion - 1 to targetVersion
          const transform = versionData.functionmap.get(targetVersionNumber)

          transform && transform(transitionDocument)

          // merge new structure/additions
          const updateversiondata = versionData.datamap.get(targetVersionNumber)

          if (updateversiondata) {

            transitionDocument = _merge(_cloneDeep(updateversiondata), _cloneDeep(document))

          }

          // console.log('collection, type, sourceVersion, startversion, latestVersion, targetVersionNumber, updateversion, versionData.datamap, initialvalues', 
          //   collection, type, sourceVersion, startversion, latestVersion, targetVersionNumber, updateversion, versionData.datamap, initialvalues)

          transitionDocument.version = updateversiondata.version

        }

        // finally apply defaults for any properties not represented in source
        transitionDocument = _merge(_cloneDeep(transitionDocument), _cloneDeep(initialvalues))

        updatedDocument = transitionDocument

    } else {

        updatedDocument = document

    }

    return updatedDocument

}

// property names are collection names
const versionMaps = {
  workboxes: {
    collection: {
      latest_version:2,
      datamap: new Map(),
      functionmap: new Map(),
    },
    domain: {
      latest_version:3,
      datamap: new Map(),
      functionmap: new Map(),
    },
    member: {
      latest_version:3,
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
      latest_version:1,
      datamap: new Map(),
      functionmap: new Map(),
    },
  },
  users: {
    standard: {
      latest_version:5,
      datamap: new Map(),
      functionmap: new Map(),
    },
  },
  members: {
    standard: {
      latest_version:2,
      datamap: new Map(),
      functionmap: new Map(),
    },
  },
  memberships: {
    standard: {
      latest_version:2,
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
  workspaces: {
    standard: {
      latest_version:0,
      datamap: new Map(),
      functionmap: new Map(),
    }
  },
  panels: {
    standard: {
      latest_version:0,
      datamap: new Map(),
      functionmap: new Map(),
    }
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
          if (profile) {
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
        }
      },
      {
        version:2,
        transform: (data) => {
          const { profile } = data
          if (profile) {
            delete profile.is_abandoned
            delete profile.first_load
            delete profile.fully_registered
            delete profile.terms_accepted
            delete profile.payment_method
            delete profile.user_handle
            delete profile.standing_code
          }
        }
      },
      {
        version:4,
        transform: (data) => {
          const { profile } = data
          // console.log('data, profile', data, profile)
          if (profile) {
            delete profile.user.handle.id
            delete profile.user.handle.name
          }
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
      version: 2,
      generation: 0,
      profile: {
        workbox: {
          id:null,
          name: null,
          image: {
            source: null,
          },
        },
        roles: {
          read: null,
          write: null,
        },
        owner: {
          id: null,
          name: null,
        },
        domain: {
          id: null,
          name: null,
        },
        controller: {
          id: null,
          name: null,
        },
        type: {
          name: "collection",
          alias: "Collection",
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
          updated_by: {
            id: null, 
            name: null
          },
          updated_timestamp: null,
        },
        counts: {
          connectors: 0,
          references: 0,
        },
      },
      document: {
        data:{
            display_order: 1,
        },
        base: {
            display_order: 0,
            name: null,
            image: {
              caption: null,
              source: null,
            },
            description: null,
            summary: null,
        },
        sections: [
        ],
        locked: false,
      },
      resources: {
        accepts: [],
        locked: false,
      },
    }],
    domain: [
    {
      version: 3,
      generation: 0,
      profile: {
        workbox: {
          id:null,
          name: null,
          image: {
            source: null,
          },
        },
        roles: {
          read: null,
          write: null,
        },
        owner: {
          id: null,
          name: null,
        },
        domain: {
          id: null,
          name: null,
        },
        controller: {
          id: null,
          name: null,
        },
        type: {
          name: "domain",
          alias: "Domain",
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
        counts: {
          connectors: 0,
          references: 0,
        },
      },
      document: {
        data:{
            display_order: 1,

        },
        base: {
            display_order: 0,
            name: null,
            image: {
              caption: null,
              source: null,
            },
            description: null,
            summary: null,
        },
        sections: [
        ],
        locked:false,
      },
      resources: {
        accepts: [],
        locked: false,
      },
    }],
    member: [
    {
      version: 3,
      generation: 0,
      profile: {
        workbox: {
          id:null,
          name: null,
          image: {
            source: null,
          },
        },
        user: {
          id: null,
          name: null,
        },
        member: {
          id: null,
          name: null,
        },
        roles: {
          read: null,
          write: null,
        },
        owner: {
          id: null,
          name: null,
        },
        domain: {
          id: null,
          name: null,
        },
        controller: {
          id: null,
          name: null,
        },
        type: {
          name: "member",
          alias: "Member",
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
        counts: {
          connectors: 0,
          references: 0,
        },
      },
      document: {
        data:{
            display_order: 1,

        },
        base: {
            display_order: 1,
            name: null,
            image: {
              source: null,
              caption: null,
            },
            description: null,
            summary: null,
        },
        sections: [
        ],
        locked: false,
      },
      resources: {
        accepts: [],
        locked: false,
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
          date_joined: null,
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
      version: 5,
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
          settled: false,
          sample_workbox_created:false,
        },
        user: {
          id:null,
          name: null,
          email_name: null,
          image: {
            source: null,
          },
          location: null,
          birthdate: null,
          description: null,
          date_joined: null,
        },
        handle: {
          plain: null,
          lower_case: null,
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
          workspaces:0,
          workboxes:0,
        },
      },
      workspace: {
        mobile: {
          name:null,
          id:null,
        },
        desktop: {
          name:null,
          id:null,
        },
      },
    }],
  },
  members: {
    standard: [
    {
      version: 2,
      generation: 0,
      profile: {
        user: {
          id:null,
          name: null,
        },
        member: {
          id:null,
          name: null,
          image: {
            source: null,
          },
          location: null,
          description: null,
          date_joined: null,
        },
        roles: {
          read:[],
          write:[],
        },
        handle: {
          plain: null,
          lower_case: null,
        },
        domain: {
          id: null,
          name: null,
        },
        workbox: {
          id: null,
          name: null,
        },
        workbox_type: {
          type: {
            name: null,
            alias: null,
          }
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
          workboxes:0,
        },
      },
    }],
  },
  memberships: {
    standard: [
    {
      version: 2,
      generation: 0,
      domains:{},
      profile: {
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
      },
    }],
  },
  domains: {
    standard: [
    {
      version: 1,
      generation: 0,
      profile: {
        roles: {
          is_userdomain: null,
        },
        domain: {
          id:null,
          name: null,
          image: {
            source: null,
          },
        },
        handle: {
          plain: null,
          lower_case: null,
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
        workbox_type: {
          type: {
            name: null,
            alias: null,
          }
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
    user: [
    {
      version: 0,
      generation: 0,
      profile: {
        user: {
          name: null,
          location: null,
          birthdate: null,
          birthdate_string: null,
          description: null,
        },
        handle: {
          plain: null,
          lower_case: null,
        },
        type: {
          name: 'user',
          alias: 'user handle',
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
    },
    ],
    domain: [{
      version: 0,
      generation: 0,
      profile: {
        handle: {
          plain: null,
          lower_case: null,
          name: null, // synchronize with domain record
        },
        type: {
          name: 'domain',
          alias: null,
        },
        domain: {
          id: null,
          name: null,
          location: null, // synchronize with domain record
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
  workspaces: {
    standard: [
    {
      version: 0,
      generation: 0,
      profile: {
        workspace:{
          name: null,
          id: null,
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
        flags: {
          first_time_loaded:true,
          is_default: false,
        }
      },
      panel: {
        id: null,
        name: '',
      },
      panels:[],
    }],
  },
  panels: {
    standard: [
    {
      version: 0,
      generation: 0,
      profile: {
        display_order: 0,
        domain:{
          name: null,
          id: null,
        },
        panel:{
          name: null,
          id: null,
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
        flags: {
          is_default: false,
        }
      },
      windows: []
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
