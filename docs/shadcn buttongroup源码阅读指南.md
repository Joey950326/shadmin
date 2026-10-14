# shadcn ButtonGroup 源码阅读指南

> 说明：请求中的文件名写成了 `docs/shadcn select源码阅读指南.md`，但目标组件是 ButtonGroup。为避免覆盖已有的 Select 源码文档，本文保存为 `docs/shadcn buttongroup源码阅读指南.md`。

## 一、阅读范围和核心结论

本文阅读的主要源码是：

```text
src/components/ui/button-group.tsx
```

同时结合它直接依赖的：

```text
src/components/ui/button.tsx
src/components/ui/input-group.tsx
src/components/ui/input.tsx
src/components/ui/separator.tsx
src/lib/utils.ts
```

ButtonGroup 不是一个带内部状态的复杂组件。它的核心职责是：

- 使用一个容器把多个控件组合起来；
- 统一处理横向或纵向排列；
- 去掉相邻控件之间重复的圆角和边框；
- 调整聚焦元素的层级，避免 focus ring 被相邻元素遮挡；
- 根据子元素的 `data-slot`、`data-variant`、`data-orientation` 等属性进行联动样式；
- 提供文本容器和分隔线两个辅助组件；
- 通过 `asChild` 让文本辅助组件复用任意子元素的 DOM 节点。

可以先用下面的模型理解：

```text
ButtonGroup
  ├── 组合多个 Button / Input / SelectTrigger / 自定义元素
  ├── 根据 orientation 设置布局方向
  ├── 通过相邻选择器消除重复圆角和边框
  ├── 通过 :has() 根据子元素状态修改样式
  └── 通过 data-slot 与子组件建立样式契约

ButtonGroupText
  └── 普通情况下渲染 div
      或使用 asChild 将样式合并到子元素

ButtonGroupSeparator
  └── 基于项目 Separator 渲染横向或纵向分隔线
```

## 二、组件依赖和所在架构

### 1. package 依赖

项目的 ButtonGroup 直接或间接依赖：

- `class-variance-authority`：生成 orientation 对应的 class；
- `radix-ui`：提供 `Slot.Root`，实现 `asChild`；
- `@radix-ui/react-separator`：通过项目 `Separator` 包装使用；
- `clsx` 和 `tailwind-merge`：由 `cn` 负责 class 合并。

相关依赖在 `package.json` 中体现为：

```json
{
  "class-variance-authority": "...",
  "radix-ui": "...",
  "clsx": "...",
  "tailwind-merge": "..."
}
```

### 2. 项目组件层级

```text
ButtonGroup
├── 原生 div[role=group]
├── Button
│   └── 原生 button 或 Slot 替换后的子元素
├── Input
│   └── 原生 input
├── SelectTrigger
│   └── Radix Select 的 button
├── ButtonGroupText
│   └── div 或 Slot 替换后的子元素
└── ButtonGroupSeparator
    └── 项目 Separator
        └── Radix Separator Primitive
```

ButtonGroup 本身不依赖 Button 的 React 状态，也不持有输入值。它只通过 CSS 观察子元素的属性和结构。

## 三、源码全貌

`src/components/ui/button-group.tsx` 主要由三部分组成：

```tsx
const buttonGroupVariants = cva(...)

function ButtonGroup(...) { ... }

function ButtonGroupText(...) { ... }

function ButtonGroupSeparator(...) { ... }

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
```

导出的 `buttonGroupVariants` 也很重要。它允许其他组件复用 ButtonGroup 的 orientation class，而不必渲染 ButtonGroup 本身。

## 四、`cn` 和 `cva` 的职责

## 4.1 `cn`：合并调用方 class

项目的 `cn` 定义为：

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

工作流程：

```text
clsx
  ↓ 将字符串、数组、条件对象合并
字符串
  ↓
tailwind-merge
  ↓ 处理冲突的 Tailwind 工具类
最终 className
```

例如：

```tsx
<ButtonGroup className="w-full" />
```

默认 ButtonGroup 是 `w-fit`，调用方的 `w-full` 会被 `tailwind-merge` 合并为有效的最终宽度。

## 4.2 `cva`：生成 orientation class

源码定义：

```tsx
const buttonGroupVariants = cva(
  "group/button-group flex w-fit items-stretch ...",
  {
    variants: {
      orientation: {
        horizontal: "...",
        vertical: "flex-col ...",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);
```

`cva` 的输入是一个配置对象，输出是一个 class 生成函数：

```tsx
buttonGroupVariants({ orientation });
```

当 orientation 为 `horizontal` 时，返回横向组合样式；当 orientation 为 `vertical` 时，返回纵向组合样式。

`VariantProps<typeof buttonGroupVariants>` 会从 cva 配置中推导出：

```ts
type Orientation = "horizontal" | "vertical" | null | undefined;
```

因此 TypeScript 会检查：

```tsx
<ButtonGroup orientation="horizontal" />
<ButtonGroup orientation="vertical" />
```

而以下写法会报类型错误：

```tsx
<ButtonGroup orientation="diagonal" />
```

