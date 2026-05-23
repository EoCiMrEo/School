"""Generate mock data by calling the application's REST API endpoints.

This script is intentionally defensive: it attempts to create resources with
minimal required fields, prints failures for you to tweak payloads, and
produces a mapping of created object ids.

Requirements
- Python 3.8+
- pip install requests faker

Usage
  # from be/ directory
  python scripts/generate_via_api.py --base http://localhost:8000 --admin admin@poolcrest.com --password AdminPass123! --count-users 5 --count-services 10 --count-properties 10 --count-appointments 20

Notes
- The script expects the API to be mounted at /api/ (e.g. /api/users/auth/login/).
- Admin user must have permission to create users/profiles/services/properties/appointments.
- If a creation call fails, the script prints the response body to help you adjust payloads.
- Created ID mapping is printed and saved to `mockdata_created_map.json`.
"""

import argparse
import os
import sys
import json
from datetime import datetime, timedelta

import requests
from faker import Faker

fake = Faker()

DEFAULT_BASE = 'http://localhost:8000/api'

HEADERS_JSON = {'Content-Type': 'application/json'}


def login(base, email, password):
    url = f"{base}/users/auth/login/"
    resp = requests.post(url, json={'email': email, 'password': password}, headers=HEADERS_JSON)
    if resp.status_code == 200:
        data = resp.json()
        token = data.get('access') or data.get('token') or data.get('access_token')
        if not token and 'tokens' in data:
            token = data['tokens'].get('access')
        return token, data
    return None, resp


def create_resource(url, token, payload):
    headers = HEADERS_JSON.copy()
    if token:
        headers['Authorization'] = f"Bearer {token}"
    resp = requests.post(url, json=payload, headers=headers)
    if resp.status_code in (200, 201):
        return resp.json()
    return {'_error': True, 'status_code': resp.status_code, 'body': resp.text, 'json': try_json(resp)}


def try_json(resp):
    try:
        return resp.json()
    except Exception:
        return None


def create_users(base, token, count, created_map):
    url = f"{base}/users/users/"
    results = []
    for i in range(count):
        first = fake.first_name()
        last = fake.last_name()
        email = f"{first.lower()}.{last.lower()}.{fake.random_number(digits=3)}@example.com"
        password = 'TestPass123!'
        payload = {
            'email': email,
            'password': password,
            'first_name': first,
            'last_name': last
        }
        res = create_resource(url, token, payload)
        if res and not res.get('_error'):
            uid = res.get('id') or res.get('pk') or res.get('user', {}).get('id')
            created_map.setdefault('users', []).append({'email': email, 'password': password, 'response': res})
            results.append(res)
            print(f'Created user: {email} -> {uid}')
        else:
            print('Failed to create user', payload)
            print(res)
    return results


def create_profiles(base, token, users, created_map):
    url = f"{base}/users/profiles/"
    results = []
    for u in users:
        # find id in response
        uid = u.get('id') or u.get('pk') or u.get('user', {}).get('id')
        if not uid:
            print('Cannot determine user id for user response:', u)
            continue
        payload = {
            'user': uid,
            'full_name': f"{u.get('first_name','')} {u.get('last_name','')}",
            'phone': fake.phone_number(),
            'role': 'customer',
            'status': 'active'
        }
        res = create_resource(url, token, payload)
        if res and not res.get('_error'):
            created_map.setdefault('profiles', []).append(res)
            results.append(res)
            print('Created profile for user id', uid)
        else:
            print('Failed to create profile for user id', uid)
            print(res)
    return results


def create_services(base, token, count, created_map):
    url = f"{base}/services/services/"
    services = []
    categories = ['Maintenance', 'Repair', 'Inspection', 'Seasonal', 'Emergency']
    for i in range(count):
        name = f"{fake.word().title()} Service {i+1}"
        payload = {
            'name': name,
            'description': fake.sentence(nb_words=12),
            'category': fake.random_element(categories),
            'base_price': round(fake.random_number(digits=2) + fake.random.random(), 2),
            'duration_minutes': fake.random_int(min=30, max=180),
            'status': True
        }
        res = create_resource(url, token, payload)
        if res and not res.get('_error'):
            services.append(res)
            created_map.setdefault('services', []).append(res)
            print('Created service', res.get('id') or res.get('name'))
        else:
            print('Failed to create service', payload)
            print(res)
    return services


