/**
 * Render the installer and uninstaller artwork from the committed application
 * tile and the shipped Montserrat face.
 *
 * The lockup pairs the private mark with the product name. The name is typeset
 * rather than drawn, and the repository ships Montserrat only as `woff2`, which
 * the SVG rasterizer cannot load, so the artwork is rendered by a headless
 * browser that loads the shipped font file. The committed PNGs are the output;
 * rerun `pnpm run render:brand-artwork` in `apps/desktop` after the tile changes.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

/** Transparent lockup panels the installer draws: 600x196 at 1x and 2x. */
export const LOCKUP_SIZE = { width: 600, height: 196 } as const

/** Opaque sidebar the uninstaller draws. */
export const UNINSTALLER_SIZE = { width: 164, height: 314 } as const

/** Edges of the lockup mark and of the uninstaller tile, in CSS pixels. */
const LOCKUP_MARK = 96
const LOCKUP_NAME = 46
const LOCKUP_GAP = 26
const UNINSTALLER_TILE = 112

/** Foreground ink per variant, matching the installer panel it ships for. */
const INK = { light: '#17181C', dark: '#F2F3F5' } as const

/** Paths owned by the desktop application. */
export const ARTWORK_PATHS = {
  tile: fileURLToPath(new URL('../resources/icon.svg', import.meta.url)),
  font: fileURLToPath(new URL('../../../packages/client/ui-theme/src/styles/montserrat-medium.woff2', import.meta.url)),
  output: fileURLToPath(new URL('../installer/assets/', import.meta.url)),
} as const

/** The mark path, extracted from the committed tile. */
export interface MarkGeometry {
  readonly path: string
}

/**
 * Read the mark geometry the application tile already carries.
 * @param tile - complete `icon.svg` document.
 * @returns the mask element and the shield path, both in the mark's own 24-unit space.
 */
export function markGeometry(tile: string): MarkGeometry {
  const path = /<path d="([^"]+)" fill="#FFFFFF" fill-rule="evenodd"/u.exec(tile)?.[1]
  if (path === undefined) throw new Error('brand artwork: the tile carries no private mark')
  return { path }
}

/** Render the mark as one even-odd path in the requested ink. */
function markSvg(geometry: MarkGeometry, ink: string, size: number): string {
  return `<svg width="${String(size)}" height="${String(size)}" viewBox="0 0 24 24" fill="none"><path d="${geometry.path}" fill="${ink}" fill-rule="evenodd"/></svg>`
}

/**
 * Build the installer lockup document.
 * @param geometry - mark geometry read from the tile.
 * @param ink - foreground color of the panel variant.
 * @param font - file URL of the shipped Montserrat face.
 * @returns a complete HTML document sized like the committed panel.
 */
export function lockupDocument(geometry: MarkGeometry, ink: string, font: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Montserrat'; font-weight: 500; src: url('${font}') format('woff2'); }
  html, body { margin: 0; padding: 0; background: transparent; }
  body { width: ${String(LOCKUP_SIZE.width)}px; height: ${String(LOCKUP_SIZE.height)}px; display: flex; align-items: center; justify-content: center; }
  .lockup { display: flex; align-items: center; gap: ${String(LOCKUP_GAP)}px; }
  .name { font-family: 'Montserrat', sans-serif; font-weight: 500; font-size: ${String(LOCKUP_NAME)}px; letter-spacing: 0.012em; line-height: 1; color: ${ink}; }
</style></head><body>
  <div class="lockup">
    ${markSvg(geometry, ink, LOCKUP_MARK)}
    <span class="name">Private DSH</span>
  </div>
</body></html>`
}

/**
 * Build the uninstaller sidebar document: the mark on its own dark tile.
 * @param geometry - mark geometry read from the tile.
 * @returns a complete HTML document sized like the committed sidebar.
 */
export function uninstallerDocument(geometry: MarkGeometry): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; }
  body { width: ${String(UNINSTALLER_SIZE.width)}px; height: ${String(UNINSTALLER_SIZE.height)}px; background: #F7F8FA;
    display: flex; align-items: center; justify-content: center; }
  .tile { width: ${String(UNINSTALLER_TILE)}px; height: ${String(UNINSTALLER_TILE)}px; border-radius: 25px; background: #1D1F24;
    display: flex; align-items: center; justify-content: center; }
</style></head><body>
  <div class="tile">
    ${markSvg(geometry, '#FFFFFF', Math.round(UNINSTALLER_TILE * 0.62))}
  </div>
</body></html>`
}

/**
 * Render one document to PNG bytes.
 * @param html - complete document.
 * @param width - viewport width in CSS pixels.
 * @param height - viewport height in CSS pixels.
 * @param scale - device scale factor; 2 produces the 2x variant.
 * @param transparent - whether the PNG keeps an alpha channel.
 * @returns the PNG bytes.
 */
async function render(html: string, width: number, height: number, scale: number, transparent: boolean): Promise<Buffer> {
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale })
    const page = await context.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluate(async () => { await document.fonts.ready })
    return await page.screenshot({ type: 'png', omitBackground: transparent, fullPage: false })
  } finally {
    await browser.close()
  }
}

/**
 * Render every committed installer asset.
 * @param geometry - mark geometry read from the tile.
 * @param font - file URL of the shipped Montserrat face.
 * @returns one entry per committed file name.
 */
export async function renderBrandArtwork(
  geometry: MarkGeometry,
  font: string,
): Promise<readonly { file: string; png: Buffer }[]> {
  const { width, height } = LOCKUP_SIZE
  return [
    { file: 'brand.png', png: await render(lockupDocument(geometry, INK.light, font), width, height, 1, true) },
    { file: 'brand-2x.png', png: await render(lockupDocument(geometry, INK.light, font), width, height, 2, true) },
    { file: 'brand-dark.png', png: await render(lockupDocument(geometry, INK.dark, font), width, height, 1, true) },
    { file: 'brand-dark-2x.png', png: await render(lockupDocument(geometry, INK.dark, font), width, height, 2, true) },
    {
      file: 'uninstaller-sidebar.png',
      png: await render(uninstallerDocument(geometry), UNINSTALLER_SIZE.width, UNINSTALLER_SIZE.height, 1, false),
    },
  ]
}

async function main(): Promise<void> {
  const tile = await readFile(ARTWORK_PATHS.tile, 'utf8')
  const font = new URL(`file://${ARTWORK_PATHS.font}`).href
  const artwork = await renderBrandArtwork(markGeometry(tile), font)
  await Promise.all(artwork.map(async ({ file, png }) => {
    await writeFile(new URL(file, `file://${ARTWORK_PATHS.output}`), png)
  }))
  console.info(`brand artwork: wrote ${artwork.map(entry => entry.file).join(', ')} to ${ARTWORK_PATHS.output}`)
}

if (process.argv[1] !== undefined && import.meta.filename === process.argv[1]) await main()
