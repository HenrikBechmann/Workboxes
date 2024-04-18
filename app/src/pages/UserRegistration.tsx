// UserRegistration.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState} from 'react'

import { Navigate } from 'react-router-dom'

import { signOut } from "firebase/auth"

import { 
    Box, Text,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    Button, Link,
} from '@chakra-ui/react'

import { useUserData, useAuth } from '../system/FirebaseProviders'

const UserRegistration = (props) => {

    const 
        auth = useAuth(),
        userData = useUserData(),
        [layoutState, setLayoutState] = useState('ready')

    console.log('UserRegistration: userData', userData)

    const logOut = () => {
            signOut(auth).then(() => {
              setLayoutState('signedout')
              // console.log('Sign-out successful.')
            }).catch((error) => {
                // console.log('signout error', error)
              // An error happened.
            })
        }

    if (!userData || (layoutState == 'signedout')) {
        return <Navigate to = {`/signin`}/>
    }
     //null

    // console.log('in LayoutGeneral: userData, userRecords.user', userData, userRecords.user)

    return <>
        <Box padding = '6px'>
        <Text>
            You are signed in as {userData.authUser.displayName}. <Link 
            color = 'teal.500' onClick = {logOut}>Sign out</Link> any time you like,
            and come back later.
        </Text>

        <Text mt = '6px'>
            Thank you for joining the Workboxes app! There are a couple of things we need before you get going.
        </Text>
        <Text mt = '6px'>
            1. A user "handle" will provide other users with a way to reach you, and refer to you.
            You'll have lots of ways to control this.
        </Text>
        <Text mt = '6px'>
            2. A "payment method" [pending for now] is of course required to help us pay the bills, and keep supporting you. 
            [Again, this is pending -- the app is free for now for invited guests.]
        </Text>
        <Text mt = '6px'>
            You'll be able to continue to the app when the user handle has been accepted. 
            [In future the payment method will need to be accepted as well].
        </Text>
        </Box >
        <Tabs variant = 'enclosed' margin = '3px'>
            <TabList>
                <Tab>User Handle</Tab>
                <Tab>Payment Method</Tab>
                <Tab>Terms and Conditions</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Text>
                        Handle: required: handle (immutable), name; 
                        optional: location, description, keyword, birth day; 
                        automated: date joined                        
                    </Text>      
                </TabPanel>
                <TabPanel>
                    <Text>
                        [pending -- free to invited guests for now] Payment method                        
                    </Text>
                </TabPanel>
                <TabPanel>
                    <Text>
                        [pending] Terms and Conditions. Basically, be constructive, be nice. Avoid misinformation. 
                        Disinformation (deliberately misleading information) won't be tolerated. We reserve the right 
                        to cancel your participation here at any time for any reason. My house, my rules.
                    </Text>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </>

}

export default UserRegistration