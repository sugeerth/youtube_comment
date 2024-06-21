console.log('%c🧑‍💻 YT Comments Crawler: Extension loaded.', 'background-color: lightblue;');

// Utility Functions
const Utils = (() => {
  const getVideoId = () => window.location.search.split('v=')[1].split(/[&#]/)[0];
  const getVideoTitle = () => document.title.replace(' - YouTube', '').trim().replace(/[^ \p{L}0-9-_.]/gu, '').replace(/\s+/g, ' ');

  const scrollToBottom = async () => {
    let lastHeight = 0;
    while (true) {
      window.scrollTo(0, document.documentElement.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newHeight = document.documentElement.scrollHeight;
      if (newHeight === lastHeight) break;
      lastHeight = newHeight;
    }
  };

  const getSortableLikes = likes => {
    let multiplier = 1;
    if (likes.endsWith("K")) multiplier = 1000;
    if (likes.endsWith("M")) multiplier = 1000000;
    return parseFloat(likes) * multiplier;
  };

  return { getVideoId, getVideoTitle, scrollToBottom, getSortableLikes };
})();

// Comment Functions
const Comments = (() => {
  const extractComments = () => {
    const commentElements = document.querySelectorAll('#contents #content-text');
    return Array.from(commentElements).map(commentElement => {
      const commentBody = commentElement.closest('#comment');
      return {
        text: commentElement.textContent.trim().replace(/\n/g, ' ').replace(/"/g, '""').replace(/'/g, "''"),
        author: commentBody.querySelector('#author-text').textContent.trim().replace(/"/g, '""').replace(/'/g, "''"),
        likes: commentBody.querySelector('#vote-count-middle').textContent.trim().replace(/"/g, '""').replace(/'/g, "''")
      };
    });
  };

  const sortComments = comments => comments.sort((a, b) => Utils.getSortableLikes(b.likes) - Utils.getSortableLikes(a.likes));

  const convertToCSV = comments => {
    const headers = ['Text', 'Author', 'Likes'];
    const rows = comments.map(comment => [comment.text, comment.author, comment.likes]);
    return [headers, ...rows].map(row => row.map(value => `"${value}"`).join(',')).join('\n');
  };

  const downloadCSV = (csv, fileName) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = `${fileName}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return { extractComments, sortComments, convertToCSV, downloadCSV };
})();

// UI Functions
const UI = (() => {
  const createButton = () => {
    const button = document.createElement('button');
    button.setAttribute('id', 'btn-crawl-comments');
    button.innerText = '⏬';
    button.title = 'Crawl comments';
    styleButton(button);
    document.body.appendChild(button);
    return button;
  };

  const styleButton = button => {
    Object.assign(button.style, {
      position: 'fixed', opacity: 0.7, bottom: 0, left: 0,
      background: 'var(--yt-spec-brand-background-secondary)',
      color: 'var(--yt-spec-icon-active-other)', border: '1px solid var(--yt-spec-brand-background-primary)',
      borderRadius: '2px', padding: '4px 4px', cursor: 'pointer', fontSize: '2em',
      transition: 'background 0.2s ease-in-out', textDecoration: 'none'
    });
  };

  const toggleButtonVisibility = button => {
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
      console.log('%c🧑‍💻 YT Comments Crawler: Went full screen, hiding the button.', 'background-color: lightblue;');
      button.hidden = true;
    } else {
      console.log('%c🧑‍💻 YT Comments Crawler: Exited full screen, showing the button.', 'background-color: lightblue;');
      button.hidden = false;
    }
  };

  const addFullscreenListeners = button => {
    ['fullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange', 'webkitfullscreenchange'].forEach(event =>
      document.addEventListener(event, () => toggleButtonVisibility(button), false)
    );
  };

  return { createButton, addFullscreenListeners };
})();

// Main Function
const Main = (() => {
  const handleButtonClick = async button => {
    console.log('%c🧑‍💻 YT Comments Crawler: Button clicked.', 'background-color: lightblue;');
    const videoId = Utils.getVideoId();
    const videoTitle = Utils.getVideoTitle();
    console.log(`%c🧑‍💻 YT Comments Crawler: videoId: ${videoId}`, 'background-color: lightblue;');
    console.log(`%c🧑‍💻 YT Comments Crawler: videoTitle: ${videoTitle}`, 'background-color: lightblue;');

    button.innerText = '⏳';
    button.title = 'Crawling...';

    await Utils.scrollToBottom();
    const comments = Comments.extractComments();
    const sortedComments = Comments.sortComments(comments);
    const csv = Comments.convertToCSV(sortedComments);
    Comments.downloadCSV(csv, `${videoTitle} [${videoId}]`);

    button.innerText = '🔃';
    button.title = 'Crawl again';
  };

  const init = () => {
    const button = UI.createButton();
    UI.addFullscreenListeners(button);
    button.addEventListener('click', () => handleButtonClick(button));
  };

  return { init };
})();

// Initialize the extension
Main.init();
