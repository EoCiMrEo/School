# User and Profile Management - Complete Guide

## Overview

The system now supports three workflows:
1. **Create User → Auto-creates Profile** (default behavior)
2. **Create Profile → No User** (for pre-registration)
3. **Create User for Existing Profile** (NEW!)

## Features Implemented

### 1. Create Profile Without User ✅
- Go to Admin → User Profiles → Add User Profile
- Leave "User" field as "(No user - Create profile first)"
- Fill in profile details
- Save

### 2. Create User Account for Existing Profile ✅

#### Method A: From Profile List
- Go to Admin → User Profiles
- Find profiles with "-" in the Email column (no user)
- Click on the profile
- You'll see "Create User Account" button
- Click it to create a user for that profile

#### Method B: From Profile Detail
- Go to Admin → User Profiles
- Click on any profile without a user
- In the list view, there's a "Create User Account" button
- Click it to open the user creation form

#### Method C: When Creating New User
- Go to Admin → Users → Add User
- You'll see new options:
  - "Skip automatic profile creation" checkbox
  - "Link to existing profile" dropdown
- Select an existing profile from the dropdown
- The new user will be linked to that profile

### 3. Create User Without Profile (Optional)
- Go to Admin → Users → Add User
- Check "Skip automatic profile creation"
- Don't select any profile to link
- User will be created without a profile

## How It Works

### Signals Enhancement
The signal system now:
1. Checks if there's an existing profile to link
2. Can skip profile creation if flagged
3. Still maintains data integrity

### Admin Interface
- Profile list shows "Create User Account" button for profiles without users
- User creation form has options to link existing profiles
- Full workflow support for all scenarios

## Use Cases

### Scenario 1: Pre-registration
1. Sales team creates profiles for potential customers
2. Profiles contain contact info, preferences
3. When customer signs up, create user account for their profile

### Scenario 2: Guest to Member
1. Guest makes inquiry (profile created)
2. Guest decides to register
3. Create user account for existing profile

### Scenario 3: Bulk Import
1. Import customer profiles from external system
2. Gradually create user accounts as needed
3. Some profiles may never need user accounts

## Visual Indicators

In Profile List:
- ✓ Has account (green) - Profile has user
- "Create User Account" button - Profile needs user

In User List:
- Has Profile column shows ✓ or ✗

## Database Relationships

```
User (auth_users)
  ↕ OneToOne (optional)
UserProfile (user_profiles)
```

- User → Profile: Automatic via signal (default)
- Profile → User: Manual via admin button (new)
- Both can exist independently

## Workflow Examples

### Example 1: Sales Lead
```
1. Sales creates profile: "John Doe" (potential customer)
2. Profile exists without user account
3. John decides to sign up
4. Admin clicks "Create User Account"
5. Enters email and password
6. John can now login
```

### Example 2: Existing Customer Database
```
1. Import 1000 customer profiles
2. Only 200 need login access
3. Create user accounts for those 200
4. Others remain as profiles only
```

### Example 3: Trial to Paid
```
1. Create profile for trial user
2. If they upgrade, create user account
3. If not, profile remains for marketing
```

## Admin Actions Available

1. **Create User Account** - For single profile
2. **Check which profiles need user accounts** - Bulk action
3. **Link to existing profile** - When creating user
4. **Skip profile creation** - When creating user

## Best Practices

1. **Default Flow**: Let signals auto-create profiles for users
2. **Pre-registration**: Create profiles first, users later
3. **Bulk Operations**: Use profiles for non-login entities
4. **Data Integrity**: System prevents duplicate profiles per user

## Troubleshooting

**Q: Can't create user for profile?**
A: Check if profile already has a user linked

**Q: Profile not auto-created?**
A: Check if "Skip profile creation" was checked

**Q: Can't link user to profile?**
A: Profile might already have a user

**Q: Multiple profiles per user?**
A: Not allowed - OneToOne relationship enforced

## Technical Details

### Signal Modifications
- Thread-local storage for profile linking
- Skip flag for profile creation
- Maintains transaction integrity

### Admin Enhancements
- Custom URL for user creation
- Form validation for email uniqueness
- Automatic name parsing from profile

### Database Constraints
- User can have 0 or 1 Profile
- Profile can have 0 or 1 User
- Email must be unique across Users

## Future Enhancements

Possible additions:
1. Bulk user creation for multiple profiles
2. Email invitation system
3. Temporary access tokens
4. Profile merge functionality
5. User account deactivation (keep profile)

## Summary

The system now fully supports:
- ✅ Users with auto-created profiles
- ✅ Profiles without users
- ✅ Creating users for existing profiles
- ✅ Linking existing profiles to new users
- ✅ Optional profile creation

This provides maximum flexibility for different business workflows while maintaining data integrity.
