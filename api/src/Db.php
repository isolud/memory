<?php
/**
 * Created by PhpStorm.
 * User: simon
 * Date: 05/04/2019
 * Time: 16:32
 */

class Db {

    /* On défini ci dessous nos informations de connexion à la base de donnée
    *
    *  Les variables sont déclarées en privée, cela signifie qu'elles ne seront pas accessibles aux classes qui
    *  héritent de la classe Db
    */
    private $hostname = "localhost";
    private $username = "root";
    private $password = "";
    private $dbname = "memory";

    // Db représente notre connexion à la base de donnée, comme nous voulons rendre la connexion accessible en dehors de la classe, il faut déclarer la variable avec une portée public
    public $db;

    // Ceci est une méthode magique, cette méthode est appelée dés qu'on crée une instance de la classe Db
    public function __construct()
    {
        // On instancie la classe mysqli avec nos informations de connexion, on stocke le résultat dans la variable $db, on peut aussi utiliser pdo au lieu de mysqli si l'extension est installée
        $this->db = new mysqli($this->$hostname,$this->$username,$this->$password,$this->$dbname);

        // Au cas où une erreur de connexion est retournée, nous l'affichons pour faciliter le debug en dev
        if ($this->db->connect_errno) {
            echo "Echec lors de la connexion à MySQL : (" . $this->db->connect_errno . ") " . $this->db->connect_error;
        }

        // On retourne notre variable contenant une instance de mysqli
        return $this->db;
    }
} 