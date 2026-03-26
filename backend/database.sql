-- eFootball Tournament Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS efootball_tournament;
USE efootball_tournament;

-- Players table
CREATE TABLE IF NOT EXISTS players (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    match_name VARCHAR(100),
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    stage ENUM('Group Stage', 'Knockout', 'Quarter Final', 'Semi Final', 'Final') NOT NULL,
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Match participants table
CREATE TABLE IF NOT EXISTS match_participants (
    match_participant_id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    player_id INT NOT NULL,
    goals_scored INT DEFAULT 0,
    result ENUM('Win', 'Loss', 'Draw', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    UNIQUE KEY unique_match_player (match_id, player_id)
);

-- Player stats table
CREATE TABLE IF NOT EXISTS player_stats (
    stats_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT UNIQUE NOT NULL,
    matches_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    draws INT DEFAULT 0,
    losses INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    goal_difference INT DEFAULT 0,
    points INT DEFAULT 0,
    stage_reached VARCHAR(50) DEFAULT 'Group Stage',
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

-- Seed data for players
INSERT INTO players (player_name, nickname, phone) VALUES
('John Smith', 'The Shark', '555-0101'),
('Mike Johnson', 'Thunder', '555-0102'),
('David Williams', 'Lightning', '555-0103'),
('James Brown', 'Ace', '555-0104'),
('Robert Davis', 'Phantom', '555-0105'),
('William Miller', 'Viper', '555-0106'),
('Christopher Wilson', 'Storm', '555-0107'),
('Daniel Taylor', 'Hawk', '555-0108');

-- Seed data for matches
INSERT INTO matches (match_name, match_date, match_time, stage, status) VALUES
('Match 1', '2024-01-15', '10:00:00', 'Group Stage', 'Completed'),
('Match 2', '2024-01-15', '11:00:00', 'Group Stage', 'Completed'),
('Match 3', '2024-01-16', '10:00:00', 'Group Stage', 'Completed'),
('Match 4', '2024-01-17', '10:00:00', 'Quarter Final', 'Completed'),
('Match 5', '2024-01-18', '10:00:00', 'Semi Final', 'Scheduled'),
('Match 6', '2024-01-19', '10:00:00', 'Final', 'Scheduled'),
('Match 7', '2024-01-15', '14:00:00', 'Group Stage', 'Completed'),
('Match 8', '2024-01-16', '11:00:00', 'Group Stage', 'Completed');

-- Seed data for match participants with results
INSERT INTO match_participants (match_id, player_id, goals_scored, result) VALUES
-- Match 1: John Smith vs Mike Johnson (2-1)
(1, 1, 2, 'Win'),
(1, 2, 1, 'Loss'),
-- Match 2: David Williams vs James Brown (0-0)
(2, 3, 0, 'Draw'),
(2, 4, 0, 'Draw'),
-- Match 3: Robert Davis vs William Miller (3-2)
(3, 5, 3, 'Win'),
(3, 6, 2, 'Loss'),
-- Match 4: Quarter Final - John Smith vs David Williams (1-0)
(4, 1, 1, 'Win'),
(4, 3, 0, 'Loss'),
-- Match 7: Group Stage - Christopher Wilson vs Daniel Taylor (2-1)
(7, 7, 2, 'Win'),
(7, 8, 1, 'Loss'),
-- Match 8: Group Stage - Mike Johnson vs James Brown (1-2)
(8, 2, 1, 'Loss'),
(8, 4, 2, 'Win');

-- Initialize player stats
INSERT INTO player_stats (player_id, matches_played, wins, draws, losses, goals_for, goals_against, goal_difference, points, stage_reached)
SELECT 
    p.player_id,
    COALESCE(mp.matches_played, 0) as matches_played,
    COALESCE(mp.wins, 0) as wins,
    COALESCE(mp.draws, 0) as draws,
    COALESCE(mp.losses, 0) as losses,
    COALESCE(mp.goals_for, 0) as goals_for,
    COALESCE(mp.goals_against, 0) as goals_against,
    COALESCE(mp.goals_for, 0) - COALESCE(mp.goals_against, 0) as goal_difference,
    COALESCE(mp.points, 0) as points,
    'Group Stage' as stage_reached
FROM players p
LEFT JOIN (
    SELECT 
        player_id,
        COUNT(*) as matches_played,
        SUM(CASE WHEN result = 'Win' THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN result = 'Draw' THEN 1 ELSE 0 END) as draws,
        SUM(CASE WHEN result = 'Loss' THEN 1 ELSE 0 END) as losses,
        SUM(goals_scored) as goals_for,
        SUM(goals_scored) as goals_for,
        0 as goals_against,
        SUM(CASE WHEN result = 'Win' THEN 3 WHEN result = 'Draw' THEN 1 ELSE 0 END) as points
    FROM match_participants
    GROUP BY player_id
) mp ON p.player_id = mp.player_id;

