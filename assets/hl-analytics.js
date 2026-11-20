/* HaiLens 站点统计 · Clarity
 *
 * 一、换成真实 ID 才生效
 *   CLARITY_ID 还是占位值时，本文件不发任何请求（安全，可以先上线）。
 *   拿到 Clarity 项目 ID（10 位字母数字）后，只改下面这一行。
 *
 * 二、排除自己
 *   A 长期：在自己浏览器控制台执行一次
 *       localStorage.setItem('hl_internal','1')
 *     之后这台机器不再上报。撤销：localStorage.removeItem('hl_internal')
 *   B 一次搞定：用浏览器打开 https://hailenslab.com/?internal=1
 *     （会写进 localStorage 并弹一个提示条，之后这台浏览器永久不再上报）
 *   C 兜底：Clarity 后台 → 设置 → 屏蔽 IP（只支持 IPv4），管住忘了设 A 的那次
 *   注：无痕模式不管用，照样会被统计。
 */
(function () {
  'use strict';

  var CLARITY_ID = 'zgevk04agq'; // ← 只改这一行
  var KEY = 'hl_internal';
  var q = location.search || '';
  var host = location.hostname;

  /* —— 排除自己 —— */
  if (q.indexOf('internal=1') > -1) {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    try {
      var b = document.createElement('div');
      b.textContent = '✓ 本机已标记为内部访问，不再计入统计';
      b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:24px;z-index:9999;'
        + 'background:#111;color:#fff;font:13px/1.6 -apple-system,system-ui,sans-serif;'
        + 'padding:8px 14px;border-radius:6px;opacity:.92';
      document.body.appendChild(b);
      setTimeout(function () { b.remove(); }, 4000);
    } catch (e) {}
  }
  var internal = false;
  try { internal = localStorage.getItem(KEY) === '1'; } catch (e) {}
  if (internal) return;
  if (host.indexOf('localhost') === 0 || host.indexOf('127.0.0.1') === 0) return;
  if (host.indexOf('preview.') === 0) return;

  var ready = /^[0-9a-z]{8,12}$/i.test(CLARITY_ID) && CLARITY_ID !== 'CLARITY_PROJECT_ID';

  /* —— Clarity 本体 —— */
  if (ready) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function tag(k, v) {
    if (v && window.clarity) window.clarity('set', k, v);
  }

  /* —— 来源标签：哪封信、哪批名单带来的 ——
   * 发信链接拼成 https://hailenslab.com/?utm_source=mail01&utm_content=poct
   * 之后在 Clarity 里按 utm_source / utm_content 筛录屏即可。
   */
  var p = new URLSearchParams(q);
  tag('utm_source', p.get('utm_source'));
  tag('utm_campaign', p.get('utm_campaign'));
  tag('utm_content', p.get('utm_content'));

  if (!p.get('utm_source') && document.referrer) {
    try { tag('ref', new URL(document.referrer).hostname); } catch (e) {}
  }

  /* —— 关键动作：页面上标了 data-track 的元素被点击就计数 —— */
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-track]') : null;
    if (!el || !window.clarity) return;
    window.clarity('event', el.getAttribute('data-track'));
  }, true);
})();
