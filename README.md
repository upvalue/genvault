# mj-workbook

App for working with a specific tool that happens to have Discord as an interface.

- Setup a postgres DB, use schema.sql (no migrations currently)
- Create a discord bot with permissions to read messages and message history, set that up in a server, configure this with the credentials
- Invite midjourney bot to the server
- Add a category called "mj-workbook" and channels within that category
- Midjourney images will show up in the app

Todo:

- Prompting & upscaling from within the app
- Search through channels or through all images

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
