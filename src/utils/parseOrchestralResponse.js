export function parseResponse(text) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const prose = text.slice(lastIndex, match.index).trim();
      if (prose) {
        blocks.push({ type: 'prose', content: prose });
      }
    }

    blocks.push({
      type: 'code',
      language: match[1] ?? 'plaintext',
      content: match[2].trimEnd(),
    });
    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex).trim();
  if (remaining) {
    blocks.push({ type: 'prose', content: remaining });
  }

  if (blocks.length === 0) {
    blocks.push({ type: 'prose', content: text });
  }

  return blocks;
}

export function parseBullets(proseText) {
  const lines = proseText.split('\n');
  const hasBullets = lines.some((line) => /^[-*]\s/.test(line.trim()));

  if (!hasBullets) {
    return { type: 'text', content: proseText };
  }

  const items = [];
  const nonBulletLines = [];

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (/^[-*]\s/.test(trimmed)) {
      items.push(trimmed.replace(/^[-*]\s/, ''));
    } else if (trimmed) {
      nonBulletLines.push(trimmed);
    }
  });

  return {
    type: 'mixed',
    intro: nonBulletLines.join(' '),
    bullets: items,
  };
}
