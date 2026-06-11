class AnalyzerService {
  /**
   * Determine the most frequently used primary language across repositories
   * @param {Array} repos 
   * @returns {string}
   */
  static calculateTopLanguage(repos) {
    if (!repos || repos.length === 0) return 'Unknown';

    const languageCounts = {};
    repos.forEach(repo => {
      const lang = repo.language;
      if (lang) {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      }
    });

    if (Object.keys(languageCounts).length === 0) return 'Unknown';

    return Object.keys(languageCounts).reduce((a, b) => 
      languageCounts[a] > languageCounts[b] ? a : b
    );
  }

  /**
   * Calculate Engagement Rate: ((followers + following) / (public_repos + 1)) * 100
   * @param {Object} profile 
   * @returns {number}
   */
  static calculateEngagementRate(profile) {
    const { followers, following, public_repos } = profile;
    const rate = ((followers + following) / (public_repos + 1)) * 100;
    return Number(rate.toFixed(2));
  }

  /**
   * Calculate Repo Velocity: Average number of public repositories created per year
   * @param {Object} profile 
   * @returns {number}
   */
  static calculateRepoVelocity(profile) {
    const { public_repos, created_at } = profile;
    const accountAgeMs = new Date() - new Date(created_at);
    const accountAgeYears = accountAgeMs / (1000 * 60 * 60 * 24 * 365.25);
    
    if (accountAgeYears <= 0) return public_repos; // To avoid Infinity or NaN

    const velocity = public_repos / accountAgeYears;
    return Number(velocity.toFixed(2));
  }

  /**
   * Calculate a weighted Profile Score out of 100
   * Formula can be arbitrary but should feel reasonable:
   * e.g., Followers (up to 40), Velocity (up to 30), Engagement (up to 30)
   * @param {Object} profile 
   * @param {number} engagementRate 
   * @param {number} repoVelocity 
   * @returns {number}
   */
  static calculateProfileScore(profile, engagementRate, repoVelocity) {
    // Follower Score (Max 40 points) - Logarithmic to not skew heavily for super stars
    const followerScore = Math.min(40, Math.log10(profile.followers + 1) * 10);
    
    // Velocity Score (Max 30 points) - Assuming ~10 repos/year is great
    const velocityScore = Math.min(30, (repoVelocity / 10) * 30);
    
    // Engagement Score (Max 30 points) - Assuming 50% is great
    const engScore = Math.min(30, (engagementRate / 50) * 30);
    
    const totalScore = followerScore + velocityScore + engScore;
    return Math.round(totalScore);
  }

  /**
   * Orchestrate all analyses
   * @param {Object} profile 
   * @param {Array} repos 
   * @returns {Object}
   */
  static analyze(profile, repos) {
    const top_language = this.calculateTopLanguage(repos);
    const engagement_rate = this.calculateEngagementRate(profile);
    const repo_velocity = this.calculateRepoVelocity(profile);
    const profile_score = this.calculateProfileScore(profile, engagement_rate, repo_velocity);

    return {
      top_language,
      engagement_rate,
      repo_velocity,
      profile_score
    };
  }
}

export default AnalyzerService;
