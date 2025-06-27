// src/i18n/navigation.js
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing'; // Import routing config from the same directory

// Export locale-aware versions of Next.js navigation APIs
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);