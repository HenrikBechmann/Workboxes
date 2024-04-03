// workboxGateway.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

const workboxDefaultConfig = {
    settingsShow:false,
    settingsDisabled:false,
    coverShow:true,
    coverDisabled:false,
    contentsShow:true,
    contentsDisabled:false,
}

const workboxTemplate = {
    profile:null,
    document:null,
    databox:null,
}

const profileTemplate = {

    workbox:null,
    owner:null,
    domain:null,
    type:null,
    counts:null,
    defaultConfig:null,
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
            workbox:{ID:null, name:null, alias:null, icon:null},
            owner:{ID:null, name:null, alias:null, icon:null},
            domain:{ID:null, name:null, alias:null, icon:null},
            type:{ID:null, name:null, alias:null, icon:null},
            defaultConfig:{...workboxDefaultConfig},
            counts:{generation:null, links:null},
            commits: {
                created_by:{ID:null, name:null, alias:null},
                created_time:null,
                updated_by:{ID:null, name:null, alias:null},
                updated_time:null,
            },
        }
        this.document = {...documentTemplate, 
            sections:[
                {
                    id:'basic',
                    name:null,
                    description:null,
                    position:0,
                    icon:null,
                    changed:false,
                },
            ]}
        this.databox = {...databoxTemplate, 
            accepts:[], 
            links:{preload:true, list:[], set:new Set()}
        }

    }

    profile
    document
    databox

}

export default workboxGateway