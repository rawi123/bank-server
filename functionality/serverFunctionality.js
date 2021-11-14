const fs = require("fs");

const getAllUsers = () => {
    try {
        const buffer = fs.readFileSync("users.json");
        return (JSON.parse(buffer.toString()));
    }
    catch {
        return [];
    }
}

const updateAllUsers = (users) => {
    try {
        fs.writeFileSync("users.json", JSON.stringify(users));
        return true;
    }
    catch {
        return false;
    }
}

const getSingleUser = (id) => {//return the user if its found else return falsy value
    const data = getAllUsers();
    const user = data.find(user => user.passportID === Number(id));
    return user;//falsy value is the user was not found!
}

const addNewUser = (obj) => {
    const data = getAllUsers();
    if (data.find(user => user.passportID === Number(obj.passportID))) {
        return false;
    }

    const user = {
        passportID: Number(obj.passportID),
        credit: Number(obj.credit) || 0,
        cash: Number(obj.cash) || 0,
        isActive: obj.isActive || true
    }

    data.push(user);
    updateAllUsers(data);
    return user;
}

const updateUser = (id, obj, changingActive = false) => {
    const data = getAllUsers();
    const user = data.find(user => user.passportID === Number(id));

    if (!changingActive && user && !user.isActive) {
        return "User inactive";
    }

    if (user) {
        for (const variable in obj) {
            if (variable !== "isActive" || changingActive)
                user[variable] = user[variable] !== undefined ? obj[variable] : undefined
        }

        updateAllUsers(data);
        return user;
    }

    else {
        return "User not found!";
    }
}

const deleteUser = (id) => {
    const data = getAllUsers();
    const users = data.filter(user => Number(user.passportID) !== Number(id));
    updateAllUsers(users);
    return users.length === data.length ? false : true;
}

const deposit = (id, cash, update = true) => {
    const data = getAllUsers();
    const user = data.find(user => user.passportID === Number(id));
    if (user && user.isActive) {
        user["cash"] = Number(cash) + user["cash"];

        update ? updateAllUsers(data) : null;
        return user;
    }

    else if (user && !user.isActive) {
        return "User is inactive!";
    }
    else {
        return "User not found!"
    }
}

const withdraw = (id, cash, update = true) => {
    const data = getAllUsers();
    const user = data.find(user => user.passportID === Number(id));
    if (user && user.isActive) {
        if (user.cash >= cash) {
            user.cash -= cash;
        }
        else if (user.cash + user.credit >= cash) {
            user.cash -= cash;
        }
        else {
            return "Not enough money/credit";
        }
        update ? updateAllUsers(data) : null;
        return user;
    }
    else if (user && !user.isActive) {
        return "User is inactive!";
    }
    else {
        return "User not found!";
    }
}

const transfer = (sendId, reciveId, cash) => {
    const sendUserRes = withdraw(sendId, cash, false);
    const reciveUserRes = deposit(reciveId, cash, false);

    if (sendUserRes === "Not enough money/credit" || sendUserRes === "User is inactive!" || sendUserRes === "User not found!") {
        return { "sender": sendUserRes };
    }

    if (reciveUserRes === "User not found!" || reciveUserRes === "User is inactive!!" || reciveUserRes === "User not found!") {
        return { "reciver": reciveUserRes };
    }

    const sendReciveObj = {
        sender: withdraw(sendId, cash),
        reciver: deposit(reciveId, cash)
    }
    return sendReciveObj;
}


module.exports = {
    updateAllUsers,
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser,
    addNewUser,
    deposit,
    withdraw,
    transfer
}