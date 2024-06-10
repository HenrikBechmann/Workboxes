// PanelReorderDialog.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

import React, {useRef, useState, useMemo} from 'react'

import {
    Button, Text, Box,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
    useToast,
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import Scroller from 'react-infinite-grid-scroller'

import { useWorkspaceHandler } from '../../system/WorkboxesProvider'

import { isMobile } from '../../index'

const PanelListItem = (props) => {
    const { panelProfile, scrollerContext } = props

    const isDnd = scrollerContext?.scroller.current.dndEnabled

    const float = useMemo(() => {
      return <div 
        style = {{float:'left', height: '28px', width:'34px'}} 
        data-type = 'dnd-float'
      />
    },[])

    return <>{isDnd && float}<div style= {{borderTop:'1px solid goldenrod', height:'100%'}}>
                {panelProfile.panel.name + (panelProfile.flags.is_default?'*':'')}
            </div></>
}

const PanelReorderDialog = (props) => {

    const
        { setPanelReorderDialogState } = props,
        [workspaceHandler, dispatchWorkspaceHandler] = useWorkspaceHandler(),
        { panelCount, panelRecords } = workspaceHandler,
        cancelRef = useRef(null),
        [alertState, setAlertState] = useState('ready'),
        toast = useToast({duration:4000}),
        navigate = useNavigate()

    const doClose = () => {
        setPanelReorderDialogState(false)
    }

    const dragDropTransferCallback = (fromScrollerID, fromIndexID, toScrollerID, toIndexID, context) => {
        console.log('fromScrollerID, fromIndexID, toScrollerID, toIndexID, context\n', 
            fromScrollerID, fromIndexID, toScrollerID, toIndexID, context)
    }


    async function doPanelReorder () {

        // const result = await workspaceHandler.panelReset(workspaceHandler.panelSelection)

        // if (result.error) {
        //     navigate('/error')
        //     return
        // }

        // toast({description:result.notice})
        
        dispatchWorkspaceHandler('reorderpanel')
        doClose()
    }

    const getItemPack = (index, itemID, context) => {

        const panelProfile = panelRecords[index].profile
        return {
            component:<PanelListItem panelProfile = {panelProfile} scrollerContext = {null}/>,
            profile:{id:panelProfile.panel.id, name:panelProfile.panel.name, index},
            dndOptions:{type:'panel', dragText:panelProfile.panel.name + (panelProfile.flags.is_default?'*':'')}
        }

    }

    return (<>
        <AlertDialog
            isOpen={true}
            leastDestructiveRef={cancelRef}
            onClose={doClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent height = 'calc(100vh - 55px)' mt = '45px'>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Drag and drop to re-order the panels
                    </AlertDialogHeader>

                    <AlertDialogBody fontSize = 'sm' height = '100%'>
                        <Box position = 'relative' height = '100%' border = '1px solid silver'>
                        <Scroller 
                            callbacks = {{dragDropTransferCallback}}
                            dndOptions = {{accept:['panel']}}
                            profile = {{description:'re-order panels scroller'}}
                            cellHeight = { 26 }
                            cellWidth = { 250 }
                            padding = {10}
                            gap = {10}
                            startingListRange = { [0,panelCount - 1] }
                            getItemPack = { getItemPack }
                            cache = 'preload'
                        />
                        </Box>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button mr = '10px' isDisabled = {alertState == 'processing'} ref={cancelRef} 
                            onClick = {doClose}
                        >
                          Cancel
                        </Button>
                        <Button isDisabled = {alertState == 'processing'} colorScheme = 'blue'
                            onClick = {doPanelReorder}
                        >
                          Apply
                        </Button>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default PanelReorderDialog
