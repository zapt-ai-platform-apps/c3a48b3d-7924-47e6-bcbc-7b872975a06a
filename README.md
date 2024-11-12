# Name My Pet

**Name My Pet** is an application designed to help users generate creative names for their pets and save their favorites to a personal list.

## User Journeys

### 1. Sign In

1. **Landing Page**: Users are greeted with a friendly sign-in page titled "Sign in with ZAPT".
2. **ZAPT Authentication**: Users can sign in using email magic links or through social providers like Google, Facebook, or Apple.
3. **Access Granted**: Upon successful authentication, users are redirected to the home page where they can start generating pet names.

### 2. Generate Pet Names

1. **Home Page**: Users see a welcoming interface with options to input details about their pet.
2. **Select Pet Type**:
   - Users choose the type of pet they have (e.g., Dog, Cat, Bird) from a dropdown menu.
3. **Generate Names**:
   - Users click the "Generate Names" button.
   - The app displays a loading state ("Generating...") while fetching name suggestions.
4. **View Suggestions**:
   - A list of suggested pet names is displayed.
   - Users can scroll through the names and save their favorites.

### 3. Save Favorite Names

1. **Save Names**:
   - Next to each suggested name, there's a "Save" button.
   - Users click "Save" to add the name to their personal list.
   - The button displays a loading state ("Saving...") during the save process to prevent multiple clicks.
2. **Confirmation**:
   - Once saved, the name is added to the "My Saved Names" list.

### 4. View Saved Names

1. **My Saved Names**:
   - Users can view all the names they've saved in a scrollable list.
2. **Manage Names**:
   - Users can manage their saved names (e.g., potential future features like deleting names).

### 5. Sign Out

- Users can sign out at any time using the "Sign Out" button, returning them to the sign-in page.

## External API Services Used

- **ZAPT AI Services**:
  - Used for generating pet name suggestions based on the selected pet type.

## Notes

- The app is free to use.
- All user data is securely stored, and authentication is handled via ZAPT (powered by Supabase Auth).
- The app includes error logging with Sentry for both frontend and backend to ensure any issues are promptly addressed.
- The app is a Progressive Web App (PWA) and can be installed on your device.

## Environment Variables

The following environment variables are required:

- `VITE_PUBLIC_APP_ID`: Your app ID for initialization.
- `VITE_PUBLIC_SENTRY_DSN`: Sentry DSN for error logging.
- `VITE_PUBLIC_APP_ENV`: Environment (e.g., production, development).
- `NEON_DB_URL`: Database connection URL.