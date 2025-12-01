// import mongoose, { Schema, Document } from 'mongoose';
 // TODO: Fix missing module: mongoose
import bcrypt from 'bcryptjs';

// Stub mongoose types
declare const Schema: any;
declare const mongoose: any;
declare const Document: any;

export interface IUser {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  userType: 'hourse' | 'children' | 'seniors';
  subscriptionTier: 'free' | 'premium' | 'elite';
  familyIds: any[]; // mongoose.Types.ObjectId[];
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpiry?: Date;
  ssoProvider?: 'google' | 'facebook' | 'apple';
  ssoProviderId?: string;
  refreshTokens: string[];
  lastLogin?: Date;
  isOnboardingComplete: boolean;
  preferences: {
    notifications: boolean;
    locationSharing: boolean;
    popupSettings: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      maxPerDay: number;
      categories: string[];
    };
  };
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
  }>;
  deviceTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: any = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address',
    },
  },
  password: {
    type: String,
    select: false, // Don't include password in queries by default
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(v: string) {
        // At least one uppercase, one lowercase, one number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    },
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  avatar: {
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Avatar must be a valid URL',
    },
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Please enter a valid phone number',
    },
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Date of birth cannot be in the future',
    },
  },
  userType: {
    type: String,
    enum: ['hourse', 'children', 'seniors'],
    default: 'hourse',
    required: true,
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'premium', 'elite'],
    default: 'free',
    required: true,
  },
  familyIds: [{
    type: Schema.Types.ObjectId,
    ref: 'hourse',
  }],
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationCode: {
    type: String,
    select: false,
  },
  emailVerificationExpiry: {
    type: Date,
    select: false,
  },
  ssoProvider: {
    type: String,
    enum: ['google', 'facebook', 'apple'],
  },
  ssoProviderId: {
    type: String,
  },
  refreshTokens: [{
    type: String,
    select: false,
  }],
  lastLogin: {
    type: Date,
  },
  isOnboardingComplete: {
    type: Boolean,
    default: false,
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true,
    },
    locationSharing: {
      type: Boolean,
      default: true,
    },
    popupSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily',
      },
      maxPerDay: {
        type: Number,
        default: 3,
        min: 1,
        max: 10,
      },
      categories: [{
        type: String,
        enum: ['ad', 'promotion', 'announcement', 'emergency'],
      }],
    },
  },
  emergencyContacts: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  deviceTokens: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Indexes for efficient querying
UserSchema.index({ email: 1 });
UserSchema.index({ ssoProvider: 1, ssoProviderId: 1 });
UserSchema.index({ familyIds: 1 });
UserSchema.index({ userType: 1 });
UserSchema.index({ subscriptionTier: 1 });
UserSchema.index({ isEmailVerified: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: any) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
UserSchema.virtual('age').get(function(this: any) {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(this: any, next: any) {
  // Only hash password if it's modified (or new)
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    // Hash password with salt rounds
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(this: any, candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to add hourse
UserSchema.methods.addFamily = async function(this: any, familyId: any) {
  if (!this.familyIds.includes(familyId)) {
    this.familyIds.push(familyId);
    await this.save();
  }
};

// Instance method to remove hourse
UserSchema.methods.removeFamily = async function(this: any, familyId: any) {
  this.familyIds = this.familyIds.filter((id: any) => !id.equals || !id.equals(familyId));
  await this.save();
};

// Instance method to add device token
UserSchema.methods.addDeviceToken = async function(this: any, token: string) {
  if (!this.deviceTokens.includes(token)) {
    this.deviceTokens.push(token);
    await this.save();
  }
};

// Instance method to remove device token
UserSchema.methods.removeDeviceToken = async function(this: any, token: string) {
  this.deviceTokens = this.deviceTokens.filter((t: string) => t !== token);
  await this.save();
};

// Instance method to add emergency contact
UserSchema.methods.addEmergencyContact = async function(this: any, contact: {
  name: string;
  phone: string;
  relationship: string;
  isPrimary?: boolean;
}) {
  // If this is a primary contact, unset other primary contacts
  if (contact.isPrimary) {
    this.emergencyContacts.forEach((c: any) => c.isPrimary = false);
  }
  
  this.emergencyContacts.push(contact);
  await this.save();
};

// Instance method to remove emergency contact
UserSchema.methods.removeEmergencyContact = async function(this: any, contactId: string) {
  this.emergencyContacts = this.emergencyContacts.filter(
    (contact: any) => contact._id.toString() !== contactId
  );
  await this.save();
};

// Static method to find users by hourse
UserSchema.statics.findByFamily = function(familyId: any) {
  return this.find({ familyIds: familyId }).populate('familyIds');
};

// Static method to find users by type
UserSchema.statics.findByType = function(userType: string) {
  return this.find({ userType });
};

// Static method to find premium users
UserSchema.statics.findPremiumUsers = function() {
  return this.find({ subscriptionTier: { $in: ['premium', 'elite'] } });
};

// Static method to get user statistics
UserSchema.statics.getUserStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        verifiedUsers: {
          $sum: { $cond: ['$isEmailVerified', 1, 0] }
        },
        premiumUsers: {
          $sum: { $cond: [{ $in: ['$subscriptionTier', ['premium', 'elite']] }, 1, 0] }
        },
        avgFamiliesPerUser: { $avg: { $size: '$familyIds' } }
      }
    }
  ]);
};

// Static method to find users by subscription tier
UserSchema.statics.findBySubscriptionTier = function(tier: string) {
  return this.find({ subscriptionTier: tier });
};

// Static method to find users with incomplete onboarding
UserSchema.statics.findIncompleteOnboarding = function() {
  return this.find({ isOnboardingComplete: false });
};

// Static method to find users by SSO provider
UserSchema.statics.findBySSOProvider = function(provider: string) {
  return this.find({ ssoProvider: provider });
};

// Static method to get user activity stats
UserSchema.statics.getActivityStats = function(days: number = 30) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        lastLogin: { $gte: dateThreshold }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' }
        },
        activeUsers: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

export const UserModel: any = mongoose.model('User', UserSchema); 