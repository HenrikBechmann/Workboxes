// types.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
// example
// lookup is a namespace, parse with lowdash
const Person = {
  properties: {
    age: {
      type: "number",
      default:{
          value:null,
          lookup:null
      },
      alias:'Age',
      order:1,
      prompt:'',
      description:'',
      errormessage:'',
      isValid:{},
      onChange:{}
    },
    firstName: {
      type: "string",
      default:{
          value:null,
          lookup:null
      },
      alias:'Age',
      order:1,
      prompt:'',
      description:'',
      errormessage:'',
      isValid:{},
      onChange:{}
    },
    lastName: {
      type: "string",
      default:{
          value:null,
          lookup:null
      },
      alias:'Age',
      order:1,
      prompt:'',
      description:'',
      errormessage:'',
      isValid:{},
      onChange:{}
    },
    socials: {
      items: {
        type: "string",
        default:{
            value:null,
            lookup:null
        },
        alias:'Age',
        order:1,
        prompt:'',
        description:'',
        errormessage:'',
        isValid:{},
        onChange:{}
      },
      type: "array",
      default:{
          value:null,
          lookup:null
      },
      alias:'Age',
      order:1,
      prompt:'',
      description:'',
      errormessage:'',
      isValid:{},
      onChange:{}
    }
  },
  required: [ "firstName", "lastName", "age", "socials"],
  type: 'object',
}
