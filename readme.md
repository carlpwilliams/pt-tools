# PT-Tools by CarlPWilliams
This project is a sort of addon to Profit Trailer.

The project watches a discord channel and whenever it sees the word "Sold" in a message it get's the daily stat history from PT and updates a spreadsheet with the values.


**** Note: You are welcome to use this code, but I provide no support. By using it, you agree that you do so at your own risk!
## Dependencies
- Npm
- node
- pm2

## Requirements.
- You will need a google service account
This is a simple account that allows the program to access a spreadsheet in your google. cloud.
https://support.google.com/a/answer/7378726?hl=en

    When you have gone through this process, you will get a googleCreds.json file.
    Save this to the root of the project.
- You will need a discord bot application

## Installation
- clone down the repo
    <blockquote>git clone https://github.com/carlpwilliams/pt-tools.git</blockquote>

- Run Npm install
    <blockquote>npm install i</blockquote>

- Fill in the required fields in config.jsonc
- Download google creds json file and ensure it is in the root folder of the project

## Running it to test
- Test it by running
    <blockquote>npm run start</blockquote>

## Run it as a service
- change directory to the working folder
- Run as a pm2 process
    <blockquote>pm2 start pm2-pt-tools.json</blockquote>


---

Buy me a coffee?

Eth: 0x6381C85b1dD5044a627ecA0Ca89fB782234d5119