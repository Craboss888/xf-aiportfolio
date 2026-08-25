import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const showcaseUrl = 'https://craboss888.github.io/hotyume-showcase/';

for (const page of ['index.html', 'theme-apple.html', 'win98.html']) {
  test(`${page} 的 AI 壁纸详情页提供 HotYume 在线展示入口`, () => {
    const html = fs.readFileSync(path.join(projectRoot, page), 'utf8');
    const wallpaperSection = html.match(/(?:<section id="wallpaper"|id="w-wallpaper")[\s\S]*?(?=<section id=|<div class="win win-lg" id=|$)/)?.[0];

    assert.ok(wallpaperSection, `${page} 应包含 AI 壁纸详情页`);
    assert.match(
      wallpaperSection,
      new RegExp(`<a[^>]+href="${showcaseUrl.replaceAll('.', '\\.')}"[^>]*>在线展示 ↗<\\/a>`),
    );
  });
}
