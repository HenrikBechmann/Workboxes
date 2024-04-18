// UserRegistration.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState} from 'react'

import { Navigate } from 'react-router-dom'

import { signOut } from "firebase/auth"

import { 
    Box, Text, Heading,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    Button, Link,
} from '@chakra-ui/react'

import { useUserData, useAuth } from '../system/FirebaseProviders'

const UserRegistration = (props) => {

    const 
        auth = useAuth(),
        userData = useUserData(),
        [layoutState, setLayoutState] = useState('ready')

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
        <Heading mb = '3px' size = 'md'>Welcome to the Workboxes app!</Heading>
        <Text>
            You are signed in as <b>{userData.authUser.displayName}</b>. <Link 
            color = 'teal.500' onClick = {logOut}>Sign out</Link> any time you like,
            if you want to come back later.
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
        <Text>3. Accept our (somewhat crude) terms and conditions.</Text>
        <Text mt = '6px'>
            You'll be able to continue to the app when the user handle and terms have been accepted. 
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
                        [pending -- free to invited guests for now] Payment method. I'm thinking about $10 per month for
                        the base fee, but I need to study the cost structure more. Feedback is welcome. 
                        More in increments (say $5) if metered usage gets beyond some point.                       
                    </Text>
                </TabPanel>
                <TabPanel>
                    <Text>
                        [pending] Terms and Conditions. Basically, be constructive, be polite, be honest. Avoid misinformation. 
                        Disinformation (deliberately misleading information) won't be tolerated. Phishing or any devious 
                        practices won't be tolerated. We reserve the right to cancel your participation here at any time 
                        for any reason. My house, my rules. If we ever get big enough, we'll have an ethics committee.
                    </Text>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </>

}

export default UserRegistration