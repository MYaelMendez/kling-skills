#!/usr/bin/env node
/**
 * gen_docs.mjs — Generate docs/index.md from SKILL.md + skill_manifest.json
 *
 * Usage:
 *   node scripts/gen_docs.mjs
 *
 * Outputs: docs/index.md
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');

const skillMd = readFileSync(resolve(root, 'SKILL.md'), 'utf-8');
const manifest = JSON.parse(readFileSync(resolve(root, 'skill_manifest.json'), 'utf-8'));

// Strip YAML front-matter from SKILL.md
const bodyStart = skillMd.indexOf('\n---\n', 3);
const skillBody = bodyStart >= 0 ? skillMd.slice(bodyStart + 5).trimStart() : skillMd;

const date = new Date().toISOString().slice(0, 10);

const output = `---
title: ${manifest.name}
description: ${manifest.description}
version: ${manifest.version}
generated: ${date}
---

# ${manifest.name}

> ${manifest.description}

**Version**: \`${manifest.version}\` | **License**: MIT | **Runtime**: ${manifest.prerequisites?.runtime ?? 'Node.js 18+'}

## Supported Modes

${manifest.modes.map((m) => `- \`${m}\``).join('\n')}

## API Endpoints

| Mode | API Path | Model |
|------|----------|-------|
${Object.entries(manifest.endpoints)
  .map(([, ep]) => `| ${ep.trigger} | \`${ep.path}\` | \`${ep.model}\` |`)
  .join('\n')}

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
${Object.entries(manifest.parameters)
  .map(([name, p]) => {
    const def = p.default !== undefined ? `\`${p.default}\`` : p.required === false ? '_optional_' : '_required_';
    return `| \`--${name}\` | ${p.type} | ${def} | ${p.description} |`;
  })
  .join('\n')}

---

${skillBody}

---

*Auto-generated from [SKILL.md](../SKILL.md) and [skill_manifest.json](../skill_manifest.json) on ${date}.*
`;

const outDir = resolve(root, 'docs');
mkdirSync(outDir, { recursive: true });
const outFile = resolve(outDir, 'index.md');
writeFileSync(outFile, output, 'utf-8');
console.log(`✓ Docs written to ${outFile}`);
