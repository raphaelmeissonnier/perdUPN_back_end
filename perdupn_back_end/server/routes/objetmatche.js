// Import express
const express = require("express");
// Import Product Controller
const {
    createObjetMatche,
    getObjetMatche,
    updateObjetMatche
} = require("../controllers/objetmatche.controller");

const {
    createRdv,
} = require("../controllers/rendezvous.controller");

// Init express router
const router = express.Router();

router.post('/objetsmatche', createObjetMatche);

router.post('/objetsmatche/rdv', createRdv);

router.get('/objetsmatche/:id', getObjetMatche);

router.patch('/objetsmatche/:id', updateObjetMatche);

module.exports = router;