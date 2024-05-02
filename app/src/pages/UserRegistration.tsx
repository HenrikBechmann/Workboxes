// UserRegistration.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*
    TODO

    allow blank date - currently an error - use checkmark to include
    useRef for userRecord line 209

*/
import React, { useState, useEffect, useRef } from 'react'

import { Navigate, useNavigate } from 'react-router-dom'

import { signOut, getAuth, deleteUser, reauthenticateWithPopup, OAuthProvider } from "firebase/auth"

import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore'

import { 
    Flex, Box, Text, Heading,
    Button, Link, Checkbox, Textarea,
    InputGroup, InputLeftAddon, Input, 
    Tabs, TabList, Tab, TabPanels, TabPanel,
    useDisclosure,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    FormControl, FormLabel, FormErrorMessage, FormHelperText,
    UnorderedList, ListItem,
} from '@chakra-ui/react'

import {isDate as _isDate} from 'lodash'

import { useUserAuthData, useUserRecords, useSystemRecords, useAuth, useSnapshotControl, useFirestore, useErrorControl } from '../system/WorkboxesProvider'

import { updateDocumentSchema } from '../system/utilities'

// =================================[ User Registration Base ]==================================

// ---------------------------------[ display user registration ]--------------------------------

const UserRegistration = (props) => {

    const 
        auth = useAuth(),
        userAuthData = useUserAuthData(),
        db = useFirestore(),
        { displayName } = userAuthData.authUser,
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
        [paymentState, setPaymentState] = useState('input'),
        [termsState, setTermsState] = useState('input'),
        registrationComplete = (handleState == 'output') && (termsState == 'output'),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    // sign out option
    useEffect(()=>{

        handleEditDataRef.current = {} // TODO ???

    },[])

    useEffect(()=>{

        if (registrationState != 'ready') setRegistrationState('ready')

    },[registrationState])

    const logOut = () => {
        signOut(auth).then(() => {

          setRegistrationState('signedout')

        }).catch((error) => {

            console.log('signout error', error)
            errorControl.push({description:'signout error on registration page', error})
            navigate('/error')

        })
    }

    if (userRecords.user.profile.flags.fully_registered) { // no need for user registration

        return <Navigate to = '/'/>

    } else if (!userAuthData || (registrationState == 'signedout')) { // not signed in

        return <Navigate to = '/signin'/>

    }

    async function proceedToApp() {

        try {
            await updateDoc(doc(db, 'users',userRecords.user.profile.user.id),
                {
                    'profile.flags.fully_registered':true
                }
            )
            await updateDoc(doc(db, 'system','usage'),
                {
                    'user_entries':increment(1)
                }
            )

        } catch(error) {

            console.log('error accepting terms',error)
            errorControl.push({description:'error accepting terms on registration page', error})
            navigate('/error')

        }

    }

    // registration

    return <>
        <Box padding = '6px'>

        <Heading mb = '3px' size = 'md'>Welcome to the Workboxes app!</Heading>
        <Text>
            You are signed in as <b>{userAuthData.authUser.displayName}</b> ({userAuthData.authUser.email}). <Link 
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
            {!registrationComplete && 'Now please process each of the three tabs below, and then hit'} 
            {registrationComplete && "You're all set! Now hit "}
            -&gt; <Button 
                isDisabled = {!registrationComplete} 
                colorScheme = 'blue'
                onClick = {proceedToApp}
            >Ready!</Button> to proceed to the Workboxes app.
        </Text>
        </Box >
        <hr style = {{borderTop:'2px solid silver'}}/>
        <Tabs margin = '3px'>
            <TabList>
                <Tab><Checkbox isChecked = {handleState == 'output'}>User Handle</Checkbox></Tab>
                <Tab><Checkbox isDisabled isChecked = {false} ml = '10px'>Payment Method</Checkbox></Tab>
                <Tab><Checkbox isChecked = {termsState == 'output'} ml = '10px'>Terms and Conditions</Checkbox></Tab>
            </TabList>
            <TabPanels>
                <TabPanel>

                    <RegistrationForHandle defaultData = {defaultData} editDataRef = {handleEditDataRef} setHandleState = {setHandleState}/>

                </TabPanel>
                <TabPanel>

                    <PaymentMethodRegistration />

                </TabPanel>
                <TabPanel>

                    <TermsRegistration setTermsState = {setTermsState}/>

                </TabPanel>
            </TabPanels>
        </Tabs>
        <hr style = {{borderTop:'2px solid silver'}}/>
        <Box padding = '6px'>
        <Text>
            Hit -&gt; <DialogForCancel setRegistrationState = {setRegistrationState} />to cancel this registration. We'll remove all the information you've given us.
        </Text>
        <Text>You'll be able to come back and restart the registration process any time you wish.</Text>

        </Box>
    </>

}

