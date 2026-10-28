import {writeFile} from 'node:fs/promises';
import {profile, projects, awards, interests} from '../src/data.js';

// Keep the no-JavaScript document aligned with the same public facts as React.
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(profile.name)}｜${escape(profile.role)}</title>
<meta name="description" content="椿襄的后训练项目、Agent 开发实习与个人成果。">
<link rel="icon" href="./assets/favicon.svg">
<style>
:root{color-scheme:light;background:#e9e9e5;color:#20211f;font:700 17px/1.85 system-ui,sans-serif}*{box-sizing:border-box}body{margin:0}main{max-width:1050px;margin:auto;padding:70px 6vw}h1,h2,h3{font-family:system-ui,sans-serif;font-weight:700}h1{font-size:clamp(60px,10vw,110px);line-height:1.2;margin:20px 0}h2{font-size:36px;margin-top:65px}h3{font-size:25px}p{max-width:45em}a{color:#a34f3e;text-underline-offset:5px}a:focus-visible{outline:2px solid #a34f3e;outline-offset:4px}img{display:block;max-width:100%;height:auto}.hero-art{mix-blend-mode:multiply;max-width:800px;margin:30px auto}article{border-top:1px solid #d1d0c4;padding:24px 0}.meta{font-size:14px;color:#73776d}.role{font-size:24px}.project-image{max-height:480px;object-fit:contain;margin-top:20px}li{padding:10px 0}footer{border-top:1px solid #d1d0c4;margin-top:50px;padding-top:25px}small{font-size:14px}article:first-of-type h3{color:#a34f3e}
</style></head><body><main>
<p class="meta">CHUNXIANG / PORTFOLIO</p><h1>${escape(profile.name)}</h1><p class="role">${escape(profile.role)}</p><p>${escape(profile.education)}</p>
<h2>研究与经历</h2>
${projects.map(project => `<article><p class="meta">${escape(project.category)} · ${escape(project.period || project.organization)}</p><h3>${escape(project.title)}</h3><p>${escape(project.summary)}</p>${project.details ? `<p>${escape(project.details)}</p>` : ''}<p class="meta">${project.stack.map(escape).join(' / ')}</p>${project.proof ? `<p>${escape(project.proof)}</p>` : ''}${project.image ? `<a href="${escape(project.image)}"><img class="project-image" src="${escape(project.image)}" alt="${escape(project.imageAlt)}" loading="lazy"></a><small>${escape(project.imageCredit || project.organization)}</small>` : ''}</article>`).join('\n')}
<h2>成果原件</h2><ul>${awards.map(award => `<li><a href="${escape(award.image)}">${escape(award.title)}</a> <small>${escape(award.meta)}</small></li>`).join('')}</ul>
<h2>关于与生活</h2><p>${escape(profile.introduction)}</p><p>${escape(profile.biography)}</p>${interests.map(item => `<article><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p></article>`).join('')}
<footer><p><a href="mailto:${escape(profile.email)}">${escape(profile.email)}</a> · <a href="${escape(profile.phoneHref)}">${escape(profile.phone)}</a></p><a href="./">返回个人主页 ↗</a></footer>
</main></body></html>`;
await writeFile(new URL('../public/profile.html', import.meta.url), html);
