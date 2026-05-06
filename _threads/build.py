#!/usr/bin/env python3
"""
构建脚本：把 _threads/*.md 渲染成 discourse/*.html

使用方法：
  python3 build_threads.py

会生成：
  /home/claude/mathrock-site/discourse/<slug>.html
"""
import json
import re
from pathlib import Path
import yaml
import markdown

ROOT = Path('/home/claude/mathrock-site')
SRC = ROOT / '_threads'
OUT = ROOT / 'discourse'
OUT.mkdir(exist_ok=True)

# 读取模板
template = (SRC / '_template.html').read_text(encoding='utf-8')

# Markdown 解析器（带 tables, fenced_code 等扩展）
md = markdown.Markdown(extensions=['extra', 'tables', 'fenced_code', 'sane_lists'])

# 处理每个 .md 文件
md_files = sorted(SRC.glob('thread-*.md'))
print(f'找到 {len(md_files)} 个帖子文件\n')

for md_path in md_files:
    raw = md_path.read_text(encoding='utf-8')

    # 拆分 frontmatter + 正文 + 回复
    # 格式：---\nyaml\n---\n正文\n---REPLIES---\n[yaml-list]
    parts = raw.split('---REPLIES---')
    front_and_body = parts[0]
    replies_yaml = parts[1].strip() if len(parts) > 1 else '[]'

    # 拆 frontmatter（YAML）和 body
    fm_match = re.match(r'^---\n(.*?)\n---\n(.*)$', front_and_body, re.DOTALL)
    if not fm_match:
        print(f'  ⚠ {md_path.name} 没有 frontmatter，跳过')
        continue

    meta = yaml.safe_load(fm_match.group(1))
    body_md = fm_match.group(2).strip()
    replies = yaml.safe_load(replies_yaml) or []

    # 渲染 markdown 正文为 HTML
    md.reset()
    body_html = md.convert(body_md)

    # 渲染回复为 HTML
    reply_blocks = []
    for r in replies:
        md.reset()
        r_body = md.convert(r['body'])
        reply_blocks.append(f'''      <div class="reply-item">
        <div class="reply-meta">
          <div class="author">{r['author']}</div>
          <div class="time">{r['time']}</div>
        </div>
        <div class="reply-body">{r_body}</div>
      </div>''')
    replies_html = '\n'.join(reply_blocks)

    # 模板替换
    output = template
    replacements = {
        '{{id}}':       meta['id'],
        '{{slug}}':     meta['slug'],
        '{{tag}}':      meta['tag'],
        '{{tagName}}':  meta['tagName'],
        '{{title}}':    meta['title'],
        '{{author}}':   meta['author'],
        '{{time}}':     meta['time'],
        '{{date}}':     meta['date'],
        '{{replies}}':  replies_html,
        '{{replyCount}}': str(len(replies)),
        '{{content}}':  body_html,
        '{{views}}':    str(meta.get('views', 0)),
    }
    # views 比较特别，先单独替换数字
    output = output.replace('{{replies}}', replies_html)
    output = output.replace('{{content}}', body_html)
    # 然后处理元数据替换（注意 {{replies}} 那个数字也要替换）
    for k, v in replacements.items():
        if k in ('{{replies}}', '{{content}}'):
            continue
        # {{replies}} 在元信息栏（数字）和 replies 容器（HTML）都出现，但前者是 {{replies}} 数字而 HTML 已经替换过了
        # 注意：模板里 {{replies}} 被两处用——元信息栏的 "回复数字" 和正文的 "{{replies}}" HTML容器
        # 我把元信息栏改成 {{replyCount}}，避免冲突
        output = output.replace(k, str(v))

    # 写文件
    out_path = OUT / f'{meta["slug"]}.html'
    out_path.write_text(output, encoding='utf-8')
    print(f'  ✓ {meta["slug"]}.html  ({len(output):,} bytes, {len(replies)} 回复)')

print(f'\n输出目录: {OUT}')
print(f'生成文件: {len(list(OUT.glob("*.html")))} 个')
