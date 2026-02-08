// Lightweight sanitization for user-generated content: trim and enforce max length.
// Helps prevent abuse and keeps stored data within reasonable bounds.

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_CONTENT_LENGTH = 20000;

function trimAndLimit(str, maxLen) {
  if (str == null || typeof str !== 'string') return str;
  const trimmed = str.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen);
}

function safeTitle(str) {
  return trimAndLimit(str, MAX_TITLE_LENGTH);
}

function safeName(str) {
  return trimAndLimit(str, MAX_TITLE_LENGTH);
}

function safeDescription(str) {
  return trimAndLimit(str, MAX_DESCRIPTION_LENGTH);
}

function safeContent(str) {
  return trimAndLimit(str, MAX_CONTENT_LENGTH);
}

module.exports = {
  safeTitle,
  safeName,
  safeDescription,
  safeContent,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_CONTENT_LENGTH,
};