## 五、`buttonGroupVariants` 基础样式

基础 class 是：

```text
group/button-group
flex
w-fit
items-stretch
*:focus-visible:relative
*:focus-visible:z-10
has-[>[data-slot=button-group]]:gap-2
has-[>[data-variant=outline]]:*:data-[slot=input-group]:border-border
has-[>[data-variant=outline]]:*:data-[slot=select-trigger]:border-border
has-[>[data-variant=outline]]:[&>[data-slot=input-group]:has(:focus-visible)]:border-ring
has-[>[data-variant=outline]]:[&>[data-slot=select-trigger]:focus-visible]:border-ring
has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-4xl
[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit
[&>input]:flex-1
has-[>[data-variant=outline]]:[&>input]:border-border
has-[>[data-variant=outline]]:[&>input:focus-visible]:border-ring
```

这些 class 可以分为六组：

1. 容器布局；
2. focus 层级；
3. 嵌套 ButtonGroup 的间距；
4. outline 变体下的 InputGroup/SelectTrigger 边框联动；
5. SelectTrigger 的宽度和末尾圆角；
6. 直接子级 input 的伸展和边框处理。

## 5.1 `group/button-group`

```text
group/button-group
```

这是 Tailwind 的命名 group。后代元素可以通过：

```text
group-data-[...]/button-group:...
```

引用父级状态。

当前 ButtonGroup 源码主要使用 `has-*` 和子选择器，没有大量使用这个命名 group，但保留命名可以让其他样式以 ButtonGroup 为作用域，避免普通 `.group` 冲突。

## 5.2 `flex w-fit items-stretch`

```text
flex
w-fit
items-stretch
```

含义：

- `flex`：将直接子元素排成 Flex 布局；
- `w-fit`：容器默认只占用内容宽度；
- `items-stretch`：交叉轴上让子元素尽量拉伸。

横向模式下，默认主轴是水平方向；纵向模式下，`flex-col` 将主轴变为垂直方向。

如果需要 ButtonGroup 撑满父容器：

```tsx
<ButtonGroup className="w-full">...</ButtonGroup>
```

## 5.3 focus 层级

```text
*:focus-visible:relative
*:focus-visible:z-10
```

它匹配所有直接子元素的 `:focus-visible` 状态：

```text
ButtonGroup
├── Button:focus-visible → position: relative; z-index: 10
├── Input:focus-visible → position: relative; z-index: 10
└── SelectTrigger:focus-visible → position: relative; z-index: 10
```

作用是让当前聚焦控件的 focus ring 位于相邻控件之上。

没有这两条规则时，相邻按钮的边框可能覆盖当前输入框的 ring，产生断裂或层叠错误。

## 六、横向和纵向 orientation

## 6.1 横向模式

源码：

```text
[&>*:not(:first-child)]:rounded-l-none
[&>*:not(:first-child)]:border-l-0
[&>*:not(:last-child)]:rounded-r-none
[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-4xl!
```

假设结构为：

```tsx
<ButtonGroup>
  <Button>左</Button>
  <Button>中</Button>
  <Button>右</Button>
</ButtonGroup>
```

选择器产生的结果：

```text
第一个 Button
  ├── 保留左圆角
  ├── 去掉右圆角
  └── 保留左边框

中间 Button
  ├── 去掉左圆角
  ├── 去掉右圆角
  └── 去掉左边框

最后一个 Button
  ├── 去掉左圆角
  ├── 保留右圆角
  └── 保留右边框
```

最终视觉上像一个连续的控件：

```text
[  左按钮  ][  中按钮  ][  右按钮  ]
```

### `:not(:first-child)`

```text
[&>*:not(:first-child)]:rounded-l-none
```

含义是：选择 ButtonGroup 的直接子元素中，除了第一个之外的所有元素，去掉左侧圆角。

### `:not(:last-child)`

```text
[&>*:not(:last-child)]:rounded-r-none
```

含义是：选择除了最后一个之外的所有直接子元素，去掉右侧圆角。

### 左边框处理

```text
[&>*:not(:first-child)]:border-l-0
```

如果每个 Button 自己都有 border，那么相邻 Button 会产生 2px 的视觉分隔。去掉后续元素的左边框，可以避免重复边框。

### 最后一个带 data-slot 的子元素

```text
[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-4xl!
```

这条规则并不是简单匹配最后一个 DOM 子元素，而是匹配“没有后续兄弟节点继续带 `data-slot` 的直接子元素”。因此，如果最后一个 DOM 子元素是没有 `data-slot` 的图标或普通装饰元素，最后一个带 `data-slot` 的控件仍可能获得右侧圆角。末尾的 `!` 表示使用重要性，确保它可以覆盖前面去掉右圆角的规则。

## 6.2 纵向模式

源码：

```text
flex-col
[&>*:not(:first-child)]:rounded-t-none
[&>*:not(:first-child)]:border-t-0
[&>*:not(:last-child)]:rounded-b-none
[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-4xl!
```

结构变为：

```text
[上方控件]
[中间控件]
[下方控件]
```

规则和横向模式对称：

