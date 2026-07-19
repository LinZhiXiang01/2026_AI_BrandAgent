# 品牌智能体竞赛项目 — 目录架构规范

> 队友协作必读。请所有人在此框架下工作，不要新建顶层目录。

---

## 目录架构

```
蓝标/
├── index.html                                 ← 主页面（唯一入口）
├── .nojekyll / .gitignore
├── AGENT.md                                   ← 本文件
├── 政策背景+必要性+紧迫性分析+解题策略.txt
│
├── 论文支撑/                                   ← PDF论文 + 研究报告（只读）
│   ├── *.pdf                                  ← 10篇学术论文
│   ├── Deep_Research_文献扫描综合报告.md
│   ├── 论文下载链接汇总.md
│   └── 论文关键词与研究主题.md
│
└── demos/                                     ← 所有演示、文档、测试统一在此
    │
    ├── Agent营销场景定义演示/                   ← V1-V4 战场模拟 HTML
    │   ├── v1-ai-marketing-warfare.html
    │   ├── v2-ai-marketing-warfare.html
    │   ├── v3-ai-marketing-warfare.html
    │   ├── v4-ai-marketing-warfare.html
    │   ├── 演进说明.txt
    │   ├── 预设场景.md
    │   └── Agent.md
    │
    ├── brand-ai/                              ← 品牌AI仿真 + 决策交还演示
    │   ├── brand-ai-3faces.html               ← 三面孔
    │   ├── brand-ai-simulation.html           ← 主仿真系统
    │   ├── brand-ai-v2.html                   ← AI语言版
    │   └── brand-ai-v3.html                   ← 人类语言版
    │
    ├── interactive-system/                    ← 互动系统【第四版·终版】
    │   ├── index.html
    │   ├── css/style.css
    │   └── js/
    │       ├── brand-ai.js
    │       ├── consumer-ai.js
    │       ├── knowledge-base.js
    │       ├── main.js
    │       └── scenarios.js
    │
    ├── 互动系统第三版（单品牌对单AI）/           ← 互动系统【第三版】
    │   ├── index.html
    │   ├── css/style.css
    │   ├── js/ (5个模块)
    │   └── 开题报告.md
    │
    ├── walmart/                               ← 沃尔玛品牌案例
    │   ├── 沃尔玛营销AI博弈全景报告.md
    │   ├── 沃尔玛营销AI博弈深度报告.html
    │   └── 沃尔玛竞品AI博弈对比仪表盘.html
    │
    ├── 品牌仿真实验室/                          ← 方案设计文档
    │   ├── 品牌AI博弈仿真实验室-综合文档.md
    │   ├── 品牌AI博弈仿真实验室.html
    │   ├── 品牌AI四层防御策略手册.md
    │   ├── 品牌AI策略映射蓝图-详细版.md
    │   ├── 品牌智能体竞品比价博弈系统-完整优化方案.md
    │   └── 预设场景.md
    │
    ├── a2a-tests/                             ← 飞书A2A真实测试
    │   ├── A2A报告.md
    │   ├── A2A报告.docx
    │   └── screenshots/
    │       ├── A2A_01.png
    │       ├── A2A_02.png
    │       └── A2A_03.png
    │
    ├── screenshots/                           ← 微信工作截图（6张）
    │
    └── 废弃Archive/                           ← 归档文件
```

---

## 新增文件放哪里？

| 文件类型 | 放到 | 示例 |
|----------|------|------|
| 新的演示 HTML | `demos/` 下按前缀新建或加入已有子目录 | `demos/新功能名/v1-xxx.html` |
| 方案/策略文档 (.md) | `demos/品牌仿真实验室/` | 策略手册、方案设计 |
| 品牌案例分析 | `demos/walmart/`（如换品牌可新建目录） | `demos/新品牌名/报告.md` |
| JS/CSS 模块 | `demos/interactive-system/` 对应子目录 | `js/新模块.js` |
| 测试截图 | `demos/screenshots/` | `07.png` |
| 学术论文 PDF | `论文支撑/` | 直接放根目录 |
| 顶层说明文件 | 直接放 `蓝标/` 根目录 | 如本文件 |

---

## 规则

1. **不要在根目录新建文件夹**。所有内容要么在 `demos/` 下，要么在 `论文支撑/` 下
2. **不要深层嵌套**。`demos/xxx/yyy/` 最多两层
3. **不要创建重复目录**。放文件前先检查是否已有同名或同类文件夹
4. **修改 index.html 后检查链接**。确保按钮/链接指向正确的 `demos/子目录/文件名`
5. **命名**：文件夹用中文描述性名称，文件名保持原有命名

---

## GitHub Pages

- 仓库：`https://github.com/LinZhiXiang01/2026_AI_BrandAgent`
- 公开页面：`https://linzhixiang01.github.io/2026_AI_BrandAgent/`
- 演示链接格式：`https://linzhixiang01.github.io/2026_AI_BrandAgent/demos/子目录/文件名`
