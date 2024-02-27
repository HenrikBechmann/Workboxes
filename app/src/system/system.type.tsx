export const metatype = {
    systemblock: {
        class: "system",
        variant: "type",
        type: "system.type",
        label: "System root type",
        version: 0,
        generation: 0,
        relations: {
            lists:[],
            supers:[],
            controllers:[],
        },
        read_group: "",
        permissions: [],
        counts: [],
        commits: {
            creator: "henrik",
            created: {
                nanoseconds: 630000000,
                seconds: 1702416553,
            },
            updater: "henrik",
            updated: {
                nanoseconds: 859000000,
                seconds: 1702416615,
            },
        },
    },
    noteblocks:{},
    settings:{},
    datablock: {
        transitions:[],
        defaults:{
            system:{
                class: "system",
                variant: "type",
                type: "system.type",
                label: "System root type",
                version: 0,
                generation: 1,
                relations: {},
                read_group: "",
                permissions: [],
                counts: [],
                commits: {
                    creator: "henrik",
                    created: {
                        nanoseconds: 630000000,
                        seconds: 1702416553,
                    },
                    updater: "henrik",
                    updated: {
                        nanoseconds: 859000000,
                        seconds: 1702416615,
                    },
                },
            },
            fields:{
                fields:{},
                views:{},
                settings:{},
            }
        },
    },
    metadata: {
        fields:{
            name:"",
            type: "map",
            map_type: {
                database: {
                    name: "string",
                    type: "string",
                    value: "string | object",
                },
                model:{
                    order:"number",
                    required:"boolean",
                    property:"string",
                    type: "string",
                    value: "string",
                    label: "string",
                },
                display:{},
                edit: {
                    error_message: "string",
                    help_message:"string",
                    min: "number",
                    max: "number",
                    minlength: "number",
                    maxlength: "number",
                    readonly: "boolean",
                    required: "boolean",
                    spellcheck: "",
                    type: "string",
                    default:{
                        lookup: "namespace",
                        value: "string",
                    },
                    ingress: "namespace",
                    egress:"namespace",
                    change: "namespace",
                    verify: "namespace",
                    filter: "string",
                    format: "string",
                    placeholder: "",
                    name: "string",
                    order: "number",
                    size: "number",
                },
            },
        },
    },
}
