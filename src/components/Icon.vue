<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="name === 'import' ? '0 0 1280 1024' : '0 0 24 24'"
    :fill="name === 'import' ? 'currentColor' : 'none'"
    :stroke="name === 'import' ? 'none' : 'currentColor'"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'book-open'">
      <path d="M12 7v14" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H12V5H6.5A2.5 2.5 0 0 0 4 7.5v12Z" />
      <path d="M20 19.5A2.5 2.5 0 0 0 17.5 17H12V5h5.5A2.5 2.5 0 0 1 20 7.5v12Z" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </template>
    <template v-else-if="name === 'home'">
      <path d="M15 21v-7a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v7" />
      <path d="M4 10.5 12 3l8 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z" />
    </template>
    <template v-else-if="name === 'library'">
      <path d="M4 19.5V5.5A1.5 1.5 0 0 1 5.5 4H9v17H5.5A1.5 1.5 0 0 1 4 19.5Z" />
      <path d="M9 4h4v17H9z" />
      <path d="M14.5 4.5 18 4l2 16.5-3.5.5-2-16.5Z" />
    </template>
    <template v-else-if="name === 'ranking'">
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </template>
    <template v-else-if="name === 'complete'">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 12 3 3 5-7" />
    </template>
    <template v-else-if="name === 'tag'">
      <path d="M20.5 13.5 13.5 20.5a2 2 0 0 1-2.8 0L3 12.8V3h9.8l7.7 7.7a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </template>
    <template v-else-if="name === 'user'">
      <path d="M19 21v-1.5A4.5 4.5 0 0 0 14.5 15h-5A4.5 4.5 0 0 0 5 19.5V21" />
      <circle cx="12" cy="8" r="4" />
    </template>
    <template v-else-if="name === 'history'">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </template>
    <template v-else-if="name === 'bookshelf'">
      <path d="M4 20V5" />
      <path d="M8 20V5" />
      <path d="M12 20V5" />
      <path d="M18 20 14 5" />
      <path d="M3 20h18" />
      <path d="M4 9h4" />
      <path d="M12 13h4" />
    </template>
    <template v-else-if="name === 'profile'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </template>
    <template v-else-if="name === 'source-group'">
      <path d="M4 5.5h6l1.8 2H20v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </template>
    <template v-else-if="name === 'edit-square'">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 15h2.2L16 10.2 13.8 8 9 12.8V15Z" />
      <path d="M13.5 8.3 15.7 10.5" />
    </template>
    <template v-else-if="name === 'save'">
      <path d="M5 4h12l2 2v14H5V4Z" />
      <path d="M8 4v6h8V4" />
      <path d="M8 20v-6h8v6" />
    </template>
    <template v-else-if="name === 'debug'">
      <path d="M8 8a4 4 0 0 1 8 0v1H8V8Z" />
      <path d="M7 9h10v5a5 5 0 0 1-10 0V9Z" />
      <path d="M4 13h3" />
      <path d="M17 13h3" />
      <path d="M5 19l2.2-2" />
      <path d="M18.8 17 21 19" />
      <path d="M12 9v10" />
    </template>
    <template v-else-if="name === 'more-vertical'">
      <circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H2.8a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2a2 2 0 1 1 4 0V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </template>
    <template v-else-if="name === 'import'">
      <path d="M394 376V230.8c0-19.2 15.6-34.8 34.8-34.8h477.4c19.2 0 34.8 15.6 34.8 34.8v477.4c0 19.2-15.6 34.8-34.8 34.8H761c-18.8 0-34 15.2-34 34s15.2 34 34 34h178.9c38.2 0 69.1-31 69.1-69.1V197.1c0-38.2-31-69.1-69.1-69.1H395.1c-38.2 0-69.1 31-69.1 69.1V376c0 18.8 15.2 34 34 34s34-15.2 34-34z" />
      <path d="M678.9 618.8l-0.1-0.1L545.1 485c-13.3-13.3-34.8-13.3-48.1 0-13.3 13.3-13.3 34.8 0 48.1l75.9 75.9H360c-18.8 0-34 15.2-34 34s15.2 34 34 34h212.7L497 752.7c-13.3 13.3-13.3 34.8 0 48.1 13.3 13.3 34.8 13.3 48.1 0l131.6-131.6c7.5-6.2 12.3-15.6 12.3-26.1 0-9.6-3.9-18.1-10.1-24.3z" />
    </template>
    <template v-else>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 20
  },
  strokeWidth: {
    type: [Number, String],
    default: 2
  }
});
</script>
