# shadcn Select 源码阅读指南

## 一、阅读目标

本文用于帮助开发者理解项目中的 Select 组件，而不是只记住它的使用方式。阅读对象分为两层：

1. `src/components/ui/select.tsx`：项目中的 shadcn 风格包装层；
2. `radix-ui` 暴露的 `@radix-ui/react-select`：真正实现状态管理、键盘交互、焦点管理、定位、表单兼容和无障碍行为的底层组件。

项目中的 Select 并不是一个从零实现的原生 `<select>`，而是：

```text
项目 Select 包装层
  ↓ 添加 Tailwind 样式、图标、data-slot、size
Radix Select Primitive
  ↓ 管理状态、事件、焦点、定位、表单和无障碍
React DOM / Portal / 原生隐藏 select
```

最重要的结论是：

- shadcn 层主要负责**组合和样式**；
- Radix 层负责**行为和可访问性**；
- `Select.Root` 保存选择值和打开状态；
- `Select.Trigger` 是用户实际交互的按钮；
- `Select.Content` 是通过 Portal 渲染的弹出列表；
- `Select.Item` 注册选项、参与键盘导航并完成选中；
- 当 Select 处于表单控制场景时，Radix 会生成一个视觉隐藏的原生 `<select>`，用于表单提交和原生表单事件兼容。

## 二、源码范围和依赖版本

### 1. 项目包装文件

```text
src/components/ui/select.tsx
```

该文件导入：

```tsx
import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react";
```

### 2. `radix-ui` 聚合包

项目通过：

```tsx
import { Select as SelectPrimitive } from "radix-ui";
```

获得 Select 命名空间。

`radix-ui` 本身是 Radix 多个组件的聚合入口，它在入口文件中导出：

```ts
export * as Select from "@radix-ui/react-select";
```

实际 Select 行为来自：

```text
@radix-ui/react-select
```

安装版本可以从 `package.json` 和锁文件确认。当前项目使用：

```json
{
  "radix-ui": "^1.4.3"
}
```

该聚合包对应的 Select Primitive 版本为 `@radix-ui/react-select 2.2.6`。

### 3. 直接依赖的底层能力

Radix Select 内部还组合了多个 Radix 工具包：

- `@radix-ui/react-primitive`：将原生 DOM 元素包装成可扩展 Primitive；
- `@radix-ui/react-context`：创建组件内部 Context；
- `@radix-ui/react-collection`：收集和遍历 Select Item；
- `@radix-ui/react-popper`：实现弹出层定位；
- `@radix-ui/react-portal`：将浮层渲染到 Portal；
- `@radix-ui/react-focus-scope`：限制并恢复焦点；
- `@radix-ui/react-dismissable-layer`：处理 Escape、点击外部和关闭；
- `@radix-ui/react-focus-guards`：防止焦点穿透；
- `@radix-ui/react-use-controllable-state`：支持受控和非受控状态；
- `@radix-ui/react-compose-refs`：合并多个 ref；
- `react-remove-scroll`：弹出层打开时处理页面滚动；
- `aria-hidden`：隐藏浮层外部内容，辅助屏幕阅读器理解当前模态区域。

## 三、项目包装层的整体结构

`src/components/ui/select.tsx` 导出了以下组件：

| 包装组件                 | 对应 Radix Primitive               | 主要职责                     |
| ------------------------ | ---------------------------------- | ---------------------------- |
| `Select`                 | `SelectPrimitive.Root`             | 提供状态和 Context           |
| `SelectGroup`            | `SelectPrimitive.Group`            | 对选项分组                   |
| `SelectValue`            | `SelectPrimitive.Value`            | 显示当前选中值或 placeholder |
| `SelectTrigger`          | `SelectPrimitive.Trigger`          | 触发打开、显示箭头和当前值   |
| `SelectContent`          | `SelectPrimitive.Content`          | Portal 弹出选项列表          |
| `SelectLabel`            | `SelectPrimitive.Label`            | 显示分组标题                 |
| `SelectItem`             | `SelectPrimitive.Item`             | 显示和选择单个选项           |
| `SelectSeparator`        | `SelectPrimitive.Separator`        | 显示分隔线                   |
| `SelectScrollUpButton`   | `SelectPrimitive.ScrollUpButton`   | 列表向上滚动按钮             |
| `SelectScrollDownButton` | `SelectPrimitive.ScrollDownButton` | 列表向下滚动按钮             |

包装层没有重新实现 Select 的行为，而是通过以下方式增强 Primitive：

```tsx
<SelectPrimitive.Trigger
  data-slot="select-trigger"
  className={cn(defaultClassName, className)}
  {...props}
>
  {children}
  <SelectPrimitive.Icon asChild>
    <ChevronDownIcon />
  </SelectPrimitive.Icon>
</SelectPrimitive.Trigger>
```

这个模式可以概括为：

```text
接收原生 Primitive 的 props
  ↓
解构项目自己的扩展 props
  ↓
合并默认 className 和调用方 className
  ↓
增加 data-slot / data-size / 图标
  ↓
渲染 Radix Primitive
```

## 四、`cn` 如何合并样式

项目中的 `cn` 定义在：

```text
src/lib/utils.ts
```

实现为：

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

它分两步工作：

1. `clsx` 将字符串、数组、条件对象等合并成 class 字符串；
2. `tailwind-merge` 解决 Tailwind 冲突类，例如调用方传入 `w-full` 时覆盖默认的 `w-fit`。

因此包装组件通常采用：

```tsx
className={cn('默认样式', className)}
```

调用方可以修改视觉表现：

```tsx
<SelectTrigger className="w-full" />
```

默认样式中有 `w-fit`，调用方的 `w-full` 会经过 `tailwind-merge` 合并为最终宽度。

## 五、组件组合关系

一个最小 Select 的 JSX 结构是：

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="请选择" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="one">选项一</SelectItem>
    <SelectItem value="two">选项二</SelectItem>
  </SelectContent>
</Select>
```

运行时可以抽象成：

```text
<Select Root>
  ├── SelectTrigger
  │   ├── SelectValue
  │   └── SelectPrimitive.Icon
  └── SelectContent
      └── Portal
          └── Content
              ├── ScrollUpButton
              ├── Viewport
              │   ├── SelectItem
              │   ├── SelectItem
              │   └── ...
              └── ScrollDownButton
