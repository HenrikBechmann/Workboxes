// workboxGateway.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

const workboxDefaultState = {
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
    databox:null,
}

const profileTemplate = {

    workbox:null,
    owner:null,
    administrator:null,
    domain:null,
    type:null,
    counts:null,
    defaultState:null,
    commits:null,

}

const documentTemplate = {
    sections:null,
    changed:false,
}

const databoxTemplate = {
    accepts:null,
    links:null,
    changed:false,
}

class workboxGateway {
    constructor(defaults) {

        // create skeleton
        this.profile = {...profileTemplate,
            workbox:{ID:null, name:null, icon:null},
            owner:{ID:null, handle:null, name:null, icon:null},
            administrator:{ID:null, handle:null, name:null, icon:null},
            domain:{ID:null, name:null, icon:null},
            type:{ID:null, name:null, alias:null, icon:null},
            defaultState:{...workboxDefaultState},
            counts:{
                generation:null, 
                links:null,
                acl:null,
            },
            commits: {
                created_by:{ID:null, handle:null, name:null},
                created_timestamp:null,
                updated_by:{ID:null, handle:null, name:null},
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
        this.databox = {...databoxTemplate, 
            accepts:[], 
            links:{preload:true, list:[], set:new Set()}
        }
        // save defaults for new instances
        this.defaults = defaults

    }

    profile
    document
    databox
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
            databox:{...this.databox},
        }
        return data
    }

    setData = (data) => {

    }

}

export default workboxGateway