const extensionMap = {
  css: 'css',
  html: 'html',
  js: 'javascript',
  json: 'json',
  jsx: 'javascript',
  md: 'markdown',
  ts: 'typescript',
  tsx: 'typescript',
  yml: 'yaml',
  yaml: 'yaml',
};

const languageLabels = {
  css: 'CSS',
  html: 'HTML',
  javascript: 'JavaScript',
  json: 'JSON',
  markdown: 'Markdown',
  plaintext: 'Plain Text',
  typescript: 'TypeScript',
  yaml: 'YAML',
};

export function detectLanguage(fileName = '') {
  const [, extension = ''] = fileName.toLowerCase().match(/\.([^.]+)$/) ?? [];
  return extensionMap[extension] ?? 'plaintext';
}

export function getLanguageLabel(language) {
  return languageLabels[language] ?? 'Plain Text';
}
