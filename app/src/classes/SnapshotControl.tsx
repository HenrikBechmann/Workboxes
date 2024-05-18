// SnapshotControl.tsx

class SnapshotControl {

    snapshotData = new Map()

    // TODO save this, at least to local database
    count = 0 // aggregate call count, collected on unsubscribe

    create = (index) => {
        this.snapshotData.set(index,{unsub:null, count:0, doccheck:false})
    }

    registerUnsub = (index, unsub) => {
        this.snapshotData.get(index).unsub = unsub
    }

    has = (index) => {
        return this.snapshotData.has(index)
    }

    incrementCallCount = (index, count) => {
        this.snapshotData.get(index).count += count
    }

    unsub = (index) => {
        const 
            record = this.snapshotData.get(index),
            unsubscribe = record.unsub

        this.count += record.count

        unsubscribe && unsubscribe()

        this.snapshotData.delete(index)

    }

    wasSchemaChecked = (index) => {
        return this.snapshotData.get(index).doccheck
    }

    setSchemaChecked = (index) => {
        this.snapshotData.get(index).doccheck = true
    }

    unsubAll = () => {

        // TODO: collect and save counts
        this.snapshotData.forEach((record) => {
            const unsubscribe = record.unsub
            this.count += record.count
            unsubscribe && unsubscribe()
        })

        this.snapshotData.clear()
    }

}

// const snapshotControl = new SnapshotControl() // singleton

export default SnapshotControl