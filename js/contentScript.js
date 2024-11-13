try {
  // Your content script code here
  const container = document.querySelector('#container');
  if (container) {
    // Append your content
  } else {
    console.warn('Container element not found');
  }
} catch (error) {
  console.error('Content script error:', error);
} 