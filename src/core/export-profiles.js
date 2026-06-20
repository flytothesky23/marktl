const exportGenres = [
  {
    id: 'construction-daily',
    label: '공사일보',
    description: '현장 사진, 당일 작업, 리스크 중심',
  },
  {
    id: 'meeting-notes',
    label: '회의록',
    description: '안건, 결정사항, 후속 조치',
  },
  {
    id: 'integrated-note',
    label: '통합노트',
    description: '여러 흐름을 한 화면에 정리',
  },
  {
    id: 'report',
    label: '보고서',
    description: '요약, 근거, 시사점 중심',
  },
  {
    id: 'general-note',
    label: '일반 노트',
    description: '원문 구조를 읽기 좋게 보존',
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
    id: 'share-article',
    label: '공유 기사',
    description: '공개 공유용 기사형 HTML',
  },
];

const exportDepths = [
  {
    id: 'brief',
    label: '간단 기록',
    description: '사진과 당일 작업 중심',
  },
  {
    id: 'standard',
    label: '표준 일보',
    description: '작업, 증빙, 리스크, 다음 작업',
  },
  {
    id: 'milestone',
    label: '종합·마일스톤',
    description: '일정, 공정 흐름, 계획 대비 실적',
  },
];

const exportPurposes = [
  {
    id: 'internal-share',
    label: '내부 공유',
    description: '팀 상황 공유',
  },
  {
    id: 'field-review',
    label: '현장 검토',
    description: '증빙, 리스크, 다음 조치 확인',
  },
  {
    id: 'external-report',
    label: '외부 보고',
    description: '외부 이해관계자 보고',
  },
  {
    id: 'public-archive',
    label: '공개 아카이브',
    description: '공개 목록과 재열람 기준',
  },
  {
    id: 'presentation',
    label: '발표',
    description: '회의 화면 공유',
  },
  {
    id: 'ai-rework',
    label: 'AI 재작업',
    description: '검토와 재작업용 화면',
  },
];

const defaultSelection = {
  exportGenre: 'construction-daily',
  exportDepth: 'standard',
  exportPurpose: 'field-review',
};

const genreProfiles = {
  'construction-daily': {
    artifactGoal: 'review',
    artifactType: 'research-report',
    template: 'construction-daily',
    conversionMode: 'presentation',
    previewSecurity: 'trusted',
  },
  'meeting-notes': {
    artifactGoal: 'review',
    artifactType: 'interactive-explainer',
    template: 'interactive-report',
    conversionMode: 'presentation',
    previewSecurity: 'trusted',
  },
  'integrated-note': {
    artifactGoal: 'review',
    artifactType: 'strategy-brief',
    template: 'integrated-dashboard',
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
  'general-note': {
    artifactGoal: 'read',
    artifactType: 'faithful-note',
    template: 'editorial',
    conversionMode: 'preserve',
    previewSecurity: 'sanitized',
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
  'share-article': {
    artifactGoal: 'publish',
    artifactType: 'research-report',
    template: 'editorial',
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

function findExportGenre(id) {
  return exportGenres.find((item) => item.id === id) || exportGenres[0];
}

function findExportDepth(id) {
  return exportDepths.find((item) => item.id === id) || exportDepths[1];
}

function findExportPurpose(id) {
  return exportPurposes.find((item) => item.id === id) || exportPurposes[1];
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

  if (normalized.exportGenre === 'construction-daily') {
    if (normalized.exportDepth === 'brief') {
      Object.assign(profile, {
        artifactGoal: 'read',
        artifactType: 'faithful-note',
        conversionMode: 'preserve',
        previewSecurity: 'sanitized',
      });
    }
    if (normalized.exportDepth === 'milestone') {
      Object.assign(profile, {
        artifactGoal: 'review',
        artifactType: 'strategy-brief',
        template: 'integrated-dashboard',
        conversionMode: 'presentation',
        previewSecurity: 'trusted',
      });
    }
  }

  if (normalized.exportPurpose === 'public-archive') {
    profile.artifactGoal = normalized.exportGenre === 'construction-daily' ? profile.artifactGoal : 'publish';
  }
  if (normalized.exportPurpose === 'presentation') {
    profile.conversionMode = 'presentation';
    profile.previewSecurity = 'trusted';
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
