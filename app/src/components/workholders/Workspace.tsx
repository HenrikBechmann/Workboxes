// Workspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*

    Workspace holds a collection of workpanels. Its data is held in memory during the session
    so as not to interfere with multiple tabs or devices with the same login.
    But its data is saved when workspace is changed

*/

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'

import { useNavigate } from 'react-router-dom'

import { 
    doc, collection, 
    query, where, getDocs, orderBy, 
    getDoc, setDoc, updateDoc, deleteDoc, 
    increment, serverTimestamp,
    writeBatch,
} from 'firebase/firestore'

import {
    Box,
    Grid, GridItem 
} from '@chakra-ui/react'

import Scroller from 'react-infinite-grid-scroller'

import '../../system/panel-variables.css'

import { updateDocumentSchema } from '../../system/utilities'

import { useUserAuthData, useFirestore, useUserRecords, useErrorControl, useUsage,
    useWorkspaceHandler } from '../../system/WorkboxesProvider'
import ToolbarFrame from '../toolbars/Toolbar_Frame'
import WorkspaceToolbar from '../toolbars/Toolbar_Workspace'
import Workpanel from './Workpanel'

import collectionIcon from '../../../assets/shelves.png'
import notebookIcon from '../../../assets/notebook.png'
import checklistIcon from '../../../assets/checklist.png'
import homeIcon from '../../../assets/home.png'

const defaultWorkboxState = {
    settingsShow:false,
    settingsDisabled:false,
    documentShow:true,
    documentDisabled:false,
    databoxShow:true,
    databoxDisabled:false,
}

const defaultDocumentState = {
    mode:'view',
}

const defaultDataboxState = {

}

