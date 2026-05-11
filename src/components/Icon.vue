<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
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
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H2.8a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2a2 2 0 1 1 4 0V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
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
