// snapshotControlClass.tsx

class snapshotControlClass {

    snapshotData = new Map()

    count = 0

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

    getDoccheck = (index) => {
        return this.snapshotData.get(index).doccheck
    }

    setDoccheck = (index) => {
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

const snapshotControl = new snapshotControlClass() // singleton

export default snapshotControl