```

其中 `SelectContent` 在 DOM 中通常不和 Trigger 保持兄弟节点的物理位置，而是通过 Portal 渲染到 Portal 容器，默认通常是 `document.body`。

## 六、项目包装组件逐个阅读

## 6.1 `Select`

源码结构：

```tsx
function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}
```

### 职责

- 对外提供项目统一的 `Select` 名称；
- 将所有 Root props 原样传给 Radix；
- 添加 `data-slot="select"`，方便外部 CSS 或调试定位。

### 支持的核心 props

来自 Radix `Select.Root`：

```ts
interface SelectProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  value?: string;
  defaultValue?: string;
  onValueChange?(value: string): void;
  dir?: "ltr" | "rtl";
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  form?: string;
}
```

### 受控和非受控

非受控：

```tsx
<Select defaultValue="male">...</Select>
```

选择值由 Radix 内部保存。

受控：

```tsx
const [value, setValue] = useState('male')

<Select value={value} onValueChange={setValue}>
  ...
</Select>
```

选择值由页面状态保存，Radix 每次选择后调用 `onValueChange`。

打开状态也可以受控：

```tsx
<Select open={open} onOpenChange={setOpen}>
  ...
</Select>
```

不要同时用 `value` 和 `defaultValue`，也不要同时用 `open` 和 `defaultOpen`。同一状态应选择受控或非受控的一种模式。

## 6.2 `SelectGroup`

源码结构：

```tsx
function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1.5 p-1.5", className)}
      {...props}
    />
  );
}
```

### 职责

- 将多个 Item 组织为一组；
- 添加 `role="group"`，该属性由 Radix Group 负责；
- 添加组内滚动间距和内边距；
- 保留调用方传入的 `className` 和其他 props。

使用示例：

```tsx
<SelectContent>
  <SelectGroup>
    <SelectLabel>用户状态</SelectLabel>
    <SelectItem value="enabled">启用</SelectItem>
    <SelectItem value="disabled">禁用</SelectItem>
  </SelectGroup>
</SelectContent>
```

## 6.3 `SelectValue`

源码结构：

```tsx
function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}
```

包装层本身没有增加逻辑，只添加：

```html
data-slot="select-value"
```

这个 data 属性被 `SelectTrigger` 的样式使用：

```text
*:data-[slot=select-value]:line-clamp-1
*:data-[slot=select-value]:flex
*:data-[slot=select-value]:items-center
*:data-[slot=select-value]:gap-1.5
```

### `SelectValue` 的特殊行为

Radix 的 `SelectValue` 并不一定直接渲染自己的 children。它根据当前 value 判断：

- 当前值为空或未定义：渲染 `placeholder`；
- 当前值存在且 `SelectValue` 没有自定义 children：Radix 会把对应 `SelectItemText` 的内容 Portal 到这里；
- `SelectValue` 有 children：可以使用自定义显示内容，Radix 不再自动替换成选项文本。

普通用法：

```tsx
<SelectValue placeholder="请选择性别" />
```

自定义显示：

```tsx
<SelectValue>
  <span>自定义当前值</span>
</SelectValue>
```

## 6.4 `SelectTrigger`

源码核心：

```tsx
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(defaultClassName, className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
```

### Props 扩展

Radix Trigger 的原生 props 之外，包装层增加：

```ts
size?: 'sm' | 'default'
```

默认值为：

```ts
size = "default";
```

然后输出：

```html
data-size="default"
```

或者：

```html
data-size="sm"
```

CSS 根据这个属性选择高度：

```text
data-[size=default]:h-9
data-[size=sm]:h-8
```

使用：

```tsx
<SelectTrigger size="sm">
  <SelectValue />
</SelectTrigger>
```

### 默认样式的行为

主要样式可以分为几组：

#### 布局

```text
flex
w-fit
items-center
justify-between
gap-1.5
```

Trigger 是横向 Flex 容器，内容和箭头两端布局。

#### 视觉

```text
rounded-3xl
border
border-transparent
bg-input/50
px-3
py-2
text-sm
```

#### 高度

```text
data-[size=default]:h-9
data-[size=sm]:h-8
```

#### Focus

```text
outline-none
focus-visible:border-ring
focus-visible:ring-3
focus-visible:ring-ring/30
```

组件不在普通 focus 时显示强烈边框，而是使用 `focus-visible`，更适合键盘访问。

#### Disabled

```text
disabled:cursor-not-allowed
disabled:opacity-50
```

Radix Trigger 会输出真正的 `disabled` 属性，因此浏览器也会阻止交互。

#### Placeholder

```text
data-placeholder:text-muted-foreground
```

Radix 在 value 为空时会给 Trigger 增加 `data-placeholder`，包装层据此降低 placeholder 文本颜色。

#### 无效状态

```text
aria-invalid:border-destructive
aria-invalid:ring-3
aria-invalid:ring-destructive/20
```

表单校验只要给 Trigger 传入：

```tsx
<SelectTrigger aria-invalid="true">
  <SelectValue />
</SelectTrigger>
```

就会触发错误样式。

#### 子元素 SVG

```text
[&_svg]:pointer-events-none
[&_svg]:shrink-0
[&_svg:not([class*='size-'])]:size-4
```

这会避免图标阻挡点击，并统一没有显式尺寸的 SVG 大小。

### 箭头图标

包装层固定追加：

```tsx
<SelectPrimitive.Icon asChild>
  <ChevronDownIcon />
</SelectPrimitive.Icon>
```

`asChild` 表示 Radix Icon 不再额外渲染自己的 `<span>`，而是将 Icon 行为合并到 `ChevronDownIcon` 上。

因此调用方只需要写：

```tsx
<SelectTrigger>
  <SelectValue />
</SelectTrigger>
```

不需要手动写下拉箭头。

### 重要行为

Radix Trigger 最终是：

```html
<button type="button" role="combobox"></button>
```

`type="button"` 很重要：Select 放进 `<form>` 时，点击 Trigger 不会意外提交表单。

## 6.5 `SelectContent`

源码结构：

```tsx
function SelectContent({
  className,
  children,
  position = 'item-aligned',
  align = 'center',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === 'item-aligned'}
        className={cn(defaultClassName, ... , className)}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport ...>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}
```

### 包装层做了四件事

1. 外层包裹 `SelectPrimitive.Portal`；
2. 给 Content 增加 `data-slot="select-content"`；
3. 默认 `position="item-aligned"`；
4. 自动插入上下滚动按钮和 Viewport。

### `position` 的两种模式

#### `item-aligned`

```tsx
<SelectContent position="item-aligned">...</SelectContent>
```

特点：

- 弹层会尽量与当前选中 Item 对齐；
- 弹层的内容位置和 Trigger、当前选项文本有关；
- 适合传统 Select 菜单；
- Radix 会动态计算顶部、底部、宽度和滚动位置。

#### `popper`

```tsx
<SelectContent position="popper" align="start">
  ...
</SelectContent>
```

特点：

- 使用 Popper/Floating UI 逻辑相对 Trigger 定位；
- 可以使用 `side`、`sideOffset`、`align` 等定位 props；
- Radix 会提供以下 CSS 自定义属性：

```text
--radix-select-content-transform-origin
--radix-select-content-available-width
--radix-select-content-available-height
--radix-select-trigger-width
--radix-select-trigger-height
```

项目包装层还根据 `position` 增加：

```html
data-align-trigger="true"
```

当 `position` 是 `item-aligned` 时该属性为 `true`，用于关闭某些弹出动画。

### Content 样式

#### 弹层层级和尺寸

```text
relative
z-50
max-h-(--radix-select-content-available-height)
min-w-36
overflow-x-hidden
overflow-y-auto
```

其中：

- `z-50` 让弹层处于较高层级；
- `min-w-36` 设置最小宽度；
- `overflow-y-auto` 允许选项列表滚动；
- `max-h-(--radix-select-content-available-height)` 使用 Radix 提供的可用高度变量。

#### 背景和阴影

```text
rounded-3xl
bg-popover
text-popover-foreground
shadow-lg
ring-1
ring-foreground/5
```

颜色不是硬编码，而是通过 `bg-popover`、`text-popover-foreground` 和 CSS 变量支持主题切换。

#### 方向动画

```text
data-[side=bottom]:slide-in-from-top-2
data-[side=left]:slide-in-from-right-2
data-[side=right]:slide-in-from-left-2
data-[side=top]:slide-in-from-bottom-2
```

Radix 会设置 `data-side`，Tailwind 根据弹层实际方向选择进入动画方向。

#### Popper 额外偏移

```text
data-[side=bottom]:translate-y-1
data-[side=left]:-translate-x-1
data-[side=right]:translate-x-1
data-[side=top]:-translate-y-1
```

只有 `position="popper"` 时才合并这些 classes。

### Content 中的 Viewport

包装层没有直接使用 `SelectViewport` 包装组件，而是直接使用：

```tsx
<SelectPrimitive.Viewport
  data-position={position}
  className={cn(...)}
>
  {children}
</SelectPrimitive.Viewport>
```

输出：

```html
data-position="item-aligned"
```

或：

```html
data-position="popper"
```

当处于 Popper 模式时，Viewport 使用 Radix CSS 变量：

```text
data-[position=popper]:h-(--radix-select-trigger-height)
data-[position=popper]:w-full
data-[position=popper]:min-w-(--radix-select-trigger-width)
```

这会让弹层至少与 Trigger 保持相关的高度和宽度约束。

## 6.6 `SelectLabel`

源码结构：

```tsx
function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-3 py-2.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}
```

默认样式：

```text
px-3
py-2.5
text-xs
text-muted-foreground
```

`SelectLabel` 应该放在 `SelectGroup` 内部，用于提供分组可访问名称：

```tsx
<SelectGroup>
  <SelectLabel>支付状态</SelectLabel>
  <SelectItem value="paid">已支付</SelectItem>
