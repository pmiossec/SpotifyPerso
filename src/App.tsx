import { useEffect, useState } from 'react'
import { Spotify as SpotifyPlayer } from 'react-spotify-embed';

import './App.css'

const spotifyAccessToken = "<TODO>";
//Spotify authentication: https://dev.to/dom_the_dev/how-to-use-the-spotify-api-in-your-react-js-app-50pn
const defaultPlaylist = "https://open.spotify.com/playlist/47dzOYBDRYt5ubbegyon3N"
function App() {
  const [activePlaylistUrl, setActivePlaylistUrl] = useState(defaultPlaylist);
  const [playlistUrls, setPlaylistUrls] = useState([{title: "perso", url: defaultPlaylist}]);


  const fetchPlaylists = async () => {
    const response = await fetch("https://api.spotify.com/v1/users/pmiossec/playlists",{
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      // mode: "cors", // no-cors, *cors, same-origin
      // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: "same-origin", // include, *same-origin, omit
      headers: {
        // "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:`Bearer ${spotifyAccessToken}`
      },
      // redirect: "follow", // manual, *follow, error
      // referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      // body: JSON.stringify(data), // body data type must match "Content-Type" header
    });

    // console.log("response", response);

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    // console.log("data", data);
    const playlistData = data.items as [{ name: string, external_urls: {spotify: string }}];
    // console.log("playlistData", playlistData);
    setPlaylistUrls(playlistData.map(p => {
      return { title: p.name, url: p.external_urls.spotify }
    }).sort((a, b)=> a.title.localeCompare(b.title)));
  };

  useEffect(() => { fetchPlaylists(); }, []);

  return (
    <>
        <SpotifyPlayer link={activePlaylistUrl} />
        <select name="playlists" id="playlists"
          value={activePlaylistUrl}
          onChange={e => setActivePlaylistUrl(e.target.value)}>
          {playlistUrls.map(p => <option value={p.url} >{p.title}</option>)}
        </select>
        <input onChange={e => setActivePlaylistUrl(e.target.value)} value={activePlaylistUrl} placeholder='Spotify playlist url' />
    </>
  )
}

export default App;
