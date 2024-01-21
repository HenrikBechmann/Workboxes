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
    opacity:0.7,
    border: '1px solid black',
    borderRadius: '12px',
    padding:'3px',
    boxShadow:'none',
    backgroundColor: 'transparent',
    transition: 'box-shadow 0.2s, backgroundColor 0.2s',
} as CSSProperties

const iconToggleStyles = {
    height:'16px',
    width:'16px',
}

const ToggleIcon = (props) => {

    const 
        { toggleOn, disabled, callback, icon, tooltip, caption } = props,
        toggleValueRef = useRef(toggleOn),
        disabledValueRef = useRef(disabled),
        iconBoxToggleStylesRef = useRef(baseIconBoxToggleStyles),
        iconToggleStylesRef = useRef(iconToggleStyles)

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
        event.preventDefault()
        if (disabled) return

        callback && callback(!toggleOn)
    }

    return <Box display = 'flex' flexDirection = 'column' alignItems = 'center' marginLeft = '12px'>
        <Box onClick = {toggleIcon} style = {iconBoxToggleStylesRef.current} >
            <Tooltip hasArrow label = {tooltip}>
                <img style = {iconToggleStylesRef.current} src = {icon} />
            </Tooltip>
        </Box>
        <Box fontSize = 'xs' fontStyle = 'italic'>{caption}</Box>
    </Box>

}

// toggleIcon always takes toggleOn and disabled from useToggleIcon call - controlled by host
export const useToggleIcon = ({toggleOnRef, disabledRef, icon, tooltip, caption}) => {

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
        tooltip = {tooltip} 
        caption = {caption}
        toggleOn = {toggleOnRef.current} 
        disabled = {disabledRef.current} 
        callback = {userChangeCallback} 
    />
}