const Workspace = (props) => {

    const 
        { panelDataRef } = props,
        [workspaceHandler, dispatchWorkspaceHandler, workspacePayload] = useWorkspaceHandler(),
        workspaceData = workspaceHandler.workspaceRecord,
        [workspaceState,setWorkspaceState] = useState('setup'),
        [panelSelectionNumber, setPanelSelectionNumber] = useState(null),
        // [panelList, setPanelList] = useState(null),
        userAuthData = useUserAuthData(),
        { displayName, photoURL } = userAuthData.authUser,
        panelComponentListRef = useRef(null),
        panelRecordListRef = useRef(null),
        workboxMapRef = useRef(null),
        workboxGatewayMapRef = useRef(null),
        workspaceElementRef = useRef(null),
        db = useFirestore(),
        userRecords = useUserRecords(),
        errorControl = useErrorControl(),
        navigate = useNavigate(),
        usage = useUsage()

    panelDataRef.current = panelRecordListRef.current // available to Main for save on exit

    async function getPanels() {

        // console.log('running getPanels')

        const panelRecordList = []
        const panelComponentList = []

        const dbPanelCollection = 
            collection(
                db, 
                'users', userRecords.user.profile.user.id, 
                'workspaces', workspaceData.profile.workspace.id,
                'panels'
            )

        const q = query( dbPanelCollection )
        let querySnapshot
        try {
            querySnapshot = await getDocs(q)
        } catch (error) {
            console.log('error getting panel list from workspace setup', error)
            errorControl.push({description:'error getting panel list from workspace setup', error})
            navigate('/error')
            return
        }
        usage.read(querySnapshot.size)
        querySnapshot.forEach((dbdoc) => {
            const data = dbdoc.data()
            panelRecordList.push(data)
        })

        if (panelRecordList.length) {
            const batch = writeBatch(db)
            // temporary, to allow for use of await
            panelRecordList.sort((a, b)=>{
                return a.profile.display_order - b.profile.display_order // best attempt to sort
            })

            // update versions
            let writes = 0
            for (let index = 0; index < panelRecordList.length; index++) {
                const data = panelRecordList[index]
                data.profile.display_order = index // assert contiguous order
                const updatedData = updateDocumentSchema('panels','standard',data)
                if (!Object.is(data, updatedData)) {
                    const dbDocRef = doc(dbPanelCollection, updatedData.profile.panel.id)
                    batch.set(dbDocRef, updatedData)
                    panelRecordList[index] = updatedData
                    writes++
                }
            }

            try {
                await batch.commit()
            } catch (error) {

                console.log('error updating panels list in workspace setup', error)
                errorControl.push({description:'error updating panels list in workspace setup', error})
                navigate('/error')
                return

            }
            usage.write(writes)
        }
        if (panelRecordList.length === 0) { // create a panel
            const dbNewPanelDocRef = doc(dbPanelCollection)
            const newPanelData = updateDocumentSchema('panels','standard',{},
                {
                  profile: {
                    panel:{
                      name: 'Default panel',
                      id: dbNewPanelDocRef.id,
                    },
                    display_order: 0,
                    owner: {
                      id: userRecords.user.profile.user.id,
                      name: userRecords.user.profile.user.name,
                    },
                    commits: {
                      created_by: {
                          id: userRecords.user.profile.user.id,
                          name: userRecords.user.profile.user.name,
                      },
                      created_timestamp: serverTimestamp(),
                      updated_by: {
                          id: userRecords.user.profile.user.id,
                          name: userRecords.user.profile.user.name,
                      },
                      updated_timestamp: serverTimestamp(),
                    },
                    flags: {
                      is_default: true,
                    }
                  },
                }
            )
            try {
                // TODO update workspace list of panels
                await setDoc(dbNewPanelDocRef,newPanelData)
            } catch (error) {
                console.log('error adding new panel in workspace setup', error)
                errorControl.push({description:'error adding new panel in workspace setup', error})
                navigate('/error')
                return                
            }
            usage.create(1)
            panelRecordList.push(newPanelData)
            workspaceData.panel = newPanelData.profile.panel
        }
        // generate panel components, sorted by display_order, ascending

        const selectedID = workspaceData.panel.id
        let selectedIndex, defaultIndex
        for (let index = 0; index < panelRecordList.length; index++) {

            const panelData = panelRecordList[index]

            if (selectedID && selectedID == panelData.profile.panel.id) {
                selectedIndex = index
            }

            if (panelData.profile.flags.is_default) {
                defaultIndex = index
            }

            panelComponentList.push(
                <Workpanel 
                    key = {panelData.profile.panel.id} 
                    panelData = {panelData}
                    startingWindowsSpecsList = {null} 
                    workboxMapRef = {workboxMapRef}
                    workboxGatewayMapRef = {workboxGatewayMapRef}
                    panelNumber = {index}
                />
            )

        }

        // otherwise, set the default as the current panel

        panelComponentListRef.current = panelComponentList

        panelRecordListRef.current = panelRecordList

        // console.log('initialized panelRecordList, workspaceData',panelRecordList, workspaceData)

        if (selectedIndex !== undefined) {
            setPanelSelectionNumber(selectedIndex)            
        } else if (defaultIndex !== undefined) {
            const defaultData = panelRecordList[defaultIndex]
            workspaceData.panel = {id:defaultData.profile.panel.id , name: defaultData.profile.panel.name}
            setPanelSelectionNumber(defaultIndex)
        } else {
            // TODO error, no default found
        }

    }

    // set up panels
    useEffect(()=>{

        if (workspaceHandler.flags.new_workspace) {
            workspaceHandler.flags.new_workspace = false
            getPanels()  
        } 

        // return 
        // // TODO placeholder logic

        // workboxMapRef.current = new Map()
        // workboxGatewayMapRef.current = new Map()

        // const panelWindowsSpecs = [

        //     {
        //         window:{
        //             zOrder: 1,
        //             configDefaults: {top:20,left:20, width:610,height:400},
        //             view: 'normalized',
        //         },
        //         workbox: {
        //             defaultWorkboxState:{...defaultWorkboxState},
        //             defaultDocumentState: {...defaultDocumentState},
        //             defaultDataboxState: {...defaultDataboxState},
        //             itemTitle: "Base Workbox",
        //             itemIcon: homeIcon,
        //             domainTitle: displayName,
        //             domainIcon: photoURL,
        //             typeName: 'Collection',
        //             type:'Collection',
        //             id:null,
        //         }
        //     },
        //     {
        //         window:{
        //             zOrder: 2,
        //             configDefaults: {top:40,left:40, width:610,height:400},
        //             view: 'normalized',
        //         },
        //         workbox: {
        //             defaultWorkboxState:{...defaultWorkboxState},
        //             defaultDocumentState: {...defaultDocumentState},
        //             defaultDataboxState: {...defaultDataboxState},
        //             itemTitle: 'Notebooks',
        //             itemIcon: notebookIcon,
        //             domainTitle: displayName,
        //             domainIcon: photoURL,
        //             typeName: 'Collection',
        //             type:'Collection',
        //             id:null,
        //         }
        //     },
        //     {
        //         window:{
        //             zOrder: 3,
        //             configDefaults: {top:60,left:60, width:610,height:400},
        //             view: 'normalized',
        //         },
        //         workbox: {
        //             defaultWorkboxState:{...defaultWorkboxState},
        //             defaultDocumentState: {...defaultDocumentState},
        //             defaultDataboxState: {...defaultDataboxState},
        //             itemTitle: 'Checklists',
        //             itemIcon: checklistIcon,
        //             domainTitle: displayName,
        //             domainIcon: photoURL,
        //             typeName: 'Collection',
        //             type:'Collection',
        //             id:null,
        //         }
        //     },

    },[workspacePayload])

    const resizeCallback = useCallback((entries)=>{

        const width = entries[0].contentRect.width
        document.documentElement.style.setProperty('--wb_panel_width',width + 'px')

    },[])

    useEffect(()=>{

        document.documentElement.style.setProperty('--wb_panel_selection',(-panelSelectionNumber).toString())

    },[panelSelectionNumber])

    useEffect(()=>{
        const observer = new ResizeObserver(resizeCallback)
        observer.observe(workspaceElementRef.current)
        return () => {
            observer.disconnect()
        }
    },[])

    useEffect(()=>{

        if (workspaceState != 'ready') setWorkspaceState('ready')

    },[workspaceState])

    const workspaceComponent = <Grid 
          date-type = 'workspace'
          height = '100%'
          gridTemplateAreas={`"body"
                          "footer"`}
          gridTemplateRows={'1fr auto'}
          gridTemplateColumns={'1fr'}
        >
        <GridItem data-type = 'workspace-body' area={'body'} position = 'relative'>
            <Box id = 'wb-panelframe' data-type = 'panel-frame' position = 'absolute' inset = {0}>
                <Box data-type = 'panel-scroller' height = '100%' display = 'inline-flex' minWidth = {0}
                transform = 'translate(var(--wb_panel_offset), 0px)' transition = 'transform 0.75s ease'>
                {(workspaceState != 'setup') && panelComponentListRef.current}
                </Box>
            </Box>
        </GridItem>
        <GridItem data-type = 'workspace-footer' area = 'footer'>
            <Box borderTop = '1px solid lightgray' width = '100%' >
                <ToolbarFrame>
                    <WorkspaceToolbar panelSelectionNumber = {panelSelectionNumber} setPanelSelectionNumber = {setPanelSelectionNumber} workspaceData = {workspaceData}/>
                </ToolbarFrame>
            </Box>
        </GridItem>
    </Grid>

    // workspace-container to get workspaceElementRef

    return <Box ref = {workspaceElementRef} data-type = 'workspace-container' position = 'absolute' inset = {0}>
        <Scroller layout = 'static' staticComponent = {workspaceComponent}></Scroller>
    </Box>
} 

export default Workspace
