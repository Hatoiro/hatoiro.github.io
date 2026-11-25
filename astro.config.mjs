import { defineConfig } from 'astro/config';

// hatoiro.github.io is a GitHub "user site": this repo is served from the domain root.
// Other repos (e.g. quiet-flight) keep working at hatoiro.github.io/<repo>/.
export default defineConfig({
  site: 'https://hatoiro.github.io',
  build: { format: 'directory' },
});
