#!/usr/bin/env node
/**
 * split-content.js — one-shot migration, not part of the build.
 *
 * Phase 5 puts Decap CMS in front of the content, and Decap edits *files*:
 * one file becomes one entry in the editor's sidebar. A single flat
 * content/en.json with 908 keys would therefore be a single 908-field form,
 * which is not something a non-technical editor can navigate.
 *
 * The keys are already shaped page.section.field, so the fix is to let that
 * shape become the storage layout: a file per page, an object per section.
 * The editor gets 14 navigable entries; the build flattens them straight back
 * to the same dotted keys, so nothing downstream of the loader changes.
 *
 * jsonld.org-description is the one key that was two segments deep. It becomes
 * jsonld.org.description so every key is uniformly page.section.field.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const LOCALES = ['en', 'da', 'pl'];

const RENAMES = { 'jsonld.org-description': 'jsonld.org.description' };

function split(locale) {
  const flatFile = path.join(CONTENT, locale + '.json');
  if (!fs.existsSync(flatFile)) {
    console.log('  ' + locale + ': no flat file, skipped');
    return 0;
  }

  const flat = JSON.parse(fs.readFileSync(flatFile, 'utf8'));
  const pages = {};

  for (const rawKey of Object.keys(flat)) {
    const key = RENAMES[rawKey] || rawKey;
    const parts = key.split('.');
    if (parts.length !== 3) {
      throw new Error('key is not page.section.field: ' + key);
    }
    const [page, section, field] = parts;
    pages[page] = pages[page] || {};
    pages[page][section] = pages[page][section] || {};
    pages[page][section][field] = flat[rawKey];
  }

  const dir = path.join(CONTENT, locale);
  fs.mkdirSync(dir, { recursive: true });

  let files = 0;
  for (const page of Object.keys(pages).sort()) {
    const sorted = {};
    for (const section of Object.keys(pages[page]).sort()) {
      sorted[section] = {};
      for (const field of Object.keys(pages[page][section]).sort()) {
        sorted[section][field] = pages[page][section][field];
      }
    }
    fs.writeFileSync(
      path.join(dir, page + '.json'),
      JSON.stringify(sorted, null, 2) + '\n',
      'utf8'
    );
    files++;
  }

  fs.rmSync(flatFile);
  console.log('  ' + locale + ': ' + Object.keys(flat).length + ' keys -> ' + files + ' files');
  return files;
}

for (const locale of LOCALES) split(locale);
