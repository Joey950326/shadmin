# 如何封装 shadcn 风格的 Uploader 组件

## 一、组件定位

本文基于项目中的 `src/components/uploader/` 实现，说明如何封装一个 shadcn 风格的文件上传组件。

这里的“shadcn 风格”不是指从某个固定 npm 包导入一个完整的 Uploader，而是指采用以下设计方式：

- 组件源码放在项目中，可以直接阅读和修改；
- 使用已有的 Button、Input、Item、Dialog 等基础组件；
- 采用复合组件组合 API；
- 使用 Context 共享上传状态，而不是把所有 props 层层传递；
- 使用 `cn` 合并 Tailwind class；
- 使用 Radix Slot 支持 `asChild` 或自定义触发器；
- 行为、数据和视觉结构分离。

项目中的组件组合方式如下：

```text
<Uploader>
  <UploaderContent>
    <UploaderTrigger />
  </UploaderContent>
  <UploaderDescription />
  <UploaderFileList />
</Uploader>
```

`Uploader` 是状态容器，其他组件通过 `useUploader()` 读取和修改状态。

## 二、源码目录和职责

```text
src/components/uploader/
├── index.tsx                # 统一导出
├── types.tsx                # FileWithPreview 类型
├── Uploader.tsx             # 根组件、状态、文件校验和 Context Provider
├── UploaderContext.tsx      # Context 类型和实例
├── useUploader.ts           # 子组件访问 Context 的 Hook
├── UploaderContent.tsx      # 拖拽区域和隐藏文件 input
├── UploaderTrigger.tsx      # 打开文件选择器的触发器
├── UploaderDescription.tsx  # 说明文本
├── UploaderFileList.tsx     # 文件列表容器
└── UploaderFileItem.tsx     # 单个文件和删除按钮
```

每个文件只承担一个主要职责：

| 文件                      | 主要职责                               |
| ------------------------- | -------------------------------------- |
| `Uploader.tsx`            | 保存 files、上传状态、限制配置和回调   |
| `UploaderContext.tsx`     | 定义 Provider 与消费者之间的状态契约   |
| `useUploader.ts`          | 读取 Context，并在脱离 Provider 时抛错 |
| `UploaderContent.tsx`     | 接收拖拽文件和原生 input 文件          |
| `UploaderTrigger.tsx`     | 调起隐藏 input 的 click                |
| `UploaderFileList.tsx`    | 遍历文件并显示数量                     |
| `UploaderFileItem.tsx`    | 显示文件名、大小和移除操作             |
| `UploaderDescription.tsx` | 显示格式和大小提示                     |
| `types.tsx`               | 扩展 File 对象的预览和进度字段         |
| `index.tsx`               | 对外提供稳定导入路径                   |

## 三、先认识组件整体结构

Uploader 的数据流如下：

```text
用户点击触发器 / 拖拽文件
          ↓
UploaderContent 或 UploaderTrigger
          ↓
addFiles(FileList | File[])
          ↓
validateFiles()
          ↓
生成预览 URL、合并 files
          ↓
setFiles()
          ↓
Context value 更新
     ┌────┼─────────────┐
     ↓    ↓             ↓
文件列表  外部 onUpload  加载状态回调
     ↓
UploaderFileItem
     ↓
removeFile(index)
```

当前实现还提供了一个独立的上传流程：

```text
调用 handleUpload()
      ↓
设置 isUploading=true
      ↓
模拟每个文件 0~100 的上传进度
      ↓
调用 onUpload(files)
      ↓
设置 isUploading=false
```

但当前页面实际主要使用“选中文件回调 + 页面确认按钮”的模式：

```text
文件选择
  ↓
Uploader 的 useEffect 调用 onUpload(files)
  ↓
父组件保存 selectedFiles
  ↓
用户点击 Dialog 确定
  ↓
页面自己的 mutation 上传文件
```

这两个流程需要区分：

- `files` 变化后的 `onUpload` 实际上更像“文件选择变化回调”；
- `handleUpload` 才更像“真正开始上传”；
- 为避免语义混乱，生产实现建议改名为 `onFilesChange` 和 `onSubmitUpload`。

## 四、文件类型设计

文件：

```text
src/components/uploader/types.tsx
```

源码：

```ts
export interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
}
```

### 1. 为什么扩展 File

原生 `File` 已经提供：

- `name`；
- `size`；
- `type`；
- `lastModified`；
- 文件内容读取能力。

Uploader 还需要在 UI 层保存：

- 图片预览 URL；
- 上传进度。

所以使用交叉概念扩展：

```text
File
  + preview?
  + uploadProgress?
```

### 2. 当前实现的对象处理方式

在 `addFiles` 中，代码将原始 File 转为扩展对象：

```ts
const fileWithPreview = file as FileWithPreview;

if (file.type.startsWith("image/")) {
  fileWithPreview.preview = URL.createObjectURL(file);
}
```

这实际上是在原生 File 对象上增加可变属性，而不是创建一个完全独立的新对象。

这种方式简单，但有两个注意点：

- File 对象被直接修改，调试时要注意它并非纯数据对象；
- 如果项目需要不可变状态管理，建议改成包装对象：

```ts
interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  uploadProgress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}
```

这种包装对象更容易支持状态、错误、重试和并发上传。

## 五、Context 设计

文件：

```text
src/components/uploader/UploaderContext.tsx
```

源码中的 Context 类型：

