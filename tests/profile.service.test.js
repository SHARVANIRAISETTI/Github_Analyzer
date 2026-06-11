import { jest } from '@jest/globals';
import ProfileService from '../src/services/profile.service.js';
import GitHubService from '../src/services/github.service.js';
import ProfileModel from '../src/models/ProfileModel.js';
import AnalyzerService from '../src/services/analyzer.service.js';

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('analyzeAndSaveProfile', () => {
    const mockUsername = 'testuser';
    const mockDbProfile = {
      id: 1,
      username: 'testuser',
      followers: 100,
      updated_at: new Date().toISOString() // Very recent
    };

    it('should return cached profile if updated within 12 hours', async () => {
      jest.spyOn(ProfileModel, 'findByUsername').mockResolvedValue(mockDbProfile);
      jest.spyOn(GitHubService, 'fetchUserProfileAndRepos').mockResolvedValue({});

      const result = await ProfileService.analyzeAndSaveProfile(mockUsername);

      expect(ProfileModel.findByUsername).toHaveBeenCalledWith('testuser');
      expect(GitHubService.fetchUserProfileAndRepos).not.toHaveBeenCalled();
      expect(result.source).toBe('cache');
      expect(result.data).toEqual(mockDbProfile);
    });

    it('should fetch from GitHub, analyze, and upsert if not in cache', async () => {
      jest.spyOn(ProfileModel, 'findByUsername')
        .mockResolvedValueOnce(null) // Not found initially
        .mockResolvedValueOnce(mockDbProfile); // Found after upsert

      const mockGithubProfile = {
        login: 'testuser',
        followers: 100,
        following: 50,
        public_repos: 10,
        created_at: '2020-01-01T00:00:00Z'
      };
      const mockGithubRepos = [{ language: 'JavaScript' }, { language: 'JavaScript' }];

      jest.spyOn(GitHubService, 'fetchUserProfileAndRepos').mockResolvedValue({
        profileData: mockGithubProfile,
        reposData: mockGithubRepos
      });

      jest.spyOn(ProfileModel, 'upsertProfile').mockResolvedValue({});

      const result = await ProfileService.analyzeAndSaveProfile(mockUsername);

      expect(GitHubService.fetchUserProfileAndRepos).toHaveBeenCalledWith('testuser');
      expect(ProfileModel.upsertProfile).toHaveBeenCalled();
      expect(result.source).toBe('github_api');
      expect(result.data).toEqual(mockDbProfile);
    });
  });

  describe('AnalyzerService.calculateEngagementRate', () => {
    it('should calculate engagement rate correctly', () => {
      const profile = { followers: 10, following: 10, public_repos: 4 };
      // ((10 + 10) / (4 + 1)) * 100 = (20 / 5) * 100 = 400
      const rate = AnalyzerService.calculateEngagementRate(profile);
      expect(rate).toBe(400);
    });
  });
});
