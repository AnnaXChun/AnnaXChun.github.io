import React, { useEffect, useRef, useState } from 'react';
import { awards, capabilities, experiment, interests, methods, profile, projects } from './data';
import './dossier.css';

const tabs = [
  { id: 'work', label: '项目与方法', count: '04' },
  { id: 'life', label: '关于与生活', count: '03' },
  { id: 'archive', label: '成果档案', count: '08' },
];

function ProjectIndex() {
  return (
    <div className="dossier-work-layout">
      <div className="dossier-project-index">
        <div className="dossier-column-label"><span>项目索引</span><span>展开查阅 ↓</span></div>
        {projects.map((project, index) => (
          <details className="dossier-project" key={project.id}>
            <summary className="dossier-project-summary">
              <span className="dossier-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="dossier-project-heading"><span className="dossier-meta">{project.category}</span><span className="dossier-project-title">{project.title}</span><span className="dossier-project-date">{project.period || project.organization}</span></span>
              <span className="dossier-plus" aria-hidden="true">+</span>
            </summary>
            <div className="dossier-project-body">
              <p>{project.summary}</p>
              <p>{project.details}</p>
              <ul className="dossier-tags" aria-label={`${project.title}技术栈`}>
                {project.stack.map(item => <li key={item}>{item}</li>)}
              </ul>
              <p className="dossier-project-proof">{project.proof}</p>
              <figure className="dossier-project-figure">
                <a href={project.image} target="_blank" rel="noopener noreferrer" aria-label={`打开${project.title}配图原图`}><img src={project.image} alt={project.imageAlt} loading="lazy" /></a>
                <figcaption>{project.imageCredit || project.organization}<span>原图 ↗</span></figcaption>
              </figure>
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
  return (
    <div className="dossier-personal-layout">
      <div className="dossier-profile">
        <figure className="dossier-portrait"><img src={profile.portrait} alt="椿襄的手绘风格肖像" width="1122" height="1402" loading="lazy" /><figcaption>{profile.romanizedName}<span>{profile.personality}</span></figcaption></figure>
        <div className="dossier-biography"><p className="dossier-meta">{profile.role} · {profile.education}</p><h3>兴奋地开始，冷静地收尾。</h3><p>{profile.introduction}</p><p>{profile.biography}</p><div className="dossier-personal-contact"><a href={`mailto:${profile.email}`}>{profile.email} ↗</a><a href={profile.phoneHref}>{profile.phone} ↗</a></div></div>
      </div>
      <div className="dossier-personal-notes">
        <div className="dossier-interests">{interests.map(interest => <article className="dossier-interest" key={interest.id}><h4>{interest.title}<span>{interest.note}</span></h4><p>{interest.description}</p></article>)}</div>
        <aside className="dossier-experiment"><span className="dossier-meta">个人实验场 / {experiment.status}</span><h4>{experiment.title}</h4><p>{experiment.description}</p></aside>
      </div>
    </div>
  );
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
      <header className="dossier-header"><div><span className="dossier-eyebrow">PERSONAL DOSSIER</span><h2 id="dossier-title">资料抽屉</h2></div><p>项目的来龙去脉，<br />和图纸之外的日常。</p><span className="dossier-header-mark" aria-hidden="true">+</span></header>
      <div className="dossier-tablist" role="tablist" aria-label="个人资料分类">
        {tabs.map((tab, index) => <button className="dossier-tab" type="button" role="tab" id={`dossier-tab-${tab.id}`} aria-controls={`dossier-panel-${tab.id}`} aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1} key={tab.id} ref={node => { tabRefs.current[index] = node; }} onClick={() => setActiveTab(tab.id)} onKeyDown={event => changeTabWithKey(event, index)}>{tab.label}<span>{tab.count}</span></button>)}
      </div>
      <div className="dossier-panel" id="dossier-panel-work" role="tabpanel" aria-labelledby="dossier-tab-work" hidden={activeTab !== 'work'} tabIndex={0}><ProjectIndex /></div>
      <div className="dossier-panel" id="dossier-panel-life" role="tabpanel" aria-labelledby="dossier-tab-life" hidden={activeTab !== 'life'} tabIndex={0}><PersonalIndex /></div>
      <div className="dossier-panel" id="dossier-panel-archive" role="tabpanel" aria-labelledby="dossier-tab-archive" hidden={activeTab !== 'archive'} tabIndex={0}>
        <div className="dossier-archive-heading"><p>研究、竞赛与成果原件。</p><span>08 RECORDS</span></div>
        <ul className="dossier-awards">{awards.map(award => <li className="dossier-award" key={award.id}><span className="dossier-award-year">{award.year || '研究'}</span><a className="dossier-award-title" href={award.image} onClick={event => openAward(event, award)} aria-haspopup="dialog"><span>{award.title}</span><small>{award.meta}</small></a><a className="dossier-award-original" href={award.image} target="_blank" rel="noopener noreferrer" aria-label={`在新窗口打开${award.title}原图`}>原图 <span aria-hidden="true">↗</span></a></li>)}</ul>
        <p className="dossier-archive-note">点击标题预览材料，或在新窗口打开原图。</p>
      </div>
      <dialog className="dossier-dialog" ref={dialogRef} aria-labelledby="dossier-dialog-title" aria-describedby="dossier-dialog-description" onClose={onDialogClose} onClick={closeOnBackdrop}>
        <div className="dossier-dialog-top"><span className="dossier-eyebrow">ARCHIVE / 原始材料</span><button className="dossier-dialog-close" type="button" onClick={() => dialogRef.current.close()} autoFocus>关闭 <span aria-hidden="true">×</span></button></div>
        {selectedAward && <div className="dossier-dialog-content"><figure className="dossier-dialog-image"><img src={selectedAward.image} alt={`${selectedAward.title}原始材料`} /></figure><div className="dossier-dialog-caption"><span className="dossier-meta">{[selectedAward.year, selectedAward.meta].filter(Boolean).join(' · ')}</span><h3 id="dossier-dialog-title">{selectedAward.title}</h3><p id="dossier-dialog-description">{selectedAward.description}</p><a className="dossier-inline-link" href={selectedAward.image} target="_blank" rel="noopener noreferrer">打开原图 ↗</a></div></div>}
      </dialog>
    </section>
  );
}