```ts
interface UploaderContextValue {
  files: Array<FileWithPreview>;
  isDragOver: boolean;
  isUploading: boolean;
  accept: string;
  multiple: boolean;
  maxFiles: number;
  maxSize: number;
  fileInputRef: RefObject<HTMLInputElement | null>;
  addFiles: (newFiles: Array<FileWithPreview> | FileList) => void;
  removeFile: (index: number) => void;
  handleUpload: () => void;
  onUpload?: (files: File[]) => void;
  openFileSelect: () => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}
```

Context 包含四类数据：

### 1. 文件状态

```ts
files;
```

所有子组件从这里读取文件列表。

### 2. 配置

```ts
accept;
multiple;
maxFiles;
maxSize;
```

`UploaderContent` 使用 accept、multiple 和 input ref；文件校验使用 maxFiles 和 maxSize。

### 3. 操作方法

```ts
addFiles;
removeFile;
handleUpload;
openFileSelect;
handleInputChange;
```

子组件不直接操作 `setFiles`，只能调用这些方法。这是封装边界的关键。

### 4. UI 状态和回调

```ts
isDragOver;
isUploading;
onUpload;
```

- `isUploading` 用于禁用触发器和删除按钮；
- `isDragOver` 预留给拖拽高亮；
- `onUpload` 用于把文件变化或上传结果通知给父组件。

Context 初始值为：

```ts
export const UploaderContext = createContext<UploaderContextValue | null>(null);
```

使用 `null` 而不是伪造默认对象，可以尽早发现子组件放错位置的问题。

## 六、`useUploader` Hook

文件：

```text
src/components/uploader/useUploader.ts
```

源码：

```ts
import { use } from "react";
import { UploaderContext } from "./UploaderContext";

export function useUploader() {
  const context = use(UploaderContext);

  if (!context) {
    throw new Error("useUploader必须在UPloader子组件内使用");
  }

  return context;
}
```

### 1. React 19 的 `use`

项目使用 React 19 的 `use(Context)` 读取 Context，而不是传统的：

```ts
useContext(UploaderContext);
```

如果项目使用 React 18，应改为：

```ts
import { useContext } from "react";

const context = useContext(UploaderContext);
```

### 2. 为什么必须抛错

错误用法：

```tsx
<UploaderFileList />
```

如果它不在 `<Uploader>` 内部，就没有 Context。抛错比返回 undefined 更容易定位问题。

建议修正当前错误信息中的大小写拼写，使其更清晰：

```ts
throw new Error("useUploader must be used inside <Uploader>");
```

## 七、根组件 `Uploader`

文件：

```text
src/components/uploader/Uploader.tsx
```

## 7.1 Props

```ts
interface UploaderProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  children: ReactNode;
  className?: string;
  onUpload?: (file: Array<File | FileWithPreview>) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}
```

各字段含义：

| Props             | 默认值                  | 作用                     |
| ----------------- | ----------------------- | ------------------------ |
| `accept`          | `.xlsx,.xls,.xlsm,.csv` | 允许的 MIME 或扩展名     |
| `multiple`        | `false`                 | input 是否允许多选       |
| `maxFiles`        | `1`                     | 最大文件数               |
| `maxSize`         | `5`                     | 单文件最大大小，单位 MB  |
| `children`        | 必填                    | 自定义上传界面           |
| `className`       | 无                      | 根容器样式               |
| `onUpload`        | 无                      | 当前实现中用于传出 files |
| `onLoadingChange` | 无                      | 上传状态变化回调         |

### 重要接口语义

当前 `onUpload` 类型允许：

```ts
Array<File | FileWithPreview>;
```

而 Context 中声明的是：

```ts
(files: File[]) => void
```

由于 `FileWithPreview` 继承自 `File`，实际传递通常可工作，但两个接口的命名和类型并不完全一致。建议统一成：

```ts
type UploadFiles = FileWithPreview[]

onFilesChange?: (files: UploadFiles) => void
```

如果回调的目标是开始上传，则使用：

```ts
onSubmitUpload?: (files: UploadFiles) => Promise<void> | void
```

## 7.2 内部状态

```ts
const [files, setFiles] = useState<Array<FileWithPreview>>([]);
const [isDragOver] = useState<boolean>(false);
const [isUploading, setIsUploading] = useState<boolean>(false);
const fileInputRef = useRef<HTMLInputElement>(null);
```

当前状态作用：

- `files`：已选择文件；
- `isDragOver`：用于拖拽状态，但当前没有 setter，实际不会改变；
- `isUploading`：模拟上传或外部上传流程的 busy 状态；
- `fileInputRef`：指向隐藏的 `<input type="file">`。

## 7.3 默认配置

```ts
accept = ".xlsx,.xls,.xlsm,.csv";
multiple = false;
maxFiles = 1;
maxSize = 5;
```

这个默认配置说明组件最初的业务目标偏向“上传一个 Excel/CSV 文件”，后续通过 Props 扩展成通用文件选择器。

## 八、文件类型校验

函数：

```ts
const isFileAccepted = useCallback((file: File): boolean => {
  ...
}, [accept])
```

## 8.1 通配配置

当 accept 是：

```ts
"*";
```

或：

```ts
"";
```

直接允许文件：

```ts
if (accept === "*" || accept === "") return true;
```

## 8.2 解析文件信息

```ts
const fileType = file.type.toLowerCase();
const fileName = file.name.toLowerCase();
const fileExtension = fileName.substring(fileName.lastIndexOf("."));
```

得到：

