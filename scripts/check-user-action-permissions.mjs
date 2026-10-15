import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile('src/pages/systemManagement/users/index.tsx', 'utf8')
const formDialog = await readFile('src/pages/systemManagement/users/UserFormDialog.tsx', 'utf8')

assert.match(
  formDialog,
  /<Can\s+permission=\{isEditing\s*\?\s*'user:edit'\s*:\s*'user:create'\}>[\s\S]*?<Dialog[\s\S]*?<\/Can>/,
  'create and edit dialogs must require their distinct operation permissions',
)
assert.match(page, /<Can\s+permission="user:delete">[\s\S]*?deleteSelected[\s\S]*?<\/Can>/, 'bulk delete must require user:delete')
assert.match(page, /<Can\s+permission="user:delete">[\s\S]*?onClick=\{\(\) => setDeleteUserIds\(\[user\.id\]\)\}[\s\S]*?<\/Can>/, 'row delete must require user:delete')
assert.match(page, /<Can\s+permission="user:change-status">[\s\S]*?<Switch[\s\S]*?handleStatusChange\(user, checked\)[\s\S]*?<\/Can>/, 'status switch must require user:change-status')

console.log('PASS: user create, edit, bulk/row delete, and status actions require their own permissions')
