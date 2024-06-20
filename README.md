YouTube Comment Ingester Chrome Extension
Overview
The YouTube Comment Ingester is a simple Chrome extension that automates the process of navigating to a YouTube video and extracting comments. This extension is useful for researchers, data scientists, and anyone interested in analyzing YouTube comments.

Features
Navigate to a specified YouTube video URL
Extract comments from the video
Save extracted comments in a JSON format
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/youtube-comment-ingester.git
Open Chrome and navigate to the Extensions page:

chrome
Copy code
chrome://extensions/
Enable Developer Mode by clicking the toggle switch in the top right corner.

Click the "Load unpacked" button and select the cloned repository folder.

Usage
Click on the YouTube Comment Ingester extension icon in the Chrome toolbar.

Enter the URL of the YouTube video you want to extract comments from.

Click "Start".

The extension will navigate to the specified video and start extracting comments.

Once the extraction is complete, a JSON file with the comments will be downloaded automatically.

File Structure
css
Copy code
youtube-comment-ingester/
│
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
└── styles.css
License
This project is licensed under the MIT License - see the LICENSE file for details.