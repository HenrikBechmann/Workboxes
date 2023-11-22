// Tribalopolis.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useEffect } from 'react'

import { signOut, deleteUser } from "firebase/auth"

import { useNavigate } from 'react-router-dom'

import { Button } from '@chakra-ui/react'

import { useAuth, useUser } from './utilities/FirebaseProviders'

export const Tribalopolis = (props) => {

    const auth = useAuth()

    const user = useUser()

    const navigate = useNavigate()

    const gotoAccount = () => {
        navigate('/account')
    } 

    const deleteAccount = () => {
        
        deleteUser(user).then(()=>{
            console.log('deleted user', user.displayName, user.email)
        }).catch((error) => {
            console.log('failed delete user',error)
        })

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
            <Button onClick = {deleteAccount}> Delete account </Button>
            <Button onClick = {gotoAccount}> Go to account </Button>
            <div><span>{user.displayName} {user.email}</span></div>
            <pre><code>
                {JSON.stringify(user,null,2)}
            </code></pre>
        </>
    )
}

export default Tribalopolis