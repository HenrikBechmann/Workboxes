// types.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/* example

see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input for input attributes

lookup is a namespace, parse with lowdash

Data types:
float
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
  type (class.variant)
  fields: array
}

const field = 
  {
    <fieldname>: {
      type: "number",
      label:'Age',
      value:'',
      order:1,
      description:'',
      edit: {
        default:{
            value:null,
            lookup:null
        },
        errormessage:'',
        verifyfunc:<index>,
        changefunc:<index>,
        attributes: {
          placeholder:'',
          required:true,
          readonly,
          size,
          spellcheck,
          min,
          max,
          minlength,
          maxlength,
        }
      }
    }
  }
*/
