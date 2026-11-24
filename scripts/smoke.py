#!/usr/bin/env python3
"""Read-only smoke tests for the deployed single-origin demo."""
import json
import sys
import urllib.error
import urllib.parse
import urllib.request


def get(base, path):
    try:
        with urllib.request.urlopen(base + path, timeout=35) as res:
            return res.status, res.read().decode('utf-8', errors='replace')
    except urllib.error.HTTPError as err:
        return err.code, err.read().decode('utf-8', errors='replace')


def main():
    if len(sys.argv) != 2:
        sys.exit('Usage: python3 scripts/smoke.py https://your-live-site.example')
    base = sys.argv[1].rstrip('/')
    for path, expected in [('/', 200), ('/health/live', 200), ('/health/ready', 200),
                           ('/api/v1/products', 200), ('/api/v1/search?q=cyber', 200),
                           ('/api/v1/products?page=0', 400)]:
        status, body = get(base, path)
        if status != expected:
            raise RuntimeError(f'{path}: status {status} != {expected}; response: {body[:160]}')
        if path.startswith('/api/') and status == 200:
            data = json.loads(body)
            if 'data' not in data:
                raise RuntimeError(f'{path}: missing data property')
        print(f'PASS {status} {path}')
    print('Read-only smoke checks passed. Login/checkout still require manual E2E testing.')


if __name__ == '__main__':
    main()
