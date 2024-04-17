// UserRegistration.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React from 'react'

import { 
    Box, Text,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    Button,
} from '@chakra-ui/react'

import { useUserData, useAuth } from '../system/FirebaseProviders'

const UserRegistration = (props) => {

    const 
        auth = useAuth(),
        userData = useUserData()

    return <>
        <Box padding = '6px'>
        <Text>
            You are logged in as {userData.authUser.displayName}.
        </Text>

        <Text mt = '6px'>
            Thank you for joining the Workboxes app! There are a couple of things we need before you get going.
        </Text>
        <Text mt = '6px'>
            1. A user "handle" will provide other users with a way to reach you, and refer to you.
            You'll have lots of ways to control this, as you wish.
        </Text>
        <Text mt = '6px'>
            2. A "payment method" is of course required to help us pay the bills, and keep supporting you.
        </Text>
        <Text mt = '6px'>
            To continue to the app, click <Button colorScheme = 'blue'>Done</Button> when both the user handle and the payment method have been accepted.
        </Text>
        </Box >
        <Tabs variant = 'enclosed' margin = '3px'>
            <TabList>
                <Tab>User Handle</Tab>
                <Tab>Payment Method</Tab>
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
            </TabPanels>
        </Tabs>
    </>

}

export default UserRegistration