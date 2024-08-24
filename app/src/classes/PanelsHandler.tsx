// PanelHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/*

TODO:
    - standardize calls to saveWorkspaceData

*/

import { 
    doc, collection, 
    getDoc, setDoc, updateDoc, // deleteDoc
    query, where, orderBy, getDocs,
    arrayUnion, arrayRemove,
    increment, serverTimestamp, Timestamp,
    runTransaction, writeBatch,
} from 'firebase/firestore'

import { cloneDeep as _cloneDeep } from 'lodash'

import { updateDocumentSchema } from '../system/utilities'

import DomainRecordPublisher from './DomainRecordPublisher'

class PanelsHandler {

    constructor(workspaceHandler, db, errorControl) {
        this.workspaceHandler = workspaceHandler
        this.db = db
        this.errorControl = errorControl
    }

    workspaceHandler
    db
    errorControl
    // initialized from workboxesProvider
    usage
    userName
    userID

    // const panelControlData = {
    //     selector:{
    //         index,
    //         id:panelRecordID,
    //         name:panelRecord.profile.panel.name
    //     },
    //     functions:{ // repository for direct calls
    //         showDomainWorkbox:null, 
    //         showMemberWorkbox: null,
    //         updateDomainData: null,
    //         updateMemberData: null,
    //     },
    //     domain: panelRecord.profile.domain,
    // }


    async subscribeToDomainChanges(panelControlData) {
        const 
            { domainRecordPublishers } = this.workspaceHandler,
            domainID = panelControlData.domain.id,
            panelID = panelControlData.selector.id,
            panelHandler = this

        if (!domainRecordPublishers.has(domainID)) {
            // await // create a domainRecordPublisher
            const 
                workspaceID = this.workspaceHandler.workspaceRecord.profile.workspace.id,
                userID = this.userID
            domainRecordPublishers.set(domainID, new DomainRecordPublisher(panelID, workspaceID, userID, panelHandler))
        }

        const domainRecordPublisher = domainRecordPublishers.get(domainID)
        domainRecordPublisher.subscribe(panelID)
        
    }

    async unsubscribeFromDomainChanges(panelControlData) {
        const { domainRecordPublishers } = this.workspaceHandler
        const domainID = panelControlData.domain.id

        if (!domainRecordPublishers.has(domainID)) {
            return
        }

        const domainRecordPublisher = domainRecordPublishers.get(domainID)
        domainRecordPublisher.unSubscribe(panelControlData.selector.id)

    }

    async clearSubscriptionsToDomainChanges() {
        const { domainRecordPublishers } = this.workspaceHandler

        domainRecordPublishers.forEach((domainRecordPublisher) => {
            domainRecordPublisher.unSubscribeAll()
        })
    }

