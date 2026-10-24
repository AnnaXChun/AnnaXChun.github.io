import React, { useEffect, useRef, useState } from 'react';
import { awards, capabilities, experiment, interests, methods, profile, projects } from './data';
import './dossier.css';

const tabs = [
  { id: 'work', label: '研究与经历', count: String(projects.length).padStart(2, '0') },
  { id: 'archive', label: '成果档案', count: '08' },
];

function ProjectIndex() {
  return (
    <div className="dossier-work-layout">
      <div className="dossier-project-index">
        <div className="dossier-column-label"><span>研究与项目</span><span>展开查阅 ↓</span></div>
        {projects.map((project, index) => (
          <details className={"dossier-project" + (project.featured ? " is-featured" : "")} key={project.id} open={project.featured || undefined}>
            <summary className="dossier-project-summary">
              <span className="dossier-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="dossier-project-heading"><span className="dossier-meta">{project.category}</span><span className="dossier-project-title">{project.title}</span><span className="dossier-project-date">{project.period || project.organization}</span></span>
              <span className="dossier-plus" aria-hidden="true">+</span>
            </summary>
            <div className="dossier-project-body">
              <p>{project.summary}</p>
              {project.details && <p>{project.details}</p>}
              <ul className="dossier-tags" aria-label={`${project.title}技术栈`}>
                {project.stack.map(item => <li key={item}>{item}</li>)}
              </ul>
              {project.proof && <p className="dossier-project-proof">{project.proof}</p>}
              {project.image && <figure className="dossier-project-figure">
                <a href={project.image} target="_blank" rel="noopener noreferrer" aria-label={`打开${project.title}配图原图`}><img src={project.image} alt={project.imageAlt} loading="lazy" /></a>
                <figcaption>{project.imageCredit || project.organization}<span>原图 ↗</span></figcaption>
              </figure>}
              {project.supportingImage && <a className="dossier-inline-link" href={project.supportingImage} target="_blank" rel="noopener noreferrer">{project.supportingLabel} ↗</a>}
            </div>
          </details>
        ))}
      </div>
      <aside className="dossier-methods" aria-label="技术与工作方法">
        <div className="dossier-column-label"><span>技术与方法</span><span>TOOLBOX</span></div>
        {capabilities.map(group => (
          <details className="dossier-capability" key={group.title}>
            <summary>{group.title}<span className="dossier-plus" aria-hidden="true">+</span></summary>
            <ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul>
          </details>
        ))}
        <div className="dossier-method-list">{methods.map(method => <div key={method.title}><h4>{method.title}</h4><p>{method.description}</p></div>)}</div>
      </aside>
    </div>
  );
}

function PersonalIndex() {
  return <section className="personal-overview" id="about" aria-labelledby="about-title">
    <figure className="personal-portrait"><img src={profile.portrait} alt="椿襄的手绘风格肖像" width="1122" height="1402" loading="lazy"/><figcaption><span>{profile.romanizedName}</span><span>{profile.personality}</span></figcaption></figure>
    <div className="personal-introduction">
      <header className="personal-title"><span className="dossier-eyebrow">ABOUT / 认识我</span><h2 id="about-title">我是椿襄。</h2>
      <p className="personal-role">Agent 开发、<br/>后训练算法工程师</p></header>
      <p className="personal-voice">{profile.introduction}</p>
      <dl className="personal-facts"><div><dt>研究</dt><dd>OPD + RL 后训练<span>开源 benchmark · SOTA</span></dd></div><div><dt>现在</dt><dd>字节跳动 · 国际商业化<span>Agent 开发实习 · 2026.09.20 — 至今</span></dd></div><div><dt>背景</dt><dd>{profile.education}</dd></div></dl>
      <div className="personal-links"><a href={`mailto:${profile.email}`}>邮件联系 ↗</a><a href="https://github.com/AnnaXChun" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="#work-index">研究与经历 ↓</a></div>
    </div>
  </section>;
}

function InterestsSection() {
  return <section className="personal-life" aria-labelledby="personal-life-title"><header><span className="dossier-eyebrow">OFF THE CLOCK</span><h3 id="personal-life-title">还有这些日常。</h3></header>
    <div className="personal-interest-grid">{interests.map((interest,index)=><article key={interest.id}><span className="interest-number">0{index+1}</span><h4>{interest.title}</h4><strong>{interest.note}</strong><p>{interest.description}</p></article>)}</div>
    <aside className="personal-experiment"><span className="dossier-meta">个人实验 / {experiment.status}</span><h4>{experiment.title}</h4><p>{experiment.description}</p></aside>
  </section>;
}

