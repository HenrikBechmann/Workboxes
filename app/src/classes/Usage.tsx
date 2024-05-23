// Usage.tsx
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

class Usage {

    read = (number) => {
        this.data.read += number
    }
    write = (number) => {
        this.data.write += number
    }
    create = (number) => {
        this.data.create += number
    }
    delete = (number) => {
        this.data.delete += number
    }
    login = (number) => {
        this.data.login += number
    }
    filesave = (number) => {
        this.data.filesave += number
    }
    filedelete = (number) => {
        this.data.filedelete += number
    }
    reset = () => {
        this.data = {
            read:0,
            write:0,
            create:0,
            delete:0,
            login:0,
            filesave:0,
            filedelete:0,
        }
    }
    data = {
        read:0,
        write:0,
        create:0,
        delete:0,
        login:0,
        filesave:0,
        filedelete:0,
    }

}
 export default Usage