</SelectGroup>
```

## 6.7 `SelectItem`

源码结构：

```tsx
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(defaultClassName, className)}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
```

### 选项结构

每个 Item 实际组合为：

```text
SelectPrimitive.Item
  ├── 绝对定位的选中标记容器
  │   └── SelectPrimitive.ItemIndicator
  │       └── CheckIcon
  └── SelectPrimitive.ItemText
      └── children
```

### `value` 是必填且必须是非空字符串

正确：

```tsx
<SelectItem value="male">男</SelectItem>
```

错误：

```tsx
<SelectItem value="">请选择</SelectItem>
```

Radix 会主动抛出错误，因为空字符串被保留为“清空当前选择并显示 placeholder”的特殊值。

如果需要清空选择，应将 Root 的 `value` 设置为空字符串，而不是增加一个空值 Item：

```tsx
<Select value={value} onValueChange={setValue}>
  ...
</Select>

<button type="button" onClick={() => setValue('')}>
  清空
</button>
```

### Item 样式

#### 布局

```text
relative
flex
w-full
items-center
gap-2.5
py-2
pr-8
pl-3
```

右侧预留 `pr-8`，给 CheckIcon 留出位置。

#### 交互

```text
cursor-default
select-none
outline-hidden
```

选项不是原生 `<option>`，因此 Radix 自己管理 focus、pointer 和键盘选中。

#### 选中或悬停状态

```text
focus:bg-accent
focus:text-accent-foreground
```

Radix 会将当前键盘焦点放到 Item 上，CSS 使用 `focus` 表示高亮。

#### 禁用状态

```text
data-disabled:pointer-events-none
data-disabled:opacity-50
```

Radix 会同时设置：

```html
aria-disabled="true" data-disabled=""
```

禁用 Item 不参与选择，也不参与有效项目的键盘导航。

#### 选中标记

```tsx
<SelectPrimitive.ItemIndicator>
  <CheckIcon />
</SelectPrimitive.ItemIndicator>
```

`ItemIndicator` 只有当前 Item 被选中时才渲染内容，未选中时不会输出 CheckIcon。

### `SelectItemText`

包装层强制将 children 放在：

```tsx
<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
```

它有三个重要作用：

1. 为 Item 提供可访问名称；
2. 为 typeahead 搜索收集文本；
3. 在 Trigger 中显示当前选中的文本。

如果 children 是：

```tsx
<SelectItem value="male">
  <span>男</span>
</SelectItem>
```

Radix 会从 ItemText 获取文本内容用于搜索和原生 option。

## 6.8 `SelectSeparator`

源码结构：

```tsx
function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "pointer-events-none -mx-1.5 my-1.5 h-px bg-border",
        className,
      )}
      {...props}
    />
  );
}
```

默认表现：

- 高度 1px；
- 使用 `bg-border`；
- 左右负 margin 抵消 Group 的内边距；
- `pointer-events-none` 不阻塞操作。

使用示例：

```tsx
<SelectContent>
  <SelectItem value="one">第一项</SelectItem>
  <SelectSeparator />
  <SelectItem value="two">第二组第一项</SelectItem>
