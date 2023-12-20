
const doc = {
    class: "system",
    variant: "type",
    type: "system.type",
    label: "System root type",
    version: 0,
    generation: 1,
    relations: {},
    list_permission_group: "",
    permissions: [],
    counts: [],
    fields: {
        root:{
            metadata: {
                type: "array",
                array_type: "map",
                map_type: {
                    field_attributes:{
                        order:"number",
                        type: "string",
                        value: "string",
                        label: "string",
                    },
                    input_attributes: {
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
                        change: "namespace",
                        verify: "namespace",
                        filter: "string",
                        format: "string",
                        placeholder: "",
                        name: "string",
                        order: "number",
                        size: "number",
                    },
                    display_attributes:{
                        views:{

                        },
                    }
                },
            },
            data:{
                class: "system",
                variant: "type",
                type: "system.type",
                label: "System root type",
                version: 0,
                generation: 1,
                relations: {},
                list_permission_group: "",
                permissions: [],
                counts: [],
                commits: {
                    created_by: "henrik",
                    created_time: {
                        nanoseconds: 630000000,
                        seconds: 1702416553,
                    },
                    updated_by: "henrik",
                    updated_time: {
                        nanoseconds: 859000000,
                        seconds: 1702416615,
                    },
                },
            }
        },
        fields:{
            metadata: {
                type: "array",
                array_type: "map",
                map_type: {
                    field_attributes:{
                        order:"number",
                        required:"boolean",
                        type: "string",
                        value: "string",
                        label: "string",
                    },
                    input_attributes: {
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
                        change: "namespace",
                        verify: "namespace",
                        filter: "string",
                        format: "string",
                        placeholder: "",
                        name: "string",
                        order: "number",
                        size: "number",
                    },
                    display_attributes: {
                        views:{
                            base:{}

                        }
                    },
                },
            },
            data:{
                fields:[],
            }
        },
        views:{
            // extra-small, small, medium, large, extra-large
        },
        settings:{

        },
        transitions:[]
    },
    commits: {
        created_by: "henrik",
        created_time: {
            nanoseconds: 630000000,
            seconds: 1702416553,
        },
        updated_by: "henrik",
        updated_time: {
            nanoseconds: 859000000,
            seconds: 1702416615,
        },
    },
}
