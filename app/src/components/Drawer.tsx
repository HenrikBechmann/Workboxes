// Drawer.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useState, useEffect } from 'react'

import { isMobile } from '../index'

export const Drawer = (props) => {

    const [drawerState, setDrawerState] = useState('setup')

    const [openState, setOpenState] = useState(0) // truth - 0 or 1; boolean can't be used for useEffect index

    const { placement, isOpen, finalFocusRef, span, containerRef, contents, onClose } = props

    const revisedLengthRef = useRef(null) // user drag

    let length = revisedLengthRef.current || span || 0
    const ratio = isMobile?0.8:0.33
    const containerLength = 
        (['right','left'].includes(placement))
            ? containerRef.current.offsetWidth
            : containerRef.current.offsetHeight
    length = Math.max(Math.round(ratio * containerLength),length)

    console.log('drawer span',length)

    const lengthRef = useRef(null)
    lengthRef.current = length

    const drawerStyleRef = useRef(null)

    const drawerElementRef = useRef(null)

    if (!drawerStyleRef.current) {
        const style = {
            position:'absolute',
            backgroundColor:'yellow', // -(lengthRef.current + 15) + 'px' // extra for resize tab
        }
        switch (placement) {
            case 'right': {
                Object.assign(style,{
                    height: '100%',
                    width: lengthRef.current + 'px',
                    top:'auto',
                    right:0,
                    bottom:'auto',
                    left:'auto',
                })
                break
            }
            case 'left': {
                Object.assign(style,{
                    height: '100%',
                    width: lengthRef.current + 'px',
                    top:'auto',
                    right:'auto',
                    bottom:'auto',
                    left:0,
                })
                break
            }
            case 'top': {
                Object.assign(style,{
                    height: lengthRef.current + 'px',
                    width: '100%',
                    top:0,
                    right:'auto',
                    bottom:'auto',
                    left:'auto',
                })
                break
            }
            case 'bottom': {
                Object.assign(style,{
                    height: lengthRef.current + 'px',
                    width: '100%',
                    top:'auto',
                    right:'auto',
                    bottom:0,
                    left:'auto',
                })
                break
            }
        }
        drawerStyleRef.current = style
    }

    useEffect(()=>{
        drawerElementRef.current = <div data-type = {'drawer-' + placement} style = {drawerStyleRef.current}>
            Drawer
        </div>
    },[])

    useEffect(()=>{
        if (drawerState == 'setup') {
            setDrawerState('ready')
        }
    },[drawerState])

    useEffect(()=> {

    }, [openState])

    return (drawerState == 'ready')? drawerElementRef.current: null
}

export default Drawer