export default function Dossier() {
  const [activeTab, setActiveTab] = useState('work');
  const [selectedAward, setSelectedAward] = useState(null);
  const tabRefs = useRef([]);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!selectedAward || !dialogRef.current) return undefined;
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selectedAward]);

  function changeTabWithKey(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  function openAward(event, award) {
    // Keep the original-image link functional if modal dialogs are unavailable.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof dialogRef.current?.showModal !== 'function') return;
    event.preventDefault();
    triggerRef.current = event.currentTarget;
    setSelectedAward(award);
  }

  function onDialogClose() {
    setSelectedAward(null);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function closeOnBackdrop(event) {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialogRef.current.close();
  }

  return (
    <section className="dossier-root" id="dossier" aria-labelledby="dossier-title">
      <PersonalIndex/>
      <header className="dossier-header" id="work-index"><div><span className="dossier-eyebrow">RESEARCH & PRACTICE</span><h2 id="dossier-title">研究与经历</h2></div><p>从后训练到 Agent 开发，<br />以及工作之外的日常。</p><span className="dossier-header-mark" aria-hidden="true">+</span></header>
      <div className="dossier-tablist" role="tablist" aria-label="个人资料分类">
        {tabs.map((tab, index) => <button className="dossier-tab" type="button" role="tab" id={`dossier-tab-${tab.id}`} aria-controls={`dossier-panel-${tab.id}`} aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1} key={tab.id} ref={node => { tabRefs.current[index] = node; }} onClick={() => setActiveTab(tab.id)} onKeyDown={event => changeTabWithKey(event, index)}>{tab.label}<span>{tab.count}</span></button>)}
      </div>
      <div className="dossier-panel" id="dossier-panel-work" role="tabpanel" aria-labelledby="dossier-tab-work" hidden={activeTab !== 'work'} tabIndex={0}><ProjectIndex /></div>
      <div className="dossier-panel" id="dossier-panel-archive" role="tabpanel" aria-labelledby="dossier-tab-archive" hidden={activeTab !== 'archive'} tabIndex={0}>
        <div className="dossier-archive-heading"><p>研究、竞赛与成果原件。</p><span>08 RECORDS</span></div>
        <ul className="dossier-awards">{awards.map(award => <li className="dossier-award" key={award.id}><span className="dossier-award-year">{award.year || '研究'}</span><a className="dossier-award-title" href={award.image} onClick={event => openAward(event, award)} aria-haspopup="dialog"><span>{award.title}</span><small>{award.meta}</small></a><a className="dossier-award-original" href={award.image} target="_blank" rel="noopener noreferrer" aria-label={`在新窗口打开${award.title}原图`}>原图 <span aria-hidden="true">↗</span></a></li>)}</ul>
        <p className="dossier-archive-note">点击标题预览材料，或在新窗口打开原图。</p>
      </div>
      <InterestsSection/>
      <dialog className="dossier-dialog" ref={dialogRef} aria-labelledby="dossier-dialog-title" aria-describedby="dossier-dialog-description" onClose={onDialogClose} onClick={closeOnBackdrop}>
        <div className="dossier-dialog-top"><span className="dossier-eyebrow">ARCHIVE / 原始材料</span><button className="dossier-dialog-close" type="button" onClick={() => dialogRef.current.close()} autoFocus>关闭 <span aria-hidden="true">×</span></button></div>
        {selectedAward && <div className="dossier-dialog-content"><figure className="dossier-dialog-image"><img src={selectedAward.image} alt={`${selectedAward.title}原始材料`} /></figure><div className="dossier-dialog-caption"><span className="dossier-meta">{[selectedAward.year, selectedAward.meta].filter(Boolean).join(' · ')}</span><h3 id="dossier-dialog-title">{selectedAward.title}</h3><p id="dossier-dialog-description">{selectedAward.description}</p><a className="dossier-inline-link" href={selectedAward.image} target="_blank" rel="noopener noreferrer">打开原图 ↗</a></div></div>}
      </dialog>
    </section>
  );
}
