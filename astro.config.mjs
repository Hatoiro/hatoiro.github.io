import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// hatoiro.github.io is a GitHub "user site": this repo is served from the domain root.
// Other repos (e.g. quiet-flight) keep working at hatoiro.github.io/<repo>/.
export default defineConfig({
  site: 'https://hatoiro.github.io',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !/\/(photos|podcast|about)\/$/.test(page) && !page.includes('/404') })],
  // 部屋の名前に合わせて URL を変えたので、古い URL は新しい部屋へ案内する
  redirects: { '/photos': '/darkroom', '/podcast': '/studyroom', '/about': '/front-room' },
});
