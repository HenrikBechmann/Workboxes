// UserRegistration.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, { useState, useEffect, useRef } from 'react'

import { Navigate } from 'react-router-dom'

import { signOut } from "firebase/auth"

import { 
    Box, Text, Heading,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    Button, Link, Checkbox, Textarea,
    InputGroup, InputLeftAddon, Input, 
    useDisclosure,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    Flex,
    FormControl, FormLabel, FormErrorMessage, FormHelperText,
} from '@chakra-ui/react'

import { useUserData, useUserRecords, useAuth } from '../system/FirebaseProviders'

const AlertForSaveHandle = (props) => {
  const 
      { isOpen, onOpen, onClose } = useDisclosure(),
      cancelRef = React.useRef()

  return (
    <>
      <Button mr = '6px' colorScheme='blue' onClick={onOpen}>
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

const handleSchema = 
{
    version: 0,
    generation: 0,
    profile: {
        // synchronized with user record
        name: null,
        location: null,
        birthdate: null,
        description: null,
        handle: {
          plain: null,
          lower_case: null,
        },
        type: {
            name: 'user',
            alias: null,
        },
        owner: {
            id: null,
            name: null,
        },
        commits: {
            created_by: {
                id: null, 
                name: null
            },
            created_timestamp: null,
            updated_by: {
                id: null, 
                name: null
            },
            updated_timestamp: null,
        },
        counts: {
        },
    },
}

const handleHelperText = {
    handle: 'Required. This will be your permanent "@" link to let others connect and refer to you. 6-25 characters,\
     a-z, A-Z, 0-9, no spaces. Cannot be changed once saved.',
    name:'Required. This name will appear to app users. Can be changed. 6-50 characters.',
    description:'Optional. Something about yourself. This description will appear to app users. Can be changed. Max 150 characters.',
    location: 'Optional. A hint about where you are. Will be shown to app users. Can be changed. Max 50 characters.',
    birthdate: 'Optional. Can be changed. Will be set to private until you set it otherwise.',
}

const handleIsInvalidFieldFlags = {
    handle: false,
    name: false,
    description: false,
    location: false,
    birthdate: false,
}

const handleErrorMessages = {
    handle: 'The handle is required, and can only be 6 to 25 characters. a-z, A-Z, 0-9, no spaces.',
    name:'The name can only be 6 to 50 characters.',
    description:'The description can only be up to 150 characters.',
    location: 'The location is optional, but can only be up to 50 characters',
    birthdate: 'Optional. Must be a valid date.',
}

const HandleRegistration = (props) => {
    const 
        {defaultData, editDataRef} = props,
        { handle, name, description, location, birthdate } = defaultData,
        [editValues, setEditValues] = useState({...defaultData}),
        [editState,setEditState] = useState('setup')
        
    editDataRef.current = editValues

    useEffect(()=>{

        // check required fields on load
        isInvalidTests.name(editValues.name??'')
        isInvalidTests.handle(editValues.handle??'')
        setEditState('checking')

    },[])

    useEffect(()=>{

        if (editState != 'ready') setEditState('ready')

    },[editState])

    const onChangeFunctions = {
        handle:(event) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            isInvalidTests.handle(value)
            editValues.handle = value
            setEditValues({...editValues})
        },
        name:(event) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            isInvalidTests.name(value)
            editValues.name = value
            setEditValues({...editValues})
        },
        location:(event) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            isInvalidTests.location(value)
            editValues.location = value
            setEditValues({...editValues})
        },
        description:(event) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            isInvalidTests.description(value)
            editValues.description = value
            setEditValues({...editValues})
        },
        birthdate:(event) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            isInvalidTests.birthdate(value)
            editValues.birthdate = value
            setEditValues({...editValues})
        },
    }

    // see db at system.settings.constraints.maxNameLength (set to 50)
    const isInvalidTests = {
        // TODO check for blank, string
        handle: (value) => {
            let isInvalid = false
            if (value.length > 25 || value.length < 6) {
                isInvalid = true
            }
            if (!isInvalid) {
                const regex = new RegExp('^[a-zA-Z0-9]+$');
                isInvalid = !regex.test(value)
            }
            handleIsInvalidFieldFlags.handle = isInvalid
            return isInvalid
        },
        name: (value) => {
            let isInvalid = false
            if (value.length > 50 || value.length < 6) {
                isInvalid = true
            }
            handleIsInvalidFieldFlags.name = isInvalid
            return isInvalid
        },
        location:(value) => {
            let isInvalid = false

            return isInvalid
        },
        description: (value) => {
            let isInvalid = false
            if (value.length > 150) {
                isInvalid = true
            }
            handleIsInvalidFieldFlags.description = isInvalid
            return isInvalid
        },
        birthdate:(value) => {
            let isInvalid = false

            return isInvalid
        }
    }

    return <Box padding = '3px'>
        <Heading size = 'sm'>Your basic identity information</Heading>
        Fill in the fields below, and then hit -&gt; <AlertForSaveHandle />
        <Flex data-type = 'register-handle-edit-flex' flexWrap = 'wrap'>
            <Box data-type = 'handlefield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' maxWidth = '400px' isInvalid = {handleIsInvalidFieldFlags.handle}>
                    <FormLabel fontSize = 'sm'>Your forever handle:</FormLabel>
                    <InputGroup size='sm'>
                        <InputLeftAddon>@</InputLeftAddon>
                        <Input 
                            value = {editValues.handle || ''} 
                            size = 'sm'
                            onChange = {onChangeFunctions.handle}
                        />
                    </InputGroup>
                    <FormErrorMessage>
                        {handleErrorMessages.handle} Current length is {editValues.handle?.length || '0 (blank)'}.
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic' >
                        {handleHelperText.handle} Current length is {editValues.handle?.length || '0 (blank)'}.
                    </FormHelperText>
                </FormControl>
            </Box>
            <Box data-type = 'namefield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' maxWidth = '400px' isInvalid = {handleIsInvalidFieldFlags.name}>
                    <FormLabel fontSize = 'sm'>Your name:</FormLabel>
                    <Input 
                        value = {editValues.name || ''} 
                        size = 'sm'
                        onChange = {onChangeFunctions.name}
                    >
                    </Input>
                    <FormErrorMessage>
                        {handleErrorMessages.name} Current length is {editValues.name?.length || '0 (blank)'}.
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic' >
                        {handleHelperText.name} Current length is {editValues.name?.length || '0 (blank)'}.
                    </FormHelperText>
                </FormControl>
            </Box>
            <Box data-type = 'descriptionfield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px' isInvalid = {handleIsInvalidFieldFlags.description}>
                    <FormLabel fontSize = 'sm'>Your description:</FormLabel>
                    <Textarea 
                        value = {editValues.description || ''} 
                        size = 'sm'
                        onChange = {onChangeFunctions.description}
                    >
                    </Textarea>
                    <FormErrorMessage>
                        {handleErrorMessages.description} Current length is {editValues.description?.length || '0 (blank)'}.
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic' >
                        {handleHelperText.description} Current length is {editValues.description?.length || '0 (blank)'}.
                    </FormHelperText>
                </FormControl>
            </Box>
            <Box data-type = 'locationfield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px' isInvalid = {handleIsInvalidFieldFlags.location}>
                    <FormLabel fontSize = 'sm'>Your location:</FormLabel>
                    <Input 
                        value = {editValues.location || ''} 
                        size = 'sm'
                        onChange = {onChangeFunctions.location}
                    >
                    </Input>
                    <FormErrorMessage>
                        {handleErrorMessages.location} Current length is {editValues.location?.length || '0 (blank)'}.
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic'>
                        {handleHelperText.location} Current length is {editValues.location?.length || '0 (blank)'}.
                    </FormHelperText>
                </FormControl>
            </Box>
            <Box data-type = 'datefield' margin = '3px' padding = '3px' border = '1px dashed silver'>
                <FormControl minWidth = '300px' marginTop = '6px' maxWidth = '400px' isInvalid = {handleIsInvalidFieldFlags.birthdate}>
                    <FormLabel fontSize = 'sm'>Your birth date:</FormLabel>
                    <Input placeholder='Select Date' size='md' type='date' onChange = {onChangeFunctions.birthdate}/>
                    <FormErrorMessage>
                        {handleErrorMessages.birthdate}.
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic'>
                        {handleHelperText.birthdate}
                    </FormHelperText>
                </FormControl>
            </Box>
        </Flex>
    </Box>
}

