class Users  {    
    constructor(id, name, room) {
        this.id = id;
        this.name = name;
        this.room = room;
        this.users = [];
}

    addUser(id, name, room) {
        var user = {id, name, room};
        this.users.push(user);
        return user;
    }

    removeUser (id) {
        var user = this.getUser(id);

        if(user) {
            this.users = this.users.filter((user) => user.id !== id);
        }
        return user;
    }
    getUser (id) {
        return this.users.filter((user) => user.id  === id)[0];
    }

    getUserList(room) {
        /*this function will return all he list of users
        who are in common room the filter method does that task for us and return
        */
        var users = this.users.filter((user) => user.room === room);
        var namesArray = users.map((user) =>  user.name);
        

        return namesArray;
    }
    
}

module.exports = {Users}
