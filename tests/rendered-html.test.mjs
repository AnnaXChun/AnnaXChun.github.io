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
  assert.match(html, /<title>高级软件开发工程师｜三维交互简历<\/title>/i);
  assert.match(html, /椿襄/);
  assert.doesNotMatch(html, /春祥/);
  assert.match(html, /高级软件开发工程师/);
  assert.match(html, /高并发/);
  assert.match(html, /人工智能原生/);
  assert.match(html, /高级软件开发工程师沉浸式个人简历/);
  assert.match(html, /查看“高并发案例”/);
  assert.match(html, /高峰值交易服务/);
  assert.match(html, /Spring Boot 3/);
  assert.match(html, /Kubernetes/);
  assert.match(html, /技术体系/);
  assert.match(html, /引用命中目标/);
  assert.match(html, /10万级/);
  assert.match(html, /从需求到上线/);
  assert.match(html, /每一步都有依据/);
  assert.match(html, /难而正确的事/);
  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("removes starter preview infrastructure and keeps 3D dependencies", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /from "@react-three\/fiber"/);
  assert.match(page, /from "@react-three\/drei"/);
  assert.match(page, /from "@gsap\/react"/);
  assert.match(page, /useGLTF\("\/models\/chunxiang-avatar\.glb"\)/);
  assert.match(page, /双鱼座/);
  assert.match(layout, /高级软件开发工程师｜三维交互简历/);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", templateRoot)),
  );
  await access(new URL("public/models/chunxiang-avatar.glb", templateRoot));
});
