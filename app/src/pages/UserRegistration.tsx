// UserRegistration.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    TODO
    - delete handle with cancel
    - location in user, domain, account

*/

import React, { useState, useEffect, useRef } from 'react'

import { Navigate } from 'react-router-dom'

import { signOut, getAuth, deleteUser, reauthenticateWithPopup, OAuthProvider } from "firebase/auth"

import { doc, deleteDoc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'

import { 
    Flex, Box, Text, Heading,
    Button, Link, Checkbox, Textarea,
    InputGroup, InputLeftAddon, Input, 
    Tabs, TabList, Tab, TabPanels, TabPanel,
    useDisclosure,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    FormControl, FormLabel, FormErrorMessage, FormHelperText,
} from '@chakra-ui/react'

import {cloneDeep as _cloneDeep, isDate as _isDate} from 'lodash'

import { useUserData, useUserRecords, useAuth, useSnapshotControl, useFirestore } from '../system/FirebaseProviders'

import { updateDocumentSchema } from '../system/utilities'

const AlertForSaveHandle = (props) => {
    const 
        {invalidFlags, editValues, setEditState, setHandleState} = props,
        { isOpen, onOpen, onClose } = useDisclosure(),
        userData = useUserData(),
        db = useFirestore(),
        userRecords = useUserRecords(),
        cancelRef = React.useRef(),
        [alertState,setAlertState] = useState('ready')

    const isError = (invalidFlags) => {
        let errorState = false
        for (const property in invalidFlags) {

            if (invalidFlags[property]) {
                errorState = true
                break
            }
        }
        return errorState
    }

    async function saveHandle () {
        setAlertState('processing')
        try {
            let date = new Date(editValues.birthdate)
            date = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
            const datestring = date.toDateString()
            const data = updateDocumentSchema('handles','user',{},{
                profile: {
                    user: {
                        id: userData.authUser.uid,
                        name: editValues.name,
                        location: editValues.location,
                        birthdate: new Date(editValues.birthdate),
                        birthdate_string: datestring,
                        description: editValues.description,
                    },
                    handle: {
                        plain: editValues.handle,
                        lower_case: editValues.handle.toLowerCase()
                    },
                    owner: {
                        id: userData.authUser.uid,
                        name: editValues.name,
                    },
                    commits: {
                        created_by: {
                            id: userData.authUser.uid,
                            name: editValues.name
                        },
                        created_timestamp: serverTimestamp()
                    }
                }
            })
            console.log('UserRecords',userRecords)
            await setDoc(doc(db,'handles',editValues.handle.toLowerCase()), data)
            await updateDoc(doc(db,'users',userData.authUser.uid),{
                'profile.handle.plain':editValues.handle,
                'profile.handle.lower_case':editValues.handle.toLowerCase(),

                'profile.user.name':editValues.name,
                'profile.user.location':editValues.location,
                'profile.user.birthdate': new Date(editValues.birthdate),
                'profile.user.birthdate_string': datestring,
                'profile.user.description':editValues.description,

                'profile.domain.name':editValues.name,
                'profile.account.name':editValues.name,

                'profile.commits.created_by.name':editValues.name
            })
            await updateDoc(doc(db,'domains',userRecords.domain.profile.domain.id),{
                'profile.handle.plain':editValues.handle,
                'profile.handle.lower_case':editValues.handle.toLowerCase(),

                'profile.domain.name':editValues.name,
                'profile.workbox.name':editValues.name,
                'profile.owner.name':editValues.name,
                'profile.commits.created_by.name':editValues.name,
            })
            await updateDoc(doc(db,'accounts',userRecords.account.profile.account.id),{
                'profile.account.name':editValues.name,
                'profile.owner.name':editValues.name,
                'profile.commits.created_by.name':editValues.name,
            })
            const workbox = await getDoc(doc(db,'workboxes',userRecords.domain.profile.workbox.id))
            const workboxdata = workbox.data()
            workboxdata.document.sections[0].data.name = editValues.name
            // console.log('workboxdata',workboxdata)
            await updateDoc(doc(db,'workboxes',userRecords.domain.profile.workbox.id),{
                'document.sections':workboxdata.document.sections,

                'profile.workbox.name':editValues.name,
                'profile.domain.name':editValues.name,
                'profile.owner.name':editValues.name,
                'profile.commits.created_by.name':editValues.name,
            })
            onClose()
            setHandleState('output')
            setAlertState('done')
            setEditState('output')
        } catch(e) {
            console.log('failure to post',e)
            setAlertState('failure')
        }
    }

    const closeAlert = () => {
        setAlertState('ready')
        onClose()
    }

    const isErrorState = isError(invalidFlags) 

    const onOpenForHandle = () => {
        const date = new Date(editValues.birthdate)
        let isInvalid = !editValues.birthdate || !_isDate(date)
        invalidFlags.birthdate = isInvalid
        if (isInvalid) setEditState('error')
        // console.log('invalidFlags.birthdate, editValues.birthdate, date',invalidFlags.birthdate, editValues.birthdate, date)
        onOpen()
    }

    return (<>
        <Button mr = '6px' colorScheme='blue' onClick={onOpenForHandle}>
            Save User Handle
        </Button>

        <AlertDialog
            isOpen={(alertState == 'processing')? true: isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Save User Handle (and related identity information)
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {((alertState != 'processing') && (alertState != 'failure') && !isErrorState) && `Are you sure? The user handle [${editValues.handle}] can't be changed afterwards.`}
                        {isErrorState && 'Error(s) found! Please go back and fix errors before saving.'}
                        {(alertState == 'processing') && 'Processing...'}
                        {(alertState == 'failure') && 'Save handle failed. Try a different handle.'}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} 
                            onClick={closeAlert} 
                            colorScheme = {(!isErrorState && (alertState != 'failure'))?'gray':'blue'}
                            isDisabled = {alertState == 'processing'}
                        >
                            {!isErrorState && !(alertState == 'failure') && 'Cancel'}
                            {(isErrorState || (alertState == 'failure')) && 'OK'}
                        </Button>
                        {!isErrorState && (!(alertState == 'failure')) && <Button 
                            colorScheme='blue' 
                            onClick={saveHandle} ml={3}
                            isDisabled = {alertState == 'processing'}
                        >
                            Save
                        </Button>}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

const AlertForCancel = (props) => {
  const 
      { setRegistrationState } = props,
      snapshotControl = useSnapshotControl(),
      db = useFirestore(),
      userData = useUserData(),
      userRecords = useUserRecords(),
      auth = useAuth(),
      { isOpen, onOpen, onClose } = useDisclosure(),
      cancelRef = React.useRef(),
      [cancelState, setCancelState] = useState('ready')

   // TODO delete any saved handle record
   function cancelRegistration() {
       setCancelState('cancelling')
       const provider = new OAuthProvider('google.com') // OAuthProvider should be taken from user data
       // userData.authUser.providerData[0].providerData (object user email matches userData.authUser.email)
       reauthenticateWithPopup(auth.currentUser, provider).then(async (result) => {
           snapshotControl.unsubAll()
           if (userRecords.user.profile.handle.lower_case) {
               await deleteDoc(doc(db, 'handles', userRecords.user.profile.handle.lower_case))
           }
           await deleteDoc(doc(db, 'workboxes', userRecords.domain.profile.workbox.id))
           await deleteDoc(doc(db, 'domains', userRecords.domain.profile.domain.id))
           await deleteDoc(doc(db, 'accounts', userRecords.account.profile.account.id))
           await deleteDoc(doc(db, 'users',userRecords.user.profile.user.id))
           const user = auth.currentUser
           await deleteUser(user)
           await signOut(auth)
           onClose()
           }
       ).catch(e => {

           alert("Cancel failed. There was an error re-authenticating. Signing out. You'll have to sign in again, and try again.")
           signOut(auth)

           return
       })
   }

  return (
    <>
      <Button mr = '6px' colorScheme='blue' onClick={onOpen}>
        Cancel
      </Button>

      <AlertDialog
        isOpen={(cancelState == 'cancelling')? true: isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Cancel registration. We'll remove any information we've gathered from you.
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text mb = '6px'>You'll be asked to re-authenticate, as cancelling will involve deleting your account with us.</Text>
              <Text>If you cancel, you can come back and restart the process anytime.</Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} isDisabled = {cancelState == 'cancelling'} onClick={onClose}>
                Oops! Cancel the Cancel
              </Button>
              <Button colorScheme='blue' isDisabled = {cancelState == 'cancelling'} onClick={cancelRegistration} ml={3}>
                Go ahead and cancel!
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

const handleHelperText = {
    handle: 'Required. This will be your permanent "@" link to let others connect and refer to you. 6-25 characters,\
     a-z, A-Z, 0-9, no spaces. Cannot be changed once saved.',
    name:'Required. This name will appear to app users. Can be changed. 6-50 characters.',
    description:'Optional. Something about yourself. This description will appear to app users with some communcications. \
    Can be changed. Max 150 characters.',
    location: 'Optional. A hint about where you are. Will be shown to app users. Can be changed. Max 50 characters.',
    birthdate: 'Optional. Can be changed. Will be set to private until you set it otherwise.',
}

const handleIsInvalidFieldFlags = {
    handle: false,
    name: false,
    description: false,
    location: false,
    birthdate: true,
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
        {defaultData, editDataRef, setHandleState} = props,
        { handle, name, description, location, birthdate } = defaultData,
        [editValues, setEditValues] = useState({...defaultData}),
        [editState,setEditState] = useState('input')
        
    editDataRef.current = editValues

    useEffect(()=>{

        // check required fields on load
        isInvalidTests.name(editValues.name??'')
        isInvalidTests.handle(editValues.handle??'')
        setEditState('checking')

    },[])

    useEffect(()=>{

        if (editState != 'output') setEditState('input')

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
            // console.log('birthdate onChange, value',value)
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
            if (value.length > 50) {
                isInvalid = true
            }
            handleIsInvalidFieldFlags.location = isInvalid
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
            let isInvalid = !value || !_isDate(new Date(value)) 
            handleIsInvalidFieldFlags.birthdate = isInvalid
            // console.log('isInvalidTests, isInvalid, date value, new Date', isInvalid, value, new Date(value))
            return isInvalid
        }
    }

    // console.log('handleIsInvalidFieldFlags',handleIsInvalidFieldFlags)

    return <Box padding = '3px'>
        <Heading size = 'sm'>Your basic identity information</Heading>
        {<>
        <span>Fill in the fields below, and then hit -&gt;</span> <AlertForSaveHandle 
            invalidFlags = {handleIsInvalidFieldFlags}
            editValues = {editValues}
            setEditState = {setEditState}
            setHandleState = {setHandleState}
        />
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
        </Flex></>}
    </Box>
}

const TermsRegistration = (props) => {

    return <>
        <Text>Review the terms and conditions below and then hit -&gt; <Button colorScheme = 'blue'>I accept</Button> to
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
        defaultData = {
            handle:'',
            name: displayName,
            description: '',
            location: '',
            birthdate: null,
        },
        [handleState, setHandleState] = useState('input'),
        [paymentStatus, setPaymentStatus] = useState('input'),
        [termsStatus, seTermsStatus] = useState('input')

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

    useEffect(()=>{

        if (registrationState != 'ready') setRegistrationState('ready')

    },[registrationState])

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
        <Text mt = '6px'>
            If you change your mind and want to cancel this registration altogether, scoll to the very bottom of this page, 
            where you will see a cancel option. You'll be able to start over at any time.
        </Text>
        <Text mt = '6px' mb = '6px'>
            Now please process each of the three tabs below, and then hit 
            -&gt; <Button isDisabled = {true} colorScheme = 'blue'>Ready!</Button> to proceed to the Workboxes app.
        </Text>
        </Box >
        <hr style = {{borderTop:'2px solid silver'}}/>
        <Tabs variant = 'enclosed' margin = '3px'>
            <TabList>
                <Tab><Checkbox isChecked = {handleState == 'output'}>User Handle</Checkbox></Tab>
                <Tab><Checkbox isDisabled isChecked = {false} ml = '10px'>Payment Method</Checkbox></Tab>
                <Tab><Checkbox isChecked = {false} ml = '10px'>Terms and Conditions</Checkbox></Tab>
            </TabList>
            <TabPanels>
                <TabPanel>

                    <HandleRegistration defaultData = {defaultData} editDataRef = {handleEditDataRef} setHandleState = {setHandleState}/>

                </TabPanel>
                <TabPanel>

                    <PaymentMethodRegistration />

                </TabPanel>
                <TabPanel>

                    <TermsRegistration />

                </TabPanel>
            </TabPanels>
        </Tabs>
        <hr style = {{borderTop:'2px solid silver'}}/>
        <Box padding = '6px'>
        <Text>
            Hit -&gt; <AlertForCancel setRegistrationState = {setRegistrationState} />to cancel this registration. We'll remove all the information you've given us.
        </Text>
        <Text>You'll be able to come back and restart the registration process any time you wish.</Text>
        </Box>
    </>

}

export default UserRegistration