</SelectContent>
```

## 6.9 上下滚动按钮

### 上滚按钮

```tsx
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*=size-])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpButton>
  );
}
```

### 下滚按钮

下滚按钮结构相同，只是：

- 使用 `SelectPrimitive.ScrollDownButton`；
- 使用 `ChevronDownIcon`；
- data-slot 为 `select-scroll-down-button`。

### 为什么始终插入按钮

`SelectContent` 无条件渲染：

```tsx
<SelectScrollUpButton />
<SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
<SelectScrollDownButton />
```

但 Radix 内部会根据滚动位置决定是否真正渲染按钮：

- 没有向上可滚动内容时，上滚按钮返回 `null`；
- 没有向下可滚动内容时，下滚按钮返回 `null`。

因此包装层不需要计算列表高度。

## 七、Radix Root 的状态模型

Radix Select Root 是整个组件的状态源。底层实现主要保存这些状态：

```text
open                  弹层是否打开
value                 当前选中值
trigger               Trigger DOM 节点
valueNode             SelectValue DOM 节点
valueNodeHasChildren  SelectValue 是否有自定义 children
contentId             Content 的唯一 id
triggerPointerDownPos 鼠标按下 Trigger 的坐标
nativeOptionsSet      为表单生成的原生 option 集合
dir                   ltr 或 rtl
```

可以用以下模型理解：

```text
Root
├── open / onOpenChange
├── value / onValueChange
├── trigger ref
├── valueNode ref
├── contentId
├── direction
├── disabled / required
└── native options
```

### 1. 受控状态实现

Radix 使用 `useControllableState`：

```tsx
const [open, setOpen] = useControllableState({
  prop: openProp,
  defaultProp: defaultOpen ?? false,
  onChange: onOpenChange,
});

const [value, setValue] = useControllableState({
  prop: valueProp,
  defaultProp: defaultValue,
  onChange: onValueChange,
});
```

含义是：

- 传入 `open` 时，外部是 open 的状态源；
- 未传入 `open` 时，内部使用 `defaultOpen` 初始化并自行维护；
- `value` 的规则完全相同；
- 状态改变时调用外部回调，但不会在受控模式下直接替外部持有状态。

### 2. Context 传递

Root 将状态写入 Select Context：

```text
trigger
onTriggerChange
valueNode
onValueNodeChange
value
onValueChange
open
onOpenChange
dir
required
disabled
contentId
triggerPointerDownPosRef
```

后代组件通过 `useSelectContext` 获取这些数据，不需要层层传 props。

## 八、Trigger 的执行流程

## 8.1 Trigger 的 DOM 和 ARIA

Radix Trigger 最终使用一个 Primitive button，并设置：

```html
<button
  type="button"
  role="combobox"
  aria-controls="content-id"
  aria-expanded="true|false"
  aria-required="true|false"
  aria-autocomplete="none"
  data-state="open|closed"
  data-placeholder
></button>
```

这些属性的作用：

| 属性               | 作用                                 |
| ------------------ | ------------------------------------ |
| `role="combobox"`  | 告诉辅助技术这是一个可展开的选择控件 |
| `aria-controls`    | 关联弹出列表的 id                    |
| `aria-expanded`    | 告知当前是否展开                     |
| `aria-required`    | 传递必填状态                         |
| `data-state`       | 给 CSS 提供 open/closed 状态         |
| `data-placeholder` | 当前没有真实值时存在                 |

## 8.2 鼠标和触摸打开

底层 Trigger 区分鼠标和非鼠标指针：

```text
pointerType = mouse
  → pointerdown 时打开
  → click 时只聚焦

pointerType = touch / pen
  → click 时打开
```

这样做是为了避免鼠标按下和 click 两次都触发打开，也保证触摸设备行为自然。

鼠标左键且没有 Ctrl 时才打开：

```text
button === 0
ctrlKey === false
pointerType === 'mouse'
```

如果目标元素捕获了 pointer，则先释放 pointer capture，避免触发流程被浏览器的 pointer capture 干扰。

## 8.3 键盘打开

Trigger 的键盘处理包括：

```text
Space
Enter
ArrowUp
ArrowDown
```

按下这些键时：

1. 打开 Content；
2. 重置 typeahead 搜索字符串；
3. 阻止浏览器默认行为。

Trigger 还会在按下普通字符时触发 typeahead，让用户在未展开或已展开状态下通过输入首字母寻找选项。

## 九、Content 的挂载和 Portal

## 9.1 为什么使用 Portal

项目包装层明确写了：

```tsx
<SelectPrimitive.Portal>
  <SelectPrimitive.Content>...</SelectPrimitive.Content>
</SelectPrimitive.Portal>
```

Portal 的意义：

- 避免父容器的 `overflow: hidden` 截断弹层；
- 避免局部 stacking context 影响 z-index；
- 让浮层相对 viewport 或 Popper 容器定位；
- 将弹层从普通页面布局流中移出。

因此 `SelectContent` 不能依赖父级的 `position: relative` 才能正确弹出。

## 9.2 Content 关闭时也会保留选项集合

Radix 的 `SelectContent` 在关闭时不会简单地把所有 Item 从 React 树中完全删除。它会：

1. 创建一个 `DocumentFragment`；
2. 将 Collection Slot 和 children 放到这个 fragment；
3. 在关闭状态下通过 Portal 保留选项注册信息；
4. 打开时再渲染真正的 Content 实现。

这样做的目的主要是：

- 让 Root 持续知道有哪些 Item；
- 为 typeahead 和原生 option 提供选项信息；
- 让值变化后能找到对应的 ItemText；
- 避免 Content 不可见时选项元数据完全丢失。

## 9.3 Content 打开时的可访问性处理

Content 打开后，Radix 会组合多个层：

```text
RemoveScroll
  ↓
FocusScope
  ↓
DismissableLayer
  ↓
SelectPosition
  ↓
role=listbox
```

### `RemoveScroll`

防止用户滚动页面背景，同时允许在弹层内滚动。

### `FocusScope`

- 弹层打开时将焦点管理限制在浮层范围；
- 关闭时将焦点恢复到 Trigger；
- 阻止默认的自动聚焦流程，由 Select 自己聚焦选中 Item。

### `DismissableLayer`

负责：

- 按 Escape 关闭；
- 点击外部关闭；
- 处理 focus outside；
- 阻止外部区域在弹层打开时接收 pointer。

### `aria-hidden`

Radix 使用 `hideOthers(content)` 隐藏 Content 之外的页面内容，帮助屏幕阅读器聚焦当前列表。

## 十、Content 打开后的焦点流程

打开 Select 时，焦点并不是随意落在 Content 上，而是优先尝试：

```text
当前选中的 Item
  ↓ 不存在
第一个可用 Item
  ↓ 不存在
