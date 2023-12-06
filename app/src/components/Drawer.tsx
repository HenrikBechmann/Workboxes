// Drawer.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useRef, useState, useEffect } from 'react'

import { isMobile } from '../index'

import handleIcon from '../../assets/handle.png'

export const Drawer = (props) => {

    const 
        { placement, containerRef, isOpen, finalFocusRef, span, component, onClose } = props,
        [openState, setOpenState] = useState(0), // truthy - 0 or 1; boolean can't be used for useEffect index
        lengthRef = useRef(null),
        revisedLengthRef = useRef(null), // user drag,
        drawerStyleRef = useRef(null),
        handleStyleRef = useRef(null),
        handleIconStyleRef = useRef(null)

    let length = revisedLengthRef.current || span || 0
    const 
        ratio = isMobile?0.8:0.33,
        containerLength = 
            (['right','left'].includes(placement))
                ? containerRef.current.offsetWidth
                : containerRef.current.offsetHeight
    length = Math.max(Math.round(ratio * containerLength),length)
    lengthRef.current = length

    if (!drawerStyleRef.current) {
        const 
            drawerStyle = {
                position:'absolute',
                backgroundColor:'yellow', // -(lengthRef.current + 15) + 'px' // extra for resize tab
            },
            handleStyle = {
                position:'absolute',
                margin: 0,
                backgroundColor:'yellow',
                border:'1px solid gray',
                display:'flex'
            },
                handleIconStyle = {
                opacity:.5
            }

        switch (placement) {
            case 'right': { // data entry
                Object.assign(drawerStyle,{
                    height: '100%',
                    width: lengthRef.current + 'px',
                    top:'auto',
                    right:0,
                    bottom:'auto',
                    left:'auto',
                    borderLeft:'1px solid gray',
                    boxShadow:'-5px 0px 5px 0px silver',
                    borderRadius: '8px 0 0 8px',
                    zIndex:0,
                })
                Object.assign(handleStyle,{
                    top:'50%',
                    transform:'translateY(-50%)',
                    left:'-24px',
                    borderRight:'transparent',
                    borderRadius: '8px 0 0 8px',
                    height:'48px',
                    width:'24px',
                    alignItems:'center',
                    boxShadow:'-5px 0px 5px 0px silver',
                })
                Object.assign(handleIconStyle,{
                    height:'24px',
                    width:'48px',
                    transform:'rotate(90deg)'
                })
                break
            }
            case 'left': { // help
                Object.assign(drawerStyle,{
                    height: '100%',
                    width: lengthRef.current + 'px',
                    top:'auto',
                    right:'auto',
                    bottom:'auto',
                    left:0,
                    borderRight:'1px solid gray',
                    boxShadow:'5px 0 5px 0px silver',
                    borderRadius: '0 8px 8px 0',
                    zIndex:2
                })
                Object.assign(handleStyle,{
                    top:'50%',
                    transform:'translateY(-50%)',
                    right:'-24px',
                    borderLeft:'transparent',
                    borderRadius: '0 8px 8px 0',
                    height:'48px',
                    width:'24px',
                    alignItems:'center',
                    boxShadow:'5px 0 5px 0px silver',
                })
                Object.assign(handleIconStyle,{
                    height:'24px',
                    width:'24px',
                    transform:'rotate(90deg)'
                })
                break
            }
            case 'top': { // lookup
                Object.assign(drawerStyle,{
                    height: lengthRef.current + 'px',
                    width: '100%',
                    top:0,
                    right:'auto',
                    bottom:'auto',
                    left:'auto',
                    borderBottom:'1px solid gray',
                    boxShadow:'0px 5px 5px 0px silver',
                    borderRadius: '0 0 8px 8px',
                    zIndex:1
                })
                Object.assign(handleStyle,{
                    left:'50%',
                    transform:'translateX(-50%)',
                    bottom:'-24px',
                    borderTop:'transparent',
                    borderRadius: '0 0 8px 8px',
                    height:'24px',
                    width:'48px',
                    justifyContent:'center',
                    boxShadow:'0px 5px 5px 0px silver',
                })
                Object.assign(handleIconStyle,{
                    height:'24px',
                    width:'24px',
                })
                break
            }
            case 'bottom': { // message
                Object.assign(drawerStyle,{
                    height: lengthRef.current + 'px',
                    width: '100%',
                    top:'auto',
                    right:'auto',
                    bottom:0,
                    left:'auto',
                    borderTop:'1px solid gray',
                    boxShadow:'0px -5px 5px 0px silver',
                    borderRadius: '8px 8px 0 0',
                    zIndex:3
                })
                Object.assign(handleStyle,{
                    left:'50%',
                    transform:'translateX(-50%)',
                    top:'-24px',
                    borderBottom:'transparent',
                    borderRadius: '8px 8px 0 0',
                    height:'24px',
                    width:'48px',
                    justifyContent:'center',
                    boxShadow:'0px -5px 5px 0px silver',
                })
                Object.assign(handleIconStyle,{
                    height:'24px',
                    width:'24px',
                })
                break
            }
        }
        handleIconStyleRef.current = handleIconStyle
        handleStyleRef.current = handleStyle
        drawerStyleRef.current = drawerStyle
    }

    useEffect(()=> {

    }, [openState])

    return <div data-type = {'drawer-' + placement} style = {drawerStyleRef.current} >
        <div data-type = {'drawer-handle-' + placement} style = {handleStyleRef.current} >
            <img style = {handleIconStyleRef.current} src = {handleIcon} />
        </div>
        Drawer
    </div>
}

export default Drawer