    async panelsLoadRecords() {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        const { panelRecords, panelControlMap} = this.workspaceHandler
        panelRecords.length = 0 // start over
        await this.clearSubscriptionsToDomainChanges()
        panelControlMap.clear()

        const 
            workspaceID = this.workspaceHandler.workspaceRecord.profile.workspace.id,
            dbPanelCollection = 
                collection( this.db, 'users', this.userID, 'workspaces', workspaceID, 'panels' ),
            querySpec = query( dbPanelCollection )

        let queryDocs
        try {
            queryDocs = await getDocs(querySpec)
        } catch (error) {
            const errdesc = 'error getting panel list from workspace setup'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            result.error = true
            return result
        }
        this.usage.read(queryDocs.size)
        this.workspaceHandler.panelCount = queryDocs.size
        queryDocs.forEach((dbdoc) => {
            const data = dbdoc.data()
            panelRecords.push(data)
        })

        if (panelRecords.length) {
            const batch = writeBatch(this.db)
            // temporary, to allow for use of await
            panelRecords.sort((a, b)=>{
                return a.profile.display_order - b.profile.display_order // best attempt to sort
            })

            // update versions
            let writes = 0
            for (let index = 0; index < panelRecords.length; index++) {
                const data = panelRecords[index]
                let changed = false
                if (data.profile.display_order !== index) {
                    changed = true
                    data.profile.display_order = index // assert contiguous order
                }
                const updatedData = updateDocumentSchema('panels','standard',data)
                if (!Object.is(data, updatedData) || changed) {
                    const dbDocRef = doc(dbPanelCollection, updatedData.profile.panel.id)
                    batch.set(dbDocRef, updatedData)
                    panelRecords[index] = updatedData
                    writes++
                }
                const panelRecord = panelRecords[index]
                const panelRecordID = panelRecord.profile.panel.id
                const panelControlData = {
                    selector:{
                        index,
                        id:panelRecordID,
                        name:panelRecord.profile.panel.name
                    },
                    functions:{ // repository for direct calls
                        showDomainWorkbox:null, 
                        showMemberWorkbox: null,
                        updateDomainData: null,
                        updateMemberData: null,
                    },
                    domain: panelRecord.profile.domain,
                }
                await this.subscribeToDomainChanges(panelControlData)
                panelControlMap.set(panelRecordID, panelControlData)
            }

            try {

                await batch.commit()

            } catch (error) {

                const errdesc = 'error updating panels list in workspace setup'
                console.log(errdesc, error)
                this.errorControl.push({description:errdesc, error})
                result.error = true
                return result

            }
            this.usage.write(writes)
        } else { // no panels found - create a panel
            const newPanelDocRef = doc(dbPanelCollection)
            const userRecord = this.workspaceHandler.userRecords.user
            const newPanelData = updateDocumentSchema('panels','standard',{},
                {
                  profile: {
                    panel:{
                      name: 'Default panel',
                      id: newPanelDocRef.id,
                    },
                    display_order: 0,
                    owner: {
                      id: this.userID,
                      name: this.userName,
                    },
                    domain: userRecord.profile.domain,
                    commits: {
                      created_by: {
                          id: this.userID,
                          name: this.userName,
                      },
                      created_timestamp: serverTimestamp(),
                      updated_by: {
                          id: this.userID,
                          name: this.userName,
                      },
                      updated_timestamp: serverTimestamp(),
                    },
                    flags: {
                      is_default: true,
                    }
                  },
                }
            )
            this.workspaceHandler.workspaceRecord.panel = {...newPanelData.profile.panel}
            const workspaceRef = doc(collection(this.db, 'users',this.userID, 'workspaces'), 
                    workspaceID)
            try {
                const batch = writeBatch(this.db)
                batch.set(newPanelDocRef,newPanelData)
                batch.set(workspaceRef, this.workspaceHandler.workspaceRecord)
                await batch.commit()
            } catch (error) {
                const errdesc = 'error adding new panel in workspace setup'
                console.log(errdesc, error)
                this.errorControl.push({description:errdesc, error})
                result.error = true
                return result
            }
            this.usage.create(1)
            panelRecords.push(newPanelData)
            const panelRecord = newPanelData
            const panelRecordID = panelRecord.profile.panel.id
            const panelControlData = {
                selector:{
                    index:0,
                    id:panelRecordID,
                    name:panelRecord.profile.panel.name
                },
                functions:{ // repository for direct calls
                    showDomainWorkbox:null, 
                    showMemberWorkbox: null,
                    updateDomainData: null,
                    updateMemberData: null,
                },
                domain:{
                    domainid:panelRecord.profile.domain
                },
            }
            await this.subscribeToDomainChanges(panelControlData)
            panelControlMap.set(panelRecordID, panelControlData)
        }

        return result
        
    }

