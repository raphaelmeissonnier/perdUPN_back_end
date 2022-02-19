const {config} = require("../config/config");
const jwt = require("jsonwebtoken");
const {Sequelize, QueryTypes} = require('sequelize');
const db = require('../config/database');
var DataTypes = Sequelize.DataTypes;
var utilisateur = require("../models/utilisateur");
var UserModel = utilisateur(db,DataTypes);


const bcrypt = require("bcrypt");
const {isEmpty} = require("validator");

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
                $or: [
                    {id_utilisateur: req.params.id},
                    {id_utilisateur: req.body.id}
                ]
            }
        });
        if(!req.params.id)
        {
            return user;
        }
        else
        {
            res.json(user);
        }
    } catch (err) {
        console.log(err);
    }
}

// Get user by id
const getRdvByUser = async (req, res) => {
    try {
        const rdvs = await db.query('SELECT * FROM rendezvous, localisation WHERE localisation = id_localisation AND (first_user=:id_user OR second_user=:id_user)',
        {
            replacements : {
                id_user: req.params.id
            },
            type: QueryTypes.SELECT
        })
        res.json(rdvs);
    } catch (err) {
        console.log(err);
    }
}

// Get user by id
const getAllRdvByUser = async (req, res) => {
    try {
        const rdvs = await db.query("SELECT count(*) as nbRdv FROM rendezvous WHERE etat = 'en cours' AND (first_user=:id_user OR second_user=:id_user)",
        {
            replacements : {
                id_user: req.params.id
            },
            type: QueryTypes.SELECT
        });
        res.json(rdvs[0]);
    } catch (err) {
        console.log(err);
    }
}


// Get user by id
const getHistByUser = async (req, res) => {
    try {
        const hist_minus = await db.query('SELECT listerecompenses.date_recompense as date, recompense.valeur as valeur_neg, recompense.intitule as intitule FROM historique, listerecompenses, recompense \
        WHERE historique.liste_recompense=listerecompenses.id \
          AND \
            listerecompenses.id_recompense = recompense.id_recompense \
          AND  historique.id_utilisateur_trouveur=:id_user ORDER BY listerecompenses.date_recompense;',
        {
            replacements : {
                id_user: req.params.id
            },
            type: QueryTypes.SELECT
        })

        const hist_posi = await db.query('SELECT rendezvous.date_rdv as date, categorie.valeur as valeur_pos, objet.intitule as intitule FROM historique, rendezvous, objetmatche, objet, categorie  \
            WHERE historique.rdv = rendezvous.id_rdv \
                AND \
                    rendezvous.objet_matche = objetmatche.id_objet_matche \
                AND \
                    objetmatche.objet_trouve = objet.id_objet \
                AND \
                    objet.categorie = categorie.id_categorie \
                AND \
                    historique.id_utilisateur_trouveur=:id_user ORDER BY rendezvous.date_rdv;',
        {
            replacements : {
                id_user: req.params.id
            },
            type: QueryTypes.SELECT
        })

        var hist = hist_minus.concat(hist_posi)
        var sort_hist= hist.sort((a,b) => b.date - a.date)
        console.log("SORT_HIST",sort_hist)
        //TRIE SELON LA DATE
        res.json(sort_hist);
    } catch (err) {
        console.log(err);
    }
}


// Create a new user
const createUser = async (req, res) => {
    //Hash du mot de passe
    bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
        try {
            await UserModel.findOrCreate({
                where: {
                    $or: [
                        {username: req.body.username},
                        {email: req.body.email}
                    ]
                },
                defaults: {
                    nom: req.body.nom,
                    prenom: req.body.prenom,
                    username: req.body.username,
                    email: req.body.email,
                    mdp: hash,
                    solde: 0
                }
            });
            res.json({
                "result": 1,
                "msg": "Votre compte a bien été créé"
            });
        } catch (e) {
            console.log(e);
            switch(e.constructor)
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
                        "msg": e
                    });
            }
        }
    });
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
            const match = await bcrypt.compare(req.body.password, user.mdp);
            console.log('match: ', match);
            if(match)
            {
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

const updateSoldeUser = async(req, field) =>{
    try
    {
        await UserModel.update(
            {solde: field},
            {
                where:
                {
                    id_utilisateur: req.body.id
                }
            }
        );
    }
    catch (e)
    {
        return e;
    }
}
module.exports = {updateSoldeUser, getUserById,getUsers,deleteUser,createUser,updateUser, loginUser, logoutUser, getRdvByUser, getAllRdvByUser, getHistByUser}