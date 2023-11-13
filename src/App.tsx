import { useEffect, useState } from 'react'
import { Spotify as SpotifyPlayer } from 'react-spotify-embed';
import './App.css'

const CLIENT_ID = "49db0fd1075941c8a76359263a5f2be0"

//Spotify authentication: https://dev.to/dom_the_dev/how-to-use-the-spotify-api-in-your-react-js-app-50pn
const defaultPlaylist = "https://open.spotify.com/playlist/47dzOYBDRYt5ubbegyon3N"
function App() {
  const [activePlaylistUrl, setActivePlaylistUrl] = useState(defaultPlaylist);
  const [playlistUrls, setPlaylistUrls] = useState([{title: "perso", url: defaultPlaylist}]);
  const [token, setToken] = useState<string|null>(null);

  const fetchPlaylists = async () => {

    const hash = window.location.hash
    let extractedToken = window.localStorage.getItem("token")

    if (!extractedToken && hash) {
      extractedToken = (hash.substring(1).split("&").find(elem => elem.startsWith("access_token")) ?? "").split("=")[1]
      window.location.hash = "";
      window.localStorage.setItem("token", extractedToken);
    }

    setToken(extractedToken);

    // https://developer.spotify.com/documentation/web-api/reference/get-list-users-playlists
    const response = await fetch(`https://api.spotify.com/v1/me/playlists`,{
      method: "GET",
      headers: {
        Authorization:`Bearer ${extractedToken}`
      },
    });

    if (!response.ok) {
      console.error("Call for playlists failed", response);
      return;
    }

    const data = await response.json();
    const playlistData = data.items as [{ name: string, external_urls: {spotify: string }}];
    // console.log("playlistData", playlistData);
    const playLists = playlistData.map(p => {
      return { title: p.name, url: p.external_urls.spotify }
    }).sort((a, b)=> a.title.localeCompare(b.title));
    console.log("playLists", playLists);
    setPlaylistUrls(playLists);
    if (playLists.length === 1) {
      setActivePlaylistUrl(playLists[0].url);
    }
  };

  useEffect(() => { fetchPlaylists(); }, []);

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
