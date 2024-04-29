// Toolbar_Standard.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef, useState, useEffect} from 'react'
import { signOut } from "firebase/auth"
import { doc, setDoc, collection, query, getDocs, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Button, Text,
    Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup, MenuItemOption, MenuOptionGroup,
    Tooltip, Box,
    useDisclosure, Input,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    FormControl, FormLabel, FormErrorMessage, FormHelperText,
} from '@chakra-ui/react'

import { 
    useUserAuthData, 
    useUserRecords, 
    useAuth, 
    useFirestore, 
    useWorkspaceSelection, 
    useSystemRecords 
} from '../../system/WorkboxesProvider'

import { updateDocumentSchema } from '../../system/utilities'

import { isMobile } from '../../index'

import LearnIcon from './LearnIcon'
import MenuIcon from './MenuIcon'
import MenuControl from './MenuControl'
import StandardIcon from './StandardIcon'
import ToolbarVerticalDivider from './VerticalDivider'
import { useToggleIcon } from './ToggleIcon'

import fireIcon from '../../../assets/workbox-logo.png'
import notificationsIcon from '../../../assets/notifications.png'
import chatIcon from '../../../assets/chat.png'
import messageIcon from '../../../assets/mail.png'
import helpIcon from '../../../assets/help.png'
import homeIcon from '../../../assets/home.png'
import homeFillIcon from '../../../assets/home_fill.png'
import subscriptionsIcon from '../../../assets/subscriptions.png'
import appSettingsIcon from '../../../assets/app_settings.png'
import workspacesIcon from '../../../assets/workspaces.png'
import cartIcon from '../../../assets/cart.png'
import moreVerticalIcon from '../../../assets/more_vert.png'
import hideIcon from '../../../assets/expand_less.png'
import mobileIcon from '../../../assets/smartphone.png'
import desktopIcon from '../../../assets/laptop.png'


// ==============================[ STANDARD TOOLBAR ]==========================

// ----------------------------- static values -----------------------------
const standardToolbarStyles = {
    minHeight:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'nowrap',
    whitespace:'nowrap',
    alignItems:'center',
    // height:'40px',
    boxSizing:'border-box',
    backgroundColor:'#dfecdf', //'#f2f2f2',
    borderRadius:'8px',

} as CSSProperties

const iconWrapperStyles = {
    display:'inline-block',
    marginLeft:'12px',
    opacity:0.7,
}

const iconStyles = {
    height:'20px',
    width:'20px',
}

const smallerIconStyles = {
    height:'18px', 
    width:'18px'
}

const downArrowWrapperStyles = {
    display:'inline-block',
}

const downArrowStyles = {
    opacity:0.5, 
    fontSize:'small',
}

const fireIconControlStyles = {
    display:'flex',
    flexWrap:'nowrap',
    alignItems:'center',
    padding:'2px',
    borderRadius:'6px',
    marginLeft:'6px',
} as CSSProperties

const avatarStyles = {
    width:'24px', 
    height:'24px', 
    borderRadius:'12px',
    // display:'inline-block',
}

const displayNameStyles = {
    display:'flex',
    flexWrap:'nowrap',
    alignItems:'center',
    whiteSpace:'nowrap',
    fontSize:'small', 
    marginLeft:'4px',
    marginRight:'3px', 
} as CSSProperties

let workspaceMenuIteration = 0

