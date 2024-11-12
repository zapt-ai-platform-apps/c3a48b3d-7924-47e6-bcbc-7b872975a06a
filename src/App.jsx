import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { SolidMarkdown } from "solid-markdown";

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [loading, setLoading] = createSignal(false);
  const [petType, setPetType] = createSignal('');
  const [petCharacteristics, setPetCharacteristics] = createSignal('');
  const [nameSuggestions, setNameSuggestions] = createSignal([]);
  const [savedNames, setSavedNames] = createSignal([]);
  const [selectedNames, setSelectedNames] = createSignal([]);
  const [generatedImage, setGeneratedImage] = createSignal('');
  const [audioUrl, setAudioUrl] = createSignal('');
  const [markdownText, setMarkdownText] = createSignal('');

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const authListener = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const fetchSavedNames = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch('/api/getNames', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setSavedNames(data);
    } else {
      console.error('Error fetching names:', response.statusText);
    }
  };

  const saveNames = async () => {
    if (selectedNames().length === 0) return;
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const response = await fetch('/api/saveNames', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ names: selectedNames() }),
      });
      if (response.ok) {
        setSavedNames([...savedNames(), ...selectedNames()]);
        setSelectedNames([]);
      } else {
        console.error('Error saving names');
      }
    } catch (error) {
      console.error('Error saving names:', error);
    }
  };

  const handleGenerateNames = async () => {
    setLoading(true);
    try {
      const prompt = `Suggest 10 unique names for a ${petType()} that is ${petCharacteristics()}. Return the names in a JSON array under the key "names".`;
      const result = await createEvent('chatgpt_request', {
        prompt,
        response_type: 'json'
      });
      setNameSuggestions(result.names || []);
    } catch (error) {
      console.error('Error generating names:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectName = (name) => {
    if (selectedNames().includes(name)) {
      setSelectedNames(selectedNames().filter(n => n !== name));
    } else {
      setSelectedNames([...selectedNames(), name]);
    }
  };

  const handleGenerateImage = async () => {
    setLoading(true);
    try {
      const result = await createEvent('generate_image', {
        prompt: `A cute ${petType()} named ${selectedNames()[0] || 'your pet'}`
      });
      setGeneratedImage(result);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = async () => {
    if (!selectedNames().length) return;
    setLoading(true);
    try {
      const result = await createEvent('text_to_speech', {
        text: `Your pet's new name is ${selectedNames()[0]}`
      });
      setAudioUrl(result);
    } catch (error) {
      console.error('Error converting text to speech:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkdownGeneration = async () => {
    if (!selectedNames().length) return;
    setLoading(true);
    try {
      const prompt = `Write a short, heartwarming story about a ${petType()} named ${selectedNames()[0]}. Return the story in markdown format.`;
      const result = await createEvent('chatgpt_request', {
        prompt,
        response_type: 'text'
      });
      setMarkdownText(result);
    } catch (error) {
      console.error('Error generating markdown:', error);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    if (!user()) return;
    fetchSavedNames();
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-green-600">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                showLinks={false}
                view="magic_link"
              />
            </div>
          </div>
        }
      >
        <div class="max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-green-600">Name My Pet</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-green-600">Describe Your Pet</h2>
              <div class="space-y-4">
                <input
                  type="text"
                  placeholder="Type of pet (e.g., dog, cat)"
                  value={petType()}
                  onInput={(e) => setPetType(e.target.value)}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent box-border"
                  required
                />
                <input
                  type="text"
                  placeholder="Pet characteristics (e.g., playful, brown fur)"
                  value={petCharacteristics()}
                  onInput={(e) => setPetCharacteristics(e.target.value)}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent box-border"
                  required
                />
                <button
                  onClick={handleGenerateNames}
                  class={`w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading()}
                >
                  <Show when={loading()}>Generating...</Show>
                  <Show when={!loading()}>Generate Names</Show>
                </button>
              </div>
            </div>

            <div class="col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-green-600">Name Suggestions</h2>
              <div class="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
                <For each={nameSuggestions()}>
                  {(name) => (
                    <div
                      class={`flex items-center justify-between bg-white p-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${selectedNames().includes(name) ? 'border-2 border-green-500' : ''}`}
                      onClick={() => handleSelectName(name)}
                    >
                      <p class="text-gray-700">{name}</p>
                      <Show when={selectedNames().includes(name)}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
              <button
                onClick={saveNames}
                class="w-full mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                disabled={selectedNames().length === 0}
              >
                Save Selected Names
              </button>
            </div>

            <div class="col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-green-600">Your Saved Names</h2>
              <div class="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
                <For each={savedNames()}>
                  {(name) => (
                    <div class="bg-white p-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                      <p class="text-gray-700">{name.name}</p>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>

          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-green-600">Additional Features</h2>
              <div class="space-y-4">
                <button
                  onClick={handleGenerateImage}
                  class="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                  disabled={loading()}
                >
                  Generate Image
                </button>
                <Show when={selectedNames().length}>
                  <button
                    onClick={handleTextToSpeech}
                    class="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                    disabled={loading()}
                  >
                    Text to Speech
                  </button>
                  <button
                    onClick={handleMarkdownGeneration}
                    class="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                    disabled={loading()}
                  >
                    Generate Story
                  </button>
                </Show>
              </div>
            </div>

            <Show when={generatedImage()}>
              <div class="col-span-1">
                <h3 class="text-xl font-bold mb-2 text-green-600">Generated Image</h3>
                <img src={generatedImage()} alt="Generated pet image" class="w-full rounded-lg shadow-md" />
              </div>
            </Show>
            <Show when={audioUrl()}>
              <div class="col-span-1">
                <h3 class="text-xl font-bold mb-2 text-green-600">Pet Name Audio</h3>
                <audio controls src={audioUrl()} class="w-full" />
              </div>
            </Show>
            <Show when={markdownText()}>
              <div class="col-span-1 md:col-span-2">
                <h3 class="text-xl font-bold mb-2 text-green-600">Story</h3>
                <div class="bg-white p-4 rounded-lg shadow-md">
                  <SolidMarkdown children={markdownText()} />
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;