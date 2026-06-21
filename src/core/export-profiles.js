const exportGenres = [
  {
    id: 'integrated-note',
    label: '통합 노트',
    description: '여러 흐름을 한 화면에 정리',
  },
  {
    id: 'general-note',
    label: '일반 노트',
    description: '원문 구조를 읽기 좋게 보존',
  },
  {
    id: 'meeting-notes',
    label: '회의록',
    description: '안건, 결정사항, 후속 조치',
  },
  {
    id: 'report',
    label: '업무 보고서',
    description: '요약, 근거, 시사점 중심',
  },
  {
    id: 'compare-review',
    label: '비교 검토',
    description: '선택지, 기준, 장단점 비교',
  },
  {
    id: 'presentation',
    label: '발표 자료',
    description: '보고/발표용 섹션 화면',
  },
  {
    id: 'research-paper',
    label: '리서치/논문',
    description: '근거, 방법, 인용 중심',
  },
  {
    id: 'share-article',
    label: '공유 기사',
    description: '공개 공유용 기사형 HTML',
  },
  {
    id: 'newspaper',
    label: '뉴스레터',
    description: '헤드라인과 섹션 흐름',
  },
  {
    id: 'social-feed',
    label: 'SNS 피드',
    description: '짧은 카드와 공유 문구',
  },
  {
    id: 'community-blog',
    label: '커뮤니티 블로그',
    description: '경험, 의견, 후속 질문',
  },
];

const exportDepths = [
  {
    id: 'brief',
    label: '빠른 요약',
    description: '핵심만 1화면에 정리',
  },
  {
    id: 'standard',
    label: '표준 문서',
    description: '본문, 근거, 다음 행동 균형',
  },
  {
    id: 'deep',
    label: '심층 분석',
    description: '맥락, 리스크, 대안까지 확장',
  },
  {
    id: 'visual',
    label: '시각화 중심',
    description: '표, 카드, 흐름도, 차트 우선',
  },
];

const exportPurposes = [
  {
    id: 'internal-share',
    label: '내부 공유',
    description: '팀 상황 공유',
  },
  {
    id: 'review',
    label: '검토',
    description: '쟁점, 리스크, 피드백 확인',
  },
  {
    id: 'external-report',
    label: '외부 보고',
    description: '외부 이해관계자 보고',
  },
  {
    id: 'public-archive',
    label: '공개 아카이브',
    description: '검색과 재열람 기준',
  },
  {
    id: 'presentation',
    label: '발표',
    description: '회의 화면 공유',
  },
  {
    id: 'executive-brief',
    label: '임원 브리핑',
    description: '판단, 수치, 의사결정 중심',
  },
  {
    id: 'community-share',
    label: '커뮤니티 공유',
    description: '경험, 배경, 토론거리 중심',
  },
  {
    id: 'ai-rework',
    label: 'AI 재작업',
    description: '검토와 재작업용 화면',
  },
];

const defaultSelection = {
  exportGenre: 'integrated-note',
  exportDepth: 'standard',
  exportPurpose: 'internal-share',
};

const legacyAliases = {
  genre: {
    'construction-daily': 'integrated-note',
  },
  depth: {
    milestone: 'deep',
  },
  purpose: {
    'field-review': 'review',
  },
};

const genreProfiles = {
  'integrated-note': {
    artifactGoal: 'read',
    artifactType: 'strategy-brief',
    template: 'dashboard',
    conversionMode: 'presentation',
    previewSecurity: 'trusted',
  },
  'general-note': {
    artifactGoal: 'read',
    artifactType: 'faithful-note',
    template: 'editorial',
    conversionMode: 'preserve',
    previewSecurity: 'sanitized',
  },
  'meeting-notes': {
    artifactGoal: 'review',
    artifactType: 'interactive-explainer',
    template: 'interactive-report',
    conversionMode: 'presentation',
    previewSecurity: 'trusted',
  },
  report: {
    artifactGoal: 'review',
    artifactType: 'research-report',
    template: 'research-memo',
    conversionMode: 'presentation',
    previewSecurity: 'trusted',
  },
  'compare-review': {
    artifactGoal: 'compare',
    artifactType: 'decision-memo',
    template: 'dashboard',
    conversionMode: 'presentation',
    previewSecurity: 'trusted',
  },
  presentation: {
    artifactGoal: 'read',
    artifactType: 'slide-deck',
    template: 'deck',
    conversionMode: 'presentation',
    previewSecurity: 'trusted',
  },
  'research-paper': {
    artifactGoal: 'read',
    artifactType: 'research-report',
    template: 'paper',
    conversionMode: 'presentation',
    previewSecurity: 'sanitized',
  },
  'share-article': {
    artifactGoal: 'publish',
    artifactType: 'research-report',
    template: 'editorial',
    conversionMode: 'blog',
    previewSecurity: 'sanitized',
  },
  newspaper: {
    artifactGoal: 'publish',
    artifactType: 'research-report',
    template: 'newspaper',
    conversionMode: 'blog',
    previewSecurity: 'sanitized',
  },
  'social-feed': {
    artifactGoal: 'publish',
    artifactType: 'interactive-explainer',
    template: 'social-feed',
    conversionMode: 'blog',
    previewSecurity: 'sanitized',
  },
  'community-blog': {
    artifactGoal: 'publish',
    artifactType: 'research-report',
    template: 'community-blog',
    conversionMode: 'blog',
    previewSecurity: 'sanitized',
  },
};