// --------------------------- component ----------------------------
const StandardToolbar = (props) => {

    // ------------------------------ hooks ------------------------
    const 
        // system resources
        navigate = useNavigate(),
        location = useLocation(),
        auth = useAuth(),
        db = useFirestore(),
        // user resources
        userAuthData = useUserAuthData(),
        { displayName:userDisplayName, photoURL:userPhotoURL } = userAuthData.authUser,
        isSuperUser = userAuthData.sysadminStatus.isSuperUser,
        userRecords = useUserRecords(),
        // router data
        { pathname } = location,
        homepath = '/workspace',
        isHome = (pathname === '/' || pathname.substring(0,homepath.length) === homepath),
        // workspace data
        workspaceSelection = useWorkspaceSelection(),
        [workspaceList,setWorkspaceList] = useState([]), // empty array to avoid menu processing error
        [workspaceMenuList, setWorkspaceMenuList] = useState(null),
        // toolbar resources
        currentHomeIcon = 
            isHome
            ? homeFillIcon
            : homeIcon,
        [writeDialogState, setWriteDialogState] = useState({open:false, action:null}),
        [deleteDialogState, setDialogDeleteState] = useState(false)

    // --------------------- navigation functions ------------------
    const 
        goHome = () => { navigate('/workspace') },
        gotoNotifications = () => { navigate('/workspace/notifications') },
        gotoMessages = () => { navigate('/workspace/messages') },
        gotoChatrooms = () => { navigate('/workspace/chatrooms') },
        gotoNewsflows = () => { navigate('/workspace/newsflows') },
        gotoSysadmin = () => { navigate('/sysadmin') },
        gotoAbout = () => { navigate('/about') },
        gotoNotices = () => { navigate('/notices') },
        gotoClassifieds = () => { navigate('/classifieds') },
        gotoAccount = () => { navigate('/account') },
        gotoDomains = () => { navigate('/account/domains') },
        gotoMemberships = () => { navigate('/account/memberships') },
        gotoSubscriptions = () => { navigate('/account/subscriptions') },
        logOut = () => {
            signOut(auth).then(() => {
              // console.log('Sign-out successful.')
            }).catch((error) => {
                // console.log('signout error', error)
              // An error happened.
            })
        }

    // initialize
    useEffect(()=>{
        getWorkspaceList()
    },[workspaceSelection])

    const workboxesmenulist = useMemo(() => {
       return <MenuList>
                <MenuItem isDisabled onClick = {gotoClassifieds} >Classifieds&nbsp;<span style = {{fontStyle:'italic'}}>[pending]</span></MenuItem>
                <MenuDivider />
                <MenuItem onClick = {gotoNotices}>General notices</MenuItem>
                <MenuItem onClick = {gotoAbout}>About</MenuItem>
            </MenuList>
    },[])

    const currentusermenulist = useMemo(() => {

        return <MenuList>
            <MenuItem >User preferences</MenuItem>
            <MenuItem onClick = {gotoAccount}>Account settings</MenuItem>
            <MenuItem onClick = {gotoDomains}>Domain settings</MenuItem>
            <MenuDivider />
            <MenuItem onClick = {gotoMemberships}>Memberships</MenuItem>
            <MenuItem onClick = {gotoSubscriptions}>Subscriptions</MenuItem>
            <MenuDivider />
            <MenuItem onClick = {logOut}>Sign out</MenuItem>
        </MenuList>

    },[])

    async function getWorkspaceList() {
        const workingWorkspaceList = []
        const q = query(collection(db, 'users', userRecords.user.profile.user.id, 'workspaces'), orderBy('profile.workspace.name'))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            workingWorkspaceList.push(data.profile.workspace)
        })
        setWorkspaceList(workingWorkspaceList)
    }

    const renameWorkspace = () => {
        setWriteDialogState({open:true, action:'changename'})
    }

    const createWorkspace = () => {
        setWriteDialogState({open:true, action:'createworkspace'})
    }

    const workspacemenuList = useMemo(() => {

        // if (workspacesMenu.length === 0) return null
        const defaultValue = workspaceSelection.id

        // key is set for MenuOptionGroup to brute force sync with changed MenuItemOption children set
        return <MenuList>
            <MenuItem onClick = {renameWorkspace} >Rename this workspace</MenuItem>
            <MenuItem onClick = {createWorkspace} >Add a workspace</MenuItem>
            <MenuItem >Delete a workspace</MenuItem>
            <MenuOptionGroup key = {workspaceMenuIteration++} defaultValue = {defaultValue} fontSize = 'medium' fontStyle = 'italic' title = 'Select a workspace:'>
                {
                    workspaceList.map((item) => {
                        return <MenuItemOption key = {item.id} value = {item.id}>{item.name}</MenuItemOption>
                    })
                }
            </MenuOptionGroup>
            <MenuDivider />
        </MenuList>

    },[workspaceList, workspaceSelection])

