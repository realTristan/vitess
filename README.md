# Vitess ![Stars](https://img.shields.io/github/stars/realTristan/vitess?color=brightgreen) ![Watchers](https://img.shields.io/github/watchers/realTristan/vitess?label=Watchers)

![logo](https://github.com/realTristan/vitess/assets/75189508/a74d4664-6b6e-4ba3-b922-976427953ec3)

# Example

<img width="563" alt="Screenshot 2023-10-20 at 9 50 52 PM" src="https://github.com/realTristan/vitess/assets/75189508/70bcc37e-a12d-4f74-a945-84e1725674f2">

# How to install and host

#### Add and update the following .env variables

```env
DATABASE_URL = "CockroachDB URL"
REDIS_URL = "redis://localhost:6379"
DISCORD_TOKEN = "YOUR DISCORD TOKEN"
```

### Execute the following commands

```bash
make install
make migrate
make redis
make start
```

# How to interact with the bot

Invite the bot [here](https://discord.com/api/oauth2/authorize?client_id=1165100334084014150&permissions=8&scope=applications.commands%20bot)

### Verify with

`/verify`

### See all verified users

`/verified`

### Unverify yourself

`/unverify`

# License

MIT License

Copyright (c) 2023 Tristan Simpson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
