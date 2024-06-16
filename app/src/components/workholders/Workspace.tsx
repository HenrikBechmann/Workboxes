// Workspace.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*

    Workspace holds a collection of workpanels. Its data is held in memory during the session
    so as not to interfere with multiple tabs or devices with the same login.
    But its data is saved when workspace is changed

*/

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'

import { useNavigate } from 'react-router-dom'

import {
    Box,
    Grid, GridItem 
} from '@chakra-ui/react'

import {RigsDnd as Scroller} from 'react-infinite-grid-scroller'

import '../../system/panel-variables.css'

import { useWorkspaceHandler } from '../../system/WorkboxesProvider'

import ToolbarFrame from '../toolbars/Toolbar_Frame'
import WorkspaceToolbar from '../toolbars/Toolbar_Workspace'
import Workpanel from './Workpanel'

import collectionIcon from '../../../assets/shelves.png'
import notebookIcon from '../../../assets/notebook.png'
import checklistIcon from '../../../assets/checklist.png'
import homeIcon from '../../../assets/home.png'

const Workspace = (props) => {

    // data
    const 
        navigate = useNavigate(),

        // basics
        [workspaceState,setWorkspaceState] = useState('setup'),
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        { workspaceRecord, workspaceSelection } = workspaceHandler,
        [panelSelection, setPanelSelection] = useState({index:0,id:null, name:null}),

        // resources
        workspaceFrameElementRef = useRef(null), // for resizeObserver
        panelComponentListRef = useRef(null), // workspace children, viewd in workpanel scroller

        // centralized management of workbox resources
        workboxComponentMapRef = useRef(null),
        workboxHandlerMapRef = useRef(null),

        // required scroller property
        scrollerAcceptsRef = useRef({accept:[]}) //static, no anticipated direct child scrollers

    workspaceHandler.panelSelection = panelSelection // always up to date

    // ---------------------------[ state change effects ]------------------------

    // init resizeObserver
    useEffect(()=>{
        const observer = new ResizeObserver(resizeCallback)
        observer.observe(workspaceFrameElementRef.current)
        return () => {
            observer.disconnect()
        }
    },[])

    // init workbox resource repositiories
    useEffect(()=>{

        workboxComponentMapRef.current = new Map()
        workboxHandlerMapRef.current = new Map()
        workspaceHandler.setPanelSelection = setPanelSelection

    },[])

    // initialize panels list
    useEffect(()=>{

        if (workspaceHandler.flags.new_workspace_load) {
            workspaceHandler.flags.new_workspace_load = false
            loadPanels()
            setWorkspaceState('loading')
        } 

    },[workspaceHandler.flags.new_workspace_load])

    // handle scroller effects for panels
    useEffect(()=>{

        const is_set = panelSelection.index ?? false
        if (is_set === false) return

        updateWorkspacePanelSelection(panelSelection)

        document.documentElement.style.setProperty('--wb_panel_selection',(-(panelSelection.index)).toString())

    },[panelSelection])

    // -------------------[ operations ]----------------------
    
    async function updateWorkspacePanelSelection(panelSelection) {

        const panelRecord = workspaceHandler.panelRecords[panelSelection.index]

        if (!panelRecord) return

        const result = await workspaceHandler.updateWorkspacePanelSelection(
            panelRecord.profile.panel.id , panelRecord.profile.panel.name)

        if (result.error) {
            navigate('/error')
            return
        }

        dispatchWorkspaceHandler('updatepanel')

    }

    // --------------------------[ operations ]--------------------------
    const resizeCallback = useCallback((entries)=>{

        const element = entries[0].target
        const width = entries[0].contentRect.width
        document.documentElement.style.setProperty('--wb_panel_width',width + 'px')

        const panelDisplayElement = element.querySelector('#panel-display')
        if (!panelDisplayElement) return
        document.documentElement.style.setProperty('--wb_panel_display_height',(panelDisplayElement.offsetHeight - 10) + 'px')
        // console.log('panelDisplayElement', panelDisplayElement)

    },[])

    // fetch data for all panels, then create components for all panels
    // panel data and components are all kept in memory
    async function loadPanels() {

        const result = await workspaceHandler.loadPanels()

        if (result.error) {
            navigate('/error')
            return
        }

        const panelRecords = workspaceHandler.panelRecords
        panelComponentListRef.current = []

        // generate panel components, sorted by display_order, ascending
        const selectedPanelID = workspaceRecord.panel.id
        let selectedIndex, defaultIndex
        for (let index = 0; index < panelRecords.length; index++) {

            const panelRecord = panelRecords[index]
            const panelID = panelRecord.profile.panel.id

            // const panelSelector = {index, id:panelRecord.profile.panel.id, name:panelRecord.profile.panel.name}

            if (selectedPanelID && selectedPanelID == panelRecord.profile.panel.id) {
                selectedIndex = index
            }

            if (panelRecord.profile.flags.is_default) {
                defaultIndex = index
            }
            panelComponentListRef.current.push(
                <Workpanel 
                    key = {panelID} 
                    panelID = {panelID}
                    workboxComponentMapRef = {workboxComponentMapRef}
                    workboxHandlerMapRef = {workboxHandlerMapRef}
                />
            )

        }

        // otherwise, set the default as the current panel
        // TODO set and handle workspace changed
        const panelSelection = {index:null, id:null, name:null}
        if (selectedIndex !== undefined) {
            panelSelection.index = selectedIndex
        } else if (defaultIndex !== undefined) {
            panelSelection.index = defaultIndex
            const defaultRecord = panelRecords[defaultIndex]

            const result = await workspaceHandler.updateWorkspacePanelSelection(
                defaultRecord.profile.panel.id , defaultRecord.profile.panel.name)
            if (result.error) {
                navigate('/error')
                return
            }
        } else {
            const fallbackRecord = panelRecords[0]
            panelSelection.index = 0
            const result = await workspaceHandler.updateWorkspacePanelSelection(
                fallbackRecord.profile.panel.id , fallbackRecord.profile.panel.name)
            if (result.error) {
                navigate('/error')
                return
            }
        }

        const panelSelectionRecord = panelRecords[panelSelection.index]
        panelSelection.id = panelSelectionRecord.profile.panel.id
        panelSelection.name = panelSelectionRecord.profile.panel.name

        // console.log('setPanelSelection to', panelSelection)

        setPanelSelection(panelSelection)
        setWorkspaceState('ready')
        dispatchWorkspaceHandler()

    }

    // --------------------------[ render ]----------------------------
    // Scroller supports embeded scroll regions
    const workspaceComponent = useMemo(()=>{
        return <Grid 
          data-type = 'workspace'
          height = '100%'
          gridTemplateAreas={`"body"
                          "footer"`}
          gridTemplateRows={'1fr auto'}
          gridTemplateColumns={'1fr'}
          minWidth = '0'
        >
            <GridItem data-type = 'workspace-body' area={'body'} position = 'relative' minWidth = '0'>
                <Box id = 'wb-panelframe' data-type = 'panel-frame' position = 'absolute' inset = {0}>
                    <Box 
                        data-type = 'panel-scroller' height = '100%' display = 'inline-flex' minWidth = {0}
                        transform = 'translate(var(--wb_panel_offset), 0px)' transition = 'transform 0.75s ease'
                    >
                        {(workspaceState != 'setup') && panelComponentListRef.current}
                    </Box>
                 </Box>
            </GridItem>
            <GridItem data-type = 'workspace-footer' area = 'footer' minWidth = '0'>
                <Box borderTop = '1px solid lightgray' width = '100%' >
                    <ToolbarFrame>
                        {(workspaceState != 'setup') && 
                            <WorkspaceToolbar panelComponentListRef = {panelComponentListRef} />
                        }
                    </ToolbarFrame>
                </Box>
            </GridItem>
        </Grid>
    },[panelComponentListRef.current, panelSelection, workspaceState])

    // the scroller enables scrolling components throughout TODO s/b a provider
    return <Box ref = {workspaceFrameElementRef} data-type = 'workspace-container' position = 'absolute' inset = {0}>
        <Scroller 
            layout = 'static' 
            staticComponent = {workspaceComponent} 
            dndOptions = {scrollerAcceptsRef.current} />
    </Box>
} 

export default Workspace
