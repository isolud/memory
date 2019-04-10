<?php
/**
 * Created by PhpStorm.
 * User: simon
 * Date: 06/04/2019
 * Time: 20:43
 */

require('vendor/autoload.php');
use PHPUnit\Framework\TestCase;
use Memory\api\src\Leaderboard;
use Memory\api\src\Db;

class LeaderboardTest extends TestCase
{
    protected $client;
    protected $leaderboard;
    protected $db;

    protected function setUp(): void
    {
        $this->client = new GuzzleHttp\Client([
            'base_uri' => 'http://localhost'
        ]);

        $this->db = new Db();

        $this->leaderboard = new Leaderboard($this->db->db);
    }

    public function testCreate_Leaderboard()
    {
        $this->leaderboard->setName("test");
        $this->leaderboard->setScoreTime(56);
        $res = $this->leaderboard->create();
        $this->assertTrue($res);
    }

    public function testGet_ValidInput_Leaderboard()
    {
        $response = $this->client->get('Memory/api/leaderboard/read.php');

        $this->assertEquals(200, $response->getStatusCode());

        $data = json_decode($response->getBody(), true);

        if(!empty($data)) {

            $this->assertArrayHasKey('name', $data[0]);
            $this->assertArrayHasKey('score_time', $data[0]);
        }

    }

    public function testPost_NewLeaderboardEntry()
    {

        $randomTime = mt_rand(1,10);
        $randomTime = $randomTime*60*1000;

        $response = $this->client->post('Memory/api/leaderboard/create.php', [
            'json' => [
                'name' => 'test',
                'score_time' => $randomTime
            ]
        ]);



        $this->assertEquals(201, $response->getStatusCode());

        $data = json_decode($response->getBody(), true);

        $this->assertEquals('Created', $data['Status']);
    }
}