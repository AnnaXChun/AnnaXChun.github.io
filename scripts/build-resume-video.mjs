import { spawnSync } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const sourceRoot = "/tmp/resume-video-source";
const oldRoot = "/tmp/resume-independent-acceptance";
const outputRoot = path.join(projectRoot, "artifacts", "resume-design-process");
const cardRoot = path.join("/tmp", "resume-design-process-cards");
const outputVideo = path.join(outputRoot, "椿襄-简历设计过程-竖屏.mp4");
const outputCover = path.join(outputRoot, "椿襄-简历设计过程-封面.jpg");

const width = 1080;
const height = 1920;

await Promise.all([
  mkdir(cardRoot, { recursive: true }),
  mkdir(outputRoot, { recursive: true }),
]);
await access(path.join(sourceRoot, "new", "scene-1.png"));
await access(path.join(oldRoot, "screen-3.png"));

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function textLines(lines, x, y, size, color, lineHeight, weight = 800) {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Hiragino Sans GB, PingFang SC, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="-3">${lines
    .map(
      (line, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("")}</text>`;
}

function labelText(value, x, y, color, size = 28) {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Hiragino Sans GB, PingFang SC, sans-serif" font-size="${size}" font-weight="700" letter-spacing="4">${escapeXml(value)}</text>`;
}

async function makeCard({
  index,
  kicker,
  title,
  body,
  note,
  background,
  foreground,
  accent,
  image,
  imageTop = 760,
}) {
  const screenshot = await sharp(image)
    .resize(920, 518, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const art = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${background}"/>
      <circle cx="995" cy="120" r="255" fill="${accent}" opacity="0.16"/>
      <circle cx="920" cy="1600" r="360" fill="${accent}" opacity="0.09"/>
      <path d="M70 150 H1010" stroke="${foreground}" stroke-opacity="0.35"/>
      ${labelText(kicker, 70, 112, foreground)}
      ${labelText(String(index).padStart(2, "0"), 938, 112, foreground, 30)}
      ${textLines(title, 66, 320, 108, foreground, 118)}
      ${textLines(body, 70, 610, 35, foreground, 55, 500)}
      <rect x="66" y="${imageTop - 14}" width="948" height="546" rx="18" fill="${foreground}" opacity="0.12"/>
      <rect x="78" y="${imageTop - 2}" width="924" height="522" rx="10" fill="${background}" stroke="${foreground}" stroke-width="2"/>
      <rect x="70" y="1390" width="12" height="126" rx="6" fill="${accent}"/>
      ${textLines(note, 112, 1450, 48, foreground, 66, 700)}
      <path d="M70 1780 H1010" stroke="${foreground}" stroke-opacity="0.35"/>
      ${labelText("椿襄 · 高级软件开发工程师", 70, 1840, foreground, 25)}
      ${labelText("设计过程 / 2026", 742, 1840, foreground, 25)}
    </svg>
  `);

  const file = path.join(cardRoot, `${String(index).padStart(2, "0")}.png`);
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background,
    },
  })
    .composite([
      { input: art, top: 0, left: 0 },
      { input: screenshot, top: imageTop, left: 80 },
    ])
    .png()
    .toFile(file);

  return file;
}

const cards = [
  {
    kicker: "一份三维简历的重设计",
    title: ["从信息展示", "到沉浸叙事"],
    body: ["不是换一种配色，", "而是重新决定每一屏该说什么。"],
    note: ["两次推翻重来", "最终只保留七个场景"],
    background: "#17161d",
    foreground: "#f5f0e7",
    accent: "#8a7dff",
    image: path.join(sourceRoot, "new", "scene-1.png"),
  },
  {
    kicker: "问题诊断",
    title: ["内容很多", "但没有视觉中心"],
    body: ["卡片、标签、指标同时出现，", "信息完整，却像一张被放大的简历表格。"],
    note: ["问题不是内容太少", "而是每一屏都在争抢注意力"],
    background: "#f5f0e7",
    foreground: "#17161d",
    accent: "#ff704f",
    image: path.join(oldRoot, "screen-3.png"),
  },
  {
    kicker: "设计动作一",
    title: ["删除卡片", "减少解释"],
    body: ["把九个信息面板压缩成七个叙事场景，", "每一屏只保留一个核心观点。"],
    note: ["少，不等于空", "留白让重点真正被看见"],
    background: "#ff704f",
    foreground: "#17161d",
    accent: "#f5f0e7",
    image: path.join(oldRoot, "screen-2.png"),
  },
  {
    kicker: "设计动作二",
    title: ["重新建立", "唯一视觉中心"],
    body: ["三维人物占据首屏主舞台，", "眼神追随光标，个性标签围绕人物漂浮。"],
    note: ["人物负责记忆点", "文字负责职业定位"],
    background: "#c7ff4a",
    foreground: "#17161d",
    accent: "#8a7dff",
    image: path.join(sourceRoot, "new", "scene-1.png"),
  },
  {
    kicker: "设计动作三",
    title: ["让字号", "承担情绪"],
    body: ["标题从说明文字变成画面本身，", "最大字号接近二百三十像素。"],
    note: ["不炫技", "解决问题"],
    background: "#17161d",
    foreground: "#f5f0e7",
    accent: "#ff704f",
    image: path.join(sourceRoot, "new", "scene-2.png"),
  },
  {
    kicker: "设计动作四",
    title: ["技术栈", "变成视觉轨道"],
    body: ["框架和中间件不再塞进六宫格，", "四条横向轨道形成稳定的阅读节奏。"],
    note: ["Java · Redis · Kafka", "Kubernetes · LangChain"],
    background: "#f4d84d",
    foreground: "#17161d",
    accent: "#8a7dff",
    image: path.join(sourceRoot, "new", "scene-3.png"),
  },
  {
    kicker: "动效策略",
    title: ["滚动不是搬运", "而是揭开下一幕"],
    body: ["使用整屏遮罩、缩放和分层文字入场，", "让上下滑动更像一场连续演示。"],
    note: ["每次滚动", "只发生一次明确的场景变化"],
    background: "#8a7dff",
    foreground: "#17161d",
    accent: "#c7ff4a",
    image: path.join(sourceRoot, "new", "scene-4.png"),
  },
  {
    kicker: "最终完成",
    title: ["椿襄", "高级软件开发工程师"],
    body: ["高并发系统 · 人工智能工程 · 分布式架构", "完整交互作品可通过个人主页查看。"],
    note: ["可靠 · 清晰 · 可演进", "这也是整套设计的核心"],
    background: "#17161d",
    foreground: "#f5f0e7",
    accent: "#8a7dff",
    image: path.join(sourceRoot, "new", "scene-7.png"),
  },
];

const cardFiles = [];
for (let index = 0; index < cards.length; index += 1) {
  cardFiles.push(
    await makeCard({
      index: index + 1,
      ...cards[index],
    }),
  );
}

await sharp(cardFiles[0]).jpeg({ quality: 92 }).toFile(outputCover);

const swiftScript = path.join(scriptDir, "encode-resume-video.swift");
const result = spawnSync(
  "swift",
  [swiftScript, outputVideo, ...cardFiles],
  {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  },
);

if (result.status !== 0) {
  process.stderr.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

process.stdout.write(result.stdout);
console.log(outputVideo);
console.log(outputCover);
