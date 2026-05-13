module.exports = {
  // JavaScript/TypeScript文件
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
  ],

  // 样式文件
  '*.{css,scss,less}': [
    'stylelint --fix',
    'prettier --write',
  ],

  // JSON文件
  '*.json': [
    'prettier --write',
  ],

  // Markdown文件
  '*.md': [
    'prettier --write',
  ],
}
