export const fileTree = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      { id: '2', name: 'App.jsx', type: 'file', language: 'javascript' },
      { id: '3', name: 'App.css', type: 'file', language: 'css' },
      { id: '4', name: 'main.jsx', type: 'file', language: 'javascript' },
      {
        id: '5',
        name: 'components',
        type: 'folder',
        isOpen: false,
        children: [
          { id: '6', name: 'Button.jsx', type: 'file', language: 'javascript' },
          { id: '7', name: 'Modal.jsx', type: 'file', language: 'javascript' },
        ],
      },
      {
        id: '8',
        name: 'utils',
        type: 'folder',
        isOpen: false,
        children: [
          { id: '9', name: 'helpers.js', type: 'file', language: 'javascript' },
          { id: '10', name: 'api.js', type: 'file', language: 'javascript' },
        ],
      },
    ],
  },
  { id: '11', name: 'index.html', type: 'file', language: 'html' },
  { id: '12', name: 'package.json', type: 'file', language: 'json' },
  { id: '13', name: 'vite.config.js', type: 'file', language: 'javascript' },
  { id: '14', name: 'README.md', type: 'file', language: 'markdown' },
];
