// ToggleIcon.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useEffect, useRef, CSSProperties} from 'react'
import {
  Tooltip, Box
} from '@chakra-ui/react'

const baseIconBoxToggleStyles = {
    width:'24px',
    height:'24px',
    display:'inline-block',
    marginLeft:'12px',
    opacity:0.7,
    border: '1px solid black',
    borderRadius: '12px',
    padding:'3px',
    boxShadow:'none',
    transition: 'box-shadow 0.2s, backgroundColor 0.2s',
}

const ToggleIcon = (props) => {

    const { icon, toggleOn, tooltip, disabled, callback } = props

    const toggleIconImgRef = useRef(null)

    const [toggleValue, setToggleValue] = useState(false)
    const toggleValueRef = useRef(null)
    toggleValueRef.current = toggleValue

    const iconBoxToggleStylesRef = useRef(baseIconBoxToggleStyles)

    const iconToggleStylesRef = useRef({
        height:'16px',
        width:'16px',

    })

    useEffect(()=>{

        if (toggleValueRef.current !== toggleOn) {
            setToggleValue(toggleOn)
        }

    },[toggleOn])

    useEffect(()=>{

        let styles
        if (!disabled) {
            styles = baseIconBoxToggleStyles
        } else {
            styles = {...baseIconBoxToggleStyles, opacity:0.3}
        }

    },[disabled])

    const toggleIcon = (event) => {
        if (disabled) return
        event.preventDefault()
        if (toggleValue) {
            toggleIconImgRef.current.style.backgroundColor = 'transparent'
            toggleIconImgRef.current.style.boxShadow = 'none'
        } else {
            toggleIconImgRef.current.style.backgroundColor = 'chartreuse'
            toggleIconImgRef.current.style.boxShadow = 'inset 3px 3px 3px gray'
        }
        setToggleValue(!toggleValue)
        callback && callback(toggleValue)
    }

    return <Box onClick = {toggleIcon} ref = {toggleIconImgRef} style = {iconBoxToggleStylesRef.current} >
        <Tooltip hasArrow label = {tooltip}>
            <img style = {iconToggleStylesRef.current} src = {icon} />
        </Tooltip>
    </Box>

}

export const useToggleIcon = ({icon, tooltip, toggleOn, disabled, callback}) => {
    const toggleComponentRef = useRef(<ToggleIcon />)
    const toggleState = true
    return [toggleState, toggleComponentRef.current]
}