// <StandardIcon icon = {messageIcon} caption = 'direct' tooltip = 'Direct messages' response = {gotoMessages} />
// <StandardIcon icon = {chatIcon} caption = 'chats' tooltip = 'Chatrooms with this account' response = {gotoChatrooms} />
// <StandardIcon icon  = {subscriptionsIcon} caption = 'newsflows' tooltip = 'Subscribed news flows' response = {gotoNewsflows} />

    // render
    return <Box style = {standardToolbarStyles}>
        <MenuIcon icon = {fireIcon} caption = 'Workboxes' tooltip = 'Workboxes menu' menulist = {workboxesmenulist} />
        <ToolbarVerticalDivider />
        { isHome && <>
            <StandardIcon icon = {notificationsIcon} caption = 'alerts' tooltip = 'Notifications to this account' response = {gotoNotifications} />
            <ToolbarVerticalDivider />
            </>
        }
        <MenuControl 
            displayName = {userDisplayName} 
            icon = {userPhotoURL} 
            tooltip = 'Options for current user' 
            caption = 'user' 
            menulist = {currentusermenulist} 
        />
        { isHome && 
            <>
                <ToolbarVerticalDivider />
                <MenuControl 
                    icon = {workspacesIcon} 
                    displayName = {workspaceSelection.name} 
                    tooltip = 'select a workspace'
                    caption = 'workspace'
                    menulist = {workspacemenuList} 
                />
                <StandardIcon icon = {isMobile?mobileIcon:desktopIcon} caption = {isMobile?'mobile':'desktop'} tooltip = 'some settings may be adapted to device' />
            </>
        } 
        <ToolbarVerticalDivider />
        {!isHome && <StandardIcon icon = {currentHomeIcon} caption = 'home' tooltip = 'Go to the main workspace' response = {goHome} />}
        {isSuperUser && <>
                <StandardIcon icon = {appSettingsIcon} caption = 'system' tooltip = 'System settings' response = {gotoSysadmin} />
                <ToolbarVerticalDivider />
            </>
        }
        <LearnIcon tooltip = 'Explain this toolbar'/>
        <ToolbarVerticalDivider />
        <StandardIcon icon = {hideIcon} iconStyles = {{transform:'rotate(0deg)'}} caption = 'hide' tooltip = 'hide toolbar'/>
        <span>&nbsp;&nbsp;</span>
        {writeDialogState.open && <WorkspaceWriteDialog dialogState = {writeDialogState} setWriteDialogState = {setWriteDialogState}/>}
    </Box>
}

// <ToolbarVerticalDivider />
// <StandardIcon icon = {moreVerticalIcon} caption = 'more' tooltip = 'More workspace options' />

export default StandardToolbar

// ===================================[ WORKSPACE WRITE DIALOG ]===================================

