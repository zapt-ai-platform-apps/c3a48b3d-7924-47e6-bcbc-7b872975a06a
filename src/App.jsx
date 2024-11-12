import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function App() {
  const [names, setNames] = createSignal([]);
  const [newNames, setNewNames] = createSignal([]);
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [loading, setLoading] = createSignal(false);
  const [savingNames, setSavingNames] = createSignal({});
  const [petType, setPetType] = createSignal('Dog');

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
      authListener.data.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const fetchNames = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch('/api/getNames', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setNames(data);
    } else {
      console.error('Error fetching names:', response.statusText);
    }
  };

  const saveName = async (name) => {
    const { data: { session } } = await supabase.auth.getSession();
    try {
      setSavingNames(prev => ({ ...prev, [name]: true }));
      const response = await fetch('/api/saveName', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        setNames([...names(), { name }]);
      } else {
        console.error('Error saving name');
      }
    } catch (error) {
      console.error('Error saving name:', error);
    } finally {
      setSavingNames(prev => ({ ...prev, [name]: false }));
    }
  };

  createEffect(() => {
    if (!user()) return;
    fetchNames();
  });

  const handleGenerateNames = async () => {
    setLoading(true);
    try {
      const result = await createEvent('chatgpt_request', {
        prompt: `Provide a JSON array of 5 unique and cute names for a ${petType()}. Format: ["name1", "name2", ...]`,
        response_type: 'json'
      });
      if (Array.isArray(result)) {
        setNewNames(result);
      } else {
        setNewNames([]);
      }
    } catch (error) {
      console.error('Error generating names:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-pink-100 to-yellow-100 p-4">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-pink-600">Sign in with ZAPT</h2>
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
                view="magic_link"
                showLinks={false}
                authView="magic_link"
              />
            </div>
          </div>
        }
      >
        <div class="max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-pink-600">Name My Pet</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 class="text-2xl font-bold mb-4 text-pink-600">Generate Pet Names</h2>
              <div class="space-y-4">
                <select
                  value={petType()}
                  onInput={(e) => setPetType(e.target.value)}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent box-border"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Fish">Fish</option>
                  <option value="Hamster">Hamster</option>
                  <option value="Rabbit">Rabbit</option>
                </select>
                <button
                  onClick={handleGenerateNames}
                  class={`w-full px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                    loading() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading()}
                >
                  <Show when={!loading()} fallback={<span>Generating...</span>}>
                    Generate Names
                  </Show>
                </button>
              </div>
              <Show when={newNames().length > 0}>
                <h3 class="text-xl font-bold mt-6 mb-2 text-pink-600">Suggested Names</h3>
                <ul class="space-y-2">
                  <For each={newNames()}>
                    {(name) => (
                      <li class="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
                        <span class="text-gray-700">{name}</span>
                        <button
                          onClick={() => saveName(name)}
                          class={`bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                            savingNames()[name] ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={savingNames()[name]}
                        >
                          <Show when={!savingNames()[name]} fallback={<span>Saving...</span>}>
                            Save
                          </Show>
                        </button>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </div>

            <div>
              <h2 class="text-2xl font-bold mb-4 text-pink-600">My Saved Names</h2>
              <div class="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
                <For each={names()}>
                  {(item) => (
                    <div class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                      <p class="text-gray-700">{item.name}</p>
                      {/* Optionally add delete functionality here */}
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;