// backend/src/controllers/adminController.js
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    role, 
    barangay, 
    search, 
    isActive, 
    isVerified,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (role) filter.role = role;
  if (barangay) filter.barangay = barangay.toLowerCase();
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
  
  // Search functionality
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { contactNumber: { $regex: search, $options: 'i' } },
      { barangay: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (page - 1) * limit;

  try {
    const users = await User.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip(skip)
      .select('-password');

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        current: page * 1,
        pages: Math.ceil(total / limit),
        total,
        limit: limit * 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// @desc    Create new user (Admin only)
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, contactNumber, barangay, role = 'citizen', password } = req.body;

  try {
    // Generate default password if not provided
    const userPassword = password || `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;

    const user = await User.create({
      firstName,
      lastName,
      contactNumber,
      barangay: barangay.toLowerCase(),
      role,
      password: userPassword,
      isVerified: true // Admin-created users are auto-verified
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
      temporaryPassword: password ? undefined : userPassword
    });

    console.log(`Admin ${req.user.contactNumber} created user: ${user.contactNumber}`);
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Contact number is already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, barangay, role, isActive, isVerified, profile } = req.body;

  try {
    const fieldsToUpdate = {};
    
    if (firstName) fieldsToUpdate.firstName = firstName;
    if (lastName) fieldsToUpdate.lastName = lastName;
    if (barangay) fieldsToUpdate.barangay = barangay.toLowerCase();
    if (role) fieldsToUpdate.role = role;
    if (isActive !== undefined) fieldsToUpdate.isActive = isActive;
    if (isVerified !== undefined) fieldsToUpdate.isVerified = isVerified;
    if (profile) fieldsToUpdate.profile = { ...fieldsToUpdate.profile, ...profile };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

    console.log(`Admin ${req.user.contactNumber} updated user: ${user.contactNumber}`);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

    console.log(`Admin ${req.user.contactNumber} deleted user: ${user.contactNumber}`);
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private/Admin
exports.toggleUserActive = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    console.error('Toggle user active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/admin/users/stats
// @access  Private/Admin
exports.getUserStats = asyncHandler(async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          citizenUsers: { $sum: { $cond: [{ $eq: ['$role', 'citizen'] }, 1, 0] } }
        }
      }
    ]);

    const barangayStats = await User.aggregate([
      {
        $group: {
          _id: '$barangay',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const monthlyRegistrations = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          verifiedUsers: 0,
          adminUsers: 0,
          citizenUsers: 0
        },
        barangayDistribution: barangayStats,
        monthlyRegistrations: monthlyRegistrations.reverse()
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// @desc    Reset user password (Admin only)
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private/Admin
exports.resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate random password if not provided
    const password = newPassword || `${user.firstName.toLowerCase()}${Math.floor(Math.random() * 10000)}`;
    
    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      temporaryPassword: newPassword ? undefined : password
    });

    console.log(`Admin ${req.user.contactNumber} reset password for user: ${user.contactNumber}`);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});