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
  const stopWords = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
    'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was',
    'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the',
    'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
    'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
    'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
  ]);

  const extractComments = () => {
    const commentElements = document.querySelectorAll('#contents #content-text');
    return Array.from(commentElements).map(commentElement => commentElement.textContent.trim().replace(/\n/g, ' '));
  };

  const generateWordFrequency = comments => {
    const wordCount = {};
    comments.forEach(comment => {
      const words = comment.split(/\s+/);
      words.forEach(word => {
        word = word.toLowerCase();
        if (!stopWords.has(word)) {
          word = word.replace(/[^a-zA-Z0-9-_.]/g, '');
          if (word) {
            wordCount[word] = (wordCount[word] || 0) + 1;
          }
        }
      });
    });
    return Object.entries(wordCount).map(([word, count]) => [word, count]).sort((a, b) => b[1] - a[1]);
  };


  const displayWordCloud = wordFreq => {
    console.log('%c🧑‍💻 YT Comments Crawler: Displaying word cloud.', 'background-color: lightblue;');
    const wordCloudDiv = document.createElement('div');
    wordCloudDiv.id = 'wordCloud';
    wordCloudDiv.style.width = '100%';
    wordCloudDiv.style.height = '800px'; // Increase the height for a larger word cloud
    wordCloudDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    wordCloudDiv.style.position = 'relative';

    const commentsSection = document.querySelector('ytd-comments');
    if (commentsSection) {
      commentsSection.parentNode.insertBefore(wordCloudDiv, commentsSection);
    } else {
      document.body.appendChild(wordCloudDiv);
    }

    const wordCloudOptions = {
      list: wordFreq,
      gridSize: Math.round(16 * (window.innerWidth / 1024)),
      weightFactor: function (size) {
        return Math.pow(size / maxCount, 2) * 100;
      },
      fontFamily: 'Arial',
      color: 'random-dark',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      rotateRatio: 0.5,
      rotationSteps: 2,
      shape: 'square',
    };

    if (typeof WordCloud !== 'undefined') {
      WordCloud(wordCloudDiv, wordCloudOptions);
    } else {
      console.error('WordCloud function is not available.');
    }
  };

  return { extractComments, generateWordFrequency, displayWordCloud };
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
    const wordFreq = Comments.generateWordFrequency(comments);
    Comments.displayWordCloud(wordFreq);

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
