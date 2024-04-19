// UserRegistration.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useState} from 'react'

import { Navigate } from 'react-router-dom'

import { signOut } from "firebase/auth"

import { 
    Box, Text, Heading,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    Button, Link, Checkbox,
    useDisclosure,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react'

import { useUserData, useUserRecords, useAuth } from '../system/FirebaseProviders'

const HandleAlert = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()

  return (
    <>
      <Button colorScheme='blue' onClick={onOpen}>
        Save User Handle
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Save User Handle
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? The user handle can't be changed afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='blue' onClick={onClose} ml={3}>
                Save
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
const UserRegistration = (props) => {

    const 
        auth = useAuth(),
        userData = useUserData(),
        userRecords = useUserRecords(),
        [layoutState, setLayoutState] = useState('ready')

    const logOut = () => {
        signOut(auth).then(() => {
          setLayoutState('signedout')
          // console.log('Sign-out successful.')
        }).catch((error) => {
            console.log('signout error', error)
          // An error happened.
        })
    }

    if (userRecords.user.profile.fully_registered) { // no need for user registration

        return <Navigate to = '/'/>

    } else if (!userData || (layoutState == 'signedout')) { // not signed in

        return <Navigate to = '/signin'/>

    }


    return <>
        <Box padding = '6px'>
        <Heading mb = '3px' size = 'md'>Welcome to the Workboxes app!</Heading>
        <Text>
            You are signed in as <b>{userData.authUser.displayName}</b>. <Link 
            color = 'teal.500' onClick = {logOut}>Sign out</Link> any time you like,
            if you want to come back later.
        </Text>

        <Text mt = '6px'>
            Thank you for joining the Workboxes app! There are a few things we need from you before you get going.
        </Text>
        <Text mt = '6px'>
            1. A permanent user "handle" will provide other users with a way to reach you, and refer to you.
            You'll have lots of ways to control this.
        </Text>
        <Text mt = '6px'>
            2. A "payment method" [pending for now] is of course required to help us pay the bills, and keep supporting you. 
            [Again, this is pending -- the app is free for now for invited guests.]
        </Text>
        <Text>3. Accept our (somewhat preliminary) terms and conditions.</Text>
        <Text mt = '6px' mb = '6px'>
            You'll be able to continue to the app when the user handle and terms have been accepted. 
            [In future the payment method will need to be accepted as well].
        </Text>
        <em>Accepted: <Checkbox isChecked = {true}>User Handle</Checkbox> 
        <Checkbox isChecked = {false} ml = '10px'>Terms and Conditions</Checkbox></em>
        </Box >
        <Tabs variant = 'enclosed' margin = '3px'>
            <TabList>
                <Tab>User Handle</Tab>
                <Tab>Payment Method</Tab>
                <Tab>Terms and Conditions</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <HandleAlert />                      
                    <Text>
                        Handle: required: handle (immutable), name; 
                        optional: location, description, keyword, birth day; 
                        automated: date joined  
                    </Text>      
                </TabPanel>
                <TabPanel>
                    <Text>
                        Payment method. [pending -- free to invited guests for now.] I'm thinking about $10 per month for
                        the base fee, but I need to study the cost structure more. Feedback is welcome. 
                        More in increments (say $5) if metered usage gets beyond some point.                       
                    </Text>
                </TabPanel>
                <TabPanel>
                    <Text>
                        [preliminary] Terms and Conditions. Be constructive, be polite, be honest. Avoid misinformation. 
                        Disinformation (deliberately misleading information) won't be tolerated. Phishing or any devious 
                        practices won't be tolerated. No spam please. 
                    </Text>
                    <Text mt = '6px'>
                        We reserve the right to cancel your participation here at any time for any reason. 
                        If we ever get big enough, we'll have an ethics committee to oversee this.
                    </Text>
                    <Text mt = '6px' mb = '6px'>
                        I think that assets uploaded here will have to stay here under some kind of Creative Commons licence.
                        In the meantime refrain from uploading material which you consider to be private.
                    </Text>
                    <Text><Button colorScheme = 'blue'>I accept</Button> these terms and conditions.</Text>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </>

}

export default UserRegistration