- 第一个保留上方圆角；
- 最后一个保留下方圆角；
- 中间元素去掉上下圆角；
- 后续元素去掉上边框。

使用：

```tsx
<ButtonGroup orientation="vertical">
  <Button>上</Button>
  <Button>中</Button>
  <Button>下</Button>
</ButtonGroup>
```

## 6.3 `defaultVariants`

如果不传 orientation：

```tsx
<ButtonGroup>...</ButtonGroup>
```

cva 使用：

```ts
defaultVariants: {
  orientation: 'horizontal',
}
```

所以默认是横向排列。

## 七、ButtonGroup 组件源码

源码：

```tsx
function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}
```

## 7.1 Props 组成

ButtonGroup 的 props 是两部分交集：

```ts
React.ComponentProps<"div">;
```

和：

```ts
VariantProps<typeof buttonGroupVariants>;
```

因此可以传入：

- `id`；
- `style`；
- `aria-label`；
- `aria-labelledby`；
- `data-*`；
- `onClick`；
- `ref` 相关的 div props；
- `orientation`；
- `className`。

示例：

```tsx
<ButtonGroup aria-label="搜索操作" orientation="horizontal" className="w-full">
  ...
</ButtonGroup>
```

## 7.2 `role="group"`

输出的根节点是：

```html
<div role="group"></div>
```

`role="group"` 用于向辅助技术说明多个相关控件属于同一组。

如果 ButtonGroup 已经处于一个明确的语义容器内，可以添加：

```tsx
aria-label="年龄范围"
```

或者：

```tsx
aria-labelledby="age-range-label"
```

否则屏幕阅读器只知道这是一个 group，不一定知道 group 的业务含义。

## 7.3 `data-slot="button-group"`

根节点输出：

```html
data-slot="button-group"
```

这个属性有两个用途：

1. 让父级或其他组件可以用属性选择器识别 ButtonGroup；
2. 让 CSS 可以区分普通 div 和 ButtonGroup。

源码基础 class 中有：

```text
has-[>[data-slot=button-group]]:gap-2
```

它就是通过子节点的 `data-slot` 判断是否嵌套 ButtonGroup。

## 7.4 `data-orientation`

源码输出：

```tsx
data-orientation={orientation}
```

注意它与 cva 的 orientation 有两个不同特点：

- `className` 使用 cva 的默认值，因此不传时仍然是横向样式；
- `data-orientation` 直接使用传入的 `orientation`，不传时可能没有该属性值。

如果外部 CSS 依赖：

```text
data-horizontal:...
data-vertical:...
```

需要确认组件或下游组件是否实际产生了对应属性。ButtonGroup 本身的 orientation 样式由 cva 保证，不完全依赖 `data-orientation`。

## 7.5 props 展开顺序

代码顺序是：

```tsx
<div
  role="group"
  data-slot="button-group"
  data-orientation={orientation}
  className={cn(...)}
  {...props}
/>
```

`...props` 位于最后，因此调用方可以覆盖前面生成的属性，例如：

```tsx
<ButtonGroup data-slot="custom-slot" role="presentation" />
```

最终可能覆盖：

```html
role="presentation" data-slot="custom-slot"
```

这提供了灵活性，但也意味着调用方可以破坏 ButtonGroup 的样式契约。一般不要覆盖 `data-slot` 和 `role`，除非明确知道影响。

## 八、`ButtonGroupText` 源码

源码：

```tsx
function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      className={cn(
        "flex items-center gap-2 rounded-4xl border bg-muted px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4",
        className,
      )}
      {...props}
    />
  );
}
```

## 8.1 默认渲染

默认 `asChild` 为 false：

```tsx
<ButtonGroupText>快捷键</ButtonGroupText>
```

实际输出：

```html
<div class="...">快捷键</div>
```

## 8.2 `asChild` 渲染

传入：

```tsx
<ButtonGroupText asChild>
  <span>快捷键</span>
</ButtonGroupText>
```

`Comp` 变为：

```tsx
const Comp = Slot.Root;
```

最终不会额外生成 div，而是将 ButtonGroupText 的 props 合并到子节点：

```html
<span class="..."> 快捷键 </span>
```

这适合需要使用语义化元素或已经存在一个外层元素的场景。

## 8.3 Text 默认样式

```text
flex
items-center
gap-2
rounded-4xl
border
bg-muted
px-2.5
text-sm
font-medium
```

作用：

- `flex items-center`：让文字和图标垂直居中；
- `gap-2`：文字与图标留出间距；
- `rounded-4xl border`：表现为一个独立的标签/文本块；
- `bg-muted`：使用主题中的弱背景；
- `px-2.5`：提供左右内边距；
- `text-sm font-medium`：统一字号和字重。

## 8.4 SVG 样式

```text
[&_svg]:pointer-events-none
[&_svg:not([class*='size-'])]:size-4
```

它会：

- 让内部 SVG 不接收鼠标事件；
- 对没有 `size-*` class 的 SVG 设置 `size-4`；
- 如果 SVG 自己已经有 `size-5` 等 class，则保留显式尺寸。

使用示例：