- MIME 类型，例如 `image/png`；
- 小写文件名，例如 `avatar.png`；
- 扩展名，例如 `.png`。

### 没有扩展名时

如果文件名没有点号，`lastIndexOf('.')` 为 `-1`，`substring(-1)` 在 JavaScript 中会从 0 开始，得到整个文件名。由于它通常不等于 `.xlsx` 等扩展名，所以会被扩展名规则拒绝。

## 8.3 支持逗号分隔

```ts
const acceptedTypes = accept
  .toLowerCase()
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);
```

例如：

```tsx
<Uploader accept=".png,.jpg,image/jpeg" />
```

会变成：

```ts
[".png", ".jpg", "image/jpeg"];
```

## 8.4 MIME 匹配

```ts
if (accepted.includes("/")) {
  return (
    fileType === accepted || fileType.startsWith(accepted.replace("/*", "/"))
  );
}
```

支持：

```text
image/png
image/*
application/pdf
```

`image/*` 会替换成 `image/`，所以：

```text
image/png.startsWith('image/') === true
```

### 安全边界

浏览器提供的 `file.type` 不能作为真正的安全校验。服务端仍然必须检查：

- 文件扩展名；
- MIME 类型；
- 文件头；
- 文件内容；
- 病毒和恶意脚本。

前端 accept 只是提升用户体验，不能作为安全边界。

## 8.5 扩展名匹配

```ts
return accepted.startsWith(".") && fileExtension === accepted;
```

匹配前双方都已转小写，所以 `.XLSX` 和 `.xlsx` 视为相同。

## 九、文件数量和大小校验

函数：

```ts
const validateFiles = useCallback(
  (newFiles: File[]): File[] => {
    return newFiles.filter((file) => {
      ...
    })
  },
  [accept, files.length, isFileAccepted, maxFiles, maxSize, t],
)
```

## 9.1 数量校验

当前实现：

```ts
if (files.length + newFiles.length > maxFiles) {
  toast.error(t("file.maxFiles", { count: maxFiles }), {
    position: "top-right",
  });
  return false;
}
```

它使用：

```text
已有文件数量 + 本次传入文件总数
```

进行判断。

例如：

```text
已有 0 个
本次选择 2 个
maxFiles = 1
```

所有本次文件都会被判定为超限。

如果：

```text
已有 1 个
本次选择 2 个
maxFiles = 2
```

当前实现会把本次 2 个全部判定为超限，而不是接收其中 1 个。若希望“尽可能接收直到上限”，应按已接受数量逐个计算。

更精确的实现：

```ts
const remaining = Math.max(0, maxFiles - files.length);
const candidates = newFiles.slice(0, remaining);
```

然后只对 candidates 校验。

## 9.2 大小校验

```ts
if (file.size > maxSize * 1024 * 1024) {
  toast.error(
    t("file.fileTooLarge", {
      name: file.name,
      size: maxSize,
    }),
    {
      position: "top-right",
    },
  );
  return false;
}
```

`maxSize` 的单位是 MB：

```text
MB → bytes
maxSize * 1024 * 1024
```

当 `maxSize=5` 时，限制为 5 MiB，而不是严格意义上的十进制 5 MB。

## 9.3 错误反馈

校验失败通过 Sonner 显示 Toast：

```ts
toast.error(..., { position: 'top-right' })
```

这意味着 Uploader 直接依赖全局 Toast Provider。复用到其他项目时，需要：

- 安装并挂载 Sonner；或；
- 将错误回调改为 `onError`；或；
- 让父组件自行显示错误。

更通用的 Context 设计是：

```ts
onError?: (error: UploadValidationError) => void
```

这样底层组件不需要绑定具体 Toast 库。

## 十、添加文件 `addFiles`

源码主要流程：

```ts
const addFiles = useCallback(
  (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles = validateFiles(fileArray)
    const totalFiles = [...files, ...validFiles].slice(0, maxFiles)
    const filesWithPreview = totalFiles.map(...)
    setFiles(filesWithPreview)
  },
  [files, maxFiles, validateFiles],
)
```

## 10.1 统一 FileList 和 File[]

```ts
const fileArray = Array.from(newFiles);
```

这样无论来源是：

- `<input type="file">` 的 `FileList`；
- `dataTransfer.files` 转换出的数组；
- 测试代码传入的 `File[]`；

后续都统一按数组处理。

## 10.2 合并旧文件和新文件

```ts
const totalFiles = [...files, ...validFiles].slice(0, maxFiles);
```

含义：

1. 将当前文件放在前面；
2. 将通过校验的新文件追加到后面；
3. 用 `slice` 再做一次最大数量限制。

因此默认 `maxFiles=1` 时，已有文件不会被新文件替换，而是新文件会被截掉。

如果业务希望重新选择时替换旧文件，应改为：

```ts
const totalFiles = multiple
  ? [...files, ...validFiles].slice(0, maxFiles)
  : validFiles.slice(0, 1);
```

## 10.3 重复文件识别

```ts
const existing = files.find(
  (f) => f.name === file.name && f.size === file.size,
);
```

相同文件名和大小会复用旧对象，不会重新生成预览 URL。

但这不是严格的文件唯一标识。两个不同文件可能拥有相同名称和大小。更可靠的判断可以结合：

```ts
name + size + lastModified;
```

或者为每个上传项生成独立 id。

## 10.4 图片预览 URL

```ts
if (file.type.startsWith("image/")) {
  fileWithPreview.preview = URL.createObjectURL(file);
}
```

