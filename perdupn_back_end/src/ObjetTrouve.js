const Objet = require("./Objet");
const Calculateur = require('./Calculateur');


class ObjetTrouve extends Objet
{
    constructor(categorie, localisation)
    {
        super(categorie, localisation);
        this.calculateur = new Calculateur();

    }

    getCategorie()
    {
        return super.getCategorie();
    }

    getLocalisation()
    {
        return super.getLocalisation();
    }

    getDistance(localisationUser)
    {
        //this.calculateur.setDistance(this.calculateur.getDistanceLocalisationPrecise(localisationUser, this.localisation));
        //return this.calculateur;
        return this.calculateur.getDistanceLocalisationPrecise(localisationUser, this.localisation);
    }
}

module.exports = ObjetTrouve;
