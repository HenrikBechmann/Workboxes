// types.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/* example
lookup is a namespace, parse with lowdash

Data types:
number
integer
string
boolean
null
timestamp
map
array
geopoint

document:{
  collection
  class
  variant
  type (class + variant)
  fields: array
}

const field = 
  {
    <field>: {
      type: "number",
      alias:'Age',
      order:1,
      prompt:'',
      description:'',
      edit: {
        default:{
            value:null,
            lookup:null
        },
        errormessage:'',
        verifyfunc:<index>,
        changefunc:<index>,
        required:true,
      }
    }
  }
*/
