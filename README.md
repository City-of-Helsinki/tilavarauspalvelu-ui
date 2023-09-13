# tilavarauspalvelu-ui
- [End user UI](ui/)
- [Admin UI](admin-ui/)
- [Common UI components](common/)

## Making a release

Draft a new release in https://github.com/City-of-Helsinki/tilavarauspalvelu-ui/releases - `ui` and `admin-ui` pipelines will pick up releases named `v-*`.

Old releases are named `release-*`

Include a changelog if applicable.

## Prerequisites

1. Node 18 (`nvm use`)
1. pnpm

## Scripts

Running scripts in the repo root uses turborepo to run the commands to all packages.

You can target commands using:
```
# only that package
pnpm {command} --filter {package_name}

# only that package and it's dependencies
pnpm {command} --filter {package_name}...
```

Start both frontends in dev mode
``` sh
pnpm dev
```

Lint all packages
``` sh
pnpm lint
# automatic fixing
pnpm lint:fix
```

Stylelint all packages
``` sh
pnpm lint:css
```

Typecheck all packages
``` sh
pnpm tsc
```

Build all packages
```
pnpm build
```

Test all packages
```
pnpm test
```

Generate SSL certificates for localhost
```
pnpm generate-certificate
```

## Repo structure

Main applications that don't depend on each other, can be built, and ran.
```
/apps
```

Dependencies that are used by multiple applications
```
/packages
```

## Developing locally

### backend

First check out the latest version of the backend/api project from https://github.com/City-of-Helsinki/tilavarauspalvelu-core
and follow it's instructions.

Alternatively you can use an Azure development backend by changing the environment variable.

### https

Because we use tunnistamo SSO we require https and a valid domain (not localhost).

Make sure /etc/hosts point domain local-tilavaraus.hel.fi to 127.0.0.1. This is important because tunnistamo currently does not provide SameSite information for the cookies it uses. Some browsers (like Chrome) default the SameSite to be Lax. Because of this tunnistamo and the site it is authenticating for need to share same-site context. Without fulfilling this requirement the silent renew might not work properly due to browser blocking required cookies.

```
127.0.0.1       local-tilavaraus.hel.fi
```

Create a self-signed certificate for SSL connection on developpment server by running the following command in the common directory

```sh
# in the repo root
pnpm generate-certificate
```

### set environment variables

These are done app by app so you need to go to `apps/admin-ui` and `apps/ui` and follow their instructions.

### access

If you run all the apps using `pnpm dev` in the root.

Admin-ui: https://local-tilavaraus.hel.fi:3001/kasittely
UI: https://local-tilavaraus.hel.fi:3000

## GraphQL

Assuming you are using local backend.
Interactive graphql: `http://localhost:8000/graphql/`

Using the graphql console qequires login in to django at `http://localhost:8000/admin/`

### Updates to graphql schema

New api changes require updating the schema and typescript types.

Update the version backend version in `http://localhost:8000` using git and rebuild it (follow the backend README).

```sh
cd packages/common
pnpm update-schema generate-gql-types
```

Some breaking changes might require fixing mocks in such case the Cypress tests will break.
Check the Cypress section in [UI](apps/ui/README.md).

## FAQ

### What's a server issue

How do you know it's server side? it's in the terminal logs not in the browser network request / logs.

In general for a basic page render that requires data
Nextjs does everything twice: it renders twice, it fetches twice, one on the server (SSR), one on the client (hydration).
On the server it uses Node, on the client it uses the browser.

Especially for fetch this is an issue since the native fetch in Node is rather quirky,
unlike browser APIs.

### Node 18 fetch failed server side

Using Node 18+ and getting Apollo fetch failed error or some other server side fetch exception?
Using http://localhost:XXXX as a backend?

Replace localhost with 127.0.0.1

#### Explanation

Node18 uses IPv6 as default so either we have to tell it to use IPv4 or change to 127.0.0.1 to explicitly
tell it that we are connecting to IPv4 address and not to :1.

127.0.0.1 is the prefered solution because it's not brittle unlike using dns resolution or env flags.
No module or node update should ever break it untill IPv4 is no longer supported.

### Other fetch problems with Node18+

Prefer 127.0.0.1 over localhost if that doesn't help then:

Turn off experimental fetch in the start script.
For example MSW requires this for local testing (non Docker), might help with other libraries also,
primarily those that manipulate or intercept requests.

```
"NODE_OPTIONS='--no-experimental-fetch' {cmd} ...
```

### Other server issues

Try downgrading node to 16, if it helps post a bug ticket.
