// workboxGateway.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

const defaultWorkboxState = {
    settingsShow:false,
    settingsDisabled:false,
    documentShow:true,
    documentDisabled:false,
    databoxShow:true,
    databoxDisabled:false,
}

const workboxTemplate = {
    profile:null,
    document:null,
    itembox:null,
}

const profileTemplate = {

    workbox:null,
    owner:null,
    administrator:null,
    domain:null,
    type:null,
    counts:null,
    defaultWorkboxState:null,
    commits:null,

}

const documentTemplate = {
    sections:null,
    changed:false,
}

const databoxTemplate = {
    accepts:null,
    connectors:null,
    changed:false,
}

class WorkboxHandler {
    constructor(defaults) {

        // create skeleton
        this.profile = {...profileTemplate,
            workbox:{id:null, name:null, icon:null},
            owner:{id:null, handle:null, name:null, icon:null},
            administrator:{id:null, handle:null, name:null, icon:null},
            domain:{id:null, name:null, icon:null},
            type:{id:null, name:null, alias:null, icon:null},
            defaultWorkboxState:{...defaultWorkboxState},
            counts:{
                generation:null, 
                connectors:null,
                acl:null,
            },
            commits: {
                created_by:{id:null, handle:null, name:null},
                created_timestamp:null,
                updated_by:{id:null, handle:null, name:null},
                updated_timestamp:null,
            },
        }
        this.document = {...documentTemplate, 
            sections:[
                {
                    name:'standard',
                    alias:null,
                    position:0,
                    changed:false,
                    data:{
                        name:null,
                        image:null,
                        description:null,
                        summary:null,                        
                    },
                },
            ]}
        this.itembox = {...databoxTemplate, 
            accepts:[], 
            connectors:{preload:true, list:[], set:new Set()}
        }
        // save defaults for new instances
        this.defaults = defaults

    }

    profile
    document
    itembox
    defaults

    getData = () => {
        const { defaults } = this
        const data = {
            profile:{
                domainName:defaults.domainTitle,
                domainIcon:defaults.domainIcon,
                itemName:defaults.itemTitle,
                itemIcon:defaults.itemIcon,
                typeName:defaults.typeName,
            },
            document:{...this.document},
            itembox:{...this.itembox},
        }
        return data
    }

    setData = (data) => {

    }

}

export default WorkboxHandler