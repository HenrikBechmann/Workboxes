// SectionDivider.tsx

import React from 'react'
import {Divider, Box} from '@chakra-ui/react'

const SectionDivider = (props) => {

    const { title, isDisabled, type } = props

    const backgroundColor = type == 'block'?'#adf':'silver'

    return <> 
    <Divider style = {
        {
            clear:'left', 
            borderColor: 'black', 
            borderWidth:'2px', 
            marginLeft:'-32px', 
            width:'calc(100% + 32px)'
        }
    } />
    <Box style = {
        {
            textAlign:'center', 
            backgroundColor, 
            fontSize:'small', 
            marginLeft:'-32px',
            width:'calc(100% + 32px)',
            opacity: isDisabled?.5:1,
        }
    } >{title}</Box>
    </>
}

export default SectionDivider