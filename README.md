# Interactive iPod Classic

Interactive iPod Classic 5th Generation for the web. Use the click wheel to browse your library and play tracks with zero dependencies.

<img width="1918" height="1079" alt="image" src="https://github.com/user-attachments/assets/d1ebf1e0-ecfe-4c90-8fbe-ea10e7c3a965" />

## Overview

The iPod shell (aluminium body, click wheel, screen bezel, and button icons) was designed in **[DoodleDev](https://doodledev.app)**, a visual compiler that turns vector designs into production-ready HTML/CSS. You can find this design as **Preset 2** inside DoodleDev.

### Design and Logic
DoodleDev provides a clean visual foundation for production engineering. Instead of using AI to guess at a layout, this project starts with a pixel-perfect, zero-dependency export that is easy to adjust manually. 

The menu system, audio playback, and click wheel interactions were built directly onto the DoodleDev export across four JavaScript modules:

| Module | Responsibility |
|---|---|
| `config.js` | Application state, menu structure, element cache |
| `ui.js` | Menu rendering, slide transitions, dynamic lists |
| `controls.js` | Click wheel input, button binding, boot sequence |
| `player.js` | Queue management, playback, shuffle, progress bar |

## Features

- **Click Wheel Navigation**: Rotational input with dead zone detection and momentum.
- **Menu Hierarchy**: Browse by Artist, Album, or Song with slide transitions.
- **Now Playing**: 3D album art, marquee scrolling for long titles, and live progress bar.
- **Shuffle & Repeat**: Fisher-Yates shuffle with repeat one/all modes.
- **Artwork Loading**: Lazy loading with placeholders for cover art.
- **Responsive Layout**: Scales to any viewport while maintaining aspect ratio.

<img width="1918" height="1079" alt="image" src="https://github.com/user-attachments/assets/1e2cae44-cf6a-4492-b16e-b69517153d7d" />

## Project Structure

```
├── index.html              # Entry point
├── css/
│   ├── global.css          # Background, resets, and layout
│   ├── ipod.css            # Shell and button styling
│   ├── screen.css          # Status bar and battery
│   ├── menu.css            # Menu item styling
│   └── now-playing.css     # Metadata and progress bar
├── js/
│   ├── config.js           # State and menu data
│   ├── ui.js               # Rendering logic
│   ├── controls.js         # Input handling
│   ├── player.js           # Audio engine
│   └── library.json        # Music library data
└── public/
    ├── icons/              # SVG assets
    ├── covers/             # Album art
    └── music/              # MP3 files
```

## Customizing the Library

To add your own music, modify `js/library.json` and add your files to the `public/` folder.

### 1. Data Structure
Each song in `js/library.json` follows this format:

```json
{
    "id": 1,
    "title": "Song Title",
    "artist": "Artist Name",
    "album": "Album Name",
    "src": "public/music/your_file.mp3",
    "artwork": "public/covers/your_artwork.jpg",
    "rating": 5
}
```

- **src**: Path to the MP3 file.
- **artwork**: Path to the cover image. Defaults to a placeholder if empty.
- **rating**: Optional 0-5 value for the rating stars.

### 2. Organization
- Place audio in `public/music/`.
- Place images in `public/covers/`.

The application generates menu items automatically based on the JSON. No core code changes are needed to update the music.

## Running Locally

Serve the files using a local server:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Open `http://localhost:8000`. A server is required for ES modules and the library fetch.

## Tech Stack

- **HTML/CSS/JS**: Vanilla implementation with zero dependencies.
- **ES Modules**: Native module system.
- **Web Audio**: Standard audio elements for playback.
- **DoodleDev**: Visual shell design ([doodledev.app](https://doodledev.app)).

## Credits

Designed and built by **[Mitch Ivin](https://mitchivin.com/)**.
Shell designed in **[DoodleDev](https://doodledev.app)**.

## License

MIT
