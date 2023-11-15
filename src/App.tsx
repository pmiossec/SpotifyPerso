import { useEffect, useState } from 'react'
import { Spotify as SpotifyPlayer } from 'react-spotify-embed';
import './App.css'

const CLIENT_ID = "49db0fd1075941c8a76359263a5f2be0"

const tokenKey = "spotify_perso_token";
const tokenDateKey = tokenKey +"_date";

interface PlaylistData {
  title: string,
  url: string
}

//Spotify authentication: https://dev.to/dom_the_dev/how-to-use-the-spotify-api-in-your-react-js-app-50pn
const defaultPlaylist = "https://open.spotify.com/playlist/47dzOYBDRYt5ubbegyon3N"
function App() {
  const [activePlaylistUrl, setActivePlaylistUrl] = useState(defaultPlaylist);
  const [playlistUrls, setPlaylistUrls] = useState<PlaylistData[]>([{title: "perso", url: defaultPlaylist}]);
  const [token, setToken] = useState<string|null>(null);

  const fetchPlaylists = async (url: string, token: string) : Promise<PlaylistData[]>  => {
    // TODO Fetch **all** playlist and cache them in local storage
    // https://developer.spotify.com/documentation/web-api/reference/get-list-users-playlists
    const response = await fetch(url,{
      method: "GET",
      headers: {
        Authorization:`Bearer ${token}`
      },
    });

    if (!response.ok) {
      console.error("Call for playlists failed", response);
      return [];
    }

    const data = await response.json();
    const nextUrl = data.next as null | string;
    const playlistData = data.items as [{ name: string, external_urls: {spotify: string }}];
    // console.log("playlistData", playlistData);
    const playLists: PlaylistData[] = playlistData.map(p => {
      return { title: p.name, url: p.external_urls.spotify }
    });

    if (nextUrl) {
      const nextPlaylists = await fetchPlaylists(nextUrl, token);
      return [...playLists, ...nextPlaylists];
    }

    return playLists;
  };

  const fetchAllPlaylists = async () => {

    const hash = window.location.hash
    let extractedToken = window.localStorage.getItem(tokenKey)
    const storedTokenDate = new Date (window.localStorage.getItem(tokenDateKey) ?? new Date(1900, 1, 1).toString());

    console.log("storedTokenDate", storedTokenDate);

    if (storedTokenDate.getTime() < new Date().getTime() - 3_600_000) {
      extractedToken = null;
      window.localStorage.removeItem(tokenKey);
      window.localStorage.removeItem(tokenDateKey);
    }

    if (!extractedToken && hash) {
      extractedToken = (hash.substring(1).split("&").find(elem => elem.startsWith("access_token")) ?? "").split("=")[1]
      window.location.hash = "";
      window.localStorage.setItem(tokenKey, extractedToken);
      window.localStorage.setItem(tokenDateKey, new Date().toString());
    }

    setToken(extractedToken);

    if (!extractedToken) {
      console.log("No token to be able to do a Spotify api call... Please login.");
      return;
    }

    const playLists = await fetchPlaylists(`https://api.spotify.com/v1/me/playlists?limit=50`, extractedToken)
    const sortedPlaylists = playLists.sort((a, b)=> a.title.localeCompare(b.title));
    console.log("playLists", sortedPlaylists);
    setPlaylistUrls(sortedPlaylists);
    if (playLists.length === 1) {
      setActivePlaylistUrl(playLists[0].url);
    }
  };

  useEffect(() => { fetchAllPlaylists(); }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  }

  const redirectUri = `${window.location.origin}${window.location.pathname}`;

  return (
    <>
        <SpotifyPlayer link={activePlaylistUrl} />
        <div id="settings">
          { playlistUrls.length != 1 && <select name="playlists" id="playlists"
            value={activePlaylistUrl}
            onChange={e => setActivePlaylistUrl(e.target.value)}>
            {playlistUrls.map(p => <option value={p.url} key={p.url} >{p.title}</option>)}
          </select>}
          <input onChange={e => setActivePlaylistUrl(e.target.value)} value={activePlaylistUrl} placeholder='Spotify playlist url' />
          {!token && <a href={`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=playlist-read-private`}>🔐</a>}
          {token && <a onClick={() =>logout()} href="#">🔓</a>}
        </div>
    </>
  )
}

export default App;