这是浏览器本地 Object URL，不是服务端 URL。使用方式：

```tsx
<img src={file.preview} alt={file.name} />
```

创建后必须在文件移除或组件卸载时调用：

```ts
URL.revokeObjectURL(file.preview);
```

当前 `removeFile` 会释放被删除文件的 URL，但组件卸载时没有统一释放剩余文件预览，长期打开和关闭页面可能造成资源泄漏。建议增加：

```ts
useEffect(() => {
  return () => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  };
}, [files]);
```

实际实现时要避免在每次 files 变化时错误地释放仍在使用的 URL，通常更适合在删除、替换和卸载时分别处理。

## 十一、移除文件 `removeFile`

源码：

```ts
const removeFile = useCallback(
  (index: number) => {
    const fileToRemove = files[index];

    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    setFiles((prev) => prev.filter((_, i) => i !== index));
  },
  [files],
);
```

流程：

```text
根据 index 找文件
  ↓
如果有 preview，释放 Object URL
  ↓
从最新 prev 中过滤掉 index
  ↓
触发 files 更新
```

使用 `setFiles(prev => ...)` 是正确的，因为删除操作应基于 React 当前最新状态，而不是直接使用闭包中的数组生成结果。

### 删除时的边界

- index 不存在时不会抛错；
- 预览 URL 只释放一次；
- 上传过程中 FileItem 的删除按钮被禁用；
- 当前没有取消正在进行的真实网络上传，因为 `handleUpload` 只是模拟流程。

## 十二、上传流程 `handleUpload`

源码：

```ts
const handleUpload = useCallback(async () => {
  if (files.length === 0 || !onUpload) return;

  setIsUploading(true);
  try {
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      for (let progress = 0; progress <= 100; progress += 10) {
        updatedFiles[i] = { ...updatedFiles[i], uploadProgress: progress };
        setFiles([...updatedFiles]);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
    }

    await onUpload(files);
  } catch (error) {
    console.error("上传失败", error);
  } finally {
    setIsUploading(false);
  }
}, [files, onUpload]);
```

## 12.1 空文件和缺少回调时直接返回

```ts
if (files.length === 0 || !onUpload) return;
```

因此：

- 没有文件时不进入上传状态；
- 没有 onUpload 时不会模拟进度；
- 组件可以只作为文件选择器使用。

## 12.2 上传状态生命周期

```text
开始前
isUploading = false

开始
setIsUploading(true)

执行中
更新每个文件的 uploadProgress

成功或失败
finally
setIsUploading(false)
```

`UploaderTrigger` 和 `UploaderFileItem` 都依赖 `isUploading` 禁用用户操作。

## 12.3 当前是模拟上传进度

代码明确使用：

```ts
await new Promise((resolve) => setTimeout(resolve, 80));
```

所以这不是实际网络上传进度，而是：

```text
0, 10, 20, ..., 100
```

逐步更新 UI 的演示逻辑。

真正接入 Axios 时，应该将 `onUpload` 改成返回 Promise，并由请求层提供进度：

```ts
onUpload?: (
  files: FileWithPreview[],
  onProgress: (index: number, progress: number) => void,
) => Promise<void>
```

Axios 示例：

```ts
await axios.post("/upload", formData, {
  onUploadProgress: (event) => {
    if (!event.total) return;
    const progress = Math.round((event.loaded / event.total) * 100);
    onProgress(0, progress);
  },
});
```

多文件上传时需要明确是：

- 合并成一个 FormData 一次提交；
- 还是每个文件单独请求；
- 是否并发；
- 是否允许部分成功。

## 12.4 onUpload 类型和异步语义

当前 `UploaderProps` 中：

```ts
onUpload?: (file: Array<File | FileWithPreview>) => void
```

但 `handleUpload` 中使用：

```ts
await onUpload(files);
```

即使回调返回 void，`await` 也可以执行，但无法等待真实异步上传完成。要支持真实上传，应该声明：

```ts
onUpload?: (
  files: FileWithPreview[],
) => Promise<void>
```

或者：

```ts
onUpload?: (
  files: FileWithPreview[],
) => void | Promise<void>
```

## 十三、文件 input 变化

源码：

```ts
const handleInputChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  },
  [addFiles],
);
```

### 为什么清空 input value

浏览器在用户连续选择同一个文件时，可能不会再次触发 change：

```text
第一次选择 a.xlsx → change
第二次选择 a.xlsx → 可能没有 change
```

将：

```ts
e.target.value = "";
```

放在处理完成后，可以让下一次重新选择同一个文件仍然触发 change。

这是一项很重要的文件选择器细节。

## 十四、打开文件选择器

源码：

```ts
const openFileSelect = useCallback(() => {
  fileInputRef.current?.click();
}, []);
```

流程：

```text
用户点击可见按钮
  ↓
openFileSelect
  ↓
隐藏 input.click()
  ↓
浏览器打开系统文件选择窗口
  ↓
用户选择文件
  ↓
input change
  ↓
addFiles
```

`fileInputRef.current?.click()` 使用可选链，即使 input 尚未挂载，也不会抛出异常。

## 十五、Context value 和 Provider

源码：

```tsx
const contextValue = useMemo(
  () => ({
    files,
    isDragOver,
    isUploading,
    accept,
    multiple,
    maxFiles,
    maxSize,
    fileInputRef,
    handleInputChange,
    openFileSelect,
    addFiles,
    removeFile,
    handleUpload,
    onUpload,
  }),
  [
    files,
    isDragOver,
    isUploading,
    accept,
    multiple,
    maxFiles,
    maxSize,
    handleInputChange,
    openFileSelect,
    addFiles,
    removeFile,
    handleUpload,
    onUpload,
  ],
);
```