const TermsRegistration = (props) => {

    return <>
        <Text>Review the terms and conditions and then hit -&gt; <Button colorScheme = 'blue'>I accept</Button> to
            accept the terms and conditions.</Text>
        <Text mt = '6px'>
            If you don't wish to accept these terms and conditions, scroll to the very bottom of this page, where 
            you will be able to cancel your registration with us.
        </Text>
        <Text mt = '6px'>
            [preliminary] Terms and Conditions:
        </Text>
        <Text ml = '18px' mt = '6px'>
            1. Be constructive, be polite, be honest. Avoid misinformation. 
            Disinformation (deliberately misleading information) won't be tolerated. Phishing or any devious 
            practices won't be tolerated. No spam please. 
        </Text>
        <Text ml = '18px' mt = '6px'>
            2. We reserve the right to cancel your participation here at any time for any reason. 
            If we ever get big enough, we'll have an ethics committee to oversee this.
        </Text>
        <Text ml = '18px' mt = '6px' mb = '6px'>
            3. I think that assets uploaded here will have to stay here under some kind of Creative Commons licence.
            In the meantime refrain from uploading material which you consider to be private.
        </Text>
    </>
}

const PaymentMethodRegistration = (props) => {

    return <>
        <Text>
            Payment method. [pending -- free to invited guests for now.] I'm thinking about $10 per month for
            the base fee, but I need to study the cost structure more. Feedback is welcome. 
            More in increments (say $5) if metered usage gets beyond some point.                       
        </Text>
    </>
}

