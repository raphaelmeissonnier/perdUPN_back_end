const {config} = require("../config/config");
const jwt = require("jsonwebtoken");

//const User = require("../models/user.model");
const {User} = require("../models/tables.model");

const bcrypt = require("bcrypt");

const maxAge = 3 * 24 * 60 * 60 * 1000;

const saltRounds=10
const salt = bcrypt.genSalt(saltRounds);

// Get all Users
const getUsers = async (req,res) => {
    try {
        const users = await User.findAll();
        res.send(users);
    }catch(err){
        console.log(err);
    }
}

// Get objet perdu by id
const getUserById = async (req, res) => {
    try {
        const user = await User.findAll({
            where: {
                id: req.params.id
            }
        });
        res.send(user[0]);
    } catch (err) {
        console.log(err);
    }
}

// Create a new objet perdu
const createUser = async (req, res) => {
    try {
        await User.create({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password, 

        });
        
        res.json({
            "message": "User Created"
        });
    } catch (err) {
        console.log(err);
    }
}

// Update objet perdu by id
const updateUser= async (req, res) => {
    try {
        await User.update(req.body, {
            where: {
                idUser: req.params.id
            }
        });
        res.json({
            "message": "User Updated"
        });
    } catch (err) {
        console.log(err);
    }
}
 
// Delete objet perdu by id
const deleteUser = async (req, res) => {
    try {
        console.log(req.params);
        await User.destroy({
            where: {
                idUser: req.params.id
            }
        });
        res.json({
            "message": "User Deleted"
        });
    } catch (err) {
        console.log(err);
    }
}
// Login User
const loginUser = async (req, res) => {
    try {
        console.log(req.body);
        //On récupère l'utilisateur
        const user = await User.findOne({
            where: {
                username: req.body.username
            }
        });
        //Si l'utilisateur existe et que le mot de passe est bon
        if(user){
            console.log("L'utlisateur existe !")
            if(req.body.password == user.password){
                console.log("Le mdp est correct !")
                const id = user.id;
                const Token = jwt.sign({ id }, config.TOKEN_SECRET , {expiresIn: maxAge});
                res.cookie("jwt", Token, { httpOnly: true, maxAge: maxAge });
                res.status(200).json({ user: user.id });
            }
            else
            {
                return res.status(200).json({
                    msg: "Les mdp ne correspondent pas !"
                });
            }
        }

        //Si l'utlisateur n'existe pas - Renvoyer une erreur
        else{
            return res.status(200).json({
                msg: "L'utilisateur n'existe pas"
            });
        }
    }
    catch (err) {
        console.log(err);
    }
};

module.exports = {getUserById,getUsers,deleteUser,createUser,updateUser, loginUser}