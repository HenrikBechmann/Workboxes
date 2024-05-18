// WorkspaceHandler.tsx
// copyright (c) 2024-present Henrik Bechmann, Toronto, Licence: GPL-3.0

class WorkspaceHandler {

    constructor(db) {
        this.db = db
    }

    // database
    db

    // data
    setWorkspaceHandler = null
    workspaceSelection = {id:null, name:null}
    workspaceRecord = null
    panelRecords = new Map()
    settings = {mode:'automatic', changed: false}
    changedRecords = {
        setworkspace:null,
        setwindowpositions: new Set(),
        setpanels: new Set(),
        deletepanels: new Set()
    }
    flags = {
        new_workspace:true
    }

    // methods
    setSelection = (id, name) => {
        this.workspaceSelection = {
            id,
            name,
        }
    }

    resetChanged = () => {
        this.settings.changed = false
        this.changedRecords.setworkspace = null
        this.changedRecords.setpanels.clear()
        this.changedRecords.deletepanels.clear()
        this.changedRecords.setwindowpositions.clear()
    }

}

export default WorkspaceHandler