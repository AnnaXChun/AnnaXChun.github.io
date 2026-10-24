import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import MinnanScene from './MinnanScene';

export const FPS = 30;
export const INTRO_END_FRAME = 90;
export const STARTS = [0, 270, 540, 810, 1050];
export const TOTAL_FRAMES = 1320;
export const CHAPTERS = [
  {title: '起笔', line: '椿襄 · Agent 开发、后训练算法工程师'},
  {title: '后训练', line: 'OPD + RL · 开源 benchmark SOTA'},
  {title: '实习', line: '字节跳动 · 国际商业化 · Agent 开发'},
  {title: '成果', line: '与伙伴一起，让成果落地。'},
  {title: '生活', line: '工作之外，也有自己的节奏。'},
];
const clamp = value => Math.min(1, Math.max(0, value));
const range = (frame, start, end) => {
  const t = clamp((frame - start) / (end - start));
  return t * t * (3 - 2 * t);
};
const chapterOpacity = (frame, index) => {
  // Clear the copy for the physical gate-entry shot, then reveal the internship inside.
  const enter = range(frame, index === 0 ? 0 : index === 2 ? 576 : STARTS[index] + 4, index === 0 ? 48 : index === 2 ? 612 : STARTS[index] + 42);
  const leave = index === CHAPTERS.length - 1 ? 0 : index === 1 ? range(frame,445,480) : range(frame, STARTS[index + 1] - 38, STARTS[index + 1] - 4);
  return enter * (1 - leave);
};

const STORIES = [
  {eyebrow: 'CHUNXIANG / PORTFOLIO', title: ['椿襄'], body: '专注智能体工具调用、强化学习后训练与多步推理。从模型训练，走向真实业务中的 Agent 开发。', note: '武汉大学 · 软件工程背景'},
  {eyebrow: '01 / POST-TRAINING', title: ['OPD + RL，', '让能力进阶。'], body: '围绕 OPD + RL 开展智能体后训练研究，在开源 benchmark 上取得 SOTA。从训练方法，到可比较的评测结果。', note: 'OPD + RL / Agent Post-training / Open Benchmark'},
  {eyebrow: '02 / AGENT ENGINEERING', title: ['在字节跳动，', '开发 Agent。'], body: '将 Claude Code 内核接入内部 Agent，适配国际商业化业务，开展 Skill 优化与 Bad Case Studio 开发。', note: '2026.09.20 — 至今 · 字节跳动国际商业化'},
  {eyebrow: '03 / SELECTED WORK', title: ['一起探索，', '一起成形。'], body: '从 DeepDog 到数字孪生三维人体重建，技术路线、团队协作与验证，最终落在看得见的成果上。', note: '小米杯全国一等奖队长 / 中南地区计算机设计一等奖'},
  {eyebrow: '04 / OFF THE CLOCK', title: ['留一点时间，', '给生活。'], body: '羽毛球、健身、视频剪辑。球场上的预判、训练中的调整、镜头里的取舍，也是我认识世界的方式。', note: '观察，调整，再试一次。'},
];

function InkLandscape({frame}) {
  const research = chapterOpacity(frame, 1);
  const evidence = chapterOpacity(frame, 3);
  const travel = range(frame,440,485) * (1-range(frame,535,585));
  return <div className="ink-landscape" style={{'--travel':travel, '--research':research, opacity: (0.3 + 0.7 * range(frame, 0, 72)) * (1 - evidence * .9)}}>
    <MinnanScene frame={frame} />
  </div>;
}

function StoryPanel({index, frame}) {
  const alpha = chapterOpacity(frame, index);
  if (alpha <= 0) return null;
  const data = STORIES[index];
  return <div className={'film-copy' + (index === 0 ? ' film-copy-intro' : '')} style={{opacity: alpha, transform: 'translateY(' + ((1 - alpha) * 18) + 'px)'}}>
    <div className="film-eyebrow">{data.eyebrow}</div>
    <div className="film-title">{data.title.map(line => <div key={line}>{line}</div>)}</div>
    {index === 0 && <div className="film-role">Agent 开发<span>后训练算法工程师</span></div>}
    <p className="film-description">{data.body}</p>
    <div className="film-note">{data.note}</div>
  </div>;
}

function TrainingStudy({frame}) {
  const alpha = chapterOpacity(frame, 1);
  if (alpha <= 0) return null;
  return <div className="training-study" style={{opacity: alpha, transform: 'translateY(' + ((1 - alpha) * 20) + 'px)'}}>
    <div className="study-heading"><span>研究手记 · 院中工作台</span><span className="study-seal">研</span></div>
    <ol>
      <li><span>一</span><div><strong>OPD + RL</strong><p>后训练方法研究</p></div></li>
      <li><span>二</span><div><strong>Agent</strong><p>智能体能力提升</p></div></li>
      <li className="study-result"><span>三</span><div><strong>SOTA</strong><p>开源评测成果</p></div></li>
    </ol>
  </div>;
}

function EvidenceCards({frame}) {
  const alpha = chapterOpacity(frame, 3);
  if (alpha <= 0) return null;
  return <div className="film-evidence" style={{opacity: alpha, transform: 'translateY(' + ((1 - alpha) * 20) + 'px)'}}>
    <figure className="evidence-primary">
      <div className="evidence-mount"><Img src="./assets/xiaomi-2025-first.webp" alt="DeepDog 小米杯全国一等奖获奖证书" /></div>
      <figcaption><strong>全国一等奖</strong><span>DeepDog · 小米杯</span></figcaption>
    </figure>
    <figure className="evidence-secondary">
      <div className="evidence-mount"><Img src="./assets/design-digital-twin-first.webp" alt="数字孪生三维人体重建，中南地区一等奖获奖证书" /></div>
      <figcaption><strong>中南地区一等奖</strong><span>数字孪生 · 三维重建</span></figcaption>
    </figure>
  </div>;
}

export default function Film() {
  const frame = useCurrentFrame();
  return <AbsoluteFill className="ink-film">
    <InkLandscape frame={frame} />
    {STORIES.map((_, index) => <StoryPanel key={index} index={index} frame={frame} />)}
    <TrainingStudy frame={frame} />
    <EvidenceCards frame={frame} />
    <div className="ink-signature" aria-hidden="true"><span>椿</span><span>襄</span></div>
  </AbsoluteFill>;
}
