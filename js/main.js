/**
 * main.js — iPod app startup orchestrator.
 */

import './components/IpodDesign.js';
import { initDom } from './dom.js';
import { initPlayer } from './player.js';
import { initControls } from './controls.js';

function isDevEnvironment() {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || window.location.protocol === 'file:';
}

function setupDevChromeToggle() {
    if (!isDevEnvironment()) return;

    window.addEventListener('keydown', (e) => {
        const target = e.target;
        const isTypingTarget = target && (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        );
        if (isTypingTarget) return;

        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
            e.preventDefault();
            document.body.classList.toggle('dev-chrome-hidden');
        }
    });
}

function assertDomReady() {
    const refs = initDom();
    const required = [
        'menuPrimary',
        'menuSecondary',
        'controlWheel',
        'midButton',
        'menuButton',
        'nextButton',
        'prevButton',
        'playPauseButton',
        'audio'
    ];

    const missing = required.filter((key) => !refs[key]);
    if (missing.length > 0) {
        throw new Error(`iPod DOM initialization failed. Missing: ${missing.join(', ')}`);
    }
}

function hideIpodLoader() {
    const loader = document.getElementById('app-shell-loader');

    document.body.classList.remove('app-loading');

    if (!loader) return;

    loader.classList.add('is-hidden');
    setTimeout(() => {
        loader.remove();
    }, 260);
}

async function bootstrap() {
    await customElements.whenDefined('ipod-design');
    await new Promise((resolve) => requestAnimationFrame(resolve));

    setupDevChromeToggle();
    assertDomReady();
    initPlayer();
    await initControls();

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            hideIpodLoader();
        });
    });
}

bootstrap().catch((error) => {
    console.error('iPod bootstrap failed:', error);
});
