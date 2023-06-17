# mj-workbook

App for working with a specific tool that happens to have Discord as an interface.

It works in the following way:
- Setup a postgres DB
- Create a discord bot with permissions to read messages and message history, set that up in a server
- Invite midjourney bot to the server
- Any midjourney images will show up in the app

A followup update will probably include a method for prompting within the app, but for now it just generates prompts for you.

## Instructions

Create a `config.json` file with the following contents:

```
{
  "discordPublicKey": "PUBLIC KEY",
  "discordBotToken": "BOT TOKEN"
  "database": {
    "host": "postgres",
    "user": "postgres",
    "password": "postgres",
    "port": 5432
  }
}
```
