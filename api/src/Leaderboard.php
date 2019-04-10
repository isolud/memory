<?php
/**
 * Created by PhpStorm.
 * User: simon
 * Date: 06/04/2019
 * Time: 14:14
 */

namespace Memory\api\src;


class Leaderboard {

    protected $db_conn;
    protected $table_name = "leaderboard";

    private $id;
    private $name;
    private $score_time;

    /**
     * @param $db_instance
     */
    public function __construct($db_instance)
    {
        $this->db_conn = $db_instance;
    }

    /**
     * @param string $name
     */
    public function setName(string $name)
    {
        $this->name = $name;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param int $scoretime
     *
     */
    public function setScoreTime(int $scoretime)
    {
        $this->score_time = $scoretime;
    }

    /**
     *
     * @return int
     *
     */
    public function getScoreTime(): string
    {
        return $this->score_time;
    }

    public function getTop50(): array
    {
        $results = array();

        /*
         * On selectionne les 50 meilleurs résultats dans la table classement, order by score_time ASC signifie qu'on va trier les résultats de la plus petite
         * valeur à la plus grande ( ascendant ) , le contraire DESC permet de trier de la plus grande valeur à la plus petite
         *
         * LIMIT 50 permet de ne retourner que les 50 premiers résultats
         */
        $sql="select * from {$this->table_name} where 1 order by score_time ASC LIMIT 50";
        $result = $this->db_conn->query($sql);
        while($row = $result->fetch_assoc())
        {
            // Permet d'extraire les valeurs du tableau associatif $row sous forme de variables, exemple : $row['id'] va devenir $id
            extract($row);

            // On stocke les valeurs dans un tableau, chaque ligne = une nouvelle entrée du tableau, cela nous facilitera la tache pour retourner un json correct
            $results[] = array("id" => $id, "name" => $name, "score_time" => $score_time);


        }

        return $results;
    }

    public function create(): ?bool
    {
        // Il s'agit ici d'une requete préparée avec mysqli, les ? vont être remplaçées par les variables présentes dans la méthode bind_param
        $sql="insert into {$this->table_name} (`name`,`score_time`) VALUES (?,?)";
        $stmt = $this->db_conn->prepare($sql);
        $name = filter_var($this->name, FILTER_SANITIZE_STRING);
        $score_time = filter_var($this->score_time, FILTER_SANITIZE_NUMBER_INT);

        // Attention avec mysqli, l'ordre a une importance, le parametre "si" représente le type de donnée attendu, s = string, i = integer ( un nombre entier )
        $stmt->bind_param("si", $name , $score_time);
        if($stmt->execute())
        {
            $stmt->close();
            return true;
        }
        return false;

    }



} 