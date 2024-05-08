// Workspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*

    Workspace holds a collection of workpanels. Its entire confiuratoin is saved to the device database (and optionally to the 
    cloud database)

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

import { useUserAuthData, useFirestore, useUserRecords, useErrorControl } from '../../system/WorkboxesProvider'
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
        { workspaceData } = props,
        [workspaceState,setWorkspaceState] = useState('setup'),
        [panelSelectionNumber, setPanelSelectionNumber] = useState(null),
        // [panelList, setPanelList] = useState(null),
        userAuthData = useUserAuthData(),
        { displayName, photoURL } = userAuthData.authUser,
        panelComponentsRef = useRef([]),
        panelRecordsMapRef = useRef(null),
        workboxMapRef = useRef(null),
        workboxGatewayMapRef = useRef(null),
        workspaceElementRef = useRef(null),
        db = useFirestore(),
        userRecords = useUserRecords(),
        errorControl = useErrorControl(),
        navigate = useNavigate()

    // workspaceData.profile.counts.panels = 5

    console.log('workspaceData', workspaceData)

    async function getPanels() {

        console.log('running getPanels')

        const panelRecordsMap = panelRecordsMapRef.current = new Map()

        const dbPanelCollection = 
            collection(
                db, 
                'users', userRecords.user.profile.user.id, 
                'workspaces', workspaceData.profile.workspace.id,
                'panels'
            )

        const q = query(
            dbPanelCollection
        )
        let querySnapshot
        try {
            querySnapshot = await getDocs(q)
        } catch (error) {
            console.log('error getting panel list from workspace setup', error)
            errorControl.push({description:'error getting panel list from workspace setup', error})
            navigate('/error')
            return
        }
        querySnapshot.forEach((dbdoc) => {
            const data = dbdoc.data()
            panelRecordsMap.set(data.profile.panel.id, data)
        })

        if (panelRecordsMap.size) {
            const batch = writeBatch(db)
            // temporary, to allow for use of await
            let panelRecordsList = Array.from(panelRecordsMap).map(([id, data]) => {return {id, data}}) 

            // update versions
            for (let index = 0; index < panelRecordsList.length; index++) {
                const dataObject = panelRecordsList[index]
                const updatedData = updateDocumentSchema('panels','standard',dataObject.data)
                if (!Object.is(dataObject.data, updatedData)) {
                    const dbDocRef = doc(dbPanelCollection, updatedData.profile.panel.id)
                    batch.set(dbDocRef, updatedData)
                    panelRecordsMap.set(dataObject.id, dataObject.data)
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

            panelRecordsList = undefined

        }

        if (panelRecordsMap.size === 0) { // create a panel
            const dbNewDocRef = doc(dbPanelCollection)
            const newPanelData = updateDocumentSchema('panels','standard',{},
                {
                  profile: {
                    panel:{
                      name: 'Default panel',
                      id: dbNewDocRef.id,
                    },
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
            // console.log('newPanelData', newPanelData)
            try {
            await setDoc(dbNewDocRef,newPanelData)
            } catch (error) {
                console.log('error adding new panel in workspace setup', error)
                errorControl.push({description:'error adding new panel in workspace setup', error})
                navigate('/error')
                return                
            }
            panelRecordsMap.set(dbNewDocRef.id, newPanelData)
            workspaceData.panel = newPanelData.profile.panel
        }

        // generate panel components, sorted by display_order, ascending

        // set current panel

        // match workspace panel id to one of the panels


        // otherwise, set the default as the current panel

        console.log('initialized panelRecordsMap, workspaceData',panelRecordsMap, workspaceData)

        setWorkspaceState('initialized')

    }

    // set up panels
    useEffect(()=>{

        getPanels()

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

        // ]
        // panelComponentsRef.current = [<Workpanel 
        //     key = {0} 
        //     startingWindowsSpecsList = {panelWindowsSpecs} 
        //     workboxMapRef = {workboxMapRef}
        //     workboxGatewayMapRef = {workboxGatewayMapRef}
        //     panelNumber = {0}
        // />,
        // <Workpanel 
        //     key = {1} 
        //     startingWindowsSpecsList = {panelWindowsSpecs} 
        //     workboxMapRef = {workboxMapRef}
        //     workboxGatewayMapRef = {workboxGatewayMapRef}
        //     panelNumber = {1}
        // />,
        // <Workpanel 
        //     key = {2} 
        //     startingWindowsSpecsList = {panelWindowsSpecs} 
        //     workboxMapRef = {workboxMapRef}
        //     workboxGatewayMapRef = {workboxGatewayMapRef}
        //     panelNumber = {2}
        // />,
        // <Workpanel 
        //     key = {3} 
        //     startingWindowsSpecsList = {panelWindowsSpecs} 
        //     workboxMapRef = {workboxMapRef}
        //     workboxGatewayMapRef = {workboxGatewayMapRef}
        //     panelNumber = {3}
        // />,
        // <Workpanel 
        //     key = {4} 
        //     startingWindowsSpecsList = {panelWindowsSpecs} 
        //     workboxMapRef = {workboxMapRef}
        //     workboxGatewayMapRef = {workboxGatewayMapRef}
        //     panelNumber = {4}
        // />,
        // ]

    },[])

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
                {(workspaceState != 'setup') && panelComponentsRef.current}
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