然后：

```tsx
<UploaderContext value={contextValue}>
  <div className={cn("", className)}>{children}</div>
</UploaderContext>
```

### React 19 Context Provider 简写

React 19 支持：

```tsx
<UploaderContext value={contextValue}>
```

在 React 18 中通常需要：

```tsx
<UploaderContext.Provider value={contextValue}>
```

如果组件需要兼容 React 18，应使用 `.Provider` 写法。

### 为什么使用 useMemo

如果每次渲染都创建新的 contextValue 对象：

```tsx
<UploaderContext value={{ files, addFiles, ... }}>
```

即使实际字段未变化，所有消费者也可能重新渲染。`useMemo` 让 Context value 只在依赖变化时重建。

但是，`files`、`handleUpload` 等依赖一旦变化，所有 Context 消费者仍会重新渲染。更大规模场景可以拆分为：

- FileStateContext；
- FileActionsContext；
- UploadStatusContext。

## 十六、两个副作用：文件变化和 loading 变化

### 16.1 文件变化回调

源码：

```ts
useEffect(() => {
  onUpload?.(files);
}, [files, onUpload]);
```

这意味着 `onUpload` 会在以下时机执行：

- 初次挂载；
- 添加文件；
- 删除文件；
- 文件数组发生变化；
- onUpload 函数引用发生变化。

因此当前实现中的 `onUpload` 实际语义是：

```text
文件列表变化通知
```

而不是严格意义上的：

```text
开始上传并返回结果
```

在 `UploaderDialog` 中：

```tsx
<Uploader onUpload={setSelectedFiles}>
```

所以父组件会实时得到当前选中的文件，而不是点击“确定”后才上传。

建议改为：

```tsx
<Uploader onFilesChange={setSelectedFiles}>
```

### 16.2 loading 变化回调

源码：

```ts
useEffect(() => {
  onLoadingChange?.(isUploading);
}, [isUploading, onLoadingChange]);
```

父组件可以同步禁用外部按钮：

```tsx
<Uploader onLoadingChange={setIsUploading}>...</Uploader>
```

但当前页面 `UploaderDialog` 没有使用这个回调，而是直接使用导入 mutation 的 `isPending` 控制确定按钮。

## 十七、`UploaderContent`：拖拽和原生 input

文件：

```text
src/components/uploader/UploaderContent.tsx
```

Props：

```ts
interface UploaderContentProps {
  children: ReactNode | string;
  className?: string;
}
```

## 17.1 根容器样式

```tsx
<div
  className={cn(
    'size-full relative border-2 border-primary/20 border-dotted rounded-xl min-w-60 min-h-24 py-6 px-12',
    'hover:shadow-lg hover:border-primary/50 drop:border-primay',
    'transition-all duration-300 ease-in-out',
    className,
  )}
>
```

样式意图：

- `size-full`：占据父容器；
- `relative`：作为隐藏 input 的定位父级；
- `border-dotted`：虚线拖拽边框；
- `rounded-xl`：圆角；
- `min-w-60 min-h-24`：保证最小可操作区域；
- `py-6 px-12`：内部留白；
- hover 时增加阴影和边框强调；
- transition 提供视觉过渡。

当前 class 中的：

```text
drop:border-primay
```

很可能存在两个问题：

- `drop:` 不是标准的拖拽状态变体，除非项目自行定义；
- `primay` 疑似 `primary` 的拼写错误。

如果希望根据拖拽状态改变样式，应使用 state：

```tsx
className={cn(
  isDragOver && 'border-primary bg-primary/5',
)}
```

或使用自定义：

```tsx
data-drag-over={isDragOver}
```

然后：

```text
data-[drag-over=true]:border-primary
```

## 17.2 Drop 事件

```ts
const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  const files = Array.from(e.dataTransfer.files);
  addFiles(files);
};
```

处理步骤：

1. `preventDefault()` 允许 drop 在当前元素中发生；
2. `stopPropagation()` 避免事件继续冒泡；
3. 读取 `dataTransfer.files`；
4. 转为普通数组；
5. 调用 Context 的 `addFiles`，复用 input 选择的校验流程。

将 input 和拖拽都汇聚到 `addFiles` 是正确的设计，避免两套校验逻辑漂移。

## 17.3 DragOver 和 DragLeave

当前实现：

```ts
const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
};
```

它们只阻止默认行为，没有更新 `isDragOver`。所以 Context 中的 `isDragOver` 当前始终是 false，拖拽高亮没有实际完成。

完整实现应让 Root 提供：

```ts
setIsDragOver(true);
setIsDragOver(false);
```

或者在 Content 中维护拖拽状态，再通过 callback 传给 Root。

## 17.4 隐藏文件 Input

源码：

```tsx
<Input
  ref={fileInputRef}
  type="file"
  multiple={multiple}
  accept={accept}
  onChange={handleInputChange}
  className="absolute z-[-1] opacity-0 inset-0"
/>
```

它把业务配置映射到原生 input：

| Uploader 配置       | input 属性 |
| ------------------- | ---------- |
| `multiple`          | `multiple` |
| `accept`            | `accept`   |
| `fileInputRef`      | ref        |
| `handleInputChange` | `onChange` |

项目 Input 组件还会输出：

```html
data-slot="input"
```

以及统一的基础样式。

