module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复
        'docs', // 文档
        'style', // 格式
        'refactor', // 重构
        'perf', // 性能
        'test', // 测试
        'chore', // 其他
        'revert', // 回滚
      ],
    ],

    // 允许中文
    'subject-case': [0],

    // 自定义提示消息
    'type-empty': [2, 'never', '提交类型不能为空'],
    'subject-empty': [2, 'never', '提交主题不能为空'],
  },

  prompt: {
    messages: {
      type: '选择你要提交的类型:',
      scope: '选择一个scope (可选):',
      customScope: '请输入自定义的scope:',
      subject: '填写简短精炼的变更描述:\n',
      body: '填写更加详细的变更描述 (可选)。使用 "|" 换行:\n',
      breaking: '列举非兼容性重大的变更 (可选):\n',
      footer: '列举出所有变更的ISSUES CLOSED (可选)。 例如: #31, #34:\n',
      confirmCommit: '确认提交?',
    },
    types: [
      { value: 'feat', name: 'feat:     新功能' },
      { value: 'fix', name: 'fix:      修复bug' },
      { value: 'docs', name: 'docs:     文档变更' },
      { value: 'style', name: 'style:    代码格式' },
      { value: 'refactor', name: 'refactor: 重构' },
      { value: 'perf', name: 'perf:     性能优化' },
      { value: 'test', name: 'test:     增加测试' },
      { value: 'chore', name: 'chore:    构建/工具变动' },
      { value: 'revert', name: 'revert:   回滚' },
    ],
  },
}
