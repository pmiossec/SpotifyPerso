import { useState } from 'react'
import { Spotify as SpotifyPlayer } from 'react-spotify-embed';

import './App.css'

function App() {
  const [activePlaylistUrl, setActivePlaylistUrl] = useState("https://open.spotify.com/playlist/47dzOYBDRYt5ubbegyon3N")

  return (
    <>
      <div id="spotify">
        <SpotifyPlayer link={activePlaylistUrl} />
        <input onChange={e => setActivePlaylistUrl(e.target.value)} value={activePlaylistUrl} placeholder='Spotify playlist url' />
      </div>
    </>
  )
}

export default App