### 隐藏方式注意事项

当前使用：

```text
absolute
z-[-1]
opacity-0
inset-0
```

`z-[-1]` 可能让 input 处于父级背景之后，且不同层叠上下文中行为不同。由于当前主要通过 ref.click() 打开文件选择器，它通常仍可工作，但如果需要让拖拽区本身接收原生 click，建议使用：

```text
absolute inset-0 cursor-pointer opacity-0
```

并确认它不会阻塞可见按钮。

## 十八、`UploaderTrigger`：触发器设计

文件：

```text
src/components/uploader/UploaderTrigger.tsx
```

Props：

```ts
interface UploaderTriggerProps {
  children?: ReactNode;
  asChild?: boolean;
}
```

当前实现读取：

```ts
const { fileInputRef, isUploading } = useUploader();
```

点击处理：

```ts
const handleClick = () => {
  fileInputRef.current?.click();
};
```

## 18.1 自定义子元素分支

```tsx
if (isValidElement(children)) {
  return <Slot onClick={handleClick}>{children}</Slot>;
}
```

调用：

```tsx
<UploaderTrigger>
  <Button variant="outline" size="sm">
    选择文件
  </Button>
</UploaderTrigger>
```

最终 Slot 会把 `onClick` 合并到 Button 对应的 DOM 元素上，不额外增加 wrapper。

这符合 shadcn 风格的 `asChild` 思路：

```text
组件提供行为
  ↓
调用方提供视觉和语义元素
  ↓
Slot 合并 props
```

## 18.2 默认按钮分支

如果 children 不是有效 React 元素：

```tsx
return (
  <Button disabled={isUploading} onClick={handleClick}>
    {t("table.selectFile")}
  </Button>
);
```

默认按钮：

- 使用项目 Button；
- 上传中 disabled；
- 文案来自 i18next 的 `table.selectFile`；
- 点击后打开系统文件选择窗口。

## 18.3 `asChild` prop 当前没有实际使用

虽然接口声明了：

```ts
asChild?: boolean
```

但函数没有解构或判断 `asChild`。当前逻辑是：

```text
children 是有效 React 元素
  → 自动使用 Slot

children 不是有效 React 元素
  → 渲染默认 Button
```

因此 `asChild` 只是未使用的 API 字段。更清晰的实现有两种选择：

### 方案 A：删除 asChild

既然组件根据 children 自动判断，就删掉这个字段：

```ts
interface UploaderTriggerProps {
  children?: ReactNode;
}
```

### 方案 B：按 shadcn 习惯真正实现

```tsx
function UploaderTrigger({ children, asChild = false }: UploaderTriggerProps) {
  const Comp = asChild ? Slot : Button;

  return (
    <Comp disabled={!asChild ? isUploading : undefined} onClick={handleClick}>
      {children ?? t("table.selectFile")}
    </Comp>
  );
}
```

但要处理 `asChild=true` 时 disabled 如何传给自定义子元素。

## 18.4 自定义触发器没有自动禁用

默认分支有：

```tsx
disabled = { isUploading };
```

但 Slot 分支只传了：

```tsx
onClick = { handleClick };
```

因此自定义触发器在 `isUploading=true` 时可能仍然可以点击。虽然真正的上传实现可能忽略重复操作，但 UI 状态不一致。

建议在 Slot 分支也处理：

```tsx
<Slot
  onClick={isUploading ? undefined : handleClick}
  aria-disabled={isUploading || undefined}
>
  {children}
</Slot>
```

如果子元素是 Button，还应传 `disabled`；如果是链接，则需要阻止点击和键盘激活。

## 十九、`UploaderDescription`

源码很简单：

```tsx
function UploaderDescription({ children }: UploaderDescriptionProps) {
  return (
    <div className="text-xs text-muted-foreground py-2 truncate">
      {children}
    </div>
  );
}
```

用途：

```tsx
<UploaderDescription>
  支持 xlsx、xls、csv，单个文件不超过 5MB
</UploaderDescription>
```

默认样式：

- `text-xs`：小字号；
- `text-muted-foreground`：弱化颜色；
- `py-2`：上下间距；
- `truncate`：单行超出省略。

如果说明文本允许多行，不应使用 `truncate`，而应使用：

```text
whitespace-normal break-words
```

当前组件没有 `className` prop，因此要修改样式需要扩展接口：

```ts
interface UploaderDescriptionProps {
  children?: ReactNode;
  className?: string;
}
```

## 二十、`UploaderFileList`

源码：

```tsx
function UploaderFileList({ className }: UploaderFileListProps) {
  const { files } = useUploader();

  if (files.length === 0) return null;

  return (
    <div className={cn("space-y-2 emt-2", className)}>
      <p className="text-sm font-medium">
        {t("file.selectedFiles", { count: files.length })}
      </p>
      {files.map((file, index) => (
        <UploaderFileItem
          key={`${file.name}-${index.toString()}`}
          file={file}
          index={index}
        />
      ))}
    </div>
  );
}
```

## 20.1 空状态不渲染

```ts
if (files.length === 0) return null;
```

这让调用方可以直接放置：

```tsx
<UploaderFileList />
```

而不需要在页面写：

```tsx
{
  files.length > 0 && <UploaderFileList />;
}
```

## 20.2 文件数量国际化

```tsx
{
  t("file.selectedFiles", { count: files.length });
}
```

文件列表组件自己负责数量文案，支持 i18next 插值。

## 20.3 key 的选择

当前 key：