const WorkspaceWriteDialog = (props) => {

    const 
        { action, dialogState, setWriteDialogState } = props,
        dialogStateRef = useRef(null),
        systemRecords = useSystemRecords(),
        userRecords = useUserRecords(),
        db = useFirestore(),
        maxNameLength = systemRecords.settings.constraints.input.workspaceNameLength_max,
        minNameLength = systemRecords.settings.constraints.input.workspaceNameLength_min,
        cancelRef = useRef(null),
        [writeValues, setWriteValues] = useState({name:null}),
        writeIsInvalidFieldFlagsRef = useRef({
            name: false,
        }),
        newInvocationRef = useRef(true),
        workspaceSelection = useWorkspaceSelection(),
        [alertState, setAlertState] = useState('ready'),
        writeIsInvalidFieldFlags = writeIsInvalidFieldFlagsRef.current

    dialogStateRef.current = dialogState

    useEffect(()=>{
        if (newInvocationRef.current) {
            (dialogStateRef.current.action == 'changename')
                ? setWriteValues({name:workspaceSelection.name})
                : setWriteValues({name:''})
            if (dialogStateRef.current.action == 'createworkspace') {
                writeIsInvalidTests.name('')
            }
            newInvocationRef.current = false
        }
    },[newInvocationRef.current, workspaceSelection])


    const writeHelperText = {
        name:`The workspace name can be ${minNameLength}-${maxNameLength} characters long.`,
    }

    const writeErrorMessages = {
        name:`The name can only be ${minNameLength} to ${maxNameLength} characters.`,
    }

    const onWriteChangeFunctions = {
        name:(event) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            writeIsInvalidTests.name(value)
            writeValues.name = value
            setWriteValues({...writeValues})
        },
    }

    const writeIsInvalidTests = {
        name: (value) => {
            let isInvalid = false
            if (value.length > maxNameLength || value.length < minNameLength) {
                isInvalid = true
            }
            writeIsInvalidFieldFlags.name = isInvalid
            return isInvalid
        },        
    }

    async function doSaveWrite() {
        if (writeIsInvalidFieldFlags.name) {
            alert('Please correct errors before saving')
            return
        }
        setAlertState('processing')
        // changename user workspace data
        const 
            userRecord = userRecords.user,
            userDocRef = doc(collection(db, 'users'), userRecord.profile.user.id),
            workspaceID = workspaceSelection.id,
            workspaceDocRef = doc(collection(db, 'users',userRecord.profile.user.id, 'workspaces'), workspaceID),
            updateBlock = {}

        let fieldsToUpdateCount = 0

        if (workspaceID == userRecord.workspace.mobile.id) {
            updateBlock['workspace.mobile.name'] = writeValues.name
            fieldsToUpdateCount++
        }
        if (workspaceID == userRecord.workspace.desktop.id) {
            updateBlock['workspace.desktop.name'] = writeValues.name
            fieldsToUpdateCount++
        }
        if (fieldsToUpdateCount) {
            await updateDoc(userDocRef,updateBlock)
        }
        await updateDoc(workspaceDocRef, {
            'profile.workspace.name':writeValues.name
        })
        // changename workspaceSelection
        const { setWorkspaceSelection } = workspaceSelection
        setWorkspaceSelection((previousState) => {
            previousState.name = writeValues.name
            return {...previousState}
        })

        doClose()

    }

    async function doCreateWorkspace() {
        if (writeIsInvalidFieldFlags.name) {
            alert('Please correct errors before saving')
            return
        }
        setAlertState('processing')
        // changename user workspace data
        const 
            userRecord = userRecords.user,
            userDocRef = doc(collection(db, 'users'), userRecord.profile.user.id),
            newWorkspaceDocRef = doc(collection(db, 'users',userRecord.profile.user.id, 'workspaces')),
            newWorkspaceRecord = updateDocumentSchema('workspaces','standard',{},{
                    profile: {
                        workspace:{
                            name: writeValues.name,
                            id: newWorkspaceDocRef.id,
                        },
                        device: {
                            name:isMobile?'mobile':'desktop',
                        },
                        owner: {
                            id: userRecord.profile.user.id,
                            name: userRecord.profile.user.name,
                        },
                        commits: {
                            created_by: {
                                id: userRecord.profile.user.id,
                                name: userRecord.profile.user.name,
                            },
                            created_timestamp: serverTimestamp(),
                        },
                    }
                })

        await setDoc(newWorkspaceDocRef, newWorkspaceRecord)

        let updateBlock
        if (isMobile) {
            updateBlock = {
                'workspace.mobile.id':newWorkspaceDocRef.id,
                'workspace.mobile.name':writeValues.name
            }
        } else {
            updateBlock = {
                'workspace.desktop.id':newWorkspaceDocRef.id,
                'workspace.desktop.name':writeValues.name
            }
        }

        await updateDoc(userDocRef, updateBlock)
        // changename workspaceSelection
        const { setWorkspaceSelection } = workspaceSelection
        setWorkspaceSelection((previousState) => {
            previousState.name = writeValues.name
            previousState.id = newWorkspaceDocRef.id
            return {...previousState}
        })

        doClose()

    }

    const doClose = () => {
        newInvocationRef.current = true
        setWriteDialogState((previousState)=>{
            previousState.open = false
            return {...previousState}
        })
    }

    return (<>
        <AlertDialog
            isOpen={dialogState.open}
            leastDestructiveRef={cancelRef}
            onClose={doClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {dialogState.action == 'changename' && 'Change the name of the current workspace.'}
                        {dialogState.action == 'createworkspace' && 'Create a new workspace.'}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {alertState == 'processing' && <Text>Processing...</Text>}
                        <Box data-type = 'namefield' margin = '3px' padding = '3px'>
                            <FormControl isDisabled = {alertState == 'processing'} minWidth = '300px' maxWidth = '400px' isInvalid = {writeIsInvalidFieldFlags.name}>
                                <FormLabel fontSize = 'sm'>Workspace name:</FormLabel>
                                <Input 
                                    value = {writeValues.name || ''} 
                                    size = 'sm'
                                    onChange = {onWriteChangeFunctions.name}
                                >
                                </Input>
                                <FormErrorMessage>
                                    {writeErrorMessages.name} Current length is {writeValues.name?.length || '0 (blank)'}.
                                </FormErrorMessage>
                                <FormHelperText fontSize = 'xs' fontStyle = 'italic' >
                                    {writeHelperText.name} Current length is {writeValues.name?.length || '0 (blank)'}.
                                </FormHelperText>
                            </FormControl>
                        </Box>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button isDisabled = {alertState == 'processing'} ref={cancelRef} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {alertState == 'processing'} ml = '8px' colorScheme = 'blue'
                            onClick = {dialogState.action == 'changename'? doSaveWrite:doCreateWorkspace}
                        >
                          {dialogState.action == 'changename'?'Save':'Create'}
                        </Button>
                    </AlertDialogFooter>


                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}
