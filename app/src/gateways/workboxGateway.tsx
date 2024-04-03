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
    sections:[
        {
            id:'basic',
            name:null,
            description:null,
            position:0,
            icon:null,
        },
    ]
}

const databoxTemplate = {
    accepts:null
}

class workboxGateway {
    constructor(defaults) {

        this.profile = {...profileTemplate,
            workbox:{ID:null, name:null},
            owner:{ID:null, name:null},
            domain:{ID:null, name:null},
            type:{ID:null, name:null}, 
            defaultConfig:{...workboxDefaultConfig},
            counts:{generation:0},
            commits: {
                created_by:{ID:null, name:null},
                created_time:null,
                updated_by:{ID:null, name:null},
                updated_time:null,
            }
        }
        this.document = {...documentTemplate, sections:[
            {
                id:'basic',
                name:null,
                description:null,
                position:0,
                icon:null,
            },
        ]}
        this.databox = {...databoxTemplate, accepts:[]}

    }

    profile
    document
    databox
}

export default workboxGateway