```tsx
<ButtonGroupText>
  <InfoIcon />
  说明
</ButtonGroupText>
```

## 九、Radix `Slot.Root` 的工作机制

`ButtonGroupText` 使用：

```tsx
import { Slot } from "radix-ui";
```

`radix-ui` 聚合导出的是 `@radix-ui/react-slot`：

```ts
export * as Slot from "@radix-ui/react-slot";
```

因此：

```tsx
Slot.Root;
```

实际是 Radix Slot 组件。

## 9.1 Slot 的核心目标

Slot 解决的问题是：

```tsx
<ButtonGroupText asChild>
  <a href="/help">帮助</a>
</ButtonGroupText>
```

调用方希望使用 `<a>` 的语义和默认行为，但又希望复用 ButtonGroupText 的样式。

Slot 会将父组件 props 合并到唯一的子元素上，而不是额外包一层 DOM。

## 9.2 props 合并规则

Radix Slot 的合并规则可以抽象为：

```text
普通 props
  → Slot props 与 child props 合并

className
  → Slot className + child className

style
  → Slot style 与 child style 合并，child style 覆盖同名项

事件处理器
  → 先执行 child handler
  → 再执行 Slot handler

ref
  → 合并 Slot ref 与 child ref
```

例如：

```tsx
<ButtonGroupText asChild className="text-primary" onClick={handleTextClick}>
  <a href="/help" className="underline" onClick={handleLinkClick}>
    帮助
  </a>
</ButtonGroupText>
```

最终链接会同时拥有：

```text
text-primary
underline
```

点击时先执行子元素的 `handleLinkClick`，再执行 Slot 注入的 `handleTextClick`。

## 9.3 Slot 的限制

`asChild` 模式通常要求恰好一个有效子元素：

正确：

```tsx
<ButtonGroupText asChild>
  <span>文本</span>
</ButtonGroupText>
```

不正确：

```tsx
<ButtonGroupText asChild>
  <span>文本一</span>
  <span>文本二</span>
</ButtonGroupText>
```

多个兄弟节点无法被 Slot 合并到同一个 DOM 节点。需要先包成一个元素：

```tsx
<ButtonGroupText asChild>
  <span>
    文本一
    <span>文本二</span>
  </span>
</ButtonGroupText>
```

## 十、`ButtonGroupSeparator` 源码

源码：

```tsx
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
        className,
      )}
      {...props}
    />
  );
}
```

## 10.1 默认方向为什么是 vertical

ButtonGroup 默认是横向布局：

```text
[按钮][分隔线][按钮]
```

所以分隔线默认应该是竖直方向：

```tsx
<ButtonGroupSeparator />
```

如果 ButtonGroup 是纵向布局：

```tsx
<ButtonGroup orientation="vertical">
  <Button>上</Button>
  <ButtonGroupSeparator orientation="horizontal" />
  <Button>下</Button>
</ButtonGroup>
```

此时分隔线应该是横向。

## 10.2 为什么使用项目 Separator

ButtonGroup 没有直接导入 `SeparatorPrimitive`，而是导入：

```tsx
import { Separator } from "@/components/ui/separator";
```

这样可以统一项目中 Separator 的：

- `data-slot="separator"`；
- `decorative` 默认值；
- `orientation`；
- 基础尺寸样式；
- Radix 无障碍语义。

## 10.3 Separator 的底层行为

项目 Separator 包装了 Radix Separator：

```tsx
function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(..., className)}
      {...props}
    />
  )
}
```

Radix Separator 会输出：

```html
data-orientation="horizontal"
```

或：

```html
data-orientation="vertical"
```

当 `decorative=true` 时，它通常使用：

```html
role="none"
```

如果分隔线具有语义，需要传：

```tsx
<ButtonGroupSeparator decorative={false} />
```

这样 Radix 会使用 separator 语义，并在垂直方向上提供 `aria-orientation`。

## 10.4 Separator 的方向样式

ButtonGroupSeparator 默认 class：

```text
relative
self-stretch
bg-input
data-horizontal:mx-px
data-horizontal:w-auto
data-vertical:my-px
data-vertical:h-auto
```

含义：

- `relative`：允许后续定位扩展；
- `self-stretch`：沿交叉轴拉伸；
- `bg-input`：使用输入控件边框颜色；
- 横向分隔线：添加左右 1px 外间距，并让宽度由父布局决定；
- 纵向分隔线：添加上下 1px 外间距，并让高度由父布局决定。

注意 Tailwind 的 `data-horizontal:` 与 `data-vertical:` 依赖 Radix 输出的 `data-orientation` 状态映射。调试时应检查 DOM 实际属性。

## 十一、ButtonGroup 和 Button 的样式契约

ButtonGroup 的许多规则依赖 Button 输出的属性。Button 源码会输出：

```tsx
<Button data-slot="button" data-variant={variant} data-size={size} />
```

ButtonGroup 因此可以通过：

```text
[ data-slot="button" ]
[ data-variant="outline" ]
```

间接识别子组件。

### 11.1 `data-slot="button"`

