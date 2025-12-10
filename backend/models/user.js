const mongoose = require("mongoose");

/**
 * User Schema
 * ----------------------------------------
 * Stores all users in the system:
 * - Employees
 * - Managers
 * - Admins
 * 
 * Each user has:
 * - name: Full name of the user
 * - email: Unique login email
 * - password: Hashed password
 * - role: Determines access level
 * - skills: Array of skills with skill level
 */

const UserSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Unique email address for login
    email: {
      type: String,
      required: true,
      unique: true,   // no two users can have the same email
      lowercase: true,
      trim: true
    },

    // Company Name for Multi-Tenancy
    company: {
      type: String,
      required: true,
      trim: true
    },

    // Password will be hashed using bcrypt before saving
    password: {
      type: String,
      required: true,
    },

    // User role → controls access permissions
    role: {
      type: String,
      enum: ["employee", "manager", "admin"],
      default: "employee", // default role is employee
    },

    // Profile Picture
    avatar: {
      data: Buffer,
      contentType: String
    },

    // User Preferences
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      darkMode: {
        type: Boolean,
        default: true
      },
      twoFactorEnabled: {
        type: Boolean,
        default: false
      },
      weeklyReports: {
        type: Boolean,
        default: true
      },
      systemBranding: {
        type: Boolean,
        default: true
      }
    },

    /**
     * Skills array:
     * Each skill entry contains:
     * - skillId: Reference to Skill model
     * - level: How skilled the user is (1–10 scale)
     */
    skills: [
      {
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill",    // reference to Skill model
        },
        level: {
          type: Number,
          min: 1,
          max: 10,
          default: 1,
        }
      }
    ],

    /**
     * Refresh Token:
     * Stores the JWT refresh token for this user's current session.
     * - Used to obtain new access tokens without logging in again
     * - Cleared on logout for security
     * - Only one refresh token per user (single session support)
     */
    refreshToken: {
      type: String,
      default: null,
    },

    // Password reset workflow
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },

    // Account Approval Status
    // - Employees: Auto-verified (true)
    // - Admins: Auto-verified via secret (true)
    // - Managers: Pending approval (false)
    isVerified: {
      type: Boolean,
      default: true
    },

    // Pending Profile Update Request
    profileUpdateRequest: {
      field: { type: String, enum: ['name'], default: null },
      value: { type: String, default: null },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: null },
      requestedAt: { type: Date, default: null }
    }
  },

  // Automatically adds createdAt and updatedAt timestamps
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);