```tsx
key={`${file.name}-${index.toString()}`}
```

这样能区分同名文件的不同位置，但 index 参与 key 会导致删除前面文件时后续 key 改变。更稳定的设计是给每个文件生成 id：

```ts
interface UploadFile {
  id: string;
  file: File;
}
```

然后：

```tsx
key={file.id}
```

## 20.4 当前 class 中的拼写问题

源码使用：

```text
space-y-2 emt-2
```

`emt-2` 不是标准 Tailwind class，可能原本想写：

```text
mt-2
```

如果希望列表与上方说明之间有顶部间距，应修正为：

```tsx
cn("mt-2 space-y-2", className);
```

## 二十一、`UploaderFileItem`

源码结构：

```tsx
<Item variant="outline" size="sm" className="py-2 bg-primary/5">
  <ItemContent>
    <ItemTitle>{file.name}</ItemTitle>
    <ItemDescription>文件大小 {transformFileSize(file.size)}</ItemDescription>
  </ItemContent>
  <ItemActions>
    <Button
      variant="ghost"
      size="icon"
      disabled={isUploading}
      onClick={() => removeFile(index)}
    >
      <XIcon />
    </Button>
  </ItemActions>
</Item>
```

## 21.1 复用 Item 组件

UploaderFileItem 没有重新实现列表项布局，而是复用：

```tsx
Item;
ItemContent;
ItemTitle;
ItemDescription;
ItemActions;
```

这保持了项目 UI 的统一：

```text
Item
├── ItemContent
│   ├── ItemTitle
│   └── ItemDescription
└── ItemActions
    └── Button
```

## 21.2 文件显示内容

当前显示：

- 文件名；
- 格式化后的文件大小；
- 删除按钮。

`preview` 和 `uploadProgress` 虽然在类型中存在，但当前 FileItem 没有显示：

```text
preview 未渲染
uploadProgress 未渲染
```

如果要显示图片预览：

```tsx
{
  file.preview && (
    <img
      src={file.preview}
      alt={file.name}
      className="size-10 rounded object-cover"
    />
  );
}
```

如果要显示进度：

```tsx
{
  file.uploadProgress !== undefined && <Progress value={file.uploadProgress} />;
}
```

## 21.3 删除操作

```tsx
<Button
  variant="ghost"
  size="icon"
  disabled={isUploading}
  onClick={() => removeFile(index)}
>
  <XIcon />
</Button>
```

当前按钮没有 `aria-label`。只有 X 图标时，建议增加：

```tsx
<Button
  aria-label={t('file.remove', { name: file.name })}
  ...
>
```

否则屏幕阅读器可能无法理解按钮用途。

## 二十二、导出入口

文件：

```text
src/components/uploader/index.tsx
```

源码：

```ts
import Uploader from "./Uploader";
import UploaderContent from "./UploaderContent";
import UploaderDescription from "./UploaderDescription";
import UploaderFileItem from "./UploaderFileItem";
import UploaderFileList from "./UploaderFileList";
import UploaderTrigger from "./UploaderTrigger";

export {
  Uploader,
  UploaderContent,
  UploaderDescription,
  UploaderFileItem,
  UploaderFileList,
  UploaderTrigger,
};
```

因此页面可以使用稳定的公共路径：

```tsx
import {
  Uploader,
  UploaderContent,
  UploaderDescription,
  UploaderFileList,
  UploaderTrigger,
} from "@/components/uploader";
```

页面不需要知道具体文件位置，也不应从 `Uploader.tsx` 逐个导入。

`Uploader` 默认导出和 `Cmp` memo 导出组合在一起：

```ts
export const Cmp = memo(Uploader);
export default Cmp;
```

其它子组件也采用相同模式。这样导入默认组件时拿到的是 memo 版本。

## 二十三、实际页面集成：批量导入 Dialog

实际页面文件：

```text
src/pages/proTable/complexTable/components/UploaderDialog.tsx
```

## 23.1 页面状态

```tsx
const [dialogOpen, setDialogOpen] = useState(false);
const [selectedFiles, setSelectedFiles] = useState<Array<FileWithPreview>>([]);
const { mutate, isPending } = useImportUser();
```

页面自己保存：

- Dialog 是否打开；
- 当前选择的文件；
- 后端批量导入 mutation 的状态。

Uploader 只负责文件选择和文件列表，真实导入请求由页面负责。

## 23.2 复合组件组合

```tsx
<Uploader onUpload={setSelectedFiles}>
  <UploaderContent className="gap-2">
    <div className="size-full flex flex-col items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        className="size-12 pointer-events-none"
      >
        <FolderUpIcon className="size-6 text-primary/60" />
      </Button>
      <div>{t("table.dropFileHere")}</div>
      <UploaderTrigger>
        <Button variant="outline" size="sm">
          {t("table.selectFile")}
        </Button>
      </UploaderTrigger>
    </div>
  </UploaderContent>
  <UploaderDescription>{t("table.uploadFileHint")}</UploaderDescription>
  <UploaderFileList />
</Uploader>
```

这个组合体现了复合组件的优点：

- Uploader 不决定页面布局；
- Content 不决定内部文案；
- Trigger 可以替换成任意按钮；
- Description 可以放在任何位置；
- FileList 可以按页面需要显示或隐藏。

## 23.3 文件变化回调

```tsx
<Uploader onUpload={setSelectedFiles}>
```

结合 Root 内部 effect：

```tsx
useEffect(() => {
  onUpload?.(files);
}, [files, onUpload]);
```

