// types.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0
// example
// lookup is a namespace, parse with lowdash
const Person = {
  definitions: {
    Person: {
      properties: {
        age: {
          type: "number",
          default:{
              value:null,
              lookup:null
          }
        },
        firstName: {
          type: "string",
          default:{
              value:null,
              lookup:null
          }
        },
        lastName: {
          type: "string",
          default:{
              value:null,
              lookup:null
          }
        },
        socials: {
          items: {
            type: "string",
              default:{
                  value:null,
                  lookup:null
              }
          },
          type: "array",
          default:{
              value:null,
              lookup:null
          },
        }
      },
      required: [ "firstName", "lastName", "age", "socials"],
      type: "object",
      default:{
          value:null,
          lookup:null
      },
    }
  }
}