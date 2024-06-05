// PanelHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

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

class PanelHandler {

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

    async getPanelDomainContext(panelSelection, userRecord) {
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
            memberCollection = collection(this.db, 'domains',panelDomainID, 'members')

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
            panelMemberRecord = queryPayload.docs[0].data()
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

    async loadPanels() {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        const panelRecords = this.workspaceHandler.panelRecords
        panelRecords.length = 0 // start over
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
                data.profile.display_order = index // assert contiguous order
                const updatedData = updateDocumentSchema('panels','standard',data)
                if (!Object.is(data, updatedData)) {
                    const dbDocRef = doc(dbPanelCollection, updatedData.profile.panel.id)
                    batch.set(dbDocRef, updatedData)
                    panelRecords[index] = updatedData
                    writes++
                }
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
        // if (panelRecords.length === 0) { 
            const newPanelDocRef = doc(dbPanelCollection)
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
        }

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

        workspaceHandler.changedRecords.setpanels.add(panelRecord.profile.panel.id)
        workspaceHandler.settings.changed = true

        if (workspaceHandler.settings.mode == 'automatic') {

            const result = await workspaceHandler.saveWorkspaceData()

            result.notice = 'panel name changed to [' + newname + ']'

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

    async duplicatePanelAs(panelSelection, newname) {
        
        const result = {
            error: false,
            success: true,
            notice: null,
        }

        const 
            { workspaceHandler } = this,
            panelRef = doc(
                collection(this.db, 'users',this.userID, 'workspaces',workspaceHandler.workspaceRecord.profile.workspace.id, 'panels')),
            newPanelID = panelRef.id

        const 
            newPanelRecord = _cloneDeep(workspaceHandler.panelRecords[panelSelection.index]),
            oldPanelName = newPanelRecord.profile.panel.name,
            newPanelOrder = workspaceHandler.panelRecords.length - 1,
            { profile } = newPanelRecord

        profile.display_order = workspaceHandler.panelCount + 1
        profile.panel.id = newPanelID
        profile.panel.name = newname
        profile.display_order = newPanelOrder
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
            return result
        }

        result.notice = notice
        return result

    }

    async deletePanel() {

        const result = {
            error: false,
            success: true,
            notice: null,
        }

        return result

    }

}


export default PanelHandler