const UserRegistration = (props) => {

    const 
        auth = useAuth(),
        userData = useUserData(),
        { displayName } = userData.authUser,
        userRecords = useUserRecords(),
        [registrationState, setRegistrationState] = useState('setup'),
        handleEditDataRef = useRef(null),
        handleData = {
            handle:'',
            name: displayName,
            description: '',
            location: '',
            birthdate: null,
        }

    // sign out option

    const logOut = () => {
        signOut(auth).then(() => {
          setRegistrationState('signedout')
          // console.log('Sign-out successful.')
        }).catch((error) => {
            console.log('signout error', error)
        })
    }

    if (userRecords.user.profile.flags.fully_registered) { // no need for user registration

        return <Navigate to = '/'/>

    } else if (!userData || (registrationState == 'signedout')) { // not signed in

        return <Navigate to = '/signin'/>

    }

    useEffect(()=>{
        handleEditDataRef.current = {}

    },[])

    // registration

    return <>
        <Box padding = '6px'>
        <Heading mb = '3px' size = 'md'>Welcome to the Workboxes app!</Heading>
        <Text>
            You are signed in as <b>{userData.authUser.displayName}</b> ({userData.authUser.email}). <Link 
            color = 'teal.500' onClick = {logOut}>Sign out</Link> any time you like,
            if you want to come back later to continue.
        </Text>

        <Text mt = '6px'>
            Thank you for joining the Workboxes app! There are a few things we need from you before you get going.
        </Text>
        <Text ml = '18px' mt = '6px'>
            1. A permanent user "@" handle which will provide other users with a way to reach you, and refer to you.
            You'll have lots of ways to control this usage.
        </Text>
        <Text ml = '18px' mt = '6px'>
            2. A payment method [pending for now] is of course required to help us pay the bills, and keep supporting you. 
            [Again, this is pending -- the app is free for now for invited guests.] Don't worry, the first month (optionally, 
            and with limits) will be free.
        </Text>
        <Text ml = '18px' >3. Acceptance of our (somewhat preliminary) terms and conditions.</Text>
        <Text mt = '6px'>
            You'll be able to continue to the app when the user handle and terms have been accepted. 
            [In future the payment method will need to be accepted as well].
        </Text>
        <Text mt = '6px' mb = '6px'>
            If you change your mind and want to cancel this registration altogether, scoll to the very bottom of this page, 
            where you will see a cancel option. You'll be able to start over at any time.
        </Text>
        <em>Accepted: <Checkbox isChecked = {true}>User Handle</Checkbox> 
            <Checkbox isDisabled isChecked = {false} ml = '10px'>Payment Method</Checkbox>
            <Checkbox isChecked = {false} ml = '10px'>Terms and Conditions</Checkbox>
        </em>
        </Box >
        <hr style = {{borderTop:'2px solid silver'}}/>
        <Tabs variant = 'enclosed' margin = '3px'>
            <TabList>
                <Tab>User Handle</Tab>
                <Tab>Payment Method</Tab>
                <Tab>Terms and Conditions</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>

                    <HandleRegistration defaultData = {handleData} editDataRef = {handleEditDataRef}/>

                </TabPanel>
                <TabPanel>

                    <PaymentMethodRegistration />

                </TabPanel>
                <TabPanel>

                    <TermsRegistration />

                </TabPanel>
            </TabPanels>
        </Tabs>
    </>

}

export default UserRegistration