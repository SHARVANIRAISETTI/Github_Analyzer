import ProfileService from '../services/profile.service.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * @desc    Analyze and save/upsert a GitHub profile
 * @route   POST /api/v1/profiles/:username
 * @access  Public
 */
export const analyzeProfile = catchAsync(async (req, res) => {
  const { username } = req.params;

  const result = await ProfileService.analyzeAndSaveProfile(username);

  res.status(result.source === 'cache' ? 200 : 201).json({
    status: 'success',
    source: result.source,
    data: result.data
  });
});

/**
 * @desc    Get paginated list of analyzed profiles
 * @route   GET /api/v1/profiles
 * @access  Public
 */
export const getProfiles = catchAsync(async (req, res) => {
  const result = await ProfileService.getProfilesList(req.query);

  res.status(200).json({
    status: 'success',
    results: result.data.length,
    meta: result.meta,
    data: result.data
  });
});

/**
 * @desc    Get a single profile from the local database
 * @route   GET /api/v1/profiles/:username
 * @access  Public
 */
export const getProfile = catchAsync(async (req, res) => {
  const { username } = req.params;

  const profile = await ProfileService.getProfileFromDB(username);

  res.status(200).json({
    status: 'success',
    data: profile
  });
});
