-- Schema SQL MySQL pour ArbiNote
-- À exécuter sur votre instance MySQL locale

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS votes;

DROP TABLE IF EXISTS critere_definitions;

DROP TABLE IF EXISTS matches;

DROP TABLE IF EXISTS journees;

DROP TABLE IF EXISTS saisons;

DROP TABLE IF EXISTS ligues;

DROP TABLE IF EXISTS federations;

DROP TABLE IF EXISTS teams;

DROP TABLE IF EXISTS arbitres;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS federations (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    code VARCHAR(8) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    nom_en VARCHAR(255),
    nom_ar VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_federations_code (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS ligues (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    federation_id CHAR(36) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    nom_en VARCHAR(255),
    nom_ar VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ligues_federation FOREIGN KEY (federation_id) REFERENCES federations (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS arbitres (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    nom VARCHAR(255) NOT NULL,
    nom_en VARCHAR(255),
    nom_ar VARCHAR(255),
    nationalite VARCHAR(255),
    nationalite_ar VARCHAR(255),
    date_naissance DATE,
    photo_url TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS saisons (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    nom VARCHAR(255) NOT NULL,
    nom_ar VARCHAR(255),
    date_debut DATE,
    date_fin DATE,
    league_id CHAR(36),
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_saisons_league FOREIGN KEY (league_id) REFERENCES ligues (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS teams (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    abbr VARCHAR(16) UNIQUE,
    nom VARCHAR(255) NOT NULL,
    nom_en VARCHAR(255),
    nom_ar VARCHAR(255),
    city VARCHAR(255),
    city_en VARCHAR(255),
    city_ar VARCHAR(255),
    stadium VARCHAR(255),
    stadium_ar VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS journees (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    saison_id CHAR(36) NOT NULL,
    numero INT NOT NULL,
    date_journee DATE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_journees_saison FOREIGN KEY (saison_id) REFERENCES saisons (id) ON DELETE CASCADE,
    UNIQUE KEY uniq_saison_numero (saison_id, numero)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS matches (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    journee_id CHAR(36) NOT NULL,
    equipe_home CHAR(36) NOT NULL,
    equipe_away CHAR(36) NOT NULL,
    date DATETIME,
    score_home INT,
    score_away INT,
    arbitre_id CHAR(36),
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_matches_journee FOREIGN KEY (journee_id) REFERENCES journees (id) ON DELETE CASCADE,
    CONSTRAINT fk_matches_home FOREIGN KEY (equipe_home) REFERENCES teams (id),
    CONSTRAINT fk_matches_away FOREIGN KEY (equipe_away) REFERENCES teams (id),
    CONSTRAINT fk_matches_arbitre FOREIGN KEY (arbitre_id) REFERENCES arbitres (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS votes (
    id CHAR(36) NOT NULL DEFAULT(UUID()),
    match_id CHAR(36) NOT NULL,
    arbitre_id CHAR(36) NOT NULL,
    criteres JSON NOT NULL,
    note_globale DECIMAL(5, 2) NOT NULL,
    device_fingerprint VARCHAR(255),
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_votes_match FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE,
    CONSTRAINT fk_votes_arbitre FOREIGN KEY (arbitre_id) REFERENCES arbitres (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS critere_definitions (
    id VARCHAR(64) NOT NULL,
    categorie ENUM('arbitre', 'var', 'assistant') NOT NULL,
    label_fr VARCHAR(255) NOT NULL,
    label_en VARCHAR(255),
    label_ar VARCHAR(255) NOT NULL,
    description_fr TEXT,
    description_ar TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_matches_arbitre_id ON matches (arbitre_id);

CREATE INDEX idx_matches_journee_id ON matches (journee_id);

CREATE INDEX idx_matches_date ON matches (date);

CREATE INDEX idx_votes_match_id ON votes (match_id);

CREATE INDEX idx_votes_arbitre_id ON votes (arbitre_id);

CREATE INDEX idx_votes_created_at ON votes (created_at);

CREATE INDEX idx_journees_saison ON journees (saison_id, numero);