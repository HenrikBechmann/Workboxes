// VerticalToolbarDivider.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {CSSProperties} from 'react'

const verticalDividerStyles = {
    height:'20px',
    borderLeft:'1px solid gray', 
    width:'0px', 
    marginLeft:'12px',
    // display:'inline-block',
}

const VerticalToolbarDivider = (props) => {

    return <div style = {verticalDividerStyles}></div>

}

export default VerticalToolbarDivider