function listExportGenres() {
  return exportGenres.slice();
}

function listExportDepths() {
  return exportDepths.slice();
}

function listExportPurposes() {
  return exportPurposes.slice();
}

function normalizeId(id, aliases) {
  const value = String(id || '').trim();
  return aliases[value] || value;
}

function findExportGenre(id) {
  const value = normalizeId(id, legacyAliases.genre);
  return exportGenres.find((item) => item.id === value) || exportGenres[0];
}

function findExportDepth(id) {
  const value = normalizeId(id, legacyAliases.depth);
  return exportDepths.find((item) => item.id === value) || exportDepths[1];
}

function findExportPurpose(id) {
  const value = normalizeId(id, legacyAliases.purpose);
  return exportPurposes.find((item) => item.id === value) || exportPurposes[0];
}

function normalizeExportSelection(selection = {}) {
  return {
    exportGenre: findExportGenre(selection.exportGenre || defaultSelection.exportGenre).id,
    exportDepth: findExportDepth(selection.exportDepth || defaultSelection.exportDepth).id,
    exportPurpose: findExportPurpose(selection.exportPurpose || defaultSelection.exportPurpose).id,
  };
}

function getExecutionProfile(selection = {}) {
  const normalized = normalizeExportSelection(selection);
  const profile = {
    ...(genreProfiles[normalized.exportGenre] || genreProfiles[defaultSelection.exportGenre]),
  };

  if (normalized.exportDepth === 'brief') {
    profile.conversionMode = profile.conversionMode === 'blog' ? 'blog' : 'preserve';
    if (profile.artifactGoal === 'review') {
      profile.artifactGoal = 'read';
    }
  }

  if (normalized.exportDepth === 'deep') {
    profile.artifactType = ['faithful-note', 'slide-deck'].includes(profile.artifactType)
      ? 'research-report'
      : profile.artifactType;
    profile.conversionMode = 'presentation';
  }

  if (normalized.exportDepth === 'visual') {
    profile.template = ['editorial', 'minimal', 'paper'].includes(profile.template) ? 'saas-brief' : profile.template;
    profile.conversionMode = 'presentation';
    profile.previewSecurity = 'trusted';
  }

  if (normalized.exportPurpose === 'public-archive') {
    profile.artifactGoal = 'publish';
    profile.conversionMode = profile.conversionMode === 'preserve' ? 'blog' : profile.conversionMode;
  }
  if (normalized.exportPurpose === 'review') {
    profile.artifactGoal = profile.artifactGoal === 'publish' ? 'publish' : 'review';
    profile.previewSecurity = 'trusted';
  }
  if (normalized.exportPurpose === 'presentation') {
    profile.conversionMode = 'presentation';
    profile.previewSecurity = 'trusted';
  }
  if (normalized.exportPurpose === 'executive-brief') {
    profile.artifactGoal = 'decide';
    profile.artifactType = 'strategy-brief';
    profile.template = profile.template === 'editorial' ? 'saas-brief' : profile.template;
    profile.previewSecurity = 'trusted';
  }
  if (normalized.exportPurpose === 'community-share') {
    profile.artifactGoal = 'publish';
    profile.template = normalized.exportGenre === 'social-feed' ? 'social-feed' : 'community-blog';
    profile.conversionMode = 'blog';
  }
  if (normalized.exportPurpose === 'ai-rework') {
    Object.assign(profile, {
      artifactGoal: 'tune',
      artifactType: 'interactive-explainer',
      template: 'playground',
      conversionMode: 'presentation',
      previewSecurity: 'trusted',
    });
  }

  return {
    ...normalized,
    ...profile,
  };
}

function applySelectionProfile(baseOptions = {}, selection = {}) {
  const profile = getExecutionProfile(selection);
  return {
    ...baseOptions,
    exportGenre: profile.exportGenre,
    exportDepth: profile.exportDepth,
    exportPurpose: profile.exportPurpose,
    artifactGoal: profile.artifactGoal,
    artifactType: profile.artifactType,
    template: profile.template,
    conversionMode: profile.conversionMode,
    previewSecurity: profile.previewSecurity,
  };
}

function describeExecutionProfile(selection = {}) {
  const profile = getExecutionProfile(selection);
  return [
    findExportGenre(profile.exportGenre).label,
    findExportDepth(profile.exportDepth).label,
    findExportPurpose(profile.exportPurpose).label,
  ].join(' · ');
}

module.exports = {
  applySelectionProfile,
  defaultSelection,
  describeExecutionProfile,
  findExportDepth,
  findExportGenre,
  findExportPurpose,
  getExecutionProfile,
  listExportDepths,
  listExportGenres,
  listExportPurposes,
  normalizeExportSelection,
};