所以 `selectedFiles` 会随着选择和删除立即更新。

## 23.4 确认上传

```tsx
const handleConfirm = useCallback(() => {
  if (selectedFiles.length > 0) {
    mutate(
      { file: selectedFiles[0] },
      {
        onSuccess() {
          toast.success(t("table.importSuccess"));
        },
        onError(error) {
          console.error("导入用户失败：", error);
          toast.error(t("table.importFailed"));
        },
        onSettled() {
          setDialogOpen(false);
        },
      },
    );
  }
}, [mutate, selectedFiles, t]);
```

当前页面模式是：

```text
Uploader 选择文件
  ↓
selectedFiles 更新
  ↓
用户点击确认
  ↓
useImportUser mutation
  ↓
成功 Toast / 失败 Toast
  ↓
关闭 Dialog
```

这是一种适合“先选择、再确认上传”的模式。

### 集成时需要核对 API

当前 `useImportUser` 的 mutation 函数调用的是 `userAvatarUpload`，而不是专门的用户导入 API。批量导入功能上线前，应确认：

- 用户导入 URL 是否正确；
- 请求字段是否为 `file`；
- 后端是否要求 `multipart/form-data`；
- 响应类型是否与 `Api.User.ImportResponse` 一致。

Uploader 组件只负责提供 File，不能替代 API 层的接口核对。

## 二十四、从零封装 shadcn 风格 Uploader 的实施步骤

下面给出一套可以在新项目中执行的步骤。

## 步骤 1：准备基础依赖

```bash
pnpm add react lucide-react clsx tailwind-merge class-variance-authority
pnpm add @radix-ui/react-slot
```

如果项目已经有 shadcn 风格的 Button、Input、Item，不要重复创建基础组件。

## 步骤 2：创建类型

```ts
export interface UploadFile extends File {
  id: string;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}
```

生产版本推荐比当前实现多增加：

- `id`：稳定渲染 key；
- `status`：准确表示上传阶段；
- `error`：显示单文件错误；
- `progress`：展示真实进度。

## 步骤 3：定义 Context 契约

```ts
interface UploaderContextValue {
  files: UploadFile[];
  isDragOver: boolean;
  isUploading: boolean;
  accept: string;
  multiple: boolean;
  maxFiles: number;
  maxSize: number;
  inputRef: RefObject<HTMLInputElement | null>;
  openFileSelect: () => void;
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  startUpload: () => Promise<void>;
}
```

动作和状态都通过 Context 暴露，子组件不直接修改 Root 内部 state。

## 步骤 4：实现 Root

Root 负责：

1. 保存 files；
2. 维护 drag 状态；
3. 保存 input ref；
4. 校验文件；
5. 创建和释放预览 URL；
6. 提供上传方法；
7. Provider 包裹 children。

不要让 `UploaderContent` 和 `UploaderTrigger` 各自维护一份 files，否则两个入口会产生不一致。

## 步骤 5：实现统一的 addFiles

input 和 drag & drop 都调用同一方法：

```ts
const addFiles = (incoming: FileList | File[]) => {
  const files = Array.from(incoming);
  const accepted = validate(files);
  setFiles((prev) => mergeFiles(prev, accepted));
};
```

统一入口可以确保：

- 类型校验一致；
- 大小校验一致；
- 数量限制一致；
- 重复文件处理一致；
- 预览创建一致。

## 步骤 6：实现 Content

Content 提供：

- 拖拽边界；
- `onDragEnter`；
- `onDragOver`；
- `onDragLeave`；
- `onDrop`；
- 隐藏 input；
- 自定义 children。

推荐维护 drag 状态：

```tsx
<div
  data-drag-over={isDragOver}
  onDragEnter={handleDragEnter}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
```

## 步骤 7：实现 Trigger

采用 shadcn 常见的 `asChild` 设计：

```tsx
function UploaderTrigger({ asChild = false, children }: Props) {
  const Comp = asChild ? Slot : Button;

  return (
    <Comp
      onClick={openFileSelect}
      disabled={!asChild ? isUploading : undefined}
    >
      {children ?? "选择文件"}
    </Comp>
  );
}
```

如果使用 Slot，要额外处理自定义子元素的禁用和可访问性。

## 步骤 8：实现 FileList 和 FileItem

FileList 负责：

- 空状态；
- 文件数量；
- 遍历。

FileItem 负责：

- 预览；
- 文件名；
- 大小；
- 上传进度；
- 状态和错误；
- 删除或取消。

不要把这些逻辑全部塞进 Root，否则页面无法自由组合 UI。

## 步骤 9：接入真实上传 API

推荐将上传动作与选择动作分离：

```tsx
<Uploader onFilesChange={setFiles}>
  ...
</Uploader>

<Button onClick={handleUpload}>
  开始上传
</Button>
```

真实上传应支持：

- Promise；
- 进度回调；
- 失败状态；
- 取消请求；
- 重试；
- 部分成功。

## 步骤 10：验证场景

至少验证：

1. 点击选择文件；
2. 重复选择同一个文件；
3. 拖拽单个文件；
4. 拖拽多个文件；
5. 拖拽非法类型；
6. 超过大小限制；
7. 超过数量限制；
8. 删除文件；
9. 上传进行中禁用按钮；
10. 上传成功；
11. 上传失败；
12. 图片预览 URL 释放；
13. Dialog 关闭后重新打开；
14. 键盘可以操作触发按钮；
15. 屏幕阅读器可以理解删除按钮。
