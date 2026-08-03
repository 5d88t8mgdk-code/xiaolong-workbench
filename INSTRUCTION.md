# 小龙工作台 · 一键生成指令

把下面框里的内容**完整复制**，粘贴给任意 AI 助手（ChatGPT / Claude / GLM / DeepSeek / 通义千问等），AI 会帮你生成并部署一个完整的个人工作台 App。

---

```
请帮我生成并部署一个个人工作台 PWA 应用。

## 背景
我已经有一个开源的工作台模板，基于它生成我自己的版本。模板仓库地址：
https://github.com/5d88t8mgdk-code/xiaolong-workbench

## 第一步：获取模板

请用以下任一方式获取模板代码（哪种能用就用哪种）：

方式 A（推荐，clone 整个仓库）：
git clone https://github.com/5d88t8mgdk-code/xiaolong-workbench.git
cd xiaolong-workbench

方式 B（如果 clone 失败，逐个 fetch 文件内容）：
- index.html: https://raw.githubusercontent.com/5d88t8mgdk-code/xiaolong-workbench/main/index.html
- app.js: https://raw.githubusercontent.com/5d88t8mgdk-code/xiaolong-workbench/main/app.js
- styles.css: https://raw.githubusercontent.com/5d88t8mgdk-code/xiaolong-workbench/main/styles.css
- manifest.json: https://raw.githubusercontent.com/5d88t8mgdk-code/xiaolong-workbench/main/manifest.json
- assets/ 目录下的 SVG/PNG 资源同样从 raw.githubusercontent.com/5d88t8mgdk-code/xiaolong-workbench/main/assets/... 获取

## 第二步：了解工作台

这是 Hello Kitty 粉色风格的个人生活管理 PWA，纯前端 + localStorage，无需后端。包含 8+ 板块：
1. 日常打卡（习惯打卡 + 每日格言 + 连续天数）
2. 英语学习（单词背诵 + 计划 + 统计）
3. 财务储蓄（4321 四分存钱法：对话记账 / 四个存钱罐预算进度 / 储蓄目标 / 存钱计划）
4. 健身打卡（FitDaily 风格 5 tab：今日 / 选部位 / 周计划 / 博主跟练 / AI教练带动作配图）
5. 美甲款式库（图片上传 + 4 维度标签 + AI 对话找款式 + 技能练习热力图）
6. 待办事项
7. 备忘录
8. 资讯看板
9. 财务目标
还有「问问小龙」AI 助手悬浮按钮（接智谱 GLM-4-Flash 永久免费 API，能读工作台数据对话）

## 第三步：个性化

请先问我：「你的昵称是什么？工作台叫什么名字？」

拿到昵称后，修改：
1. 所有「小龙工作台」→「〇〇工作台」（〇〇 = 我的昵称）
2. 默认昵称「小龙」→ 我的昵称
3. AI 助手「问问小龙」→「问问〇〇」
4. 主题色保持粉色 Hello Kitty 风格不变
5. AI 助手的 API key 留空，让用户自己粘贴（智谱 GLM-4-Flash 永久免费，注册地址 open.bigmodel.cn，在工作台设置面板里填）

## 第四步：部署到 GitHub Pages

1. 在我的 GitHub 账号下创建新仓库（公开），名为 my-workbench 或我喜欢的名字
2. 把修改后的代码 push 上去
3. 仓库 Settings → Pages 启用（Source: main 分支 / root 目录）
4. 等 1-2 分钟，访问 https://我的用户名.github.io/my-workbench/ 确认能打开

## 第五步：手机使用

部署后手机 Safari/Chrome 打开网址 → 添加到主屏幕 → 像 App 一样全屏使用。

## 技术要求
- 纯前端，数据存 localStorage，断网可用
- PWA（主屏图标 + 全屏 + 自定义图标）
- 手机优先，桌面也能看
- 不依赖外部 API（AI 助手除外）

现在开始：先 clone 代码，然后问我昵称，再修改部署。如果任何步骤失败，告诉我错误信息我会排查。
```

---

## 使用说明

1. 复制上面代码框里的**全部文字**（不含外层说明）
2. 粘贴到 AI 助手对话框
3. AI 会问你昵称，然后自动生成 + 部署
4. 部署完手机打开地址 → 添加到主屏幕

## 注意

- AI 助手需自己注册智谱 API key（open.bigmodel.cn，永久免费）
- 数据存在手机本地，换手机/清缓存会丢
- AI 执行报错就把错误发回给它，它会自己修