Content 容器
```

底层逻辑会：

1. 从 Collection 获取所有 Item；
2. 找出 selectedItem；
3. 如果没有选中项，寻找第一个非 disabled Item；
4. 将目标 Item 滚动到可视区域；
5. 调用 `focus()`；
6. 如果浏览器仍没有切换焦点，再尝试下一个候选元素。

当焦点移动到第一个或最后一个 Item 时，还会同步调整 Viewport 的 `scrollTop`，避免焦点项目被滚动按钮遮挡。

## 十一、Item 的注册和选择流程

## 11.1 Collection 注册

每个 `SelectItem` 会通过 `Collection.ItemSlot` 注册：

```text
value
ref
textValue
disabled
```

Collection 提供：

- 所有选项的顺序；
- 当前选项的 DOM ref；
- 键盘上下移动需要的候选列表；
- typeahead 搜索使用的文本。

这比在 DOM 上手动查找所有选项更稳定，因为 disabled、隐藏状态和 React 渲染顺序都由 Collection 统一处理。

## 11.2 Item 状态

Item 根据 Root value 判断：

```ts
const isSelected = context.value === value;
```

然后输出：

```html
role="option" aria-labelledby="item-text-id" aria-selected="true|false"
data-state="checked|unchecked" tabindex="-1"
```

需要注意：Radix 的 `aria-selected` 只在当前 Item 被选中并且获得焦点时为 true，选中但未聚焦时可能使用 `data-state="checked"` 表达选中状态。

## 11.3 Pointer 选择

Radix 区分鼠标和其他指针：

```text
非鼠标指针：click 时选择
鼠标指针：pointerup 时选择
```

这样可以避免鼠标按下、拖动、移出和释放时发生错误选择。

Pointer move 时：

- disabled Item 会让焦点回到 Content；
- 鼠标移动到启用 Item 时，Item 获得焦点；
- pointer leave 时，如果当前 Item 正是 activeElement，焦点回到 Content。

## 11.4 键盘选择

Item 监听：

```text
Space
Enter
```

按下后：

1. 调用 `onValueChange(value)`；
2. 设置 Root value；
3. 触发外部 `onValueChange`；
4. 关闭 Content；
5. 后续 FocusScope 将焦点恢复到 Trigger。

按下 Space 时还会阻止浏览器默认滚动行为。

## 十二、键盘导航和 Typeahead

## 12.1 上下方向键

Content 打开后，以下按键会在启用 Item 中移动：

```text
ArrowDown：向后
ArrowUp：向前
Home：第一个
End：最后一个
```

处理流程：

1. 从 Collection 获取所有 Item；
2. 过滤 disabled Item；
3. 根据按键决定是否反转数组；
4. 如果是 ArrowUp/ArrowDown，从当前元素之后开始搜索；
5. 用 `setTimeout` 延迟聚焦目标，避免与当前键盘事件的浏览器行为冲突；
6. `preventDefault()` 阻止页面滚动。

Tab 会被阻止，用户应通过 Enter、Space、Escape 或方向键完成操作。

## 12.2 Typeahead 搜索

Typeahead 会把用户连续输入的字符暂存在 ref：

```text
输入 A  → "a"
输入 p  → "ap"
输入 p  → "app"
```

如果 1 秒内没有继续输入，搜索字符串清空。

搜索时：

1. 过滤 disabled Item；
2. 从当前 Item 附近开始查找；
3. 使用 `textValue.toLowerCase().startsWith(search)`；
4. 找到后聚焦目标；
5. 没有匹配项时不改变当前状态。

如果用户连续输入同一个字符，例如：

```text
A A A
```

Radix 会将重复字符串归一化为单个 `A`，用于循环寻找以 A 开头的下一个选项。

### 自定义 `textValue`

当 Item 的可见内容复杂时，可以显式传入：

```tsx
<SelectItem value="user-1" textValue="张三">
  <Avatar />
  <span>张三</span>
</SelectItem>
```

这样 typeahead 不需要依赖复杂 JSX 的文本提取结果。

## 十三、Content 的两种定位算法

## 13.1 Item-aligned 定位

默认定位模式是 `item-aligned`。Radix 会读取：

- Trigger 的 `getBoundingClientRect()`；
- SelectValue 的矩形；
- 当前 selected Item 的矩形；
- selected ItemText 的矩形；
- Viewport 的 scrollHeight；
- Content 的 padding 和 border；
- 当前文本方向 ltr 或 rtl。

然后计算：

- 弹层左侧或右侧；
- 最小宽度；
- 最大可用高度；
- Content wrapper 的 top/bottom；
- selected Item 应该处于的滚动位置。

弹层尽量做到：

```text
当前选项文本与 Trigger 中的值文本对齐
```

同时不能超出窗口边缘。左右定位会保留约 10px 的 viewport margin。

## 13.2 Popper 定位

`position="popper"` 时，Radix 使用 Popper Primitive：

```tsx
<SelectContent position="popper" side="bottom" align="start">
  ...
</SelectContent>
```

Popper 负责：

- 选择 side；
- 处理 collision；
- 根据 viewport 调整位置；
- 生成 `data-side`；
- 生成 CSS 变量；
- 触发 `onPlaced`。

项目包装层没有覆盖 `side` 等 props，因此可以直接传入：

```tsx
<SelectContent position="popper" sideOffset={4} align="start">
  ...
