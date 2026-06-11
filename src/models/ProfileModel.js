import pool from '../config/db.config.js';

class ProfileModel {
  /**
   * Find a profile by username
   * @param {string} username 
   * @returns {Promise<Object|null>}
   */
  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM github_profiles WHERE username = ? LIMIT 1',
      [username]
    );
    return rows[0] || null;
  }

  /**
   * Upsert a profile into the database
   * @param {Object} profileData 
   */
  static async upsertProfile(profileData) {
    const sql = `
      INSERT INTO github_profiles (
        username, name, bio, company, location, avatar_url,
        public_repos, followers, following, public_gists, account_created_at,
        top_language, engagement_rate, repo_velocity, profile_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        bio = VALUES(bio),
        company = VALUES(company),
        location = VALUES(location),
        avatar_url = VALUES(avatar_url),
        public_repos = VALUES(public_repos),
        followers = VALUES(followers),
        following = VALUES(following),
        public_gists = VALUES(public_gists),
        top_language = VALUES(top_language),
        engagement_rate = VALUES(engagement_rate),
        repo_velocity = VALUES(repo_velocity),
        profile_score = VALUES(profile_score)
    `;

    const values = [
      profileData.username,
      profileData.name,
      profileData.bio,
      profileData.company,
      profileData.location,
      profileData.avatar_url,
      profileData.public_repos,
      profileData.followers,
      profileData.following,
      profileData.public_gists,
      profileData.account_created_at,
      profileData.top_language,
      profileData.engagement_rate,
      profileData.repo_velocity,
      profileData.profile_score,
    ];

    const [result] = await pool.execute(sql, values);
    return result;
  }

  /**
   * Get a list of profiles with pagination, sorting, and filtering
   */
  static async getProfiles({ page = 1, limit = 10, sortBy = 'profile_score', order = 'desc', language = null }) {
    const offset = (page - 1) * limit;
    
    // Whitelist sortable columns to prevent SQL injection
    const validSortColumns = ['profile_score', 'public_repos', 'followers', 'created_at', 'repo_velocity', 'engagement_rate'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'profile_score';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let query = 'SELECT * FROM github_profiles';
    let countQuery = 'SELECT COUNT(*) as total FROM github_profiles';
    const queryParams = [];

    if (language) {
      query += ' WHERE top_language = ?';
      countQuery += ' WHERE top_language = ?';
      queryParams.push(language);
    }

    query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(query, queryParams);
    
    // For count query, we only need the language param if it exists
    const countParams = language ? [language] : [];
    const [countRows] = await pool.execute(countQuery, countParams);

    return {
      data: rows,
      meta: {
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countRows[0].total / limit)
      }
    };
  }
}

export default ProfileModel;
