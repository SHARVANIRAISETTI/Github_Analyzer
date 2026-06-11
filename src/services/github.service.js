import axios from 'axios';
import { env } from '../config/env.config.js';
import AppError from '../utils/AppError.js';

class GitHubService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        // Attach PAT if available in env to increase rate limits
        ...(env.GITHUB_PAT && { Authorization: `token ${env.GITHUB_PAT}` })
      }
    });
  }

  /**
   * Concurrently fetch a user's profile and their repositories
   * @param {string} username 
   * @returns {Promise<Object>} { profileData, reposData }
   */
  async fetchUserProfileAndRepos(username) {
    try {
      // Promise.all to fetch concurrently for performance
      const [profileResponse, reposResponse] = await Promise.all([
        this.client.get(`/users/${username}`),
        this.client.get(`/users/${username}/repos?per_page=100&sort=created&direction=desc`) // Max 100 for basic analysis
      ]);

      return {
        profileData: profileResponse.data,
        reposData: reposResponse.data
      };
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          throw new AppError(`GitHub user '${username}' not found`, 404);
        }
        if (error.response.status === 403) {
           throw new AppError('GitHub API rate limit exceeded. Please ensure GITHUB_PAT is set in .env', 429);
        }
      }
      throw new AppError(`Failed to fetch data from GitHub API: ${error.message}`, 502);
    }
  }
}

export default new GitHubService();