def create_properties(base, token, profiles, services, count, created_map):
    url = f"{base}/properties/properties/"
    props = []
    for i in range(count):
        profile = fake.random_element(profiles)
        customer = profile.get('id') or profile.get('user') or profile
        svc = fake.random_element(services)
        payload = {
            'customer': customer,
            'property_name': f"{fake.street_name()} Residence",
            'address_line1': fake.street_address(),
            'city': fake.city(),
            'state': fake.state_abbr(),
            'zip_code': fake.zipcode(),
            'pool_type': 'chlorine',
            'pool_size': fake.random_element(['small','medium','large'])
        }
        res = create_resource(url, token, payload)
        if res and not res.get('_error'):
            props.append(res)
            created_map.setdefault('properties', []).append(res)
            print('Created property', res.get('id') or res.get('property_name'))
        else:
            print('Failed to create property', payload)
            print(res)
    return props


def create_appointments(base, token, profiles, properties, services, count, created_map):
    url = f"{base}/appointments/appointments/"
    appts = []
    for i in range(count):
        customer = fake.random_element(profiles)
        prop = fake.random_element(properties)
        svc = fake.random_element(services)
        scheduled = (datetime.utcnow() + timedelta(days=fake.random_int(min=1, max=30))).isoformat() + 'Z'
        payload = {
            'customer': customer.get('id') or customer.get('user') or customer,
            'property': prop.get('id') or prop.get('pk') or prop,
            'service': svc.get('id') or svc.get('pk') or svc,
            'scheduled_date': scheduled
        }
        res = create_resource(url, token, payload)
        if res and not res.get('_error'):
            appts.append(res)
            created_map.setdefault('appointments', []).append(res)
            print('Created appointment', res.get('id') or payload)
        else:
            print('Failed to create appointment', payload)
            print(res)
    return appts


def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument('--base', default=DEFAULT_BASE, help='Base API URL (without trailing /api)')
    p.add_argument('--admin', help='Admin email')
    p.add_argument('--password', help='Admin password')
    p.add_argument('--token', help='Admin access token (optional)')
    p.add_argument('--count-users', type=int, default=5)
    p.add_argument('--count-services', type=int, default=10)
    p.add_argument('--count-properties', type=int, default=10)
    p.add_argument('--count-appointments', type=int, default=20)
    p.add_argument('--out', default='mockdata_created_map.json')
    args = p.parse_args(argv)

    base = args.base.rstrip('/')
    admin_token = args.token

    if not admin_token:
        if not (args.admin and args.password):
            print('Either provide --token or both --admin and --password to login as admin')
            sys.exit(1)
        print('Logging in as admin...')
        token, resp = login(base, args.admin, args.password)
        if not token:
            print('Login failed:', try_json(resp) or resp.text)
            sys.exit(1)
        admin_token = token
        print('Obtained access token')

    created_map = {'meta': {'generated_at': datetime.utcnow().isoformat() + 'Z'}}

    # Create users and profiles
    users = create_users(base, admin_token, args.count_users, created_map)
    profiles = create_profiles(base, admin_token, users, created_map)

    # Create services
    services = create_services(base, admin_token, args.count_services, created_map)

    # Create properties
    properties = create_properties(base, admin_token, profiles or users, services, args.count_properties, created_map)

    # Create appointments
    appointments = create_appointments(base, admin_token, profiles or users, properties, services, args.count_appointments, created_map)

    created_map['summary'] = {
        'users': len(users),
        'profiles': len(profiles),
        'services': len(services),
        'properties': len(properties),
        'appointments': len(appointments)
    }

    Path_out = args.out
    with open(Path_out, 'w', encoding='utf-8') as fh:
        json.dump(created_map, fh, indent=2)

    print('\nDone. Mapping saved to', Path_out)


if __name__ == '__main__':
    main()
