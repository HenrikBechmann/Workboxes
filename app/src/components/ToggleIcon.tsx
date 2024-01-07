// ToggleIcon.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState, useEffect, useRef, useCallback, CSSProperties} from 'react'
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
    backgroundColor: 'transparent',
} as CSSProperties

const ToggleIcon = (props) => {

    const 
        { icon, toggleOn, tooltip, disabled, callback } = props,
        toggleIconElementRef = useRef(null),
        toggleValueRef = useRef(toggleOn),
        disabledValueRef = useRef(disabled),
        iconBoxToggleStylesRef = useRef(baseIconBoxToggleStyles),
        iconToggleStylesRef = useRef({
            height:'16px',
            width:'16px',
        })

    const setDisplay = (toggleOn) => {

        let styles
        if (!disabled) {
            styles = {...baseIconBoxToggleStyles}
        } else {
            styles = {...baseIconBoxToggleStyles, opacity:0.3}
        }
        if (!toggleOn || disabled) {
            styles.backgroundColor = 'transparent'
            styles.boxShadow = 'none'
        } else {
            styles.backgroundColor = 'chartreuse'
            styles.boxShadow = 'inset 3px 3px 3px gray'
        }
        iconBoxToggleStylesRef.current = styles
    }

    if (toggleOn !== toggleValueRef.current || disabled !== disabledValueRef.current) { // change
        setDisplay(toggleOn)
        toggleValueRef.current = toggleOn
        disabledValueRef.current = disabled
    }

    useEffect(()=>{
        setDisplay(toggleOn)
    },[])

    const toggleIcon = (event) => { // user input
        if (disabled) return
        event.preventDefault()

        callback && callback(!toggleOn)
    }

    return <Box onClick = {toggleIcon} ref = {toggleIconElementRef} style = {iconBoxToggleStylesRef.current} >
        <Tooltip hasArrow label = {tooltip}>
            <img style = {iconToggleStylesRef.current} src = {icon} />
        </Tooltip>
    </Box>

}

// toggleIcon always takes toggleOn and disabled from useToggleIcon call - controlled by host
export const useToggleIcon = ({icon, tooltip, toggleOnRef, disabledRef}) => {

    const [useToggleState, setUseToggleState] = useState(toggleOnRef.current)

    useEffect(()=>{
        setUseToggleState(toggleOnRef.current) // creates host cycle
    },[toggleOnRef.current])

    const userChangeCallback = useCallback((toggleOn) =>{

        toggleOnRef.current = toggleOn
        setUseToggleState(toggleOn) // creates host cycle

    },[])

    return <ToggleIcon 
        icon = {icon} 
        tooltop = {tooltip} 
        toggleOn = {toggleOnRef.current} 
        disabled = {disabledRef.current} 
        callback = {userChangeCallback} 
    />
 
}