// ==================================[ User Registration Input ]==============================

// -----------------------------[ accept handle registration input ]--------------------------

// TODO s/b a state value
const handleIsInvalidFieldFlags = {
    handle: false,
    name: false,
    description: false,
    location: false,
    birthdate: false,
}

const RegistrationForHandle = (props) => {
    const 
        {defaultData, editDataRef, setHandleState} = props,
        userRecords = useUserRecords(),
        [editValues, setEditValues] = useState({...defaultData}),
        [handleEditState,setHandleEditState] = useState(userRecords.user.profile.flags.user_handle?'output':'input'),
        [birthdateOptionState, setBirthdateOptionState] = useState('now'),
        systemRecords = useSystemRecords(),
        maxDescriptionLength = systemRecords.settings.constraints.input.descriptionLength_max,
        maxNameLength = systemRecords.settings.constraints.input.nameLength_max,
        minNameLength = systemRecords.settings.constraints.input.nameLength_min,
        maxHandleLength = systemRecords.settings.constraints.input.handleLength_max,
        minHandleLength = systemRecords.settings.constraints.input.handleLength_min,
        maxLocationLength = systemRecords.settings.constraints.input.locationLength_max

    editDataRef.current = editValues

    const handleHelperText = {
        handle: `Required. This will be your permanent "@" link to let others connect and refer to you. \
        ${minHandleLength}-${maxHandleLength} characters, \
         a-z, A-Z, 0-9, no spaces. Cannot be changed once saved.`,
        name:`Required. This name will appear to app users. Can be changed. ${minNameLength}-${maxNameLength} characters.`,
        description:`Optional. Something about yourself. This description will appear to app users with some communcications. \
        Can be changed. Max ${maxDescriptionLength} characters.`,
        location: `Optional. A hint about where you are. Will be shown to app users. Can be changed. Max ${maxLocationLength} characters.`,
        birthdate: `Optional. Can be changed. Will be set to private until you set it otherwise. Generally helpful for context.`,
    }

    const handleErrorMessages = {
        handle: `The handle is required, and can only be ${minHandleLength} to ${maxHandleLength} characters. a-z, A-Z, 0-9, no spaces.`,
        name:`The name can only be ${minNameLength} to ${maxNameLength} characters.`,
        description:`The description can only be up to ${maxDescriptionLength} characters.`,
        location: `The location is optional, but can only be up to ${maxLocationLength} characters`,
        birthdate: 'Must be a valid date.',
    }

    useEffect(()=>{

        const userProfile = userRecords.user.profile

        if (!userProfile.flags.user_handle) {

            // check required fields on load
            isInvalidTests.name(editValues.name??'')
            isInvalidTests.handle(editValues.handle??'')
            if (birthdateOptionState == 'now') {
                isInvalidTests.birthdate(editValues.birthdate)
            }
            setHandleEditState('checking')

        } else { 

            setEditValues({
                name: userProfile.user.name,
                description: userProfile.user.description,
                handle: userProfile.handle.plain,
                birthdate: userProfile.user.birthdate_string,
                location: userProfile.user.location
            })

            setHandleState('output')
        }

    },[])

    useEffect(()=>{

        if (handleEditState != 'output') setHandleEditState('input')

    },[handleEditState])

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
        birthdatecheckbox: (event) => {
            const target = event.target as HTMLInputElement
            const value = target.checked
            const birthdatefield = document.getElementById('birthdatefield') as HTMLInputElement
            let isInvalid
            if (!value) { // not checked, allow input
                isInvalid = !birthdatefield.value || isInvalidTests.birthdate(birthdatefield.value)
                handleIsInvalidFieldFlags.birthdate = isInvalid
            } else {
                birthdatefield.value = ''
                handleIsInvalidFieldFlags.birthdate = false
                editValues.birthdate = null
            }
            setBirthdateOptionState(value?'later':'now')
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
        handle: (value) => {
            let isInvalid = false
            if (value.length > maxHandleLength || value.length < minHandleLength) {
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
            if (value.length > maxNameLength || value.length < minNameLength) {
                isInvalid = true
            }
            handleIsInvalidFieldFlags.name = isInvalid
            return isInvalid
        },
        location:(value) => {
            let isInvalid = false
            if (value.length > maxLocationLength) {
                isInvalid = true
            }
            handleIsInvalidFieldFlags.location = isInvalid
            return isInvalid
        },
        description: (value) => {
            let isInvalid = false
            if (value.length > maxDescriptionLength) {
                isInvalid = true
            }
            handleIsInvalidFieldFlags.description = isInvalid
            return isInvalid
        },
        birthdate:(value) => {
            let isInvalid = false
            if (birthdateOptionState == 'now') {
                isInvalid = !value || !_isDate(new Date(value)) 
                handleIsInvalidFieldFlags.birthdate = isInvalid
            }
            return isInvalid
        }
    }

    return <Box padding = '3px'>

        <Heading size = 'sm'>Your basic identity information</Heading>
        {(handleEditState != 'output') && <>
        <span>Fill in the fields below, and then hit -&gt;</span> <DialogForSaveHandle 
            invalidFlags = {handleIsInvalidFieldFlags}
            editValues = {editValues}
            setHandleEditState = {setHandleEditState}
            setHandleState = {setHandleState}
            birthdateOptionState = {birthdateOptionState}
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
                <FormControl minWidth = '300px' marginTop = '6px'>
                    <Checkbox size = 'sm' isChecked = {birthdateOptionState == 'later'} onChange = {onChangeFunctions.birthdatecheckbox}>
                        Maybe I'll add my birth date later.
                    </Checkbox>
                </FormControl>
                <FormControl isDisabled = {birthdateOptionState == 'later'} minWidth = '300px' maxWidth = '400px' isInvalid = {handleIsInvalidFieldFlags.birthdate}>
                    <FormLabel fontSize = 'sm'>Your birth date:</FormLabel>
                    <Input id = 'birthdatefield' placeholder='Select Date' size='md' type='date' onChange = {onChangeFunctions.birthdate}/>
                    <FormErrorMessage>
                        {handleErrorMessages.birthdate}
                    </FormErrorMessage>
                    <FormHelperText fontSize = 'xs' fontStyle = 'italic'>
                        {handleHelperText.birthdate}
                    </FormHelperText>
                </FormControl>
            </Box>
        </Flex></>}
        {(handleEditState == 'output') && 
            <Box padding = '6px'>
                <Text>OK, so we've created your forever user handle (@{editValues.handle}). You won't be able to change this 
                    (although in a pinch you could still cancel this registration below and start over, but that would be it.)
                </Text>
                <Text mt = '6px'>
                    We've created a user preferences record for you, which includes:
                </Text>
                <UnorderedList>
                    <ListItem>
                        Name: {userRecords.user.profile.user.name}
                    </ListItem>
                    <ListItem>
                        Description: {userRecords.user.profile.user.description?userRecords.user.profile.user.description:'(blank)'}
                    </ListItem>
                    <ListItem>
                        Location: {userRecords.user.profile.user.location?userRecords.user.profile.user.location:'(blank)'}
                    </ListItem>
                    <ListItem>
                        Birthdate: {userRecords.user.profile.user.birthdate_string?userRecords.user.profile.user.birthdate_string:'(blank)'}
                    </ListItem>
                </UnorderedList>
                <Text mt = '6px'>
                    Those last four you'll be able to change in your user preferences.
                </Text>
                <Text mt = '6px'>
                    We've also created a couple of other things for you...
                </Text>
                <Text mt = '6px'>
                    An account record, to deal with the business side of things, and...
                </Text>
                <Text mt = '6px'>
                    Your own personal user domain, to keep your personal workboxes. You'll also be able to create additional 
                    thematic domains, with specialized workboxes, and invite others to join those domains to help out.
                </Text>

            </Box>
        }
    </Box>
}

// ------------------------------------[ accept terms registratoin input]------------------------------

const TermsRegistration = (props) => {

    const
        { setTermsState } = props,
        db = useFirestore(),
        userRecords = useUserRecords(),
        [termsRegistrationState, setTermsRegistrationState] = useState('pending'),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    useEffect(()=>{

        const userProfile = userRecords.user.profile

        if (userProfile.flags.terms_accepted) {
            
            setTermsRegistrationState('accepted')
            setTermsState('output')

        }

    },[])

    async function acceptTerms () {

        try {
            await updateDoc(doc(db, 'users',userRecords.user.profile.user.id),
                {
                    'profile.flags.terms_accepted':true
                }
            )

            setTermsRegistrationState('accepted')
            setTermsState('output')
        } catch(error) {
            console.log('error accepting terms',error)
            errorControl.push({description:'error accepting terms on registration page', error})
            navigate('/error')
        }

    }

    return <>
        {(termsRegistrationState == 'pending') && <Text>Review the terms and conditions below and then hit -&gt; <Button onClick = {acceptTerms} colorScheme = 'blue'>I accept</Button> to
            accept the terms and conditions.</Text>}
        {(termsRegistrationState == 'accepted') && <Text>You have accepted the terms and conditions below.</Text>}
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
        <Text ml = '18px' mt = '6px'>
            3. Assets uploaded here, and shared, will have to stay here under some kind of Creative Commons licence.
            So refrain from uploading and sharing material which you consider to be private.
        </Text>
        <Text ml = '18px' mt = '6px'>
            4. Sorry, we can't make any warranties or promises about the utility or robustness of this product.
        </Text>
        <Text ml = '18px' mt = '6px' mb = '6px'>
            5. We reserve the right to change these terms and conditions. Of course you'll be notified of any changes.
        </Text>
    </>
}

// -----------------------------------[ accept payment method input ]--------------------------

const PaymentMethodRegistration = (props) => {

    return <>
        <Text>
            Payment method. [pending -- free to invited guests for now.] I'm thinking about $10 per month for
            the base fee, but I need to study the cost structure more. Feedback is welcome. 
            More in increments (say $5) if metered usage gets beyond some point.                       
        </Text>
    </>
}

// ============================[ User Registration Processing ]================================

// ------------------------[ process save handle ]--------------------

const DialogForSaveHandle = (props) => {
    const 
        {invalidFlags, editValues, setHandleEditState, setHandleState, birthdateOptionState} = props,
        { isOpen, onOpen, onClose } = useDisclosure(),
        userAuthData = useUserAuthData(),
        db = useFirestore(),
        userRecords = useUserRecords(),
        cancelRef = React.useRef(),
        [alertState,setAlertState] = useState('ready'),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    const isInvalidFlag = (invalidFlags) => {
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

        // 1. handle
        try { // catch most likely if chosen handle already exists
            // derive birthdate string to avoid birthday shift with UMT
            let birthdate, birthdatestring
            if (editValues.birthdate) {
                birthdate = new Date(editValues.birthdate)
                const adjustedbirthdate = new Date(birthdate.getTime() + birthdate.getTimezoneOffset() * 60000)
                birthdatestring = adjustedbirthdate.toDateString()
            } else {
                birthdate = null
                birthdatestring = ''
            }

            // assemble handle document structure
            const data = updateDocumentSchema('handles','user',{},{
                profile: {
                    user: {
                        id: userAuthData.authUser.uid,
                        name: editValues.name,
                        location: editValues.location,
                        birthdate: birthdate,
                        birthdate_string: birthdatestring,
                        description: editValues.description,
                    },
                    handle: {
                        plain: editValues.handle,
                        lower_case: editValues.handle.toLowerCase()
                    },
                    owner: {
                        id: userAuthData.authUser.uid,
                        name: editValues.name,
                    },
                    commits: {
                        created_by: {
                            id: userAuthData.authUser.uid,
                            name: editValues.name
                        },
                        created_timestamp: serverTimestamp()
                    }
                }
            })

            // create handles doc. will fail and get caught below if duplicate
            await setDoc(doc(db,'handles',editValues.handle.toLowerCase()), data)

            // continue with integrating updates if handle successfully created

            // add handle to user and domain
            // add identity data to user
            // add new name to user domain, user account, base user workbox, and their references 
            //     and to creation and owner references

            // 2. user
            await updateDoc(doc(db,'users',userAuthData.authUser.uid),{
                // user handle
                'profile.handle.plain':editValues.handle,
                'profile.handle.lower_case':editValues.handle.toLowerCase(),

                // user identity
                'profile.user.name':editValues.name,
                'profile.user.location':editValues.location,
                'profile.user.birthdate': birthdate,
                'profile.user.birthdate_string': birthdatestring,
                'profile.user.description':editValues.description,

                // domain and acount references
                'profile.domain.name':editValues.name,
                'profile.account.name':editValues.name,

                // creation reference
                'profile.commits.created_by.name':editValues.name,

                // progress flag
                'profile.flags.user_handle':true,
            })

            // 3. domain
            await updateDoc(doc(db,'domains',userRecords.domain.profile.domain.id),{
                'profile.handle.plain':editValues.handle,
                'profile.handle.lower_case':editValues.handle.toLowerCase(),

                // domain name and base workbox reference
                'profile.domain.name':editValues.name,
                'profile.workbox.name':editValues.name,

                // owner and creation reference
                'profile.owner.name':editValues.name,
                'profile.commits.created_by.name':editValues.name,
            })

            // 4. account
            await updateDoc(doc(db,'accounts',userRecords.account.profile.account.id),{
                // account name
                'profile.account.name':editValues.name,

                // owner and creation reference
                'profile.owner.name':editValues.name,
                'profile.commits.created_by.name':editValues.name,
            })

            // 5. workbox
            // update standard section name in base domain workbox
            const workbox = await getDoc(doc(db,'workboxes',userRecords.domain.profile.workbox.id))
            const workboxdata = workbox.data()
            workboxdata.document.sections[0].data.name = editValues.name
            workboxdata.document.sections[0].data.description = editValues.description
            // console.log('workboxdata',workboxdata)

            await updateDoc(doc(db,'workboxes',userRecords.domain.profile.workbox.id),{
                // return the sections data
                'document.sections':workboxdata.document.sections,

                // workbox name and domain reference name
                'profile.workbox.name':editValues.name,
                'profile.domain.name':editValues.name,

                // owner and creation reference
                'profile.owner.name':editValues.name,
                'profile.commits.created_by.name':editValues.name,
            })
            onClose()
            setHandleState('output')
            setAlertState('done')
            setHandleEditState('output')

        } catch(error) {

            // most likely indicates handle duplicate attempted and rejected
            console.log('failure to post handle data',error)
            errorControl.push({description:'error posting handle data on registration page', error})
            navigate('/error')

        }
    }

    const closeAlert = () => {

        setAlertState('ready')
        onClose()
        
    }

    const isInvalidState = isInvalidFlag(invalidFlags) 

    const onOpenForHandle = () => {
        // date field requires special handling
        let isInvalid = false
        if (birthdateOptionState == 'now') {
            isInvalid = !editValues.birthdate || !_isDate(new Date(editValues.birthdate))
        }
        invalidFlags.birthdate = isInvalid

        if (isInvalid) setHandleEditState('error')
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
                        {((alertState != 'processing') && (alertState != 'failure') && !isInvalidState) && 
                            `Are you sure? The user handle @${editValues.handle} can't be changed afterwards.`}
                        {isInvalidState && 'Error(s) found! Please go back and fix errors before saving.'}
                        {(alertState == 'processing') && 'Processing...'}
                        {(alertState == 'failure') && 'Save handle failed. Try a different handle.'}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} 
                            onClick={closeAlert} 
                            colorScheme = {(!isInvalidState && (alertState != 'failure'))?'gray':'blue'}
                            isDisabled = {alertState == 'processing'}
                        >
                            {!isInvalidState && !(alertState == 'failure') && 'Cancel'}
                            {(isInvalidState || (alertState == 'failure')) && 'OK'}
                        </Button>
                        {!isInvalidState && !(alertState == 'failure') && <Button 
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

// -----------------------------------[ process cancel registration ]-----------------------------

const DialogForCancel = (props) => {
    const 
        { setRegistrationState } = props,
        snapshotControl = useSnapshotControl(),
        db = useFirestore(),
        userAuthData = useUserAuthData(),
        userRecords = useUserRecords(),
        auth = useAuth(),
        { isOpen, onOpen, onClose } = useDisclosure(),
        cancelRef = React.useRef(),
        [cancelState, setCancelState] = useState('ready'),
        errorControl = useErrorControl(),
        navigate = useNavigate()

   function cancelRegistration() {
       setCancelState('cancelling')
       const provider = new OAuthProvider('google.com') // TODO OAuthProvider should be taken from user data:
       // userAuthData.authUser.providerData[0].providerData (object user email matches userAuthData.authUser.email)
       reauthenticateWithPopup(auth.currentUser, provider).then(async (result) => { // required to delete user login account

           snapshotControl.unsubAll()
           if (userRecords.user.profile.handle.lower_case) {
               await deleteDoc(doc(db, 'handles', userRecords.user.profile.handle.lower_case))
           }
           await deleteDoc(doc(db, 'workboxes', userRecords.domain.profile.workbox.id))
           await deleteDoc(doc(db, 'domains', userRecords.domain.profile.domain.id))
           await deleteDoc(doc(db, 'accounts', userRecords.account.profile.account.id))
           await deleteDoc(doc(db, 'users',userRecords.user.profile.user.id))

           if (!userAuthData.sysadminStatus.isSuperUser) {
               const user = auth.currentUser
               await deleteUser(user)
           }
           await signOut(auth)
           onClose()

        }).catch(e => {

           alert("Cancel failed. There was an error re-authenticating. Signing out. You'll have to sign in again, and try again.")
           signOut(auth)

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

export default UserRegistration