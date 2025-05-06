import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import GitHubStrategy from "passport-github2";
import User from "../Models/User.js";
import dotenv from 'dotenv';
dotenv.config();
// Serialize only the user ID to reduce session size
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize by fetching user from DB
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

console.log(process.env.GOOGLE_CLIENT_ID,);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? process.env.GOOGLE_CALLBACK
          : "http://localhost:3001/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, { message: "No email provided by Google." });
        }

        // Check if email is already associated with another provider
        const existingUser = await User.findOne({ email });
        if (
          existingUser &&
          !existingUser.oauthProviders.some((p) => p.provider === "google")
        ) {
          return done(null, false, {
            message:
              "This email is already registered with GitHub. Please sign in using GitHub.",
          });
        }

        // Check for existing Google OAuth user
        let user = await User.findOne({
          "oauthProviders.provider": "google",
          "oauthProviders.providerId": profile.id,
        });

        if (!user) {
          user = new User({
            email,
            name: profile.displayName || "Unknown",
            oauthProviders: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
          await user.save();
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? process.env.GITHUB_CALLBACK
          : "http://localhost:5000/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value || `${profile.username}@github.com`;

        // Check if email is already associated with another provider
        const existingUser = await User.findOne({ email });
        if (
          existingUser &&
          !existingUser.oauthProviders.some((p) => p.provider === "github")
        ) {
          return done(null, false, {
            message:
              "This email is already registered with Google. Please sign in using Google.",
          });
        }

        // Check for existing GitHub OAuth user
        let user = await User.findOne({
          "oauthProviders.provider": "github",
          "oauthProviders.providerId": profile.id,
        });

        if (!user) {
          user = new User({
            email,
            name: profile.displayName || profile.username || "Unknown",
            oauthProviders: [
              {
                provider: "github",
                providerId: profile.id,
              },
            ],
          });
          await user.save();
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);