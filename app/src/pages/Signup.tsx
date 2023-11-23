// Signup.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useEffect, useRef } from 'react'

import { GoogleAuthProvider, getAuth, signInWithRedirect, getRedirectResult } from "firebase/auth"

import { useAuth, useUser } from '../utilities/FirebaseProviders'

import { useNavigate } from 'react-router-dom'

import { Button } from '@chakra-ui/react'

const provider = new GoogleAuthProvider()
provider.setCustomParameters({
  prompt: 'select_account',
})

const Signup = (props) => {

    const auth = useAuth()

    const userRef = useRef()

    userRef.current = useUser()

    const navigate = useNavigate()

    useEffect (()=>{

        getRedirectResult(auth)
            .then((result) => {

                console.log('result in getRedirectResult Signup', result)

                if (result === null) return

                const credential = GoogleAuthProvider.credentialFromResult(result)
                const token = credential.accessToken
                const user = result.user

                // IdP data available using getAdditionalUserInfo(result)
                // ...
            }).catch((error) => {
                console.log('error in Signup from redirectResult',error)
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData?.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
            });

        if (userRef.current) {

            navigate('/')

        }

    },[])

    const signInWithGoogle = () => {
        signInWithRedirect(auth, provider)
    }

    return (
        <>
        <div>Signup</div>

        <div><Button onClick = {signInWithGoogle} >Sign up using Google</Button></div>
        </>
    )

}

export default Signup