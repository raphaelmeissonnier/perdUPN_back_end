const {config} = require("../config/config");
const jwt = require("jsonwebtoken");

const Sequelize = require('sequelize');
const db = require('../config/database');
var DataTypes = Sequelize.DataTypes;
var utilisateur = require("../models/utilisateur");
var UserModel = utilisateur(db,DataTypes);


const bcrypt = require("bcrypt");

const maxAge = 3 * 24 * 60 * 60 * 1000;

const saltRounds=10
const salt = bcrypt.genSalt(saltRounds);

// Get all Users
const getUsers = async (req,res) => {
    try {
        const users = await UserModel.findAll();
        res.send(users);
    }catch(err){
        console.log(err);
    }
}

// Get user by id
const getUserById = async (req, res) => {
    try {
        const user = await UserModel.findOne({
            where: {
                id_utilisateur: req.params.id
            }
        });
        res.json(user);
    } catch (err) {
        console.log(err);
    }
}

// Create a new user
const createUser = async (req, res) => {
    try {
        await UserModel.create({
            email: req.body.email,
            username: req.body.username,
            mdp: req.body.password,
            solde: 0
        });

        res.json({
            "result": 1,
            "msg": "Votre compte a bien été créé"
        });
    } catch (err) {
        console.log(err);
        switch(err.constructor)
        {
            case Sequelize.UniqueConstraintError:
                res.json({
                    "result": 0,
                    "msg": "Email/Username existant"
                });
            case Sequelize.ValidationError:
                res.json({
                    "result": 0,
                    "msg": "L'email saisi est invalide"
                });
            default:
                res.json({
                    "result": 0,
                    "msg": err
                });
        }
    }
}

// Update objet perdu by id
const updateUser= async (req, res) => {
    try {
        await UserModel.update(req.body, {
            where: {
                id_utilisateur: req.params.id
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
        await UserModel.destroy({
            where: {
                id_utilisateur: req.params.id
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
        const user = await UserModel.findOne({
            where: {
                username: req.body.username
            }
        });
        //Si l'utilisateur existe et que le mot de passe est bon
        if(user){
            console.log("L'utlisateur existe !")
            if(req.body.password == user.mdp){
                console.log("Le mdp est correct !")
                const id = user.id_utilisateur;
                const Token = jwt.sign({ id }, config.TOKEN_SECRET , {expiresIn: maxAge});
                res.cookie("jwt", Token, { httpOnly: true, maxAge: maxAge });
                res.status(200).json({ result: 1, user: user.id_utilisateur });
            }
            else
            {
                return res.status(200).json({
                    result: 0,
                    msg: "Veuillez resaisir votre mot de passe !"
                });
            }
        }

        //Si l'utlisateur n'existe pas - Renvoyer une erreur
        else{
            return res.status(200).json({
                result: 0,
                msg: "Vous n'avez pas de compte !"
            });
        }
    }
    catch (err) {
        console.log(err);
    }
};

const logoutUser = async (req, res) => {
    //On deconnecte l'utilisateur   
    console.log("Cookie de Deco",res.cookie("jwt","Coucou", { httpOnly: true,maxAge: 1 })) 
    res.cookie("jwt","Coucou", { httpOnly: true,maxAge: 1 });
    res.status(200).send();
};

module.exports = {getUserById,getUsers,deleteUser,createUser,updateUser, loginUser, logoutUser}