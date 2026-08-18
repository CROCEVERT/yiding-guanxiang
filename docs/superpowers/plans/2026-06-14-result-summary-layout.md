# Result Summary Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将结果页首屏重排为问题、上下象与完整六爻图一体化的紧凑主卡片。

**Architecture:** 在 `ResultPage.tsx` 内增加独立的爻位名称函数和紧凑六爻组件，复用现有 `LineRecord` 数据。主卡片使用 CSS Grid 组织左右信息，并删除重复的“当前之象”区块。

**Tech Stack:** React、TypeScript、Tailwind CSS、Node assert 验证脚本

---

### Task 1: 锁定六爻名称

**Files:**
- Create: `src/pages/ResultSummaryLayout.verify.ts`
- Modify: `src/pages/ResultPage.tsx`

- [x] **Step 1: 写入失败验证**

验证源码包含 `getTraditionalLineName`，并覆盖“初九、六二、九三、六四、九五、上六”命名。

- [x] **Step 2: 运行验证并确认失败**

Run: `node --experimental-strip-types src/pages/ResultSummaryLayout.verify.ts`

Expected: FAIL，提示缺少传统爻位命名函数或整合布局。

- [x] **Step 3: 实现命名函数与紧凑六爻组件**

函数根据数组索引和 `LineRecord.total` 判断阴阳，返回正确的传统爻位名称。

- [x] **Step 4: 再次运行验证**

Run: `node --experimental-strip-types src/pages/ResultSummaryLayout.verify.ts`

Expected: PASS。

### Task 2: 整合顶部信息

**Files:**
- Modify: `src/pages/ResultPage.tsx`
- Modify: `src/index.css`

- [x] **Step 1: 把复盘问题放入主卡片左栏**

问题内容直接使用 `question`，保留自然换行和清晰标签。

- [x] **Step 2: 把上象和下象移动到问题下方**

两项使用紧凑双列布局，不再单独占据整屏区块。

- [x] **Step 3: 把六爻图放入主卡片右栏**

按“上爻、五爻、四爻、三爻、二爻、初爻”顺序显示，并标注传统爻名。

- [x] **Step 4: 删除重复的当前之象区块**

保留后续变化爻、变化参照、释义与行动内容。

### Task 3: 验证与版本记录

**Files:**
- Verify: `src/pages/ResultSummaryLayout.verify.ts`

- [ ] **Step 1: 运行自动验证**

Run: `node --experimental-strip-types src/pages/ResultSummaryLayout.verify.ts`

Run: `npm run build`

Run: `npm run lint`

- [ ] **Step 2: 在移动端浏览器检查**

确认问题可读、上下象上移、六爻图完整、无横向溢出。

- [ ] **Step 3: 提交并打标签**

Commit: `feat: integrate result summary layout`

Tag: `result-summary-integrated-layout`
