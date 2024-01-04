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
}

const ToggleIcon = (props) => {

    const { icon, toggleOn, tooltip, disabled, callback } = props

    console.log('running ToggleIcon: toggleOn',toggleOn)

    const toggleIconElementRef = useRef(null)

    const toggleValueRef = useRef(false)

    const iconBoxToggleStylesRef = useRef(baseIconBoxToggleStyles)

    const iconToggleStylesRef = useRef({
        height:'16px',
        width:'16px',

    })

    useEffect(()=>{

        let styles
        if (!disabled) {
            styles = baseIconBoxToggleStyles
        } else {
            styles = {...baseIconBoxToggleStyles, opacity:0.3}
        }

    },[disabled])

    const setVisible = (toggleOn) => {
        if (!toggleIconElementRef.current) return
        if (!toggleOn) {
            toggleIconElementRef.current.style.backgroundColor = 'transparent'
            toggleIconElementRef.current.style.boxShadow = 'none'
        } else {
            toggleIconElementRef.current.style.backgroundColor = 'chartreuse'
            toggleIconElementRef.current.style.boxShadow = 'inset 3px 3px 3px gray'
        }
    }

    if (toggleOn !== toggleValueRef.current) {
        setVisible(toggleOn)
        toggleValueRef.current = toggleOn
    }

    useEffect(()=>{
        setVisible(toggleOn)
    },[])

    const toggleIcon = (event) => {
        if (disabled) return
        event.preventDefault()
        setVisible(!toggleOn)

        callback && callback(!toggleOn)
    }

    return <Box onClick = {toggleIcon} ref = {toggleIconElementRef} style = {iconBoxToggleStylesRef.current} >
        <Tooltip hasArrow label = {tooltip}>
            <img style = {iconToggleStylesRef.current} src = {icon} />
        </Tooltip>
    </Box>

}

// toggleIcon always takes toggleOn and disabled from useToggleIcon call - controlled by host
export const useToggleIcon = ({icon, tooltip, toggleOnRef, disabled}) => {
    const [useToggleState, setUseToggleState] = useState(toggleOnRef.current)
    console.log('running useToggleIcon: toggleOnRef.current, useToggleState',toggleOnRef.current, useToggleState)
    // const toggleStateSettingRef = useRef(null)
    // toggleStateSettingRef.current = toggleOnRef.current
    // const toggleStateUserRef = useRef(toggleOnRef.current)
    // if (toggleStateUserRef.current !== toggleStateSettingRef.current) {
    //     toggleStateUserRef.current = toggleStateSettingRef.current
    // }

    const userChangeCallback = useCallback((toggleOn) =>{

        console.log('running callback: toggleOn',toggleOn)
        toggleOnRef.current = toggleOn
        // if (toggleOn !== toggleStateSettingRef.current) {
        //     console.log('setting useToggleState',toggleOn)
        //     toggleStateSettingRef.current = toggleStateUserRef.current = toggleOn
            setUseToggleState(toggleOn) // creates host cycle
        // }

    },[])

    return <ToggleIcon 
        icon = {icon} tooltop = {tooltip} toggleOn = {toggleOnRef.current} disabled = {disabled} callback = {userChangeCallback} />
 
}
