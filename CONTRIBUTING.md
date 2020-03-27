[conventional-commits]: https://www.conventionalcommits.org/
[eslint-amex]: https://github.com/americanexpress/eslint-config-amex
[babel-amex]: https://github.com/americanexpress/babel-preset-amex
[playwright]: https://github.com/microsoft/playwright

[slack-channel]: https://one-amex.slack.com
[slack-invite]: https://join.slack.com/t/one-amex/shared_invite/enQtOTA0MzEzODExODEwLTlmYzI1Y2U2ZDEwNWJjOTAxYTlmZTYzMjUyNzQyZTdmMWIwZGJmZDM2MDZmYzVjMDk5OWU4OGIwNjJjZWRhMjY

[security-doc]: ./SECURITY.md
[code-of-conduct-doc]: ./CODE_OF_CONDUCT.md
[demo-doc]: ./docs/Demo.md
[development-doc]: ./docs/Development.md

# Contributing to `@americanexpress/one-service-worker`

✨ Thank you for taking the time to contribute to this project ✨

## 📖 Table of Contents

* [Code of Conduct](#code-of-conduct)
* [Developing](#developing)
* [Submitting a new feature](#submitting-a-new-feature)
* [Reporting bugs](#reporting-bugs)
* [Contributing](#getting-in-contact)
* [Coding conventions](#coding-conventions)

The following guidelines must be followed by all contributors to this repository.
Please review them carefully and do not hesitate to ask for help.

## Code of Conduct

This project adheres to the American Express [Code of Conduct](code-of-conduct-doc).
By contributing, you are expected to honor these guidelines.

## Developing

### Installation

1. Fork the repository `one-service-worker` to your GitHub account.

2. Afterwards run the following commands in your terminal:

```bash
$ git clone https://github.com/<your-github-username>/one-service-worker
$ cd one-service-worker
```

> replace `your-github-username` with your github username

3. Install the dependencies by running:

```bash
$ npm install
```

4. You can now run any of these scripts below from the root folder.

#### Generating build files

**`npm run build`**

Runs `rollup` to bundle and uses`babel` to compile `src` files to transpiled JavaScript using
[`babel-preset-amex`][babel-amex].

**`npm run print`**

Prints out sizes of build output, this will be run automatically post build.

#### Running tests

**`npm test`**

Runs unit tests **and** and triggers `posttest` on success for integration testing and linting.

**`npm run test:integration`**

Runs integration tests using [`playwright`][playwright] on `chromium`, `webkit` and `firefox`.

**`npm run lint`**

Verifies that the `package-lock.json` file includes public NPM registry URLs
**and** lints the source code using our `eslint` code style defined in
[`eslint-config-amex`][eslint-amex].

There is a [**guide on development conventions**][development-doc] for the library.

While developing, you can [**pilot the demo**][demo-doc] to see your changes in localhost.

## Submitting a new feature

When submitting a new feature request or enhancement of an existing features,
please review the following:

### Is your feature request related to a problem

Please provide a clear and concise description of what you want and what
your use case is.

### Provide an example

Please include a snippets of the code of the new feature.

### Describe the suggested enhancement

A clear and concise description of the enhancement to be added include a
step-by-step guide if applicable. Add any other context or screenshots or
animated GIFs about the feature request

### Describe alternatives you've considered

A clear and concise description of any alternative solutions or features
you've considered.

## Reporting bugs

All issues are submitted within GitHub issues. Please check this before
submitting a new issue.

### Describe the bug

A clear and concise description of what the bug is.

### Provide step-by-step guide on how to reproduce the bug

Steps to reproduce the behavior, please provide code snippets or a link to repository

### Expected behavior

Please provide a description of the expected behavior

### Screenshots

If applicable, add screenshots or animated GIFs to help explain your problem.

### System information

Provide the system information which is not limited to the below:

- OS: [e.g. macOS, Windows]
- Browser (if applies) [e.g. chrome, safari]
- Version of lumberjack: [e.g. 5.0.0]
- Node version:[e.g 10.15.1]

### Security Bugs

Please review our [Security Policy](security-doc). Please follow the instructions
outlined in the policy.

## Getting in contact

- Join our [Slack channel](slack-channel) request an invite [here](slack-invite)

## Coding conventions

### Git Commit Guidelines

We follow [conventional commits](conventional-commits) for git commit message formatting.
These rules make it easier to review commit logs and improve contextual understanding of
code changes. This also allows us to auto-generate the CHANGELOG from commit messages.