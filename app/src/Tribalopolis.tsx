// Tribalopolis.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useEffect } from 'react'

import { signOut } from "firebase/auth"

import { useNavigate } from 'react-router-dom'

import { Button } from '@chakra-ui/react'

import { useAuth } from './utilities/FirebaseProviders'

export const Tribalopolis = (props) => {

    const auth = useAuth()

    const navigate = useNavigate()

    const gotoAccount = () => {
        navigate('/account')
    } 
    
    const logOut = () => {

        signOut(auth).then(() => {
          // Sign-out successful.
        }).catch((error) => {
          // An error happened.
        })
    }

    return (
        <>
            <div>Main page</div>
            <Button onClick = {logOut}> Sign out </Button>
            <Button onClick = {gotoAccount}> Go to account </Button>
        </>
    )
}

export default Tribalopolis