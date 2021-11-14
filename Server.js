const express = require("express"),
    cors = require("cors"),
    bodyParser = require("body-parser"),
    serverFunc = require("./functionality/serverFunctionality"),
    app = express();
require('dotenv').config();

//for defense will try to make requests with password
//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin:"https://bank-client-rawi.herokuapp.com/"
}));

app.get("/", (req, res) => {//get all users
    res.status(200).send(serverFunc.getAllUsers());
})

app.get("/:id", (req, res) => {//get single user by id
    const getUserRes = serverFunc.getSingleUser(req.params.id);
    if (getUserRes) {
        return res.status(200).send(getUserRes);
    }
    res.status(404).send("No user found!");

})

app.post("/", (req, res) => {//post new user
    try {
        if (!req.body.passportID || !/^[0-9]*$/g.test(req.body.passportID)) {
            throw "Invalid passportID";
        }
        const addUserRes = serverFunc.addNewUser(req.body);
        if (!addUserRes) {
            throw "User alreday exists!";
        }
        res.status(202).send(addUserRes);
    }
    catch (err) {
        res.status(404).send(err || "Unknown error")
    }
})

app.delete("/:id", (req, res) => {//delete a user
    if (serverFunc.deleteUser(req.params.id)) {
        return res.status(200).json("Deleted id: "+ req.params.id);
    }
    return res.status(404).send("User does not exist!")
})

app.put("/rawiPassword/:id", (req, res) => {//only admin-with password, update a user only! if does exist send 404
    try {
        const updateRes = serverFunc.updateUser(req.params.id, req.body);
        if (updateRes === "User not found!" || updateRes === "User inactive")
            throw (updateRes)
        if (updateRes) {
            return res.status(201).send(updateRes);
        }
    }
    catch (err) {
        res.status(404).send(err || "Unknown error!")
    }
})

app.put("/credit/:id", (req, res) => {
    if (parseFloat(req.body.ammount) != req.body.ammount) {
        return res.status(404).send("Invalid input");
    }
    
    updateSingleVar(req.params.id, { "credit": req.body.ammount }, res)
})

app.put("/active/:id", (req, res) => {
    if (typeof req.body.isActive !== "boolean") {
        return res.status(404).send("Invalid input");
    }
    updateSingleVar(req.params.id, { "isActive": req.body.isActive }, res, true)
})

app.put("/withdraw/:id", (req, res) => {
    try {
        const withdrawRes = serverFunc.withdraw(req.params.id,Number( req.body.ammount));
        if (withdrawRes === "Not enough money/credit" || withdrawRes === "User is inactive!" || withdrawRes === "User not found!") {
            throw withdrawRes;
        }
        res.status(202).send(withdrawRes);
    }
    catch (err) {
        res.status(404).send(err || "Unknown error!")
    }

})

app.put("/deposit/:id", (req, res) => {
    try {
        if(!req.body.ammount ||Number(req.body.ammount)!=req.body.ammount){
            throw "Invalid input"
        }
        const updateRes = serverFunc.deposit(req.params.id, req.body.ammount)
        if (updateRes === "User not found!" || updateRes === "User is inactive!" || updateRes === "User not found!") {
            throw updateRes;
        }
        else {
            res.status(202).send(updateRes)
        }
    }
    catch (err) {
        res.status(404).send(err)
    }
})

app.put("/send/:id1/recive/:id2", (req, res) => {
    try {
        const objRes = serverFunc.transfer(req.params.id1, req.params.id2, req.body.ammount);

        if (Object.keys(objRes).length === 1) {
            throw (objRes)
        }
        else {
            res.status(202).send(objRes)
        }
    }
    catch (err) {
        res.status(400).send(err || "Unknown error!")
    }
})

const updateSingleVar = (id, obj = { "credit": undefined }, res, changingActive = false) => {//gets id obj ={variable to change: the value to change it}
    try {
        const user = serverFunc.updateUser(id, obj, changingActive);//send true if trying to change active
        if (user) {
            return res.status(201).send(user);
        }
        throw ("User not found!")
    }
    catch (err) {
        res.status(404).send(err || "Unknown error!")
    }
}


app.listen(process.env.PORT || 4000, () => {
    console.log("app running on port 4000");
})