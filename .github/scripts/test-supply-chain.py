"""Offline regression tests: integrity failures must never activate an installer."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unittest

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('verify_build', HERE / 'verify-build.py')
verify = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify)


class SupplyChainTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='jv-supply-chain-')
        target = Path(self.temp.name).resolve()
        if target.parent != Path(tempfile.gettempdir()).resolve() or not target.name.startswith('jv-supply-chain-'):
            raise ValueError('Unexpected temporary test directory')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def installer(self, corrupt=False, invalid=False):
        # Benign fixture, not a Hugo release. Its computed digest exists only here.
        package = self.root / 'fixture.deb'
        payload = b'offline installer integrity fixture'
        package.write_bytes(payload + (b'corrupted' if corrupt else b''))
        config = self.root / 'toolchain.json'
        config.write_text(json.dumps({'version': '0.169.0' if not invalid else 'invalid;exit',
            'linux_amd64_deb_sha256': hashlib.sha256(payload).hexdigest()}))
        tools = self.root / 'bin'
        tools.mkdir()
        scripts = {
            'python3': '#!/usr/bin/env bash\nexec "$TEST_PYTHON" "$@"\n',
            'curl': '#!/usr/bin/env bash\nprintf called > "$TEST_DOWNLOAD_MARKER"\nwhile (($#)); do if [[ "$1" == --output ]]; then cp "$TEST_PACKAGE" "$2"; exit; fi; shift; done\nexit 1\n',
            'dpkg-deb': '''#!/usr/bin/env bash
set -eu
printf 'called' > "$TEST_EXTRACT_MARKER"
mkdir -p "$3/usr/local/bin"
printf '#!/usr/bin/env bash\nprintf "hugo v0.169.0-fixture+extended linux/amd64\\n"\n' > "$3/usr/local/bin/hugo"
chmod +x "$3/usr/local/bin/hugo"
'''
        }
        for name, content in scripts.items():
            p = tools / name
            p.write_text(content, encoding='utf-8', newline='\n')
            p.chmod(0o755)
        marker = self.root / 'extracted'
        downloaded = self.root / 'downloaded'
        path_file = self.root / 'github-path'
        env = os.environ.copy()
        def posix(p):
            value = str(p).replace('\\', '/')
            return '/' + value[0].lower() + value[2:] if len(value) > 1 and value[1] == ':' else value
        env.update(PATH=str(tools) + os.pathsep + env['PATH'],
                   TEST_PYTHON=str(Path(sys.executable)).replace('\\', '/'),
                   TEST_PACKAGE=posix(package), TEST_EXTRACT_MARKER=posix(marker),
                   TEST_BIN=posix(tools), TEST_DOWNLOAD_MARKER=posix(downloaded),
                   RUNNER_TEMP=posix(self.root), GITHUB_PATH=posix(path_file))
        bash = os.environ.get('TEST_BASH') or shutil.which('bash')
        if not bash:
            self.fail('Bash required; set TEST_BASH on Windows')
        # Git Bash prepends its own tools at startup. Re-prepend stubs inside Bash
        # so these tests cannot accidentally download/extract a real package.
        p = subprocess.run([bash, '-c', 'export PATH="$TEST_BIN:$PATH"; exec bash "$1" "$2"',
                            '_', posix(HERE / 'install-hugo.sh'), posix(config)],
                           env=env, capture_output=True)
        self.assertEqual(downloaded.exists(), not invalid, p.stderr.decode(errors='replace'))
        return p, marker, path_file

    def test_verified_installer_activates_only_after_checksum(self):
        p, marker, path_file = self.installer()
        self.assertEqual(p.returncode, 0, p.stderr.decode(errors='replace'))
        self.assertTrue(marker.exists())
        self.assertTrue(path_file.read_text().strip().endswith('/usr/local/bin'))

    def test_corrupted_installer_never_extracts_or_activates(self):
        p, marker, path_file = self.installer(corrupt=True)
        self.assertNotEqual(p.returncode, 0)
        self.assertIn('FAILED', p.stdout.decode(errors='replace'))
        self.assertFalse(marker.exists())
        self.assertFalse(path_file.exists())

    def test_invalid_version_never_extracts_or_activates(self):
        p, marker, path_file = self.installer(invalid=True)
        self.assertNotEqual(p.returncode, 0)
        self.assertIn('Invalid Hugo version', p.stderr.decode(errors='replace'))
        self.assertFalse(marker.exists())
        self.assertFalse(path_file.exists())

    def public(self):
        root = self.root / 'public'
        for name in ['index.html', 'portfolio/index.html', 'css/styles.fixture.css',
                     'js/main.js', 'licenses/up-business-MIT.txt']:
            p = root / name
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text('offline fixture')
        (root / 'sitemap.xml').write_text('<urlset><url><loc>https://joaovitormiranda-eng.github.io/jv-engineering-website/</loc></url></urlset>')
        return root

    def archive(self, root):
        manifest = self.root / 'manifest.json'
        manifest.write_text(json.dumps(verify.collect(root)))
        archive = self.root / 'artifact.tar'
        with tarfile.open(archive, 'w') as tar:
            tar.add(root, arcname='.')
        return archive, manifest

    def test_archive_matches_verified_files(self):
        archive, manifest = self.archive(self.public())
        self.assertEqual(verify.verify_archive(archive, manifest), 6)

    def test_archive_tampering_is_rejected(self):
        root = self.public()
        archive, manifest = self.archive(root)
        (root / 'index.html').write_text('tampered offline fixture')
        with tarfile.open(archive, 'w') as tar:
            tar.add(root, arcname='.')
        with self.assertRaises(ValueError):
            verify.verify_archive(archive, manifest)

    def test_private_path_is_rejected(self):
        root = self.public()
        (root / '.env').write_text('synthetic fixture; no credentials')
        with self.assertRaises(ValueError):
            verify.collect(root)

    def test_missing_css_is_rejected(self):
        root = self.public()
        (root / 'css/styles.fixture.css').unlink()
        with self.assertRaises(ValueError):
            verify.collect(root)

    def test_hardlink_is_rejected(self):
        root = self.public()
        os.link(root / 'index.html', root / 'linked.html')
        with self.assertRaises(ValueError):
            verify.collect(root)


if __name__ == '__main__':
    unittest.main(verbosity=2)