用于标识这是一个 Button。ButtonGroup 当前没有直接依赖它处理圆角，但其他 shadcn 样式可以通过它定位按钮。

### 11.2 `data-variant="outline"`

ButtonGroup 基础 class 中有：

```text
has-[>[data-variant=outline]]:*:data-[slot=input-group]:border-border
has-[>[data-variant=outline]]:*:data-[slot=select-trigger]:border-border
has-[>[data-variant=outline]]:[&>input]:border-border
```

含义是：如果 ButtonGroup 的直接子元素中存在 `data-variant="outline"`，则对其他直接子元素执行额外边框修正。

### 11.3 为什么需要 outline 联动

`outline` Button 通常拥有：

```text
border-border
bg-background
```

如果 ButtonGroup 中同时放入 InputGroup、Input 或 SelectTrigger，它们自己的边框颜色可能和 outline Button 不一致。ButtonGroup 使用父子选择器把边框颜色统一为：

```text
border-border
```

聚焦时再使用：

```text
border-ring
```

## 十二、ButtonGroup 和 Input 的组合

项目实际使用：

```tsx
<ButtonGroup>
  <Input placeholder="搜索用户名" />
  <Button variant="outline" aria-label="搜索">
    <SearchIcon />
  </Button>
</ButtonGroup>
```

## 12.1 直接子级 input 的伸展

ButtonGroup 有：

```text
[&>input]:flex-1
```

因此直接放入的 Input 会伸展，占据剩余空间：

```text
[---------------- 输入框 ----------------][按钮]
```

如果 Input 不是直接子元素，例如：

```tsx
<ButtonGroup>
  <div>
    <Input />
  </div>
  <Button>搜索</Button>
</ButtonGroup>
```

`[&>input]:flex-1` 不会匹配嵌套的 Input。此时需要自己处理外层 wrapper 的布局。

## 12.2 outline 子元素下的 input 边框

```text
has-[>[data-variant=outline]]:[&>input]:border-border
has-[>[data-variant=outline]]:[&>input:focus-visible]:border-ring
```

只有当直接子级存在 outline 变体时，直接子级 input 才会获得这些边框修正。

## 十三、ButtonGroup 和 SelectTrigger 的组合

ButtonGroup 专门为 SelectTrigger 保留了样式契约：

```text
has-[>[data-variant=outline]]:*:data-[slot=select-trigger]:border-border
has-[>[data-variant=outline]]:[&>[data-slot=select-trigger]:focus-visible]:border-ring
[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit
```

这里依赖项目 SelectTrigger 输出：

```html
data-slot="select-trigger"
```

当 SelectTrigger 没有显式传入 width class 时，ButtonGroup 让它使用：

```text
w-fit
```

如果调用方显式传入：

```tsx
<SelectTrigger className="w-full">
```

由于选择器使用：

```text
:not([class*='w-'])
```

它不会强行覆盖 `w-full`。

## 13.1 Select 隐藏原生 select 的特殊处理

ButtonGroup 有一条特殊选择器：

```text
has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-4xl
```

Radix Select 在表单控制场景下可能生成一个视觉隐藏的原生 `<select aria-hidden="true">`。这个隐藏元素可能出现在 ButtonGroup 的子元素结构中，并影响 `:last-child` 判断。

该选择器的意图是：

1. 检测 ButtonGroup 中是否有最后一个隐藏原生 select；
2. 找到最后一个 SelectTrigger；
3. 确保这个 SelectTrigger 仍保留右侧圆角。

这是一个典型的“组件实现细节影响父级布局样式”的例子。

## 十四、`has-*` 选择器的阅读方法

ButtonGroup 大量使用 Tailwind v4 的 `:has()` 变体。例如：

```text
has-[>[data-variant=outline]]:[&>input]:border-border
```

可以按三层拆解：

```text
has-[条件]
  :后续规则
```

### 第一层：父容器条件

```text
has-[>[data-variant=outline]]
```

ButtonGroup 自身只有在“直接子元素中存在 `data-variant=outline`”时才满足条件。

### 第二层：目标后代

```text
[&>input]
```

匹配 ButtonGroup 的直接子级 input。

### 第三层：应用样式

```text
border-border
```

合起来就是：

```css
.button-group:has(> [data-variant="outline"]) > input {
  border-color: var(--border);
}
```

阅读长 class 时建议始终按这个顺序：

```text
条件是谁 → 目标是谁 → 修改什么
```

## 十五、ButtonGroup 的实际使用场景

## 15.1 输入框加搜索按钮

```tsx
<ButtonGroup>
  <Input placeholder="搜索用户名" className="min-w-0" />
  <Button variant="outline" aria-label="搜索" onClick={handleSearch}>
    <SearchIcon />
  </Button>
</ButtonGroup>
```

数据流：

```text
用户输入
  ↓
Input 自己维护或通过 ref 获取值
  ↓
点击 Button
  ↓
handleSearch
```

ButtonGroup 不参与输入值管理，只处理布局。

## 15.2 年龄范围

项目中使用两个 Input 和中间的方向图标：

