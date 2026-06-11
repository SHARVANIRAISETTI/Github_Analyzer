import ProfileModel from '../models/ProfileModel.js';
import GitHubService from './github.service.js';
import AnalyzerService from './analyzer.service.js';
import AppError from '../utils/AppError.js';

class ProfileService {
  /**
   * Check cache or fetch, analyze, and upsert
   * @param {string} username 
   * @returns {Object} Final profile data
   */
  static async analyzeAndSaveProfile(username) {
    const lowerUsername = username.toLowerCase();

    // 1. Check local DB for cached profile
    const existingProfile = await ProfileModel.findByUsername(lowerUsername);

    if (existingProfile) {
      // Check if it's less than 12 hours old
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      const updatedAt = new Date(existingProfile.updated_at);

      if (updatedAt > twelveHoursAgo) {
        return {
          source: 'cache',
          data: existingProfile
        };
      }
    }

    // 2. Fetch fresh data from GitHub concurrently
    const { profileData, reposData } = await GitHubService.fetchUserProfileAndRepos(lowerUsername);

    // 3. Analyze data and calculate custom metrics
    const analysis = AnalyzerService.analyze(profileData, reposData);

    // 4. Construct complete DB payload
    const finalProfileData = {
      username: lowerUsername,
      name: profileData.name || null,
      bio: profileData.bio || null,
      company: profileData.company || null,
      location: profileData.location || null,
      avatar_url: profileData.avatar_url || null,
      public_repos: profileData.public_repos || 0,
      followers: profileData.followers || 0,
      following: profileData.following || 0,
      public_gists: profileData.public_gists || 0,
      account_created_at: new Date(profileData.created_at).toISOString().slice(0, 19).replace('T', ' '),
      ...analysis
    };

    // 5. Upsert to DB
    await ProfileModel.upsertProfile(finalProfileData);

    // Fetch the newly upserted row to get accurate timestamps and DB-generated fields
    const freshProfile = await ProfileModel.findByUsername(lowerUsername);

    return {
      source: 'github_api',
      data: freshProfile
    };
  }

  /**
   * Retrieve a paginated list of profiles
   */
  static async getProfilesList(queryParams) {
    return await ProfileModel.getProfiles(queryParams);
  }

  /**
   * Get single profile purely from local DB
   * @param {string} username 
   */
  static async getProfileFromDB(username) {
    const profile = await ProfileModel.findByUsername(username.toLowerCase());
    
    if (!profile) {
      throw new AppError(`Profile for '${username}' has not been analyzed yet. Please run POST /api/v1/profiles/${username} first.`, 404);
    }

    return profile;
  }
}

export default ProfileService;
