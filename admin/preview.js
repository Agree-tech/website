/**
 * preview.js — a Decap preview pane that shows the real page.
 *
 * Decap's stock preview repeats the form, which tells an editor nothing about
 * where a string sits. This one takes the page template the build laid out for
 * it (preview/<page>.html: nav, footer and JSON-LD inlined, asset paths made
 * absolute, placeholders intact) and substitutes the entry being edited with
 * the build's own localize(), so the pane is the page as it will deploy: same
 * markup, same stylesheets, same emphasis handling. Strings the entry does not
 * carry — the nav and footer, and English for anything left blank — come from
 * preview/data.json, written by the build from every locale's content.
 *
 * As the editor types, the element whose text changed is outlined and brought
 * into view. Decap does not tell a preview which field has focus, so the change
 * is the signal: each render is diffed against the last, and a single differing
 * key is the field under the cursor.
 *
 * Loads after decap-cms.js and localize.js; registers itself for every page.
 */
(function () {
  'use strict';

  var PREVIEW_DIR = 'preview/';
  var VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;

  /** The shared parts have no page of their own; show them on the homepage. */
  var SHOWN_ON = { nav: 'index', foot: 'index', jsonld: 'index' };

  var dataPromise = null;
  var templates = {};

  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ' responded ' + r.status);
      return r.text();
    });
  }

  function data() {
    if (!dataPromise) dataPromise = fetchText(PREVIEW_DIR + 'data.json').then(JSON.parse);
    return dataPromise;
  }

  function template(page) {
    if (!templates[page]) templates[page] = fetchText(PREVIEW_DIR + page + '.html');
    return templates[page];
  }

  /** content/da/index.json -> { locale: 'da', page: 'index' } */
  function whereIs(entry) {
    var m = /content\/([^/]+)\/([^/]+)\.json$/.exec(entry.get('path') || '');
    return m ? { locale: m[1], page: m[2] } : null;
  }

  /**
   * Entry data { section: { field: value } } -> { 'page.section.field': value }.
   * Blanks are dropped, as the build drops them, so an empty field previews
   * as the English fallback it will publish as.
   */
  function flatten(page, sections) {
    var out = {};
    Object.keys(sections || {}).forEach(function (section) {
      var fields = sections[section];
      if (!fields || typeof fields !== 'object') return;
      Object.keys(fields).forEach(function (field) {
        var value = fields[field];
        if (typeof value === 'string' && value.trim()) {
          out[page + '.' + section + '.' + field] = value;
        }
      });
    });
    return out;
  }

  /**
   * Put data-i18n="key" on the element that holds each placeholder, so the
   * rendered page can be searched for the element a field belongs to.
   *
   * The attribute goes on the enclosing element rather than on a wrapper
   * around the text, so the page's structure — and with it every CSS rule —
   * is exactly the deployed page's. A placeholder inside a tag (alt, content,
   * placeholder, aria-label) has no element of its own and is left alone.
   */
  function markElements(html) {
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    var tags = [];
    var tagRe = /<(\/?)([a-zA-Z][\w-]*)(?:"[^"]*"|'[^']*'|[^>"'])*?(\/?)>/g;
    var m;
    while ((m = tagRe.exec(html))) {
      tags.push({
        start: m.index,
        end: tagRe.lastIndex,
        closing: m[1] === '/',
        leaf: m[3] === '/' || VOID.test(m[2]),
      });
    }

    var keysByTag = {};
    var phRe = /\{\{i18n:([^}@]+)(?:@[^}]+)?\}\}/g;
    while ((m = phRe.exec(html))) {
      var at = m.index;
      var i = tags.length - 1;
      while (i >= 0 && tags[i].start > at) i--;
      if (i < 0 || tags[i].end > at) continue; // no tag before it, or inside one

      // Walk back to the nearest unclosed opening tag: the parent element.
      var depth = 0;
      for (; i >= 0; i--) {
        var t = tags[i];
        if (t.leaf) continue;
        if (t.closing) { depth++; continue; }
        if (depth === 0) break;
        depth--;
      }
      if (i < 0) continue;
      (keysByTag[i] = keysByTag[i] || []).push(m[1].trim());
    }

    var out = '';
    var last = 0;
    Object.keys(keysByTag)
      .map(Number)
      .sort(function (a, b) { return a - b; })
      .forEach(function (i) {
        var cut = tags[i].end - 1; // just before the closing '>'
        out += html.slice(last, cut) + ' data-i18n="' + keysByTag[i].join(' ') + '"';
        last = cut;
      });
    return out + html.slice(last);
  }

  /**
   * What the pane renders, in two parts: the head's stylesheets and style
   * block, so the page's own styling applies, and the body without its
   * scripts.
   *
   * Two parts because they change at different rates. The body changes on
   * every keystroke; the head only when the page does. Rendered as one block,
   * each keystroke would re-insert the stylesheet links, the browser would
   * re-apply them asynchronously, and the page would flash unstyled — worse,
   * the spotlight would measure the edited element at its unstyled position
   * and scroll to the wrong place. Kept apart, React leaves the head alone.
   */
  function extract(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var head = [];
    doc.head.querySelectorAll('link[rel="stylesheet"], style').forEach(function (el) {
      head.push(el.outerHTML);
    });
    doc.body.querySelectorAll('script').forEach(function (el) { el.remove(); });
    return { head: head.join('\n'), body: doc.body.innerHTML };
  }

  var PANE_STYLE =
    '<style>' +
    '.at-live{outline:3px solid #2563EB;outline-offset:4px;border-radius:4px;' +
    'box-shadow:0 0 0 8px rgba(37,99,235,.14)}' +
    '.at-note{position:fixed;left:16px;bottom:16px;z-index:2147483647;max-width:calc(100% - 32px);' +
    'padding:10px 14px;border-radius:8px;background:#101A3A;color:#fff;' +
    'font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25)}' +
    '</style>';

  var PagePreview = createClass({
    getInitialState: function () {
      return { head: '', body: '', changed: null, note: '' };
    },

    componentDidMount: function () {
      this.refresh();
    },

    componentDidUpdate: function (prevProps) {
      if (prevProps.entry !== this.props.entry) this.refresh();
    },

    refresh: function () {
      var self = this;
      var where = whereIs(this.props.entry);
      if (!where) return;

      var page = SHOWN_ON[where.page] || where.page;
      var entry = flatten(where.page, this.props.entry.get('data').toJS());

      Promise.all([template(page), data()])
        .then(function (loaded) {
          // Decap re-renders the pane for reasons other than typing — its
          // periodic draft backup, for one. Same values, nothing to do, and
          // re-rendering would only wipe the spotlight.
          var changed = self.diff(entry);
          if (changed === false) return;

          var all = loaded[1].strings;
          var strings = Object.assign({}, all[where.locale] || {}, entry);
          var html = ATLocalize.localize(markElements(loaded[0]), strings, all.en || {}, new Set());
          var parts = extract(html);
          self.setState(
            { head: parts.head, body: parts.body, changed: changed },
            function () { self.spotlight(); }
          );
        })
        .catch(function (err) {
          self.setState({
            body: '<p style="padding:2rem;font:15px system-ui">Preview unavailable: ' +
              String((err && err.message) || err) + '</p>',
            changed: null,
          });
        });
    },

    /**
     * What changed since the previous render: the one key whose value differs
     * when exactly one does, null when several did or this is the first
     * render, false when nothing did.
     */
    diff: function (entry) {
      var prev = this.last;
      this.last = entry;
      if (!prev) return null;
      var seen = {};
      var changed = [];
      Object.keys(entry).concat(Object.keys(prev)).forEach(function (key) {
        if (seen[key]) return;
        seen[key] = true;
        if (entry[key] !== prev[key]) changed.push(key);
      });
      if (!changed.length) return false;
      return changed.length === 1 ? changed[0] : null;
    },

    spotlight: function () {
      var root = this.root;
      var key = this.state.changed;
      if (!root) return;

      root.querySelectorAll('.at-live').forEach(function (el) { el.classList.remove('at-live'); });

      var note = '';
      if (key) {
        var el = root.querySelector('[data-i18n~="' + key + '"]');
        if (el) {
          el.classList.add('at-live');
          var view = el.ownerDocument.defaultView;
          var box = el.getBoundingClientRect();
          // An instant jump, not a smooth one: a smooth scroll is abandoned
          // by the browser at the next layout change, and the pane has just
          // been re-rendered, so it rarely got further than a few pixels.
          if (box.top < 0 || box.bottom > view.innerHeight) {
            el.scrollIntoView({ block: 'center' });
          }
        } else if (/\.meta\./.test(key)) {
          note = 'Not shown on the page: this is metadata (browser tab, search result, share preview or alt text).';
        } else {
          note = 'This field is not visible on this page.';
        }
      }
      if (note !== this.state.note) this.setState({ note: note });
    },

    /**
     * The same object for the same markup. React decides whether to touch a
     * dangerouslySetInnerHTML block by the identity of this object, not by
     * comparing the string inside it (Decap's React resets the element on any
     * new object), and a fresh object per render would re-insert the
     * stylesheets on every keystroke: the page would flash unstyled, and the
     * spotlight would measure elements before their styles applied.
     */
    htmlProp: function (name, html) {
      var cache = this.htmlCache || (this.htmlCache = {});
      if (!cache[name] || cache[name].__html !== html) cache[name] = { __html: html };
      return cache[name];
    },

    setRoot: function (el) {
      this.root = el;
    },

    render: function () {
      return h(
        'div',
        {},
        h('div', { dangerouslySetInnerHTML: this.htmlProp('head', PANE_STYLE + this.state.head) }),
        h('div', { ref: this.setRoot, dangerouslySetInnerHTML: this.htmlProp('body', this.state.body) }),
        this.state.note ? h('div', { className: 'at-note' }, this.state.note) : null
      );
    },
  });

  /*
   * Decap's scroll sync ties the two panes together by scroll ratio, in both
   * directions: whenever the pane scrolls, the form scrolls too. With the
   * spotlight scrolling the pane to the edited element, that would drag the
   * form away from the field being typed in. Off unless the editor has turned
   * it on themselves — the toggle in the pane's corner persists under this key.
   */
  try {
    if (localStorage.getItem('cms.scroll-sync-enabled') === null) {
      localStorage.setItem('cms.scroll-sync-enabled', 'false');
    }
  } catch (e) {
    // No storage: the toggle still works by hand.
  }

  data()
    .then(function (loaded) {
      loaded.pages.forEach(function (page) {
        CMS.registerPreviewTemplate(page, PagePreview);
      });
    })
    .catch(function (err) {
      console.error('preview: could not load preview/data.json —', err);
    });
})();
