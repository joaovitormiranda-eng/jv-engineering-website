"""Verify publishable files and compare the actual Pages tar with their digests."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import tarfile
import xml.etree.ElementTree as ET


def collect(root):
    root = Path(root)
    if root.is_symlink():
        raise ValueError('Symlinked build root is forbidden')
    required = ['index.html', 'portfolio/index.html', 'sitemap.xml',
                'licenses/up-business-MIT.txt']
    for name in required:
        if not (root / name).is_file() or not (root / name).stat().st_size:
            raise ValueError(f'Missing or empty build output: {name}')
    for pattern in ['css/styles.*.css', 'js/*.js']:
        if not any(p.is_file() and p.stat().st_size for p in root.glob(pattern)):
            raise ValueError(f'Missing compiled asset: {pattern}')
    urls = [n.text for n in ET.parse(root / 'sitemap.xml').getroot().findall('{*}url/{*}loc')]
    if not urls or len(urls) != len(set(urls)) or any(
        not u or not u.startswith('https://joaovitormiranda-eng.github.io/jv-engineering-website/')
        for u in urls
    ):
        raise ValueError('Invalid sitemap URLs')
    files = {}
    forbidden = {'.git', '.github', 'design', 'node_modules', '.env',
                 'package.json', 'package-lock.json', 'hugo.yaml', 'hugo.toml'}
    for p in sorted(root.rglob('*')):
        rel = p.relative_to(root)
        if p.is_symlink() or (p.is_file() and p.stat().st_nlink > 1):
            raise ValueError(f'Link forbidden in Pages output: {rel.as_posix()}')
        if any(part.startswith('.') or part in forbidden for part in rel.parts):
            raise ValueError(f'Non-public path in build: {rel.as_posix()}')
        if p.is_file():
            if p.suffix.lower() in {'.pem', '.key', '.pfx', '.bak', '.map'}:
                raise ValueError(f'Unexpected private/backup/source-map file: {rel.as_posix()}')
            files[rel.as_posix()] = hashlib.sha256(p.read_bytes()).hexdigest()
    return files


def verify_archive(archive, manifest):
    expected = json.loads(Path(manifest).read_text(encoding='utf-8'))
    actual = {}
    with tarfile.open(archive) as tar:
        for member in tar:
            name = PurePosixPath(member.name)
            if name.is_absolute() or '..' in name.parts or member.issym() or member.islnk():
                raise ValueError('Unsafe archive path/link')
            if member.isdir():
                continue
            if not member.isfile() or name.as_posix() in actual:
                raise ValueError('Unexpected or duplicate archive member')
            actual[name.as_posix()] = hashlib.sha256(tar.extractfile(member).read()).hexdigest()
    if actual != expected:
        raise ValueError('Pages archive differs from verified build manifest')
    return len(actual)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('public', nargs='?')
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--archive')
    args = parser.parse_args()
    if args.archive:
        count = verify_archive(args.archive, args.manifest)
        print(f'Pages archive verified: {count} files')
    else:
        if not args.public:
            parser.error('public directory required')
        manifest = json.dumps(collect(args.public), sort_keys=True, indent=2) + '\n'
        Path(args.manifest).write_text(manifest, encoding='utf-8', newline='\n')
        print(f'Build manifest SHA-256: {hashlib.sha256(manifest.encode()).hexdigest()}')