    async panelsReorderRecords(newOrderList) {

        const result = {
            error: false,
            success: true,
            notice: null,
            // payload: null,
        }

        const { panelRecords, changedRecords, settings, panelControlMap } = this.workspaceHandler

        for (let index = 0; index < newOrderList.length; index++) {
            const changeData = newOrderList[index]
            const panelRecord = panelRecords[changeData.index]
            const panelID = panelRecord.profile.panel.id
            panelControlMap.get(panelID).selector.index = index
            if (panelRecord.profile.display_order !== index) {
                panelRecord.profile.display_order = index
                changedRecords.setpanels.add(panelRecord.profile.panel.id)
            }
        }
        settings.changed = true

        panelRecords.sort((a,b) =>{
            if (a.profile.display_order < b.profile.display_order) {
                return -1
            } else {
                return 1
            }
        })

        if (settings.mode == 'automatic') {
            const result = await this.workspaceHandler.saveWorkspaceData()
            if (result.error) {
                return result
            }
        }

        result.notice = 'panels have been re-ordered'

        return result

    }

    async panelCreateRecord(newname, domainSelection) {

        const result = {
            error: false,
            success: true,
            notice: null,
            payload: null,
        }
        const 
            { workspaceHandler } = this,
            { panelRecords, panelControlMap } = workspaceHandler,
            panelCollection = collection(
                this.db, 'users',this.userID, 
                'workspaces', workspaceHandler.workspaceRecord.profile.workspace.id,
                'panels'),
            newPanelDocRef = doc(panelCollection)

        const newPanelData = updateDocumentSchema('panels','standard',{},
            {
              profile: {
                panel:{
                  name: newname,
                  id: newPanelDocRef.id,
                },
                display_order: workspaceHandler.panelCount,
                domain: {
                    id:domainSelection.id,
                    name:domainSelection.name,
                },
                owner: {
                  id: this.userID,
                  name: this.userName,
                },
                commits: {
                  created_by: {
                      id: this.userID,
                      name: this.userName,
                  },
                  created_timestamp: Timestamp.now(),
                  updated_by: {
                      id: this.userID,
                      name: this.userName,
                  },
                  updated_timestamp: Timestamp.now(),
                },
              },
            }
        )

        const panelControlRecord = {
            selector:{
                id: newPanelDocRef.id,
                name: newname,
                index: workspaceHandler.panelCount,
            },
            functions:{},
            domain:newPanelData.profile.domain,
        }
        panelRecords.push(newPanelData)
        await this.subscribeToDomainChanges(panelControlRecord)
        panelControlMap.set(newPanelDocRef.id, panelControlRecord)
        workspaceHandler.panelCount++
        workspaceHandler.changedRecords.setpanels.add(newPanelDocRef.id)
        workspaceHandler.settings.changed = true

        if (workspaceHandler.settings.mode == 'automatic') {
            const result = await workspaceHandler.saveWorkspaceData()
            if (result.error) {
                return result
            }
        }

        const newPanelSelection = {
            index: workspaceHandler.panelCount - 1,
            id: newPanelDocRef.id,
            name: newname,
        }

        result.payload = newPanelSelection
        result.notice = `new panel [${newname}] has been created`

        return result

    }

    async panelDuplicateRecord(panelSelection, newname) {
        
        const result = {
            error: false,
            success: true,
            notice: null,
            payload:null
        }

        const 
            { workspaceHandler } = this,
            panelRef = doc(
                collection(this.db, 'users',this.userID, 'workspaces',workspaceHandler.workspaceRecord.profile.workspace.id, 'panels')),
            newPanelID = panelRef.id

        const 
            newPanelRecord = _cloneDeep(workspaceHandler.panelRecords[panelSelection.index]),
            oldPanelName = newPanelRecord.profile.panel.name,
            oldPanelID = newPanelRecord.profile.panel.id,
            newPanelControlRecord = _cloneDeep(workspaceHandler.panelControlMap.get(oldPanelID)),
            newPanelIndex = workspaceHandler.panelRecords.length - 1,
            { profile } = newPanelRecord

        newPanelControlRecord.selector.index = newPanelIndex
        newPanelControlRecord.selector.name = newname
        newPanelControlRecord.functions = {}
        newPanelControlRecord.domain = newPanelRecord.profile.domain
        await this.subscribeToDomainChanges(newPanelControlRecord)
        workspaceHandler.panelControlMap.set(newPanelID, newPanelControlRecord)

        profile.panel.id = newPanelID
        profile.panel.name = newname
        profile.display_order = newPanelIndex
        profile.owner = {id:this.userID, name: this.userName}
        profile.commits = {
          created_by: {
            id: this.userID, 
            name: this.userName
          },
          created_timestamp: Timestamp.now(),
          updated_by: {
            id: this.userID, 
            name: this.userName
          },
          updated_timestamp: Timestamp.now(),            
        }
        profile.flags.is_default = false

        workspaceHandler.panelRecords.push(newPanelRecord)
        workspaceHandler.panelCount++

        workspaceHandler.changedRecords.setpanels.add(newPanelID)
        workspaceHandler.settings.changed = true

        const notice = `[${oldPanelName}] has been duplicated as [${newname}]`
        if (workspaceHandler.settings.mode == 'automatic') {
            const result = await workspaceHandler.saveWorkspaceData()
            result.notice = notice
            result.payload = newPanelID
            return result
        }

        result.payload = newPanelID
        result.notice = notice
        return result

    }

