<?php
/**
 * Created by PhpStorm.
 * User: simon
 * Date: 06/04/2019
 * Time: 15:26
 */
namespace Memory\api\leaderboard;

header("Content-Type: application/json; charset=UTF-8");

require "../../vendor/autoload.php";

use Memory\api\src\Db;
use Memory\api\src\Leaderboard;

$db_instance = new Db();


$leaderboard = new Leaderboard($db_instance->db);

echo json_encode($leaderboard->getTop50());