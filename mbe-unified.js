(() => {
  const tool = "daniel";
  const headerMarkup = "<header class=\"mbe-global-shell\" data-tool=\"daniel\" data-embedded=\"true\">\n      <div class=\"mbe-shell-wrap\">\n        <div class=\"mbe-ribbon-left\">\n          <a class=\"mbe-ribbon-brand\" href=\"https://mybibleexplorer.com\" aria-label=\"My Bible Explorer home\"><img class=\"mbe-ribbon-logo\" src=\"https://mybibleexplorer.com/assets/my-bible-explorer-logo.png?v=mbe-20260715-1\" alt=\"My Bible Explorer\" width=\"107\" height=\"34\"></a>\n          <a class=\"mbe-ribbon-back\" href=\"https://mybibleexplorer.com/#journeys\">Back to Library</a>\n        </div>\n        <nav class=\"mbe-global-nav\" aria-label=\"My Bible Explorer\">\n          <details class=\"mbe-library-menu\">\n            <summary class=\"mbe-library-toggle\">Library</summary>\n            <div class=\"mbe-library-panel\">\n              <div class=\"mbe-library-grid\">\n            <a class=\"mbe-library-item\" href=\"https://hermeneutics.mybibleexplorer.com\"><span class=\"mbe-library-name\">Hermeneutics</span><span class=\"mbe-library-desc\">Learn to read Scripture faithfully</span></a>\n            <a class=\"mbe-library-item\" href=\"https://psalms.mybibleexplorer.com\"><span class=\"mbe-library-name\">Psalms</span><span class=\"mbe-library-desc\">Worship, lament, praise, and prayer</span></a>\n            <a class=\"mbe-library-item\" href=\"https://sanctuary.mybibleexplorer.com/#structure\"><span class=\"mbe-library-name\">Sanctuary</span><span class=\"mbe-library-desc\">A blueprint of salvation</span></a>\n            <a class=\"mbe-library-item\" href=\"https://lastdayevents.mybibleexplorer.com/index.html\"><span class=\"mbe-library-name\">Last Day Events</span><span class=\"mbe-library-desc\">Earth's final chapter</span></a>\n            <a class=\"mbe-library-item\" href=\"https://parables.mybibleexplorer.com\"><span class=\"mbe-library-name\">Parables</span><span class=\"mbe-library-desc\">Stories of the kingdom</span></a>\n            <a class=\"mbe-library-item\" href=\"https://romans.mybibleexplorer.com\"><span class=\"mbe-library-name\">Romans</span><span class=\"mbe-library-desc\">Righteousness by faith and life in the Spirit</span></a>\n            <a class=\"mbe-library-item\" href=\"https://corinthians.mybibleexplorer.com/\"><span class=\"mbe-library-name\">Corinthians</span><span class=\"mbe-library-desc\">Unity, worship, holy living, and resurrection</span></a>\n            <a class=\"mbe-library-item\" href=\"https://galatians.mybibleexplorer.com/\"><span class=\"mbe-library-name\">Galatians</span><span class=\"mbe-library-desc\">Freedom in Christ and life by the Spirit</span></a>\n            <a class=\"mbe-library-item\" href=\"https://ephesians.mybibleexplorer.com/\"><span class=\"mbe-library-name\">Ephesians</span><span class=\"mbe-library-desc\">Grace, unity, new life, and spiritual warfare</span></a>\n            <a class=\"mbe-library-item\" href=\"https://philippians.mybibleexplorer.com/\"><span class=\"mbe-library-name\">Philippians</span><span class=\"mbe-library-desc\">Joy, humility, perseverance, and contentment</span></a>\n            <a class=\"mbe-library-item\" href=\"https://colossians.mybibleexplorer.com/\"><span class=\"mbe-library-name\">Colossians</span><span class=\"mbe-library-desc\">The supremacy of Christ and life in Him</span></a>\n            <a class=\"mbe-library-item\" href=\"https://hebrews.mybibleexplorer.com/\"><span class=\"mbe-library-name\">Hebrews</span><span class=\"mbe-library-desc\">Christ, covenant, sanctuary, and persevering faith</span></a>\n            <a class=\"mbe-library-item\" href=\"https://james.mybibleexplorer.com/\"><span class=\"mbe-library-name\">James</span><span class=\"mbe-library-desc\">Living faith, wisdom, speech, patience, and prayer</span></a>\n            <a class=\"mbe-library-item\" href=\"https://isaiah.mybibleexplorer.com/\"><span class=\"mbe-library-name\">Isaiah</span><span class=\"mbe-library-desc\">Judgment, comfort, and gospel hope</span></a>\n            <a class=\"mbe-library-item\" href=\"https://daniel.mybibleexplorer.com\" aria-current=\"page\"><span class=\"mbe-library-name\">Daniel</span><span class=\"mbe-library-desc\">Prophecy and providence</span></a>\n            <a class=\"mbe-library-item\" href=\"https://revelation.mybibleexplorer.com/\"><span class=\"mbe-library-name\">Revelation</span><span class=\"mbe-library-desc\">Symbols, judgment, and final hope</span></a>\n            <a class=\"mbe-library-item\" href=\"https://christ.mybibleexplorer.com/\"><span class=\"mbe-library-name\">Life of Christ</span><span class=\"mbe-library-desc\">The life and ministry of Jesus</span></a>\n              </div>\n            </div>\n          </details>\n          <a class=\"mbe-ribbon-give\" href=\"https://mybibleexplorer.com/#donate\">Support</a>\n        </nav>\n      </div>\n    </header>";
  const footerMarkup = "<footer class=\"mbe-global-footer\" data-tool=\"daniel\">\n      <div class=\"mbe-shell-wrap mbe-footer-wrap\">\n        <a class=\"mbe-footer-brand\" href=\"https://mybibleexplorer.com\" aria-label=\"My Bible Explorer home\"><img class=\"mbe-footer-logo\" src=\"https://mybibleexplorer.com/assets/my-bible-explorer-logo.png?v=mbe-20260715-1\" alt=\"My Bible Explorer\" width=\"107\" height=\"34\"></a>\n        <span>Know the Word. Live the Word.</span>\n        <span>To contact, email <a class=\"mbe-footer-link\" href=\"mailto:admin@mybibleexplorer.com\">admin@mybibleexplorer.com</a></span>\n        <a class=\"mbe-footer-link\" href=\"https://mybibleexplorer.com/#donate\">Support</a>\n        <span>&copy; <span data-mbe-year></span> My Bible Explorer</span>\n      </div>\n    </footer>\n    ";

  function updateYear() {
    document.querySelectorAll('[data-mbe-year]').forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  }

  function ensureDarkTheme() {
    document.documentElement.classList.add('dark');
    try {
      window.localStorage.setItem('daniel-theme', 'dark');
      window.localStorage.setItem('theme', 'dark');
    } catch (error) {
      // Some browsers block localStorage in restricted contexts.
    }
  }

  function ensureIllustratedAssets() {
    if (!document.head) return;
    const href = '/daniel-illustrated.css?v=daniel-study-55';
    const existing = document.querySelector('link[data-dvx="css"]');
    if (existing) {
      const expected = new URL(href, window.location.origin).href;
      if (existing.href !== expected) existing.href = href;
      return;
    }
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-dvx', 'css');
      document.head.appendChild(link);
    }
  }

  function ensureDanielArtworkMeta() {
    if (!document.body) return;
    const path = ((window.location.pathname || '/').replace(/\/+$/, '') || '/').replace(/\/index\.html$/, '') || '/';

    document.body.removeAttribute('data-daniel-route');
    document.body.removeAttribute('data-daniel-chapter');
    document.body.removeAttribute('data-daniel-chart');

    if (path === '/') {
      document.body.setAttribute('data-daniel-route', 'home');
      return;
    }

    if (path === '/background') {
      document.body.setAttribute('data-daniel-route', 'introduction');
      return;
    }

    const chartMatch = path.match(/^\/charts\/([^/]+)$/);
    if (path === '/charts' || chartMatch) {
      document.body.setAttribute('data-daniel-route', 'charts');
      if (chartMatch) document.body.setAttribute('data-daniel-chart', chartMatch[1]);
      return;
    }

    const chapterMatch = path.match(/^\/chapters\/(\d+)$/);
    if (!chapterMatch) return;

    const chapter = Number(chapterMatch[1]);
    if (chapter < 1 || chapter > 12) return;

    document.body.setAttribute('data-daniel-chapter', String(chapter));
  }

  const MOBILE_INLINE_NOTES_QUERY = '(max-width: 1023px)';
  const DANIEL_STUDY_REVISION = 'daniel-study-55';
  const danielStudyBundles = new Map();
  let danielStudySupportsReady = false;
  let danielInlineNotesReady = false;
  let inlineNoteRequestId = 0;
  let pendingInlineVerse = null;

  function studyEscape(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function currentDanielChapter() {
    const value = Number(document.body && document.body.getAttribute('data-daniel-chapter'));
    return value >= 1 && value <= 12 ? value : null;
  }

  function loadDanielStudyBundle(chapter) {
    if (danielStudyBundles.has(chapter)) return danielStudyBundles.get(chapter);
    const request = window.fetch(
      '/assets/commentary/daniel-' + chapter + '.json?v=' + DANIEL_STUDY_REVISION,
      { credentials: 'same-origin' }
    ).then((response) => {
      if (!response.ok) throw new Error('Unable to load Daniel ' + chapter + ' study supports.');
      return response.json();
    });
    danielStudyBundles.set(chapter, request);
    return request;
  }

  function wordNotesIcon() {
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 12h-5"></path><path d="M15 8h-5"></path><path d="M19 17V5a2 2 0 0 0-2-2H4"></path><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"></path></svg>';
  }

  function wordNoteReferences(references) {
    if (!Array.isArray(references) || !references.length) return '';
    return '<div class="daniel-word-note-references">' + references.map((reference) => (
      '<span>' + studyEscape(reference) + '</span>'
    )).join('') + '</div>';
  }

  function wordNotesMarkup(note) {
    const notes = Array.isArray(note && note.wordNotes) ? note.wordNotes : [];
    if (!notes.length) return '';
    return '<section class="daniel-word-notes" data-daniel-word-notes>' +
      '<div class="daniel-word-notes-title">' + wordNotesIcon() + '<span>Word / Phrase Notes</span></div>' +
      '<div class="daniel-word-notes-list">' + notes.map((item) => (
        '<article class="daniel-word-note">' +
          '<h3>' + studyEscape(item.term) + '</h3>' +
          '<p>' + studyEscape(item.explanation) + '</p>' +
          wordNoteReferences(item.scriptureReferences) +
        '</article>'
      )).join('') + '</div>' +
    '</section>';
  }

  function ensureWordPhraseNotesForNode(noteNode) {
    if (!danielStudySupportsReady) return Promise.resolve(false);
    if (!noteNode || noteNode.hasAttribute('data-daniel-inline-note')) return Promise.resolve(false);
    if (noteNode.querySelector('[data-daniel-word-notes]')) return Promise.resolve(true);

    const chapter = currentDanielChapter();
    const match = noteNode.id && noteNode.id.match(/^note-(\d+)$/);
    if (!chapter || !match) return Promise.resolve(false);
    const verse = Number(match[1]);

    return loadDanielStudyBundle(chapter).then((bundle) => {
      const currentNode = document.getElementById('note-' + verse);
      if (!currentNode || currentNode.querySelector('[data-daniel-word-notes]')) return Boolean(currentNode);
      const note = Array.isArray(bundle.notes) ? bundle.notes.find((item) => Number(item.verse) === verse) : null;
      const markup = wordNotesMarkup(note);
      if (!markup) return false;
      currentNode.insertAdjacentHTML('beforeend', markup);
      return true;
    }).catch(() => false);
  }

  function ensureActiveWordPhraseNotes() {
    document.querySelectorAll('aside[data-commentary-panel] [id^="note-"]').forEach((note) => {
      ensureWordPhraseNotesForNode(note);
    });
  }

  function installWordPhraseNotes() {
    if (!danielStudySupportsReady) return;
    ensureActiveWordPhraseNotes();
    if (window.__danielWordPhraseNotes) return;
    window.__danielWordPhraseNotes = true;
    let queued = false;
    const queue = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        ensureActiveWordPhraseNotes();
        syncInlineStudyNoteTriggers();
      });
    };
    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
  }

  function activateDanielStudySupports() {
    if (danielStudySupportsReady) return;
    danielStudySupportsReady = true;
    installWordPhraseNotes();
    syncInlineStudyNoteTriggers();
    flushPendingInlineStudyNote();
  }

  function scheduleDanielStudySupports() {
    const schedule = () => window.setTimeout(activateDanielStudySupports, 800);
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
  }

  function isInlineNotesViewport() {
    return window.matchMedia && window.matchMedia(MOBILE_INLINE_NOTES_QUERY).matches;
  }

  function removeInlineStudyNotes() {
    document.querySelectorAll('[data-daniel-inline-note]').forEach((node) => node.remove());
    if (!danielStudySupportsReady) return;
    document.querySelectorAll('main[data-bible-panel] button[id^="v-"]').forEach((button) => {
      if (isInlineNotesViewport()) {
        button.setAttribute('aria-expanded', 'false');
      } else {
        button.removeAttribute('aria-expanded');
        button.removeAttribute('aria-controls');
      }
    });
  }

  function cancelInlineStudyNotes() {
    inlineNoteRequestId += 1;
    pendingInlineVerse = null;
    removeInlineStudyNotes();
  }

  function syncInlineStudyNoteTriggers() {
    if (!danielStudySupportsReady || !isInlineNotesViewport()) return;
    const active = document.querySelector('[data-daniel-inline-note]');
    const activeVerse = active && active.getAttribute('data-daniel-inline-note-verse');
    document.querySelectorAll('main[data-bible-panel] button[id^="v-"]').forEach((button) => {
      const match = button.id.match(/^v-(\d+)$/);
      if (!match) return;
      button.setAttribute('aria-controls', 'inline-note-' + Number(match[1]));
      button.setAttribute('aria-expanded', String(match[1] === activeVerse));
    });
  }

  function closeMobileStudyDrawer() {
    if (!isInlineNotesViewport()) return;

    const panel = document.querySelector('aside[data-commentary-panel]');
    if (panel) {
      const closeButton = panel.querySelector('button[aria-label="Close study notes"]');
      if (closeButton && !panel.classList.contains('translate-x-full')) {
        closeButton.click();
      }
      panel.classList.add('translate-x-full');
      panel.classList.remove('translate-x-0');
    }

    document.querySelectorAll('.fixed.inset-0.z-40').forEach((overlay) => {
      const className = String(overlay.className || '');
      if (!className.includes('bg-black/45')) return;
      overlay.classList.add('pointer-events-none', 'opacity-0');
      overlay.classList.remove('pointer-events-auto', 'opacity-100');
    });
  }

  function cleanInlineNoteIds(note, verseNumber) {
    note.id = 'inline-note-' + verseNumber;
    note.querySelectorAll('[id]').forEach((node, index) => {
      node.id = 'inline-note-' + verseNumber + '-' + index;
    });
  }

  function cloneStudyNoteUnderVerse(verseButton, verseNumber) {
    if (!isInlineNotesViewport()) {
      removeInlineStudyNotes();
      return true;
    }

    verseButton = document.getElementById('v-' + verseNumber) || verseButton;
    if (!verseButton || !verseButton.isConnected) return false;

    const sourceNote = document.getElementById('note-' + verseNumber);
    if (!sourceNote) return false;
    if (!sourceNote.querySelector('[data-daniel-word-notes]')) {
      ensureWordPhraseNotesForNode(sourceNote);
      return false;
    }

    const verseBlock = verseButton.closest('div');
    if (!verseBlock) return false;

    removeInlineStudyNotes();

    const note = sourceNote.cloneNode(true);
    cleanInlineNoteIds(note, verseNumber);
    note.classList.add('daniel-inline-note');
    note.setAttribute('data-daniel-inline-note', '');
    note.setAttribute('data-daniel-inline-note-verse', String(verseNumber));
    note.setAttribute('data-state', 'open');
    note.setAttribute('role', 'region');
    note.setAttribute('aria-label', 'Study note for verse ' + verseNumber);
    note.removeAttribute('aria-live');

    verseBlock.insertAdjacentElement('afterend', note);
    verseButton.setAttribute('aria-controls', note.id);
    verseButton.setAttribute('aria-expanded', 'true');
    closeMobileStudyDrawer();
    window.setTimeout(closeMobileStudyDrawer, 80);
    return true;
  }

  function queueInlineStudyNote(verseButton) {
    const match = verseButton && verseButton.id && verseButton.id.match(/^v-(\d+)$/);
    if (!match) return;

    const verseNumber = Number(match[1]);
    if (!isInlineNotesViewport()) {
      cancelInlineStudyNotes();
      return;
    }

    if (!danielInlineNotesReady || !danielStudySupportsReady) {
      inlineNoteRequestId += 1;
      pendingInlineVerse = pendingInlineVerse === verseNumber ? null : verseNumber;
      removeInlineStudyNotes();
      closeMobileStudyDrawer();
      return;
    }

    const openNote = document.querySelector('[data-daniel-inline-note-verse="' + verseNumber + '"]');
    if (openNote || pendingInlineVerse === verseNumber) {
      cancelInlineStudyNotes();
      closeMobileStudyDrawer();
      return;
    }

    const requestId = ++inlineNoteRequestId;
    pendingInlineVerse = verseNumber;
    removeInlineStudyNotes();

    [0, 80, 180, 360, 700, 1100].forEach((delay) => {
      window.setTimeout(() => {
        if (requestId !== inlineNoteRequestId) return;
        if (cloneStudyNoteUnderVerse(verseButton, verseNumber)) {
          pendingInlineVerse = null;
          inlineNoteRequestId += 1;
        }
      }, delay);
    });
  }

  function flushPendingInlineStudyNote() {
    if (!danielInlineNotesReady || !danielStudySupportsReady || pendingInlineVerse == null) return;
    const verseNumber = pendingInlineVerse;
    const verseButton = document.getElementById('v-' + verseNumber);
    pendingInlineVerse = null;
    if (verseButton) queueInlineStudyNote(verseButton);
  }

  function installInlineStudyNotes() {
    if (window.__danielInlineStudyNotes) return;
    window.__danielInlineStudyNotes = true;

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== 'function') return;

      if (target.closest('button[aria-label="Open study notes"]')) {
        cancelInlineStudyNotes();
        return;
      }

      const verseButton = target.closest('main[data-bible-panel] button[id^="v-"]');
      if (!verseButton) return;

      queueInlineStudyNote(verseButton);
    }, true);

    if (window.matchMedia) {
      const media = window.matchMedia(MOBILE_INLINE_NOTES_QUERY);
      const handleViewportChange = () => {
        if (!media.matches) cancelInlineStudyNotes();
        else syncInlineStudyNoteTriggers();
      };
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', handleViewportChange);
      } else if (typeof media.addListener === 'function') {
        media.addListener(handleViewportChange);
      }
    }
  }

  const DESKTOP_READER_FOOTER_QUERY = '(min-width: 981px)';
  let readerFooterState = null;

  function isDesktopReaderFooterViewport() {
    return window.matchMedia && window.matchMedia(DESKTOP_READER_FOOTER_QUERY).matches;
  }

  function isChapterSplitReader() {
    return Boolean(
      document.body &&
      document.body.hasAttribute('data-daniel-chapter') &&
      document.querySelector('[data-chapter-workspace] main[data-bible-panel]') &&
      document.querySelector('[data-chapter-workspace] aside[data-commentary-panel]')
    );
  }

  function readerFooterCandidates() {
    return Array.from(document.querySelectorAll([
      '[data-chapter-workspace] .workspace-scroll',
      'main[data-bible-panel]',
      'aside[data-commentary-panel]',
      '.scripture-pane-body',
      '.commentary-pane-body',
      '.scripture-pane',
      '.commentary-pane',
      '.scripture-panel',
      '.commentary-panel'
    ].join(',')));
  }

  function readerFooterScrollPanes() {
    const seen = new Set();
    return readerFooterCandidates().filter((node) => {
      if (!node || seen.has(node)) return false;
      seen.add(node);
      const style = window.getComputedStyle(node);
      const scrollable = /(auto|scroll)/.test(style.overflowY || '');
      return scrollable && node.scrollHeight > node.clientHeight + 8;
    });
  }

  function setReaderFooterVisible(visible, anchorPane) {
    if (!document.body) return;
    document.body.classList.toggle('mbe-reader-footer-visible', visible);
    document.body.classList.toggle('mbe-reader-footer-hidden', !visible);

    if (!readerFooterState) return;
    if (!visible) {
      readerFooterState.anchorPane = null;
      readerFooterState.anchorBottomTop = 0;
      return;
    }

    if (anchorPane) {
      const bottom = Math.max(0, anchorPane.scrollHeight - anchorPane.clientHeight);
      anchorPane.scrollTop = bottom;
      readerFooterState.lastTop.set(anchorPane, bottom);
      readerFooterState.anchorPane = anchorPane;
      readerFooterState.anchorBottomTop = bottom;
    }
  }

  function measureReaderFooter() {
    const footer = document.querySelector('.mbe-global-footer[data-tool="' + tool + '"]');
    if (!footer || !document.documentElement) return;
    const height = Math.ceil(footer.getBoundingClientRect().height || 0) + 1;
    const workspace = document.querySelector('[data-chapter-workspace]');
    const workspaceTop = workspace ? Math.max(0, workspace.getBoundingClientRect().top) : 0;
    document.documentElement.style.setProperty('--mbe-reader-footer-height', height + 'px');
    if (workspaceTop) {
      document.documentElement.style.setProperty('--mbe-reader-workspace-top', workspaceTop.toFixed(2) + 'px');
    }
  }

  function resetDesktopReaderFooter() {
    if (readerFooterState) {
      readerFooterState.panes.forEach((pane) => pane.removeEventListener('scroll', readerFooterState.onScroll));
      window.removeEventListener('resize', readerFooterState.onResize);
      if (readerFooterState.media) {
        if (typeof readerFooterState.media.removeEventListener === 'function') {
          readerFooterState.media.removeEventListener('change', readerFooterState.onMediaChange);
        } else if (typeof readerFooterState.media.removeListener === 'function') {
          readerFooterState.media.removeListener(readerFooterState.onMediaChange);
        }
      }
      readerFooterState = null;
    }
    if (document.body) {
      document.body.classList.remove('mbe-reader-footer-managed', 'mbe-reader-footer-visible', 'mbe-reader-footer-hidden');
    }
    if (document.documentElement) {
      document.documentElement.style.removeProperty('--mbe-reader-footer-height');
      document.documentElement.style.removeProperty('--mbe-reader-workspace-top');
    }
  }

  function installDesktopReaderFooter() {
    if (!document.body) return;
    if (readerFooterState) resetDesktopReaderFooter();

    const footer = document.querySelector('.mbe-global-footer[data-tool="' + tool + '"]');
    if (!footer || !isChapterSplitReader() || !isDesktopReaderFooterViewport()) {
      resetDesktopReaderFooter();
      return;
    }

    const panes = readerFooterScrollPanes();
    if (!panes.length) {
      resetDesktopReaderFooter();
      return;
    }

    const media = window.matchMedia ? window.matchMedia(DESKTOP_READER_FOOTER_QUERY) : null;
    const lastTop = new WeakMap();
    const atBottom = (pane) => pane.scrollTop + pane.clientHeight >= pane.scrollHeight - 18;
    const onScroll = (event) => {
      const pane = event.currentTarget;
      const previous = lastTop.get(pane) ?? pane.scrollTop;
      const current = pane.scrollTop;
      const scrollingUp = current < previous - 2;
      lastTop.set(pane, current);

      if (scrollingUp) {
        const anotherPaneAtBottom = panes.some((candidate) => candidate !== pane && atBottom(candidate));
        if (anotherPaneAtBottom) return;

        if (document.body.classList.contains('mbe-reader-footer-visible') && readerFooterState && readerFooterState.anchorPane === pane) {
          const footerHeight = Number.parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--mbe-reader-footer-height')) || 0;
          if (current > readerFooterState.anchorBottomTop - footerHeight) return;
        }

        setReaderFooterVisible(false);
        return;
      }

      if (atBottom(pane)) setReaderFooterVisible(true, pane);
    };
    const onResize = () => {
      measureReaderFooter();
      if (!isChapterSplitReader() || !isDesktopReaderFooterViewport()) resetDesktopReaderFooter();
    };
    const onMediaChange = () => {
      if (!isDesktopReaderFooterViewport()) resetDesktopReaderFooter();
    };

    readerFooterState = {
      panes,
      media,
      lastTop,
      anchorPane: null,
      anchorBottomTop: 0,
      onScroll,
      onResize,
      onMediaChange
    };
    document.body.classList.add('mbe-reader-footer-managed');
    setReaderFooterVisible(false);
    measureReaderFooter();

    panes.forEach((pane) => {
      lastTop.set(pane, pane.scrollTop);
      pane.addEventListener('scroll', onScroll, { passive: true });
    });
    window.addEventListener('resize', onResize, { passive: true });
    if (media) {
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', onMediaChange);
      } else if (typeof media.addListener === 'function') {
        media.addListener(onMediaChange);
      }
    }
  }

  function queueDesktopReaderFooter() {
    window.setTimeout(installDesktopReaderFooter, 700);
    window.setTimeout(installDesktopReaderFooter, 1700);
  }

  // Swap the header brand emblem for the "Open Scripture" engraving.
  const SCRIPTURE_EMBLEM =
    '<g>' +
    '<line x1="50" y1="30" x2="50" y2="20"></line>' +
    '<line x1="42" y1="31.5" x2="38.5" y2="22.5"></line>' +
    '<line x1="58" y1="31.5" x2="61.5" y2="22.5"></line>' +
    '<line x1="35" y1="35" x2="28.5" y2="28.5"></line>' +
    '<line x1="65" y1="35" x2="71.5" y2="28.5"></line>' +
    '</g>' +
    '<path d="M50 47 q-13 -6 -24 -3 v27 q11 -3 24 3"></path>' +
    '<path d="M50 47 q13 -6 24 -3 v27 q-11 -3 -24 3"></path>' +
    '<line x1="50" y1="47" x2="50" y2="77"></line>' +
    '<path d="M32 55 q8 -2 15 1 M32 61 q8 -2 15 1 M53 56 q8 -3 15 0 M53 62 q8 -3 15 0"></path>';

  function ensureLogo() {
    const wm = document.querySelector('.tracking-\\[0\\.3em\\]');
    if (!wm) return;
    const brand = wm.closest('a');
    if (!brand) return;
    const svg = brand.querySelector('svg');
    if (!svg || svg.getAttribute('data-dvx-logo') === 'scripture') return;
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('stroke-width', '5');
    svg.setAttribute('data-dvx-logo', 'scripture');
    svg.innerHTML = SCRIPTURE_EMBLEM;
  }









  // MBE reference navigator start
  const referenceNavConfig = {"book":"Daniel","slug":"daniel","basePath":"/chapters/","storageKey":"danielRecentReferences","chapterCount":12,"verseCounts":[0,21,49,30,37,31,28,28,27,27,21,45,13],"simpleVerseIds":true};
  const referenceNavIcons = {
    arrowLeft: '<svg class="mbe-ref-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>',
    arrowRight: '<svg class="mbe-ref-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>',
    chevronDown: '<svg class="mbe-ref-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>'
  };

  function installReferenceNavStyles() {
    if (!document.head || document.getElementById('mbe-reference-nav-style')) return;
    const style = document.createElement('style');
    style.id = 'mbe-reference-nav-style';
    style.textContent = `
.mbe-ref-strip {
  position: sticky !important;
  top: calc(46px + 4rem) !important;
  z-index: 55 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 3.35rem !important;
  border-bottom: 1px solid rgba(201, 164, 76, .18) !important;
  background: rgba(19, 45, 63, .94) !important;
  padding: .35rem .75rem !important;
  box-shadow: 0 16px 34px -34px rgba(0,0,0,.9) !important;
  backdrop-filter: blur(14px) !important;
}
.mbe-ref-nav {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: .45rem !important;
  width: min(100%, 72rem) !important;
  margin: 0 auto !important;
}
.mbe-ref-form {
  position: relative !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: .45rem !important;
  flex: 1 1 18.5rem !important;
  width: min(18.5rem, 42vw) !important;
  max-width: 24rem !important;
  min-width: 13rem !important;
  height: 2.55rem !important;
  border: 1px solid rgba(229, 205, 154, .22) !important;
  border-radius: .4rem !important;
  background: rgba(245, 234, 213, .08) !important;
  padding: 0 .72rem 0 .55rem !important;
  color: #f5ead5 !important;
}
.mbe-ref-form:focus-within {
  border-color: rgba(229, 205, 154, .48) !important;
  background: rgba(245, 234, 213, .12) !important;
}
.mbe-ref-badge {
  display: inline-grid !important;
  place-items: center !important;
  flex: 0 0 auto !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
  border-radius: .22rem !important;
  background: #c9a44c !important;
  color: #0b1f3a !important;
  font-size: .48rem !important;
  font-weight: 800 !important;
  letter-spacing: .02em !important;
}
.mbe-ref-picker-toggle {
  display: inline-flex !important;
  align-items: center !important;
  gap: .4rem !important;
  flex: 0 0 auto !important;
  border: 0 !important;
  background: transparent !important;
  color: rgba(245, 234, 213, .7) !important;
  padding: 0 !important;
  cursor: pointer !important;
}
.mbe-ref-input {
  min-width: 0 !important;
  flex: 1 1 auto !important;
  border: 0 !important;
  background: transparent !important;
  color: #f5ead5 !important;
  font: 800 clamp(.92rem, 1.5vw, 1.08rem) var(--font-sans, Jost, system-ui, sans-serif) !important;
  letter-spacing: 0 !important;
  outline: 0 !important;
}
.mbe-ref-input::placeholder {
  color: rgba(245, 234, 213, .48) !important;
}
.mbe-ref-step,
.mbe-ref-recent-toggle,
.mbe-ref-all-toggle {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 auto !important;
  height: 2.55rem !important;
  min-width: 2.55rem !important;
  border: 1px solid rgba(229, 205, 154, .18) !important;
  border-radius: .4rem !important;
  background: rgba(245, 234, 213, .07) !important;
  color: rgba(245, 234, 213, .72) !important;
  padding: 0 .78rem !important;
  font: 800 .7rem var(--font-sans, Jost, system-ui, sans-serif) !important;
  letter-spacing: .08em !important;
  text-transform: uppercase !important;
  text-decoration: none !important;
  cursor: pointer !important;
}
.mbe-ref-step {
  width: 2.55rem !important;
  padding: 0 !important;
}
.mbe-ref-step:hover,
.mbe-ref-recent-toggle:hover,
.mbe-ref-recent-toggle[aria-expanded="true"],
.mbe-ref-all-toggle:hover,
.mbe-ref-all-toggle[aria-expanded="true"] {
  border-color: rgba(229, 205, 154, .32) !important;
  background: #c9a44c !important;
  color: #0b1f3a !important;
}
.mbe-ref-disabled {
  opacity: .36 !important;
  pointer-events: none !important;
}
.mbe-ref-icon {
  width: .95rem !important;
  height: .95rem !important;
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 2.2 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}
.mbe-ref-menu-wrap {
  position: relative !important;
  flex: 0 0 auto !important;
}
.mbe-ref-picker,
.mbe-ref-recent-dropdown,
.mbe-ref-all-dropdown {
  position: absolute !important;
  top: calc(100% + .45rem) !important;
  z-index: 120 !important;
  overflow: hidden !important;
  border: 1px solid rgba(229, 205, 154, .24) !important;
  border-radius: .45rem !important;
  background: rgba(11, 31, 58, .98) !important;
  color: #f5ead5 !important;
  box-shadow: 0 22px 55px rgba(0,0,0,.42) !important;
}
.mbe-ref-picker {
  left: 50% !important;
  width: min(24rem, calc(100vw - 1.5rem)) !important;
  transform: translateX(-50%) !important;
}
.mbe-ref-recent-dropdown,
.mbe-ref-all-dropdown {
  right: 0 !important;
  width: min(15rem, calc(100vw - 1.5rem)) !important;
}
.mbe-ref-all-dropdown {
  width: min(24rem, calc(100vw - 1.5rem)) !important;
}
.mbe-ref-picker[hidden],
.mbe-ref-recent-dropdown[hidden],
.mbe-ref-all-dropdown[hidden] {
  display: none !important;
}
.mbe-ref-picker-head {
  display: grid !important;
  grid-template-columns: 1.8rem minmax(0, 1fr) auto 1.8rem !important;
  align-items: center !important;
  gap: .35rem !important;
  padding: .55rem .65rem !important;
  border-bottom: 1px solid rgba(229, 205, 154, .14) !important;
}
.mbe-ref-picker-title {
  color: #f5ead5 !important;
  text-align: center !important;
  font: 800 clamp(.9rem, 1.6vw, 1.08rem) var(--font-sans, Jost, system-ui, sans-serif) !important;
}
.mbe-ref-back,
.mbe-ref-close,
.mbe-ref-go {
  display: inline-grid !important;
  place-items: center !important;
  min-width: 1.8rem !important;
  height: 1.8rem !important;
  border: 0 !important;
  border-radius: .35rem !important;
  background: rgba(245, 234, 213, .08) !important;
  color: rgba(245, 234, 213, .72) !important;
  font: 800 .72rem var(--font-sans, Jost, system-ui, sans-serif) !important;
  cursor: pointer !important;
}
.mbe-ref-back[hidden] {
  display: inline-grid !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
.mbe-ref-close {
  font-size: 1.32rem !important;
  line-height: 1 !important;
}
.mbe-ref-go,
.mbe-ref-back:hover,
.mbe-ref-close:hover {
  background: #c9a44c !important;
  color: #0b1f3a !important;
}
.mbe-ref-grid,
.mbe-ref-recent-list {
  display: grid !important;
  gap: .35rem !important;
  padding: .75rem !important;
}
.mbe-ref-grid {
  grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
}
.mbe-ref-grid button,
.mbe-ref-recent-list button,
.mbe-ref-empty {
  min-height: 1.7rem !important;
  border: 0 !important;
  border-radius: .35rem !important;
  background: transparent !important;
  color: rgba(245, 234, 213, .72) !important;
  font: 800 clamp(.72rem, 1vw, .88rem) var(--font-sans, Jost, system-ui, sans-serif) !important;
  letter-spacing: 0 !important;
}
.mbe-ref-grid button,
.mbe-ref-recent-list button {
  cursor: pointer !important;
}
.mbe-ref-grid button:hover,
.mbe-ref-grid button.is-active,
.mbe-ref-recent-list button:hover {
  background: #c9a44c !important;
  color: #0b1f3a !important;
}
.mbe-ref-recent-list button,
.mbe-ref-empty {
  width: 100% !important;
  padding: .55rem .65rem !important;
  text-align: left !important;
}
.mbe-ref-empty {
  margin: 0 !important;
  color: rgba(245, 234, 213, .52) !important;
  font-weight: 600 !important;
}
@media (max-width: 760px) {
  .mbe-ref-strip {
    top: calc(46px + 3.75rem) !important;
    padding: .25rem .45rem !important;
  }
  .mbe-ref-nav {
    gap: .3rem !important;
  }
  .mbe-ref-form {
    width: auto !important;
    min-width: 0 !important;
    height: 2.35rem !important;
    padding: 0 .5rem 0 .42rem !important;
  }
  .mbe-ref-input {
    font-size: clamp(.86rem, 4vw, 1rem) !important;
  }
  .mbe-ref-badge {
    width: 1.32rem !important;
    height: 1.32rem !important;
    font-size: .42rem !important;
  }
  .mbe-ref-step,
  .mbe-ref-recent-toggle,
  .mbe-ref-all-toggle {
    height: 2.35rem !important;
    min-width: 2.35rem !important;
    padding: 0 .48rem !important;
    font-size: .58rem !important;
    letter-spacing: .05em !important;
  }
  .mbe-ref-picker {
    position: fixed !important;
    top: calc(46px + 3.15rem + 2.15rem) !important;
    right: 1rem !important;
    left: 1rem !important;
    width: auto !important;
    transform: none !important;
  }
  .mbe-ref-picker-head {
    grid-template-columns: 1.65rem minmax(0, 1fr) auto 1.65rem !important;
    padding: .45rem .5rem !important;
  }
  .mbe-ref-grid {
    gap: .25rem !important;
    padding: .5rem !important;
  }
  .mbe-ref-grid button {
    min-height: 1.55rem !important;
    font-size: .66rem !important;
  }
}
    `;
    document.head.appendChild(style);
  }

  function referencePathChapter() {
    const path = (window.location.pathname || '/').replace(/\/index\.html$/, '/');
    if (!path.startsWith(referenceNavConfig.basePath)) return null;
    const rest = path.slice(referenceNavConfig.basePath.length).replace(/\/+$/, '');
    if (!/^\d+$/.test(rest)) return null;
    const chapter = Number(rest);
    if (!chapter || chapter < 1 || chapter > referenceNavConfig.chapterCount) return null;
    return chapter;
  }

  function referenceUrl(chapter, verse) {
    return referenceNavConfig.basePath + chapter + '/' + (verse ? '#v' + verse : '');
  }

  function referenceFormat(chapter, verse) {
    return referenceNavConfig.book + ' ' + chapter + ':' + verse;
  }

  function referenceVerseButton(chapter, verse) {
    const id = referenceNavConfig.simpleVerseIds ? 'v-' + verse : referenceNavConfig.slug + '-' + chapter + '-' + verse;
    return document.getElementById(id);
  }

  function referenceValid(chapter, verse) {
    return chapter >= 1 && chapter <= referenceNavConfig.chapterCount && verse >= 1 && verse <= (referenceNavConfig.verseCounts[chapter] || 0);
  }

  function referenceSelectedVerse(chapter) {
    const hashMatch = (window.location.hash || '').match(/^#v-?(\d+)$/);
    if (hashMatch && referenceValid(chapter, Number(hashMatch[1]))) return Number(hashMatch[1]);
    const active = document.querySelector('.scripture-card-active[id], main[data-bible-panel] button[id^="v-"].bg-primary, main[data-bible-panel] button[id^="v-"][aria-pressed="true"]');
    const idMatch = active?.id?.match(/(\d+)$/);
    if (idMatch && referenceValid(chapter, Number(idMatch[1]))) return Number(idMatch[1]);
    return 1;
  }

  function referenceReadRecent() {
    try {
      const value = JSON.parse(localStorage.getItem(referenceNavConfig.storageKey) || '[]');
      if (!Array.isArray(value)) return [];
      return value
        .map((item) => ({ chapter: Number(item.chapter), verse: Number(item.verse) }))
        .filter((item) => referenceValid(item.chapter, item.verse))
        .slice(0, 8);
    } catch (error) {
      return [];
    }
  }

  function referenceWriteRecent(references) {
    try {
      localStorage.setItem(referenceNavConfig.storageKey, JSON.stringify(references));
    } catch (error) {
      // Storage can be unavailable in restricted contexts.
    }
  }

  function referenceAddRecent(chapter, verse) {
    if (!referenceValid(chapter, verse)) return;
    const references = referenceReadRecent().filter((item) => item.chapter !== chapter || item.verse !== verse);
    references.unshift({ chapter, verse });
    referenceWriteRecent(references.slice(0, 8));
  }

  function referenceParse(raw, currentChapter) {
    let value = String(raw || '').trim().toLowerCase();
    value = value
      .replace(/[–—]/g, '-')
      .replace(new RegExp('^' + referenceNavConfig.book.toLowerCase() + '\\s+'), '')
      .replace(/^chapter\s+/, '')
      .replace(/^ch\.?\s+/, '')
      .replace(/^verse\s+/, '')
      .replace(/^v\.?\s*/, '');
    const full = value.match(/^(\d{1,2})\s*[:.]\s*(\d{1,3})$/) || value.match(/^(\d{1,2})\s+(\d{1,3})$/);
    const single = value.match(/^(\d{1,3})$/);
    let chapter = currentChapter;
    let verse = null;
    if (full) {
      chapter = Number(full[1]);
      verse = Number(full[2]);
    } else if (single) {
      verse = Number(single[1]);
    }
    if (!referenceValid(chapter, verse)) return null;
    return { chapter, verse };
  }

  function referenceSelect(chapter, verse) {
    if (!referenceValid(chapter, verse)) return;
    referenceAddRecent(chapter, verse);
    const currentChapter = referencePathChapter();
    if (chapter !== currentChapter) {
      window.location.href = referenceUrl(chapter, verse);
      return;
    }
    const button = referenceVerseButton(chapter, verse);
    if (button) {
      button.click();
      button.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    const hash = '#v' + verse;
    if (window.location.hash !== hash) history.replaceState(null, '', hash);
    const input = document.querySelector('[data-mbe-ref-input]');
    if (input) input.value = referenceFormat(chapter, verse);
  }

  function referenceFindStrip() {
    const managed = document.querySelector('.mbe-ref-strip');
    if (managed) return managed;
    const explicit = document.querySelector('nav.chapter-strip, .chapter-strip');
    if (explicit) return explicit;
    const candidates = Array.from(document.querySelectorAll('.bg-background.text-foreground > div, main.reader-page > nav, .reader-page > nav'));
    return candidates.find((node) => {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text.startsWith('Chapter')) return false;
      const linkCount = Array.from(node.querySelectorAll('a')).filter((anchor) => {
        return (anchor.getAttribute('href') || '').startsWith(referenceNavConfig.basePath);
      }).length;
      return linkCount >= Math.min(referenceNavConfig.chapterCount, 3);
    }) || null;
  }

  function referenceCreateStrip() {
    const strip = document.createElement('nav');
    strip.className = 'mbe-ref-strip no-print';
    strip.setAttribute('aria-label', referenceNavConfig.book + ' reference navigation');
    const readerShell = document.querySelector('.reader-page, .bg-background.text-foreground');
    if (readerShell) {
      readerShell.insertAdjacentElement('afterbegin', strip);
      return strip;
    }
    const header = document.querySelector('header.reader-header, header.sticky, .mbe-global-shell, header');
    if (header && header.parentNode) {
      header.insertAdjacentElement('afterend', strip);
      return strip;
    }
    if (document.body) {
      document.body.insertAdjacentElement('afterbegin', strip);
      return strip;
    }
    return null;
  }

  function installReferenceNavigator() {
    if (!document.body) return;
    installReferenceNavStyles();
    const currentChapter = referencePathChapter();
    if (!currentChapter) return;
    const strip = referenceFindStrip() || referenceCreateStrip();
    if (!strip) return;
    const signature = referenceNavConfig.slug + '-' + currentChapter;
    if (strip.getAttribute('data-mbe-ref-nav') === signature) return;

    const currentVerse = referenceSelectedVerse(currentChapter);
    const previous = currentChapter > 1 ? currentChapter - 1 : null;
    const next = currentChapter < referenceNavConfig.chapterCount ? currentChapter + 1 : null;
    strip.className = 'mbe-ref-strip no-print';
    strip.setAttribute('aria-label', referenceNavConfig.book + ' reference navigation');
    strip.setAttribute('data-mbe-ref-nav', signature);
    strip.innerHTML =
      '<div class="mbe-ref-nav">' +
      (previous ? '<a class="mbe-ref-step" href="' + referenceUrl(previous) + '" aria-label="Previous chapter">' + referenceNavIcons.arrowLeft + '</a>' : '<span class="mbe-ref-step mbe-ref-disabled" aria-hidden="true">' + referenceNavIcons.arrowLeft + '</span>') +
      '<form class="mbe-ref-form" data-mbe-ref-form>' +
      '<button class="mbe-ref-picker-toggle" data-mbe-ref-picker-toggle type="button" aria-label="Choose ' + referenceNavConfig.book + ' chapter and verse" aria-expanded="false"><span class="mbe-ref-badge">KJV</span>' + referenceNavIcons.chevronDown + '</button>' +
      '<input class="mbe-ref-input" data-mbe-ref-input type="search" inputmode="numeric" autocomplete="off" value="' + referenceFormat(currentChapter, currentVerse) + '" aria-label="Type a verse reference">' +
      '<div class="mbe-ref-picker" data-mbe-ref-picker hidden><div class="mbe-ref-picker-head"><button class="mbe-ref-back" data-mbe-ref-back type="button" aria-label="Back to chapter selection" hidden>' + referenceNavIcons.arrowLeft + '</button><strong class="mbe-ref-picker-title" data-mbe-ref-title>' + referenceNavConfig.book + '</strong><button class="mbe-ref-go" data-mbe-ref-go type="button">Go</button><button class="mbe-ref-close" data-mbe-ref-close type="button" aria-label="Close verse picker">&times;</button></div><div class="mbe-ref-grid" data-mbe-ref-grid></div></div>' +
      '</form>' +
      '<div class="mbe-ref-menu-wrap"><button class="mbe-ref-recent-toggle" data-mbe-ref-recent-toggle type="button" aria-expanded="false">Recent ' + referenceNavIcons.chevronDown + '</button><div class="mbe-ref-recent-dropdown" data-mbe-ref-recent-dropdown hidden><div class="mbe-ref-recent-list" data-mbe-ref-recent-list></div></div></div>' +
      (next ? '<a class="mbe-ref-step" href="' + referenceUrl(next) + '" aria-label="Next chapter">' + referenceNavIcons.arrowRight + '</a>' : '<span class="mbe-ref-step mbe-ref-disabled" aria-hidden="true">' + referenceNavIcons.arrowRight + '</span>') +
      '<div class="mbe-ref-menu-wrap"><button class="mbe-ref-all-toggle" data-mbe-ref-all-toggle type="button" aria-expanded="false">All</button><div class="mbe-ref-all-dropdown" data-mbe-ref-all-dropdown hidden><div class="mbe-ref-grid">' +
      Array.from({ length: referenceNavConfig.chapterCount }, (_, index) => {
        const chapter = index + 1;
        return '<button type="button" data-mbe-ref-all-chapter="' + chapter + '" class="' + (chapter === currentChapter ? 'is-active' : '') + '">' + chapter + '</button>';
      }).join('') +
      '</div></div></div>' +
      '</div>';

    let pickerChapter = currentChapter;
    let pickerVerse = currentVerse;
    const form = strip.querySelector('[data-mbe-ref-form]');
    const input = strip.querySelector('[data-mbe-ref-input]');
    const picker = strip.querySelector('[data-mbe-ref-picker]');
    const pickerToggle = strip.querySelector('[data-mbe-ref-picker-toggle]');
    const pickerBack = strip.querySelector('[data-mbe-ref-back]');
    const pickerTitle = strip.querySelector('[data-mbe-ref-title]');
    const pickerGrid = strip.querySelector('[data-mbe-ref-grid]');
    const recentToggle = strip.querySelector('[data-mbe-ref-recent-toggle]');
    const recentDropdown = strip.querySelector('[data-mbe-ref-recent-dropdown]');
    const recentList = strip.querySelector('[data-mbe-ref-recent-list]');
    const allToggle = strip.querySelector('[data-mbe-ref-all-toggle]');
    const allDropdown = strip.querySelector('[data-mbe-ref-all-dropdown]');

    const closePicker = () => {
      picker.hidden = true;
      pickerToggle.setAttribute('aria-expanded', 'false');
    };
    const closeRecent = () => {
      recentDropdown.hidden = true;
      recentToggle.setAttribute('aria-expanded', 'false');
    };
    const closeAll = () => {
      allDropdown.hidden = true;
      allToggle.setAttribute('aria-expanded', 'false');
    };
    const renderChapters = () => {
      pickerTitle.textContent = referenceNavConfig.book;
      pickerBack.hidden = true;
      pickerGrid.innerHTML = Array.from({ length: referenceNavConfig.chapterCount }, (_, index) => {
        const chapter = index + 1;
        return '<button type="button" data-mbe-ref-chapter="' + chapter + '" class="' + (chapter === pickerChapter ? 'is-active' : '') + '">' + chapter + '</button>';
      }).join('');
    };
    const renderVerses = () => {
      const maxVerse = referenceNavConfig.verseCounts[pickerChapter] || 1;
      if (pickerVerse > maxVerse) pickerVerse = 1;
      pickerTitle.textContent = referenceNavConfig.book + ' ' + pickerChapter;
      pickerBack.hidden = false;
      pickerGrid.innerHTML = Array.from({ length: maxVerse }, (_, index) => {
        const verse = index + 1;
        return '<button type="button" data-mbe-ref-verse="' + verse + '" class="' + (verse === pickerVerse ? 'is-active' : '') + '">' + verse + '</button>';
      }).join('');
    };
    const renderRecent = () => {
      const recent = referenceReadRecent();
      if (!recent.length) {
        recentList.innerHTML = '<p class="mbe-ref-empty">No recent verses yet.</p>';
        return;
      }
      recentList.innerHTML = recent.map(({ chapter, verse }) => '<button type="button" data-mbe-ref-recent-chapter="' + chapter + '" data-mbe-ref-recent-verse="' + verse + '">' + referenceFormat(chapter, verse) + '</button>').join('');
    };
    const openPicker = () => {
      pickerChapter = currentChapter;
      pickerVerse = referenceSelectedVerse(currentChapter);
      closeRecent();
      closeAll();
      renderChapters();
      picker.hidden = false;
      pickerToggle.setAttribute('aria-expanded', 'true');
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const target = referenceParse(input.value, currentChapter);
      if (target) {
        closePicker();
        closeRecent();
        closeAll();
        referenceSelect(target.chapter, target.verse);
      }
    });
    input.addEventListener('focus', () => input.select());
    input.addEventListener('click', openPicker);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        form.requestSubmit();
      }
    });
    pickerToggle.addEventListener('click', () => {
      if (picker.hidden) openPicker();
      else closePicker();
    });
    strip.querySelector('[data-mbe-ref-close]').addEventListener('click', closePicker);
    pickerBack.addEventListener('click', renderChapters);
    strip.querySelector('[data-mbe-ref-go]').addEventListener('click', () => {
      closePicker();
      referenceSelect(pickerChapter, pickerVerse);
    });
    pickerGrid.addEventListener('click', (event) => {
      const chapterButton = event.target.closest?.('[data-mbe-ref-chapter]');
      const verseButton = event.target.closest?.('[data-mbe-ref-verse]');
      if (chapterButton) {
        pickerChapter = Number(chapterButton.dataset.mbeRefChapter);
        pickerVerse = pickerChapter === currentChapter ? referenceSelectedVerse(currentChapter) : 1;
        renderVerses();
      } else if (verseButton) {
        pickerVerse = Number(verseButton.dataset.mbeRefVerse);
        closePicker();
        referenceSelect(pickerChapter, pickerVerse);
      }
    });
    recentToggle.addEventListener('click', () => {
      if (recentDropdown.hidden) {
        closePicker();
        closeAll();
        renderRecent();
        recentDropdown.hidden = false;
        recentToggle.setAttribute('aria-expanded', 'true');
      } else closeRecent();
    });
    recentList.addEventListener('click', (event) => {
      const button = event.target.closest?.('[data-mbe-ref-recent-chapter]');
      if (!button) return;
      closeRecent();
      referenceSelect(Number(button.dataset.mbeRefRecentChapter), Number(button.dataset.mbeRefRecentVerse));
    });
    allToggle.addEventListener('click', () => {
      if (allDropdown.hidden) {
        closePicker();
        closeRecent();
        allDropdown.hidden = false;
        allToggle.setAttribute('aria-expanded', 'true');
      } else closeAll();
    });
    allDropdown.addEventListener('click', (event) => {
      const button = event.target.closest?.('[data-mbe-ref-all-chapter]');
      if (!button) return;
      window.location.href = referenceUrl(Number(button.dataset.mbeRefAllChapter));
    });
    document.addEventListener('click', (event) => {
      const path = event.composedPath ? event.composedPath() : [];
      if (!path.includes(strip) && !strip.contains(event.target)) {
        closePicker();
        closeRecent();
        closeAll();
      }
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closePicker();
        closeRecent();
        closeAll();
      }
    });

    referenceAddRecent(currentChapter, currentVerse);
    if ((window.location.hash || '').match(/^#v-?\d+$/)) {
      window.setTimeout(() => referenceSelect(currentChapter, referenceSelectedVerse(currentChapter)), 900);
    }
  }
  // MBE reference navigator end


  function ensureShell() {
    if (!document.body) return;
    installReferenceNavigator();
    ensureDarkTheme();
    ensureIllustratedAssets();
    ensureDanielArtworkMeta();
    document.querySelectorAll('.mbe-reader-chapter-nav').forEach((node) => node.remove());
    ensureLogo();
    installInlineStudyNotes();
    if (!document.body.hasAttribute('data-daniel-chapter') || !isInlineNotesViewport()) removeInlineStudyNotes();
    document.body.classList.add('mbe-shell-managed');
    document.querySelectorAll('.mbe-global-shell').forEach((node, index) => {
      if (index > 0 || node.getAttribute('data-tool') !== tool || !node.hasAttribute('data-embedded')) node.remove();
    });
    if (!document.querySelector('.mbe-global-shell[data-tool="' + tool + '"][data-embedded="true"]')) {
      document.body.insertAdjacentHTML('afterbegin', headerMarkup);
    }
    const existingFooters = Array.from(document.querySelectorAll('.mbe-global-footer'));
    let footer = existingFooters.find((node) => node.getAttribute('data-tool') === tool) || null;
    existingFooters.forEach((node) => {
      if (node !== footer) node.remove();
    });
    if (!footer) {
      document.body.insertAdjacentHTML('beforeend', footerMarkup);
      footer = document.querySelector('.mbe-global-footer[data-tool="' + tool + '"]');
    }
    if (footer && footer.parentElement === document.body && footer !== document.body.lastElementChild) {
      document.body.appendChild(footer);
    }
    document.body.removeAttribute('data-mbe-shell-pending');
    updateYear();
    queueDesktopReaderFooter();
  }

  function installRouteWatcher() {
    if (window.__danielArtworkRouteWatcher) return;
    window.__danielArtworkRouteWatcher = true;

    const queueRefresh = () => {
      window.setTimeout(ensureShell, 0);
      window.setTimeout(ensureShell, 120);
    };

    ['pushState', 'replaceState'].forEach((method) => {
      const original = window.history[method];
      if (typeof original !== 'function') return;
      window.history[method] = function () {
        const result = original.apply(this, arguments);
        queueRefresh();
        return result;
      };
    });

    window.addEventListener('popstate', queueRefresh);
  }

  const schedulePageEnhancements = () => window.setTimeout(() => {
    ensureShell();
    danielInlineNotesReady = true;
    flushPendingInlineStudyNote();
  }, 500);

  ensureDarkTheme();
  installInlineStudyNotes();
  if (document.readyState === 'complete') schedulePageEnhancements();
  else window.addEventListener('load', schedulePageEnhancements, { once: true });
  installRouteWatcher();
  scheduleDanielStudySupports();
  window.addEventListener('load', () => {
    window.setTimeout(ensureShell, 500);
    window.setTimeout(ensureShell, 1000);
  });

  // Keep the emblem swapped through React hydration, then watch the header so
  // it also survives later client-side re-renders.
  let logoTicks = 0;
  const logoTimer = window.setInterval(() => {
    ensureLogo();
    if (++logoTicks >= 10) {
      window.clearInterval(logoTimer);
      const wm = document.querySelector('.tracking-\\[0\\.3em\\]');
      const header = wm && wm.closest('header');
      if (header) new MutationObserver(ensureLogo).observe(header, { childList: true, subtree: true });
    }
  }, 500);
})();