```tsx
<ButtonGroup>
  <Input
    type="number"
    placeholder="最小年龄"
    defaultValue={18}
    className="text-center"
  />
  <ArrowRightIcon className="h-full bg-primary/5 p-2" />
  <Input
    type="number"
    placeholder="最大年龄"
    defaultValue={60}
    className="text-center"
  />
</ButtonGroup>
```

这里的 `ArrowRightIcon` 不是 Button，也没有 `data-slot`，但因为它是直接子元素，仍然会参与：

```text
*:focus-visible:...
[&>*:not(:first-child)]...
[&>*:not(:last-child)]...
```

因此在组合非表单控件时，要注意普通元素是否需要单独设置高度、背景和边框。

## 15.3 垂直操作组

```tsx
<ButtonGroup orientation="vertical">
  <Button>保存</Button>
  <Button variant="outline">另存为</Button>
  <Button variant="destructive">删除</Button>
</ButtonGroup>
```

视觉结构：

```text
┌──────────┐
│ 保存     │
├──────────┤
│ 另存为   │
├──────────┤
│ 删除     │
└──────────┘
```

## 15.4 文本和按钮组合

```tsx
<ButtonGroup>
  <ButtonGroupText>https://</ButtonGroupText>
  <Input placeholder="example.com" />
</ButtonGroup>
```

如果需要让文本元素使用 label 语义：

```tsx
<ButtonGroupText asChild>
  <label htmlFor="domain">域名</label>
</ButtonGroupText>
<Input id="domain" />
```

不过 ButtonGroupText 默认有完整的圆角和 border，实际组合时可能需要通过 className 调整中间元素圆角：

```tsx
<ButtonGroupText className="rounded-r-none">https://</ButtonGroupText>
```

## 15.5 组合 SelectTrigger

```tsx
<ButtonGroup>
  <Input placeholder="关键词" />
  <Select>
    <SelectTrigger className="rounded-none">
      <SelectValue placeholder="类型" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">全部</SelectItem>
      <SelectItem value="user">用户</SelectItem>
    </SelectContent>
  </Select>
  <Button variant="outline">搜索</Button>
</ButtonGroup>
```

这里要注意：Select Root 自身可能是一个 React Context 包装，不一定直接输出 DOM；真正被 ButtonGroup 的直接子选择器识别的，是 SelectTrigger 是否直接位于 ButtonGroup 的 DOM 子树中。

## 十六、`data-slot` 是组件间的隐式接口

ButtonGroup 与其他组件没有 TypeScript 级别的耦合，但通过 `data-slot` 建立了 CSS 级别的契约：

```text
ButtonGroup 认识：
  data-slot=button-group
  data-slot=input-group
  data-slot=select-trigger
  data-slot=button-group-separator

Button 输出：
  data-slot=button
  data-variant=outline
  data-size=...

SelectTrigger 输出：
  data-slot=select-trigger
```

这是一种“结构化 CSS API”：

```text
React 组件之间不传样式参数
  ↓
各组件输出稳定 data 属性
  ↓
父组件用 :has() / 属性选择器联动
```

优点：

- 组件间耦合较低；
- 不需要 ButtonGroup 知道子组件具体实现；
- 可以支持自定义组件，只要输出约定的 data 属性；
- 样式规则集中在组合容器内。

风险：

- 改动 data-slot 名称会破坏其他组件样式；
- DOM 层级变化会导致 `>` 直接子级选择器失效；
- CSS 依赖不容易被 TypeScript 检查发现。

## 十七、DOM 层级对样式的影响

很多规则使用直接子级选择器：

```text
[&>*:not(:first-child)]
[&>input]
[&>[data-slot=select-trigger]]
```

因此下面两种结构行为不同。

### 直接子级

```tsx
<ButtonGroup>
  <Input />
  <Button>搜索</Button>
</ButtonGroup>
```

`[&>input]:flex-1` 可以匹配 Input 的原生 input。

### 多包一层

```tsx
<ButtonGroup>
  <div>
    <Input />
  </div>
  <Button>搜索</Button>
</ButtonGroup>
```

ButtonGroup 只能看到 div，无法直接匹配内部 input。此时：

- 圆角规则作用在 div，而不是 Input；
- `flex-1` 不会自动施加到 Input；
- outline 联动可能不生效；
- `:first-child` 和 `:last-child` 的对象变成 div。

如果必须增加 wrapper，需要主动补充 class：

```tsx
<ButtonGroup>
  <div className="flex-1">
    <Input className="w-full" />
  </div>
  <Button>搜索</Button>
</ButtonGroup>
```

## 十八、ButtonGroup 的无障碍行为

### 1. Group 语义

ButtonGroup 输出：

```html
role="group"
```

建议为有业务含义的组合提供 accessible name：

```tsx
<ButtonGroup aria-label="文件操作">
  <Button>打开</Button>
  <Button>下载</Button>
</ButtonGroup>
```

### 2. 子控件自身负责语义

ButtonGroup 不为子控件补充 button、input 或 select 语义。具体语义来自子组件：

- Button 输出 button；
- Input 输出 input；
- SelectTrigger 输出 combobox；
- ButtonGroupText 默认只是 div；
- Separator 根据 `decorative` 决定是否暴露 separator 语义。

