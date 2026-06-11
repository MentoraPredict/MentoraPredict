from pathlib import Path

template_path = Path('infra/kong/kong-template.yml')
public_path = Path('infra/keys/public.pem')

if not template_path.exists() or not public_path.exists():
    raise SystemExit('Missing files')

template = template_path.read_text(encoding='utf-8')
public = public_path.read_text(encoding='utf-8')

out = []
for line in template.splitlines():
    if line.strip() == '__JWT_PUBLIC_KEY__':
        out.extend('          ' + pline for pline in public.splitlines())
    else:
        out.append(line)

print('--- generated lines 1-40 ---')
for i, line in enumerate(out[:40], start=1):
    print(f'{i:03d}: {line}')
print('--- lines 30-45 ---')
for i, line in enumerate(out[29:45], start=30):
    print(f'{i:03d}: {line}')
