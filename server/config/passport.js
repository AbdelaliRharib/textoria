const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// GitHub OAuth Strategy (only if configured)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { githubId: profile.id.toString() },
          { email: profile.emails[0].value }
        ]
      }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: profile.emails[0].value,
          firstName: profile.displayName || profile.username,
          lastName: '',
          githubId: profile.id.toString(),
          avatar: profile.photos[0]?.value,
          isEmailVerified: true,
          role: 'USER'
        }
      });

      // Create default subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'FREE',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });
    } else if (!user.githubId) {
      // Update existing user with GitHub ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId: profile.id.toString(),
          avatar: profile.photos[0]?.value || user.avatar
        }
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
  }));
}

// Google OAuth Strategy (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: profile.emails[0].value,
          firstName: profile.name.givenName || '',
          lastName: profile.name.familyName || '',
          googleId: profile.id,
          avatar: profile.photos[0]?.value,
          isEmailVerified: true,
          role: 'USER'
        }
      });

      // Create default subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'FREE',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.id,
          avatar: profile.photos[0]?.value || user.avatar
        }
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
  }));
}

module.exports = passport;


