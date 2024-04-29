// Toolbar_Standard.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useMemo, CSSProperties, useRef, useState, useEffect} from 'react'
import { signOut } from "firebase/auth"
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Button,
    Menu, MenuButton, MenuList, MenuItem, MenuDivider, MenuGroup, MenuItemOption, MenuOptionGroup,
    Tooltip, Box,
    useDisclosure,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    FormControl, FormLabel, FormErrorMessage, FormHelperText,
} from '@chakra-ui/react'

import { useUserAuthData, useUserRecords, useAuth, useFirestore, useWorkspaceSelection } from '../../system/WorkboxesProvider'

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
        [dialogWriteState, setWriteDialogState] = useState(false),
        [dialogDeleteState, setDialogDeleteState] = useState(false)

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
    },[])

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
        setWriteDialogState(true)
    }

    const workspacemenuList = useMemo(() => {

        // if (workspacesMenu.length === 0) return null
        const defaultValue = workspaceSelection.id

        // key is set for MenuOptionGroup to brute force sync with changed MenuItemOption children set
        return <MenuList>
            <MenuItem onClick = {renameWorkspace} >Rename this workspace</MenuItem>
            <MenuItem >Add a workspace</MenuItem>
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
        <WorkspaceDialog doOpen = {dialogWriteState} setWriteDialogState = {setWriteDialogState}/>
    </Box>
}

// <ToolbarVerticalDivider />
// <StandardIcon icon = {moreVerticalIcon} caption = 'more' tooltip = 'More workspace options' />

export default StandardToolbar


            //             {((alertState != 'processing') && (alertState != 'failure') && !isInvalidState) && 
            //                 `Are you sure? The user handle @${editValues.handle} can't be changed afterwards.`}
            //             {isInvalidState && 'Error(s) found! Please go back and fix errors before saving.'}
            //             {(alertState == 'processing') && 'Processing...'}
            //             {(alertState == 'failure') && 'Save handle failed. Try a different handle.'}

                    // <AlertDialogFooter>
                    //     <Button ref={cancelRef} 
                    //         onClick={closeAlert} 
                    //         colorScheme = {(!isInvalidState && (alertState != 'failure'))?'gray':'blue'}
                    //         isDisabled = {alertState == 'processing'}
                    //     >
                    //         {!isInvalidState && !(alertState == 'failure') && 'Cancel'}
                    //         {(isInvalidState || (alertState == 'failure')) && 'OK'}
                    //     </Button>
                    //     {!isInvalidState && !(alertState == 'failure') && <Button 
                    //         colorScheme='blue' 
                    //         onClick={saveHandle} ml={3}
                    //         isDisabled = {alertState == 'processing'}
                    //     >
                    //         Save
                    //     </Button>}
                    // </AlertDialogFooter>

const WorkspaceDialog = (props) => {

    const 
        { doOpen, setWriteDialogState } = props,
        { isOpen, onOpen, onClose } = useDisclosure(),
        cancelRef = useRef(null)

    const doClose = () => {
        setWriteDialogState(false)
    }

    return (<>
        <AlertDialog
            isOpen={doOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Save User Handle (and related identity information)
                    </AlertDialogHeader>

                    <AlertDialogBody>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} 
                            onClick = {doClose}
                        >
                          Button
                        </Button>
                    </AlertDialogFooter>


                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}



