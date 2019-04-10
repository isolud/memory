<?php
/**
 * Created by PhpStorm.
 * User: simon
 * Date: 06/04/2019
 * Time: 15:26
 */
  namespace Memory\api\leaderboard;

  header("Content-Type: application/json; charset=UTF-8");
  header("Access-Control-Allow-Methods: POST");

  require "../../vendor/autoload.php";

  use Memory\api\src\Db;
  use Memory\api\src\Leaderboard;

  $db_instance = new Db();

  $leaderboard = new Leaderboard($db_instance->db);

  $data = json_decode(file_get_contents("php://input"));

  if(!empty($data->name) and !empty($data->score_time)) {

      $leaderboard->setName($data->name);
      $leaderboard->setScoreTime($data->score_time);
      if ($leaderboard->create()) {
          http_response_code(201);
          $response = array("Status" => "Created");
      }
      else
      {
          http_response_code(503);
          $response = array("Status" => "Unable to create record in db");
      }

  }
  else
  {
      http_response_code(400);
      $response = array("Status" => "Missing required data to create record");
  }


  echo json_encode($response);