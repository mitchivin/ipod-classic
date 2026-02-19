/**
 * ui.js — Menu rendering, navigation transitions, and dynamic menu generation.
 *
 * Handles the iPod menu hierarchy: static menus from config,
 * dynamically generated Artist/Album/Song lists from the library,
 * and the slide-left/slide-right transition between menu levels.
 */

import { library, menus, state, elements } from './config.js';
import * as player from './player.js';
import { resetScrollState } from './controls.js';

// ── Dynamic Menu Items ───────────────────────────────────────

function getDynamicItems(key) {
    if (key === 'artists') {
        const artists = [...new Set(library.map(s => s.artist))].sort((a, b) => a.localeCompare(b));
        return artists.map(artist => ({
            label: artist,
            submenu: `artist:${artist}`
        }));
    }

    if (key === 'albums') {
        const albums = [...new Set(library.map(s => s.album))].sort((a, b) => a.localeCompare(b));
        return albums.map(album => ({
            label: album,
            submenu: `album:${album}`
        }));
    }

    if (key === 'songs') {
        const sorted = [...library].sort((a, b) => a.title.localeCompare(b.title));
        return sorted.map((song, idx) => ({
            label: song.title,
            action: () => player.playQueue(sorted, idx)
        }));
    }

    // Artist detail → "All Songs" + per-album submenus
    if (key.startsWith('artist:')) {
        const name = key.slice(7);
        const songs = library.filter(s => s.artist === name).sort((a, b) => a.title.localeCompare(b.title));
        const albums = [...new Set(songs.map(s => s.album))].sort((a, b) => a.localeCompare(b));
        return [
            { label: 'All Songs', action: () => player.playQueue(songs, 0) },
            ...albums.map(album => ({ label: album, submenu: `album:${album}` }))
        ];
    }

    // Album detail → track list
    if (key.startsWith('album:')) {
        const name = key.slice(6);
        const songs = library.filter(s => s.album === name);
        return songs.map((song, idx) => ({
            label: song.title,
            action: () => player.playQueue(songs, idx)
        }));
    }

    return [];
}

// ── Menu Resolution ──────────────────────────────────────────

/** Resolves any menu key (static or dynamic) to { title, items }. */
export function resolveMenu(key) {
    if (menus[key]) {
        return {
            title: menus[key].title,
            items: menus[key].items || getDynamicItems(key)
        };
    }
    if (key.startsWith('artist:')) return { title: key.slice(7), items: getDynamicItems(key) };
    if (key.startsWith('album:')) return { title: key.slice(6), items: getDynamicItems(key) };
    return { title: key, items: [] };
}

// ── Render ────────────────────────────────────────────────────

const MAX_VISIBLE = 7;

export function renderMenu(targetPane) {
    if (state.isNowPlaying) {
        elements.screenContainer.style.transform = 'translateX(-50%)';
        elements.headerTitle.innerText = 'Now Playing';
        state.lastRenderedMenuKey = 'now-playing';
        return;
    }

    elements.screenContainer.style.transform = 'translateX(0)';

    const { title, items } = resolveMenu(state.currentMenuKey);
    elements.headerTitle.innerText = title;

    // Clamp scrollOffset so the selected item stays visible
    if (state.selectedIndex < state.scrollOffset) {
        state.scrollOffset = state.selectedIndex;
    } else if (state.selectedIndex >= state.scrollOffset + MAX_VISIBLE) {
        state.scrollOffset = state.selectedIndex - MAX_VISIBLE + 1;
    }
    state.scrollOffset = Math.max(0, Math.min(state.scrollOffset, Math.max(0, items.length - MAX_VISIBLE)));

    const visible = items.slice(state.scrollOffset, state.scrollOffset + MAX_VISIBLE);
    const pane = targetPane || elements.menuPrimary;
    pane.innerHTML = '';

    const fragment = document.createDocumentFragment();
    visible.forEach((item, i) => {
        const realIndex = i + state.scrollOffset;
        const div = document.createElement('div');
        div.className = 'menu-item'
            + (realIndex === state.selectedIndex ? ' selected' : '')
            + (item.disabled ? ' disabled' : '');

        let right = '';
        if (item.submenu) right = '<span class="material-icons arrow">chevron_right</span>';
        else if (item.value) right = `<span class="value">${item.value}</span>`;

        div.innerHTML = `<span>${item.label}</span>${right}`;
        fragment.appendChild(div);
    });
    pane.appendChild(fragment);
    state.lastRenderedMenuKey = state.currentMenuKey;
}

// ── Menu Transitions ─────────────────────────────────────────

export function switchMenu(newMenuKey, direction = 'forward', targetIndex = 0) {
    resetScrollState();
    elements.menuSlider.style.transition = 'none';

    if (direction === 'forward') {
        state.currentMenuKey = newMenuKey;
        state.selectedIndex = targetIndex;
        renderMenu(elements.menuSecondary);
        elements.menuSlider.style.transform = 'translateX(0)';
        elements.menuSlider.offsetHeight; // Force reflow

        setTimeout(() => {
            elements.menuSlider.style.transition = 'transform 150ms ease-out';
            elements.menuSlider.style.transform = 'translateX(-50%)';
            const onEnd = () => {
                elements.menuSlider.removeEventListener('transitionend', onEnd);
                elements.menuSlider.style.transition = 'none';
                elements.menuPrimary.innerHTML = elements.menuSecondary.innerHTML;
                elements.menuSlider.style.transform = 'translateX(0)';
            };
            elements.menuSlider.addEventListener('transitionend', onEnd);
        }, 20);
    } else {
        elements.menuSecondary.innerHTML = elements.menuPrimary.innerHTML;
        state.currentMenuKey = newMenuKey;
        state.selectedIndex = targetIndex;
        renderMenu(elements.menuPrimary);
        elements.menuSlider.style.transform = 'translateX(-50%)';
        elements.menuSlider.offsetHeight; // Force reflow
        setTimeout(() => {
            elements.menuSlider.style.transition = 'transform 150ms ease-out';
            elements.menuSlider.style.transform = 'translateX(0)';
        }, 20);
    }
}

// ── Header Icons ─────────────────────────────────────────────

export function updateHeaderIcons() {
    elements.playIcon.classList.toggle('active', !elements.audio.paused && !elements.audio.ended);
}
