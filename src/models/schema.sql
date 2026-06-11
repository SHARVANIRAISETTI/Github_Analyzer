CREATE TABLE IF NOT EXISTS github_profiles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(39) NOT NULL UNIQUE,
  name VARCHAR(255),
  bio TEXT,
  company VARCHAR(255),
  location VARCHAR(255),
  avatar_url VARCHAR(512),
  public_repos INT UNSIGNED DEFAULT 0,
  followers INT UNSIGNED DEFAULT 0,
  following INT UNSIGNED DEFAULT 0,
  public_gists INT UNSIGNED DEFAULT 0,
  account_created_at DATETIME,
  top_language VARCHAR(50),
  engagement_rate DECIMAL(5,2) DEFAULT 0.00,
  repo_velocity DECIMAL(5,2) DEFAULT 0.00,
  profile_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Explicit index for high-speed lookups on username
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
