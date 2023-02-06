# PT-Tools by CarlPWilliams
This project is a sort of addon to Profit Trailer.

The project watches a discord channel and whenever it sees the word "Sold" in a message it get's the daily stat history from PT and updates a spreadsheet with the values.

## Dependencies
- Npm
- node
- pm2

## Installation
- clone down the repo
    <blockquote>git clone https://github.com/carlpwilliams/pt-tools.git</blockquote>

- Run Npm install
    <blockquote>npm install i</blockquote>

- Fill in the required fields in config.jsonc

## Running it to test
- Test it by running
    <blockquote>npm run start</blockquote>

## Run it as a service
- change directory to the working folder
- Run as a pm2 process
    <blockquote>pm2 start pm2-pt-tools.json</blockquote>