const { buildShareHomeUrl, inferPagesBaseUrl, normalizePublishPath } = require('./github-pages.js');

const DEFAULT_SHARE_HOME_PROFILE_ID = 'jisu-construction';
const DEFAULT_SHARE_HOME_TITLE = '유네코 지수 통합선별공장 프로젝트';
const DEFAULT_SHARE_HOME_EYEBROW = '통합선별공장 Archive';
const DEFAULT_SHARE_HOME_DESCRIPTION = '';

function cleanProfileText(value, fallback = '') {
  const text = String(value || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text || fallback;
}

function normalizeShareHomeProfileId(value, fallback = DEFAULT_SHARE_HOME_PROFILE_ID) {
  const ascii = String(value || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return ascii || fallback;
}

function buildDefaultShareHomeProfile(settings = {}) {
  return {
    id: DEFAULT_SHARE_HOME_PROFILE_ID,
    title: cleanProfileText(settings.githubShareHomeTitle, DEFAULT_SHARE_HOME_TITLE),
    basePath: normalizePublishPath(
      Object.prototype.hasOwnProperty.call(settings, 'githubPublishPath')
        ? settings.githubPublishPath
        : 'marktl',
    ),
    eyebrow: DEFAULT_SHARE_HOME_EYEBROW,
    description: DEFAULT_SHARE_HOME_DESCRIPTION,
  };
}

function normalizeShareHomeProfile(profile, settings = {}, index = 0, usedIds = new Set()) {
  const fallback = buildDefaultShareHomeProfile(settings);
  const raw = profile && typeof profile === 'object' ? profile : {};
  const baseFallback = index === 0 ? fallback.basePath : `marktl/hub-${index + 1}`;
  const idFallback = index === 0 ? fallback.id : `share-hub-${index + 1}`;
  const descriptionFallback = index === 0 ? fallback.description : DEFAULT_SHARE_HOME_DESCRIPTION;
  const normalized = {
    id: normalizeShareHomeProfileId(raw.id || raw.key || raw.name, idFallback),
    title: cleanProfileText(raw.title || raw.name, index === 0 ? fallback.title : `공유 허브 ${index + 1}`),
    basePath: Object.prototype.hasOwnProperty.call(raw, 'basePath')
      ? normalizePublishPath(raw.basePath)
      : baseFallback,
    eyebrow: cleanProfileText(raw.eyebrow || raw.badge, index === 0 ? fallback.eyebrow : 'MarkTL Archive'),
    description: Object.prototype.hasOwnProperty.call(raw, 'description')
      ? cleanProfileText(raw.description, '')
      : descriptionFallback,
  };

  let id = normalized.id;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${normalized.id}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(id);
  normalized.id = id;
  return normalized;
}

function normalizeShareHomeProfiles(rawProfiles, settings = {}) {
  const usedIds = new Set();
  const source = Array.isArray(rawProfiles) && rawProfiles.length > 0
    ? rawProfiles
    : [buildDefaultShareHomeProfile(settings)];
  return source.map((profile, index) => normalizeShareHomeProfile(profile, settings, index, usedIds));
}

function resolveShareHomeProfile(settings = {}, profileId = '') {
  const profiles = normalizeShareHomeProfiles(settings.shareHomeProfiles, settings);
  const selectedId = cleanProfileText(profileId || settings.activeShareHomeProfileId, '');
  return profiles.find((profile) => profile.id === selectedId) || profiles[0] || buildDefaultShareHomeProfile(settings);
}

function normalizeShareHomeSettings(settings = {}) {
  const profiles = normalizeShareHomeProfiles(settings.shareHomeProfiles, settings);
  const activeId = cleanProfileText(settings.activeShareHomeProfileId, '');
  const activeProfile = profiles.find((profile) => profile.id === activeId) || profiles[0];
  return {
    shareHomeProfiles: profiles,
    activeShareHomeProfileId: activeProfile?.id || DEFAULT_SHARE_HOME_PROFILE_ID,
  };
}

function createShareHomeProfile(existingProfiles = [], seed = {}) {
  const profiles = normalizeShareHomeProfiles(existingProfiles, {});
  const index = profiles.length + 1;
  const usedIds = new Set(profiles.map((profile) => profile.id));
  return normalizeShareHomeProfile({
    id: seed.id || `share-hub-${index}`,
    title: seed.title || `새 공유 허브 ${index}`,
    basePath: Object.prototype.hasOwnProperty.call(seed, 'basePath') ? seed.basePath : `marktl/hub-${index}`,
    eyebrow: seed.eyebrow || 'MarkTL Archive',
    description: Object.prototype.hasOwnProperty.call(seed, 'description') ? seed.description : DEFAULT_SHARE_HOME_DESCRIPTION,
  }, {}, index - 1, usedIds);
}

function describeShareHomeProfile(profile, settings = {}) {
  const pagesBaseUrl = cleanProfileText(settings.githubPagesBaseUrl, '') || inferPagesBaseUrl(settings.githubRepo);
  const homeUrl = buildShareHomeUrl(pagesBaseUrl, profile?.basePath || '');
  const pathLabel = profile?.basePath ? `/${profile.basePath}/` : '/';
  return {
    pathLabel,
    homeUrl,
    summary: homeUrl ? `${profile.title} · ${homeUrl}` : `${profile.title} · ${pathLabel}`,
  };
}

function sameShareHomeSettings(left = {}, right = {}) {
  return JSON.stringify({
    activeShareHomeProfileId: left.activeShareHomeProfileId,
    shareHomeProfiles: left.shareHomeProfiles,
  }) === JSON.stringify({
    activeShareHomeProfileId: right.activeShareHomeProfileId,
    shareHomeProfiles: right.shareHomeProfiles,
  });
}

module.exports = {
  DEFAULT_SHARE_HOME_DESCRIPTION,
  DEFAULT_SHARE_HOME_EYEBROW,
  DEFAULT_SHARE_HOME_PROFILE_ID,
  DEFAULT_SHARE_HOME_TITLE,
  buildDefaultShareHomeProfile,
  cleanProfileText,
  createShareHomeProfile,
  describeShareHomeProfile,
  normalizeShareHomeProfileId,
  normalizeShareHomeProfiles,
  normalizeShareHomeSettings,
  resolveShareHomeProfile,
  sameShareHomeSettings,
};
