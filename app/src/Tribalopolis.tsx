// Tribalopolis.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useEffect } from 'react'

import { signOut, deleteUser } from "firebase/auth"

import { useNavigate } from 'react-router-dom'

import { Button } from '@chakra-ui/react'

import { useAuth, useUser } from './system/FirebaseProviders'

export const Tribalopolis = (props) => {

    const 
        auth = useAuth(),
        user = useUser(),
        navigate = useNavigate()

    const gotoAccount = () => {

        navigate('/account')
        
    } 

    const gotoAbout = () => {

        navigate('/about')
        
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
            <Button m = {3} onClick = {logOut}> Sign out </Button>
            <Button m = {3} onClick = {gotoAccount}> Go to account </Button>
            <Button m = {3} onClick = {gotoAbout}> Go to about </Button>
            <div>{user.displayName} {user.email}</div>
        </>
    )
}

export default Tribalopolis