</SelectContent>
```

## 十四、Viewport 和滚动按钮源码逻辑

Radix Viewport 主要做三件事：

1. 创建可滚动容器；
2. 将 Item 放进 Collection Slot；
3. 根据滚动位置调整弹层高度和滚动按钮。

Viewport 的关键样式：

```text
position: relative
flex: 1
overflow: hidden auto
```

Radix 还注入隐藏滚动条的 style：

```css
[data-radix-select-viewport] {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

[data-radix-select-viewport]::-webkit-scrollbar {
  display: none;
}
```

### 上滚按钮显示条件

```ts
canScrollUp = viewport.scrollTop > 0;
```

### 下滚按钮显示条件

```ts
maxScroll = viewport.scrollHeight - viewport.clientHeight;
canScrollDown = Math.ceil(viewport.scrollTop) < maxScroll;
```

### 按住按钮自动滚动

滚动按钮内部使用 `setInterval`：

```text
pointerdown / pointermove
  → 每 50ms 执行一次 onAutoScroll

pointerleave / 卸载
  → clearInterval
```

上滚每次减少 selected Item 的高度，下滚每次增加 selected Item 的高度。

## 十五、原生表单兼容机制

Radix Select 虽然视觉上使用自定义按钮和 div，但它仍然支持：

- `name`；
- `required`；
- `form`；
- 原生表单提交；
- 原生 `change` 事件。

实现方式是创建一个视觉隐藏的原生 `<select>`，通常称为 Bubble Input。

## 15.1 隐藏 select 的生成

当 Trigger 位于 `<form>` 内，或者 Root 显式传入 `form` 时，Radix 会启用 Bubble Input。Root 会将每个 `SelectItemText` 转换为：

```tsx
<option value={itemValue} disabled={itemDisabled}>
  {textContent}
</option>
```

然后把所有 option 放进隐藏的 `<select>`。

当 Root 的 value 是 undefined 时，还会放入：

```html
<option value=""></option>
```

这样浏览器表单可以识别当前值。

## 15.2 隐藏 select 的样式

Radix 使用 `VISUALLY_HIDDEN_STYLES`，它不是 `display: none`，而是视觉隐藏：

- 屏幕上不可见；
- 仍然存在于 DOM；
- 可以参与表单语义和事件；
- 不会破坏可访问性和浏览器表单机制。

## 15.3 值变化同步

当 React value 变化时，Radix 会：

1. 找到隐藏原生 select；
2. 调用原生 `HTMLSelectElement.value` setter；
3. 派发一个冒泡的 `change` 事件。

这样 React 控制的自定义 Select 仍然能表现得像原生表单字段。

## 15.4 为什么项目表单代码可以传 `name`

项目中的表单组件会这样使用：

```tsx
<Select
  name={field.name}
  value={field.value.toString()}
  onValueChange={(value) => field.onChange(Number(value))}
>
  ...
</Select>
```

`name` 最终会传到隐藏 select，因此表单工具和原生提交都能知道字段名称。

## 十六、方向和 RTL

Root 使用 `useDirection(dir)` 确定方向：

```tsx
<Select dir="rtl">...</Select>
```

方向会影响：

- Popper 的对齐；
- item-aligned 模式的左右计算；
- selected Item 的偏移；
- Content 的 clamped right/left；
- 键盘方向的视觉语义。

默认方向通常是 `ltr`，如果应用全局设置了 RTL，也可以让 Select 跟随方向 Context。

## 十七、项目实际使用模式

## 17.1 表格分页大小

项目的基础表格通过受控 value 控制每页数量：

```tsx
<Select
  value={pagination.pageSize.toString()}
  onValueChange={(value) => table.setPageSize(Number(value))}
>
  <SelectTrigger size="sm">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="10">每页 10 条</SelectItem>
    <SelectItem value="20">每页 20 条</SelectItem>
    <SelectItem value="50">每页 50 条</SelectItem>
    <SelectItem value="100">每页 100 条</SelectItem>
  </SelectContent>
</Select>
```

这里有两个关键点：

1. Radix Select 的 value 是字符串；
2. TanStack Table 的 pageSize 是数字；
3. 读取时使用 `toString()`；
4. 回调中使用 `Number(value)` 转回数字。

## 17.2 筛选条件

复杂表格中的性别筛选：

```tsx
<Select value={genderSelected} onValueChange={setGenderSelected}>
  <SelectTrigger>
    <SelectValue placeholder="请选择性别" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectItem value="1">男</SelectItem>
      <SelectItem value="2">女</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

这种写法是标准的受控 Select：

```text
用户选择 Item
  ↓
Radix 调用 onValueChange
  ↓
setGenderSelected
  ↓
组件重新渲染
  ↓
新的 value 传回 Root
```

如果筛选条件会触发数据请求，应确保请求参数依赖该 state，并且 Query key 包含新的筛选值。

## 17.3 与 React Hook Form 集成

项目中使用 `Controller` 对接 Select：

```tsx
<Controller
  name="gender"
  control={form.control}
  render={({ field, fieldState }) => (
    <Select
      name={field.name}
      value={field.value.toString()}
      onValueChange={(value) => field.onChange(Number(value))}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="请选择性别" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="1">男</SelectItem>
          <SelectItem value="2">女</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )}
/>
```

需要注意：

- `field.value` 如果是数字，必须转换成字符串传给 Select；
- `onValueChange` 回调值是字符串，必须转换回表单需要的数字；
- `fieldState.invalid` 可以映射到 `SelectTrigger aria-invalid`；
- 不要把 `SelectItem value` 写成数字，Radix 要求 string。

推荐更完整的错误状态写法：

```tsx
<SelectTrigger aria-invalid={fieldState.invalid}>
  <SelectValue placeholder="请选择性别" />
</SelectTrigger>
```

## 17.4 时间选择器

项目的 `TimeInput` 使用三个 Select 组合成 `HH:mm:ss`：

```text
小时 Select
  + ":"
分钟 Select
  + ":"
秒 Select
```

每个 Select 都是受控的：

```tsx
<Select value={hour} onValueChange={handleHourChange}>
  <SelectTrigger className="w-16 text-center">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {hours.map((hour) => (
      <SelectItem key={hour} value={hour}>
        {hour}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

选择小时后，组件不会只保存小时，而是重新拼接完整时间：

```ts
const newTime = `${newHour}:${minute}:${second}`;
onChange(newTime);
```

这说明 Select 本身只负责单字段选择，多个 Select 之间的数据组合由业务组件处理。

## 十八、组件的完整事件时序

### 1. 打开流程

```text
用户点击 Trigger
    ↓
Trigger 判断 pointer 类型
    ↓
调用 context.onOpenChange(true)
    ↓
Root 更新 open
    ↓
Content 从关闭 fragment 切换为真正浮层
    ↓
Portal 渲染到浮层容器
    ↓
计算位置
    ↓
定位完成
    ↓
聚焦选中 Item 或第一个可用 Item
```

### 2. 键盘选择流程

```text
用户按 ArrowDown
    ↓
Content 收集启用 Item
    ↓
找到当前焦点后的候选项
    ↓
focus 候选 Item

用户按 Enter / Space
    ↓
Item handleSelect
    ↓
onValueChange(value)
    ↓
Root 更新 value
    ↓
onOpenChange(false)
    ↓
FocusScope 将焦点恢复到 Trigger
    ↓
SelectValue 显示新选项文本
```

### 3. 点击外部关闭流程

```text
用户点击 Content 外部
    ↓
DismissableLayer 检测 outside pointer
    ↓
onDismiss
    ↓
Root onOpenChange(false)
    ↓
FocusScope 恢复 Trigger 焦点
```

## 十九、数据流和状态变化

Select 的核心数据流如下：

```text
外部 value
    ↓
Root useControllableState
    ↓
Select Context.value
    ├── Trigger 判断 placeholder
    ├── Value 显示当前文本
    ├── Item 判断 isSelected
    ├── Content 找到 selectedItem
    ├── ItemIndicator 显示 CheckIcon
    └── BubbleInput 同步原生 select
```

用户选择一个 Item 时：

```text
Item.value
    ↓
context.onValueChange(value)
    ↓
Root setValue
    ↓
受控模式：调用外部 onValueChange
非受控模式：更新内部 state
    ↓
所有订阅 Context 的组件重新渲染
```

## 二十、源码中的关键设计取舍

### 1. 为什么不直接使用原生 select

原生 `<select>` 有很好的表单和可访问性支持，但可定制的弹层样式有限。Radix 使用自定义 button/listbox 获得：

- 可控的视觉样式；
- 自定义弹层定位；
- 完整键盘导航；
- 自定义滚动按钮；
- 主题和动画支持。

在表单控制场景下，同时通过隐藏原生 select 保留：

- 表单 name；
- required；
- 原生 change；
- 表单提交兼容。

这是“自定义交互 + 原生表单语义”的折中方案。

### 2. 为什么使用 Collection

如果每个 Item 自己查找 DOM，React 条件渲染、disabled 选项、Portal 和排序会增加复杂度。Collection 统一收集：

```text
DOM ref
value
textValue
disabled
```

于是键盘导航、typeahead 和选中定位都基于同一份有序数据。

### 3. 为什么需要多个 Context

Radix Select 不是一个简单的单 Context 组件，它至少需要区分：

- Root 状态 Context；
- Content 状态 Context；
- Viewport 状态 Context；
- Group Context；
- Item Context；
- 原生 option Context。

这样每一层只订阅自己需要的状态，避免把所有内部状态塞进一个对象，也支持多个 Select 嵌套或作用域隔离。

### 4. 为什么组合多个 ref

同一个 DOM 节点可能同时需要：

- 暴露给调用方的 forwarded ref；
- 注册到 Root Context；
- 注册到 Collection；
- 用于定位或 focus 管理的内部 ref。

`useComposedRefs` 将它们合并，使多个系统都能获得同一个 DOM 节点。

## 二十一、项目包装层的注意事项

## 21.1 包装层没有导出全部 Radix Primitive

项目文件只导出：

```tsx
Select;
SelectContent;
SelectGroup;
SelectItem;
SelectLabel;
SelectScrollDownButton;
SelectScrollUpButton;
SelectSeparator;
SelectTrigger;
SelectValue;
```

没有导出：

- `SelectIcon`；
- `SelectPortal`；
- `SelectViewport`；
- `SelectItemText`；
- `SelectItemIndicator`；
- `SelectArrow`。

这是有意的封装取舍：常用结构已经在包装层内部固定。如果要实现特殊内容，需要：

1. 扩展 `src/components/ui/select.tsx` 的导出；或；
2. 直接从 `radix-ui` 导入 Primitive；
3. 但不要同时混用两套不同的 Root Context。

## 21.2 Trigger 会自动添加箭头

调用方写：

```tsx
<SelectTrigger>
  <SelectValue />
</SelectTrigger>
```

包装层已经追加 `ChevronDownIcon`。如果调用方再次添加一个箭头，会出现两个图标。

## 21.3 Select value 必须是字符串

这些写法不推荐：

```tsx
<Select value={1}>
```

```tsx
<SelectItem value={1}>数字</SelectItem>
```

应写成：

```tsx
<Select value={String(numberValue)}>
  <SelectItem value="1">数字</SelectItem>
</Select>
```

在回调中转换：

```tsx
onValueChange={value => setNumberValue(Number(value))}
```

## 21.4 `SelectValue` 需要放在 Trigger 内

正确：

```tsx
<SelectTrigger>
  <SelectValue placeholder="请选择" />
</SelectTrigger>
```

不建议把 `SelectValue` 放在 Content 内，因为它需要注册为 Trigger 的值展示节点。

## 21.5 `SelectItem` 的 value 不能为空字符串

空字符串在 Radix 中代表“清空值并显示 placeholder”，不能作为普通选项值。

如果后端需要一个空字符串业务值，建议使用一个非空的 UI value：

```tsx
<SelectItem value="__empty__">无</SelectItem>
```

提交接口前再转换：

```ts
const apiValue = value === "__empty__" ? "" : value;
```

## 二十二、源码阅读时发现的样式注意事项

## 22.1 Radix 输出 `data-state`，不是 `data-open`

底层 Select Content 明确输出：

```html
data-state="open"
```

或：

```html
data-state="closed"
```

而项目 `SelectContent` 的样式中包含：

```text
data-open:animate-in
data-open:fade-in-0
data-open:zoom-in-95
data-closed:animate-out
data-closed:fade-out-0
data-closed:zoom-out-95
```

按照 Tailwind data variant 的通常语义，`data-open:` 对应的是：

```css
[data-open]
```

不是：

```css
[data-state="open"]
```

因此需要在浏览器中确认当前动画是否实际生效。若动画没有生效，建议改为与 Radix 输出一致的写法：

```text
data-[state=open]:animate-in
data-[state=open]:fade-in-0
data-[state=open]:zoom-in-95
data-[state=closed]:animate-out
data-[state=closed]:fade-out-0
data-[state=closed]:zoom-out-95
```

这是源码事实和样式约定之间的一个重要核对点。

## 22.2 `data-align-trigger` 是包装层自定义属性

Radix 本身使用 `position` 和 `data-side` 等属性，项目包装层额外输出：

```tsx
data-align-trigger={position === 'item-aligned'}
```

它不是 Radix 的标准状态属性，专门用于项目自己的样式：

```text
data-[align-trigger=true]:animate-none
```

修改定位模式或动画时要同时考虑这个自定义属性。

## 22.3 CSS 变量只在对应定位模式下有意义

例如：

```text
--radix-select-content-available-height
--radix-select-trigger-width
```

这些变量主要由 Popper 定位逻辑提供。若在 `item-aligned` 模式使用依赖这些变量的 class，最终效果要通过浏览器计算样式确认。

## 22.4 Portal 会影响局部样式继承

由于 Content 通过 Portal 渲染：

- 父级字体、颜色、transform、overflow 不一定继承；
- 主题 CSS 变量必须挂在 `:root` 或全局容器上；
- 如果主题 class 只挂在一个不包含 Portal 容器的局部节点上，弹层可能不跟随主题；
- `z-index` 需要与 Dialog、Drawer、Popover 等浮层统一规划。

## 二十三、调试 Select 的方法

### 1. 检查 DOM

打开浏览器开发者工具，分别检查：

Trigger：

```html
role="combobox" data-state="open|closed" aria-expanded="true|false"
```

Content：

```html
role="listbox" data-state="open|closed" data-side="bottom|top|left|right"
```

Item：

```html
role="option" data-state="checked|unchecked" data-highlighted aria-disabled
```

隐藏表单控件：

```html
<select name="..."></select>
```

### 2. 检查状态

在 Trigger 的 `onValueChange` 中打印：

```tsx
<Select
  value={value}
  onValueChange={nextValue => {
    console.log('Select value:', nextValue)
    setValue(nextValue)
  }}
>
```

确认：

- 回调是否触发；
- value 是否为字符串；
- 受控 value 是否在下一次渲染中更新；
- Item 的 value 是否与 Root value 完全一致。

### 3. 检查样式

重点查看：

- Content 是否被 Portal 到预期容器；
- `data-side` 是否存在；
- `data-state` 与 Tailwind data variant 是否匹配；
- z-index 是否被 Dialog 或 Drawer 覆盖；
- `bg-popover` 和 `text-popover-foreground` 是否有 CSS 变量；
- 主题 class 是否能覆盖 Portal 内容。

### 4. 检查焦点

使用键盘测试：

1. Tab 聚焦 Trigger；
2. Enter 或 Space 打开；
3. ArrowUp/ArrowDown 移动；
4. Home/End 跳转；
5. Enter/Space 选择；
6. Escape 关闭；
7. 关闭后焦点回到 Trigger。

如果焦点没有恢复，优先检查是否在 Trigger 上使用了会阻止事件传播的自定义事件处理器。

## 二十四、常见问题

### 问题 1：点击 Trigger 提交了表单

检查是否绕过了项目包装层，或者自定义 Trigger 时覆盖了 `type`。Radix 默认使用：

```html
<button type="button"></button>
```

不要改成默认的 submit。

### 问题 2：选项显示了但点击后没有变化

检查：

- `SelectItem` 是否有非空 `value`；
- Root 是否处于受控模式；
- 受控模式下 `onValueChange` 是否调用了 setState；
- Root 的 `value` 是否与 Item 的 value 完全一致；
- 是否在 `onValueChange` 中抛出异常。

### 问题 3：中文输入或首字母搜索无效

检查：

- Item 是否包含 `SelectItemText`；
- 是否传入了合理的 `textValue`；
- Item 是否被标记为 disabled；
- 当前焦点是否真的在 Content 或 Item 上。

### 问题 4：下拉菜单被父容器裁剪

项目包装层已经使用 Portal。如果仍被裁剪，检查：

- Portal 是否被改成了局部 container；
- 祖先元素是否存在特殊的 stacking context；
- Content 的 z-index 是否低于其他浮层；
- 是否在 Dialog、Drawer 内使用了不同的 Portal 层级。

### 问题 5：placeholder 不显示

检查：

```tsx
<SelectValue placeholder="请选择" />
```

并确认：

- Root value 是 `''` 或 `undefined`；
- 没有误传一个不存在的 Item value；
- `SelectValue` 没有被自定义 children 覆盖。

### 问题 6：数字选项和表单数字类型不一致

Select 始终返回字符串：

```tsx
onValueChange={value => field.onChange(Number(value))}
```

不要把字符串和数字混合比较：

```ts
value === 1; // 如果 value 来自 Select，这通常是 false
```

### 问题 7：弹层动画不生效

检查 DOM 实际属性。Radix 使用：

```html
data-state="open"
```

如果 CSS 使用了：

```text
data-open:animate-in
```

需要确认 Tailwind 版本和项目配置是否把它转换成了有效选择器。否则使用：

```text
data-[state=open]:animate-in
```

## 二十五、阅读源码后的心智模型

可以用下面这句话记住 Select：

> Root 管值和开关，Trigger 管打开和焦点，Content 管弹层和定位，Collection 管选项，Item 管选择，ItemText 管文本和表单，BubbleInput 管原生表单兼容。

对应关系：

```text
Root
  ├── value / open
  ├── Context
  ├── Popper Root
  └── hidden native select

Trigger
  ├── combobox button
  ├── pointer / keyboard open
  ├── placeholder state
  └── trigger focus

Content
  ├── Portal
  ├── FocusScope
  ├── DismissableLayer
  ├── positioning
  ├── listbox
  └── viewport

Collection
  ├── item order
  ├── refs
  ├── textValue
  └── disabled filtering

Item
  ├── option role
  ├── pointer selection
  ├── keyboard selection
  ├── selected state
  └── ItemIndicator

ItemText
  ├── accessible label
  ├── typeahead text
  ├── native option
  └── selected value portal
```

## 二十六、修改组件前的检查清单

修改 `src/components/ui/select.tsx` 前，建议逐项确认：

- [ ] 是否仍然保留 `SelectPrimitive.Root` 的 Context 链路；
- [ ] 是否仍然保留 `SelectPrimitive.Portal`；
- [ ] 是否仍然保留 `SelectPrimitive.Viewport`；
- [ ] 是否仍然保留 `SelectItemText`；
- [ ] 是否仍然保留 `SelectItemIndicator`；
- [ ] 是否没有把 Item value 改成数字或空字符串；
- [ ] 是否保留 Trigger 的 `type="button"` 行为；
- [ ] 是否保留 `role="combobox"` 和 `role="option"`；
- [ ] 是否保留 `aria-expanded`、`aria-controls` 和 `aria-selected`；
- [ ] 是否正确合并调用方 className；
- [ ] 是否检查了 `data-state`、`data-side` 和自定义 data 属性；
- [ ] 是否验证了键盘导航、Escape 关闭和焦点恢复；
- [ ] 是否验证了表单提交和 required 行为；
- [ ] 是否验证了 Dialog、Drawer、主题和 Portal 场景；
- [ ] 是否验证了长列表的滚动按钮和焦点滚动。

## 二十七、总结

项目中的 shadcn Select 是一个薄包装层：

```text
shadcn 包装代码
  = API 转发 + 样式 + 图标 + data 属性
```

真正复杂的行为来自 Radix Select：

```text
Radix Select
  = 受控状态
  + Context
  + Collection
  + Typeahead
  + Keyboard Navigation
  + FocusScope
  + DismissableLayer
  + Popper 定位
  + Portal
  + 滚动按钮
  + 原生表单兼容
  + ARIA
```

使用时最重要的规则是：

1. Root 的 `value` 和 Item 的 `value` 使用字符串；
2. 通过 `onValueChange` 将字符串转换成业务需要的数字或枚举；
3. `SelectValue` 放在 Trigger 内；
4. Item 必须有非空 value；
5. 列表较长时让 Radix 管理 Viewport 和滚动按钮；
6. 表单场景传递 `name`、`required` 并正确处理 `aria-invalid`；
7. 修改样式时以 Radix 实际输出的 `data-state`、`data-side` 和 CSS 变量为准；
8. 修改结构时不要破坏 Context、Collection、Portal、FocusScope 和隐藏原生 select。
