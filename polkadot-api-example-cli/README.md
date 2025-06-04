# Web3 Mail Watcher 📬

This is a simple CLI tool that watches for `remark_with_event` transactions on the Polkadot (Westend) network using the [@polkadot-api/papi](https://www.npmjs.com/package/@polkadot-api/papi) light client.

> 🧪 This project is based on the tutorial:  
> [Beginner’s Guide to Polkadot API (PAPI): You’ve Got Mail](https://dev.to/badery/beginners-guide-to-polkadot-api-papi-youve-got-mail-mc1) by [@badery](https://dev.to/badery)

## Features

- Connects to the Westend chain via a light client
- Listens for `System.Remarked` events
- Matches remark hashes with your account + `email`
- Plays a sound and logs a message when "you've got mail"

## Usage

```bash
npm install
npm run start -- --account <YourAddress>
