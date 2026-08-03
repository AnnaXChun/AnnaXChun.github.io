import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;
const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the interactive portfolio shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>椿襄｜软件开发工程师与多面个人档案<\/title>/i);
  assert.match(html, /椿襄/);
  assert.doesNotMatch(html, /春祥/);
  assert.match(html, /高级软件开发工程师/);
  assert.match(html, /高并发/);
  assert.match(html, /人工智能原生/);
  assert.match(html, /椿襄高级软件开发工程师个人简历/);
  assert.match(html, /个人作品集三维开场/);
  assert.match(html, /蛛网英雄 \/\/ 2099/);
  assert.doesNotMatch(html, /直接进入主页/);
  assert.match(html, /点击电视进入主页/);
  assert.match(html, /正在构建三维空间/);
  assert.match(html, /智能体工作流/);
  assert.match(html, /数字孪生/);
  assert.match(html, /武汉大学/);
  assert.doesNotMatch(html, /GPA 3\.80 \/ 4\.00/);
  assert.doesNotMatch(html, /专业排名 4 \/ 25/);
  assert.doesNotMatch(html, /已保研/);
  assert.match(html, /中帆协官网与支付链路/);
  assert.match(html, /武汉泰康科技有限公司/);
  assert.match(html, /从数据库设计，到完整上线/);
  assert.match(html, /EXPLAIN/);
  assert.match(html, /联合索引与关联查询重构/);
  assert.match(html, /功能测试、回归测试、部署和问题跟踪/);
  assert.match(html, /锁机制、状态机和熔断策略/);
  assert.match(html, /ThinkPHP/);
  assert.match(html, /MySQL/);
  assert.match(html, /人工智能原生研发/);
  assert.match(html, /Verl/);
  assert.match(html, /SFT/);
  assert.match(html, /GRPO/);
  assert.match(html, /Skill、MCP 与上下文工程/);
  assert.match(html, /Agent Loop/);
  assert.match(html, /SOP 工作流/);
  assert.match(html, /Codex/);
  assert.match(html, /Claude Code/);
  assert.match(html, /Vibe Coding/);
  assert.match(html, /知识星球/);
  assert.match(html, /类似 Carrd 的个人建站产品/);
  assert.match(html, /LangChain/);
  assert.match(html, /Llama/);
  assert.match(html, /智能体与模型训练/);
  assert.match(html, /高并发后端/);
  assert.match(html, /表达与团队推进/);
  assert.match(html, /复杂问题排障/);
  assert.match(html, /含金量/);
  assert.match(html, /好奇心负责打开可能，证据负责关上风险/);
  assert.match(html, /小米杯全国一等奖/);
  assert.match(html, /学生时代结束了，证据仍然有效/);
  assert.match(html, /ENFP/);
  assert.match(html, /羽毛球/);
  assert.match(html, /视频剪辑/);
  assert.match(html, /健身/);
  assert.match(html, /\/portrait\/chunxiang-professional\.webp/);
  assert.match(html, /证书与成果横向画廊/);
  assert.match(html, /滚轮或拖动，循环浏览/);
  assert.match(html, /离开证书画廊并查看下一屏/);
  assert.match(html, /MobiCom 论文成果/);
  assert.match(html, /发明专利申请受理/);
  assert.match(html, /数学建模竞赛 Finalist/);
  assert.match(html, /PolarDB 外卡优胜奖/);
  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
  assert.doesNotMatch(html, /人工智能、羽毛球与影像叙事/);
});

test("removes starter preview infrastructure and keeps 3D dependencies", async () => {
  const [page, layout, styles, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /from "@react-three\/fiber"/);
  assert.match(page, /from "@react-three\/drei"/);
  assert.match(page, /from "@gsap\/react"/);
  assert.match(page, /useGLTF\("\/models\/chunxiang-avatar\.glb"\)/);
  assert.match(page, /window\.addEventListener\("pointermove"/);
  assert.match(page, /pointerX \* 0\.38/);
  assert.match(page, /全国一等奖队长/);
  assert.match(page, /onPointerEnter=\{\(\) => setExpanded\(true\)\}/);
  assert.match(page, /duration = reduceMotion\.current \? 0\.01 : 0\.68/);
  assert.match(page, /SOP 工作流设计/);
  assert.match(page, /function OpeningSequence/);
  assert.match(page, /const coverScale/);
  assert.match(page, /gsap\.quickTo\(world, "rotationX"/);
  assert.match(page, /onComplete: markReady/);
  assert.match(page, /enterHandler\.current\(\)/);
  assert.match(page, /移动光标 · 旋转视角/);
  assert.match(page, /if \(!openingActive\.current\)/);
  assert.match(page, /CERTIFICATE_CYCLE_COUNT = 3/);
  assert.match(page, /normalizeScroll/);
  assert.match(page, /aria-haspopup="dialog"/);
  assert.match(page, /role="dialog"/);
  assert.match(page, /\+86 182 8942 3880/);
  assert.match(page, /tel:\+8618289423880/);
  assert.doesNotMatch(page, /人工智能、羽毛球与影像叙事/);
  assert.match(styles, /scrollbar-width: none/);
  assert.match(styles, /perspective: 1400px/);
  assert.match(styles, /@keyframes openingHeroSwing/);
  assert.match(styles, /\.flora-contact-card/);
  assert.doesNotMatch(styles, /background: var\(--yellow\)/);
  assert.match(layout, /椿襄｜软件开发工程师与多面个人档案/);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", templateRoot)),
  );
  await access(new URL("public/models/chunxiang-avatar.glb", templateRoot));
  await access(new URL("public/portrait/chunxiang-professional.webp", templateRoot));
  await Promise.all(
    [
      "mobicom-paper.webp",
      "patent-acceptance.webp",
      "mcm-finalist.webp",
      "xiaomi-2025-first.webp",
      "design-poetry-second.webp",
      "design-digital-twin-first.webp",
      "xiaomi-2024-third.webp",
      "polardb-award.webp",
    ].map((name) =>
      access(new URL(`public/certificates/${name}`, templateRoot)),
    ),
  );
});