### 3. 图标按钮需要 accessible name

如果 Button 只有图标：

```tsx
<Button variant="outline" aria-label="搜索">
  <SearchIcon />
</Button>
```

不能只依赖图标让屏幕阅读器理解操作。

## 十九、ButtonGroup 的样式计算示例

假设代码：

```tsx
<ButtonGroup>
  <Input />
  <Button variant="outline">搜索</Button>
</ButtonGroup>
```

### ButtonGroup 根节点

```html
<div
  role="group"
  data-slot="button-group"
  class="group/button-group flex w-fit items-stretch ..."
></div>
```

### Input

Input 项目组件会输出类似：

```html
<input data-slot="input" />
```

它是第一个直接子元素，因此：

- 保留左侧圆角；
- 去掉右侧圆角；
- 保留自己的左边框；
- 因为是直接 input，获得 `flex-1`。

### Button

Button 会输出类似：

```html
<button data-slot="button" data-variant="outline"></button>
```

它是最后一个直接子元素，因此：

- 去掉左侧圆角；
- 保留右侧圆角；
- 通过 `border-l-0` 避免重复边框；
- 因为 Button 是 outline，触发 ButtonGroup 的 input 边框联动。

最终效果：

```text
┌──────────────────────────┬────────┐
│ Input                    │ 搜索   │
└──────────────────────────┴────────┘
```

## 二十、嵌套 ButtonGroup

源码有一条：

```text
has-[>[data-slot=button-group]]:gap-2
```

当当前 ButtonGroup 的直接子元素中存在另一个 ButtonGroup 时，外层会增加 `gap-2`。

示例：

```tsx
<ButtonGroup>
  <ButtonGroup>
    <Button>左一</Button>
    <Button>左二</Button>
  </ButtonGroup>
  <ButtonGroup>
    <Button>右一</Button>
    <Button>右二</Button>
  </ButtonGroup>
</ButtonGroup>
```

意图是：

```text
[左侧内部组合]  [右侧内部组合]
```

而不是让两个内部组合的边框直接粘在一起。

嵌套时需要注意：

- 内层 orientation 负责内层控件的圆角；
- 外层 orientation 仍会尝试匹配直接子元素；
- 复杂嵌套可能造成外层圆角规则作用于内层根节点；
- 如果出现圆角异常，检查外层和内层的直接子级关系。

## 二十一、ButtonGroup 与 `Button` 的 `asChild` 关系

Button 也支持：

```tsx
<Button asChild>
  <a href="/settings">设置</a>
</Button>
```

Button 的 `asChild` 使用同一个 Radix Slot 机制。此时最终直接子元素是：

```html
<a data-slot="button" data-variant="default" ...></a>
```

ButtonGroup 仍然可以通过 CSS 选择这个 a，因为 Button 的 data 属性被 Slot 合并到了 a 上。

示例：

```tsx
<ButtonGroup>
  <Button asChild>
    <a href="/previous">上一页</a>
  </Button>
  <Button asChild>
    <a href="/next">下一页</a>
  </Button>
</ButtonGroup>
```

这种组合保留了：

- a 的链接语义；
- Button 的视觉样式；
- ButtonGroup 的边框和圆角规则。

## 二十二、源码中的边界行为和注意事项

## 22.1 orientation 的默认值与 data 属性不完全相同

cva 默认 orientation 是：

```ts
horizontal;
```

但组件传给 DOM 的是：

```tsx
data-orientation={orientation}
```

如果调用方没有传 orientation，`data-orientation` 可能是空属性，而 class 仍然使用 horizontal 分支。

因此：

- 依赖 cva class 的横向样式可以正常工作；
- 依赖 `data-orientation="horizontal"` 的外部 CSS 需要确认实际 DOM；
- 如果希望 DOM 也明确体现默认方向，可以在组件中将默认值解构出来再传递。

## 22.2 选择器依赖 Tailwind v4 的 `:has()` 支持

源码使用：

```text
has-[...]
```

和：

```text
:has(...)
```

这要求：

- 构建工具正确生成 Tailwind v4 data/has variant；
- 浏览器支持 `:has()`；
- class 字符串没有被 Purge 或自定义构建流程遗漏。

现代浏览器基本支持 `:has()`，但如果需要兼容较老浏览器，应提供基础布局或降级样式。

## 22.3 直接子节点是样式契约

以下写法可能破坏 ButtonGroup 样式：

```tsx
<ButtonGroup>
  <React.Fragment>
    <Input />
    <Button>搜索</Button>
  </React.Fragment>
</ButtonGroup>
```

React Fragment 不产生 DOM，但最终 CSS 的直接子节点关系取决于渲染结果和具体结构。更复杂的条件渲染、包装组件和 Portal 可能改变 ButtonGroup 能看到的 DOM 层级。

建议在出现样式问题时直接检查浏览器最终 DOM，而不是只看 JSX。

## 22.4 ButtonGroupText 默认不是 Button

`ButtonGroupText` 默认渲染 div：

