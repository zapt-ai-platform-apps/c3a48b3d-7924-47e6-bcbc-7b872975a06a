# Name My Pet

**Name My Pet** is an application designed to help users generate creative names for their pets and save their favorites to a personal list.

## User Journeys

### 1. Sign In

1. **Landing Page**: Users are greeted with a friendly sign-in page titled "Sign in with ZAPT".
2. **ZAPT Authentication**: Users can sign in using email magic links or through social providers like Google, Facebook, or Apple.
3. **Access Granted**: Upon successful authentication, users are redirected to the home page where they can start generating pet names.

### 2. Generate Pet Names

1. **Home Page**: Users see a welcoming interface with options to input details about their pet.
2. **Enter Pet Details**:
   - Users provide information such as the type of pet (e.g., dog, cat), characteristics, or any keywords they'd like the names to reflect.
3. **Generate Names**:
   - Users click the "Generate Names" button.
   - The app displays a loading state while fetching name suggestions.
4. **View Suggestions**:
   - A list of suggested pet names is displayed.
   - Users can scroll through the names and mark their favorites.

### 3. Save Favorite Names

1. **Mark Favorites**:
   - Users click on a heart icon or checkbox next to the names they like.
2. **Save to Database**:
   - Users click the "Save Favorites" button to store selected names.
   - The app confirms that the names have been saved successfully.

### 4. View Saved Names

1. **My Saved Names**:
   - Users navigate to a section where all their saved pet names are listed.
2. **Manage Names**:
   - Users can remove names from their saved list if they change their mind.

### 5. Additional Features

- **Generate Images**:
  - Users can generate an image of their pet with the selected name using AI.
- **Text to Speech**:
  - Users can hear how the pet name sounds.
- **Markdown Stories**:
  - Users can generate a short story about their pet with the chosen name in markdown format.

### 6. Sign Out

- Users can sign out at any time using the "Sign Out" button, returning them to the sign-in page.

## External API Services Used

- **ZAPT AI Services**:
  - Used for generating pet name suggestions based on user input.
  - Used for generating images, text-to-speech audio, and markdown stories.
  
## Note

- The app is free to use.
- All user data is securely stored, and authentication is handled via ZAPT (powered by Supabase Auth).