    async panelDeleteRecord(panelSelection) {

        const result = {
            error: false,
            success: true,
            notice: null,
            payload: null,
        }

        const 
            { workspaceHandler } = this,
            { panelRecords, changedRecords, panelControlMap } = workspaceHandler

        panelRecords.splice(panelSelection.index, 1)
        await this.unsubscribeFromDomainChanges(panelSelection)
        panelControlMap.delete(panelSelection.id)

        const deletedIndex = panelSelection.index
        panelControlMap.forEach((index, value) =>{
            if (value.index > deletedIndex) {
                value.index--
            }
        })

        workspaceHandler.panelCount--

        for (let index = panelSelection.index + 1; index < panelRecords.length; index ++) {
            const panelRecord = panelRecords[index]
            panelRecord.profile.display_order = index
            changedRecords.setpanels.add(panelRecord.profile.panel.id)
        }

        let index
        for (index = 0; index < panelRecords.length; index++) {
            if (panelRecords[index].profile.flags.is_default) {
                break
            }
        }

        result.payload = index
        workspaceHandler.settings.changed = true
        changedRecords.deletepanels.add(panelSelection.id)
        changedRecords.setworkspace = workspaceHandler.workspaceRecord.profile.workspace.id

        let saveResult
        if (workspaceHandler.settings.mode == 'automatic') {
            saveResult = await workspaceHandler.saveWorkspaceData()
        }

        if (!saveResult.error) {
            result.notice = `panel [${panelSelection.name}] was deleted`
        } else {
            return saveResult
        }

        return result

    }

    // TODO: check schema for domain record
    async getPanelDomainContext(panelSelection) {
        const result = {
            error: false,
            success: true,
            notice: null,
        }

        const 
            panelRecord = this.workspaceHandler.panelRecords[panelSelection.index],
            panelDomainID = panelRecord.profile.domain.id,
            domainCollection = collection(this.db,'domains'),
            domainDocRef = doc(domainCollection, panelDomainID),
            memberCollection = collection(this.db, 'domains',panelDomainID, 'members'),
            userRecord = this.workspaceHandler.userRecords.user

        let panelDomainRecord
        try {
            const domainDoc = await getDoc(domainDocRef)
            this.usage.read(1)
            if (domainDoc.exists()) {
                panelDomainRecord = domainDoc.data()
            } else {
                result.success = false
                result.notice = 'domain record not found'
                return result
            }
        } catch(error) {

            const errdesc = 'error getting domain record'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            result.error = true
            return result

        }

        const querySpec = query(memberCollection, where('profile.user.id','==',userRecord.profile.user.id))

        let panelMemberRecord
        try {
            const queryPayload = await getDocs(querySpec)
            this.usage.read(Math.min(1,queryPayload.size))
            if (queryPayload.size !==1 ) {
                result.success = false
                result.notice = 'error fetching domain membership for this user'
                return result
            }
            let memberRecord = queryPayload.docs[0].data()
            const updatedRecord = updateDocumentSchema('members', 'standard', memberRecord)
            if (!Object.is(memberRecord, updatedRecord)) {
                try {

                    await setDoc(doc(memberCollection,memberRecord.profile.member.id),updatedRecord)
                    this.usage.write(1)

                } catch (error) {

                    const errdesc = 'error updating member record version'
                    console.log(errdesc, error)
                    this.errorControl.push({description:errdesc, error})
                    result.error = true
                    return result

                }

                memberRecord = updatedRecord

            }

            panelMemberRecord = memberRecord
        } catch(error) {

            const errdesc = 'error getting domain member record'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            result.error = true
            return result

        }

        this.workspaceHandler.panelDomainRecord = panelDomainRecord
        this.workspaceHandler.panelMemberRecord = panelMemberRecord

        return result        
    }