```tsx
<ButtonGroupText onClick={...}>
  操作
</ButtonGroupText>
```

虽然可以传 onClick，但它没有 button 的键盘激活语义。需要可交互行为时：

- 使用 `Button`；或；
- 使用 `asChild` 渲染真正的 button/a；
- 补充必要的键盘和 ARIA 语义。

## 22.5 Separator 默认是 decorative

项目 Separator 默认：

```tsx
decorative = true;
```

因此 ButtonGroupSeparator 作为视觉分隔线时不会干扰屏幕阅读器。如果分隔线承载语义，应显式设置：

```tsx
<ButtonGroupSeparator decorative={false} />
```

## 22.6 `...props` 可能覆盖内部约定

三个组件都将 `...props` 放在内部属性之后：

```tsx
<Comp
  data-slot="..."
  className={...}
  {...props}
/>
```

因此调用方可以覆盖：

- `data-slot`；
- `role`；
- `data-orientation`；
- `className` 不会完全覆盖，因为 `className` 已被解构并重新合并；
- `orientation` 由解构后的值控制，不会原样继续传给 DOM。

不要随意覆盖 `data-slot`，否则父子组件的 CSS 联动可能失效。

## 二十三、推荐的阅读和调试顺序

阅读这类 shadcn 包装组件时，建议按照以下顺序：

### 第一步：看导入

确认：

- 是否使用 cva；
- 是否使用 Slot；
- 是否依赖其他项目组件；
- 是否存在 data-slot 契约。

### 第二步：看导出的组件

列出每个导出函数的：

- DOM 类型；
- 自定义 props；
- 默认值；
- data 属性；
- className；
- children 结构。

### 第三步：把长 class 拆成选择器

不要一次性阅读整行 class。逐段拆成：

```text
基础布局
状态选择器
子元素选择器
:has() 条件
orientation 变体
```

### 第四步：检查直接依赖

ButtonGroup 直接依赖：

```text
Button 的 data-variant
InputGroup 的 data-slot
SelectTrigger 的 data-slot
Separator 的 data-orientation
Slot 的 props 合并
```

### 第五步：检查真实调用方

项目中当前 ButtonGroup 的主要使用位置包括：

```text
src/pages/proTable/complexTable/index.tsx
```

用法主要是：

- Input + 搜索 Button；
- 最小年龄 Input + 图标 + 最大年龄 Input。

真实调用方可以验证组件设计是不是仅停留在理论上。

## 二十四、修改 ButtonGroup 的安全检查清单

修改 `src/components/ui/button-group.tsx` 前，确认：

- [ ] `role="group"` 是否仍然存在；
- [ ] `data-slot="button-group"` 是否仍然存在；
- [ ] `orientation` 的类型是否仍然由 cva 推导；
- [ ] 默认 orientation 是否仍然是 horizontal；
- [ ] 横向模式的首尾圆角规则是否正确；
- [ ] 纵向模式的首尾圆角规则是否正确；
- [ ] 相邻控件的重复边框是否被去除；
- [ ] focus-visible 元素是否位于相邻元素上方；
- [ ] Input 是否仍能通过 `flex-1` 占据剩余空间；
- [ ] `data-variant="outline"` 联动是否仍然生效；
- [ ] `data-slot="select-trigger"` 联动是否仍然生效；
- [ ] Select 隐藏原生 select 场景的圆角是否正确；
- [ ] ButtonGroupText 的 asChild 是否仍然只要求一个子元素；
- [ ] Slot 合并后的 class、style、事件和 ref 是否正确；
- [ ] ButtonGroupSeparator 的 orientation 是否和父布局匹配；
- [ ] Separator 的 decorative 语义是否符合使用场景；
- [ ] `:has()` 选择器在目标浏览器中可用；
- [ ] 直接子级嵌套结构测试已覆盖；
- [ ] 横向、纵向、嵌套和表单场景已手动验证。

## 二十五、最终心智模型

可以用一句话概括 ButtonGroup：

> ButtonGroup 不管理业务状态，它通过 `cva` 生成方向样式，通过 `data-slot` 识别子组件，通过 `:has()` 实现父子联动，通过 Slot 让辅助文本复用子元素，并通过 Separator 统一处理组内分隔线。

完整的数据和样式关系是：

```text
ButtonGroup props
  ├── orientation
  │   └── cva
  │       ├── horizontal class
  │       └── vertical class
  ├── className
  │   └── cn 合并
  ├── role / data-slot / data-orientation
  └── children
      ├── Button
      │   ├── data-slot=button
      │   └── data-variant=outline
      ├── Input / InputGroup
      │   └── data-slot=input-group
      ├── SelectTrigger
      │   └── data-slot=select-trigger
      ├── ButtonGroupText
      │   └── div 或 Slot 子元素
      └── ButtonGroupSeparator
          └── Separator data-orientation
```

当出现布局问题时，优先检查三件事：

1. 子组件是否是 ButtonGroup 需要的直接 DOM 子级；
2. 子组件是否输出了约定的 `data-slot` 或 `data-variant`；
3. orientation、`data-orientation`、圆角和边框选择器是否互相匹配。