    async panelRename(panelSelection, newname) {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        const 
            { workspaceHandler } = this,
            panelRecord = workspaceHandler.panelRecords[panelSelection.index]

        panelRecord.profile.panel.name = newname
        workspaceHandler.workspaceRecord.panel.name = newname
        const panelID = panelRecord.profile.panel.id
        workspaceHandler.panelControlMap.get(panelID).selector.name = newname

        workspaceHandler.changedRecords.setpanels.add(panelID)
        workspaceHandler.settings.changed = true

        if (workspaceHandler.settings.mode == 'automatic') {

            const result = await workspaceHandler.saveWorkspaceData()

            if (!result.error) {
                result.notice = 'panel name changed to [' + newname + ']'
            }

            return result

        } else {

            result.notice = 'panel name changed to [' + newname + ']'
            return result

        }

    }

    // TODO remove all but the default window
    async panelReset(panelSelection) {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        result.notice = `panel selection ${panelSelection.name} has been reset`

        return result

    }

    async getUserDomainList() {

        const result = {
            error: false,
            success: true,
            notice: null,
            payload: null,
        }

        const domainList = Object.keys(this.workspaceHandler.userRecords.memberships.domains)

        if (!domainList || domainList.length === 0) {
            result.success = false
            result.notice = 'error: no domains found for this user in the users memberships list.'
            return result
        }

        const domainCollection = collection(this.db, 'domains')

        const querySpec = query(domainCollection, where('profile.domain.id','in',domainList))

        let domainRecordSelections = []
        try {
            const queryDocs = await getDocs(querySpec)
            this.usage.read(queryDocs.size || 1)
            if (queryDocs.size === 0) {
                result.success = false
                result.notice = 'error: no domain records for user domains found.'
                return result
            }
            for (let index = 0; index < queryDocs.size; index++) {
                const 
                    record = queryDocs.docs[index].data(),
                    selection = record.profile.domain

                domainRecordSelections.push(selection)
            }
            result.payload = domainRecordSelections
            return result

        } catch (error) {
            const errdesc = 'error fetching user domain records'
            console.log(errdesc, error)
            this.errorControl.push({description:errdesc, error})
            result.error = true
            return result
        }

    }

    async setDefaultPanel(fromIndex, toIndex) {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        const 
            { workspaceHandler } = this,
            { panelRecords, changedRecords, settings } = workspaceHandler,
            fromPanelRecord = panelRecords[fromIndex],
            toPanelRecord = panelRecords[toIndex]

        fromPanelRecord.profile.flags.is_default = false
        toPanelRecord.profile.flags.is_default = true
        settings.changed = true
        changedRecords.setpanels.add(fromPanelRecord.profile.panel.id)
        changedRecords.setpanels.add(toPanelRecord.profile.panel.id)

        if (settings.mode == 'automatic') {
            const result = await workspaceHandler.saveWorkspaceData()
            if (result.error) {
                return result
            }
        }

        result.notice = `default panel has been changed from [${fromPanelRecord.profile.panel.name}] to [${toPanelRecord.profile.panel.name}]`

        return result

    }

}

export default PanelsHandler