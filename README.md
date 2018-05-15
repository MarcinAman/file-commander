# File commander

Simple electron+React app that acts similarly to a Total-Commander.

Currently it is in early development stages so there is no API key which will be crucial for security.

## Getting Started

### Prerequisites

You need to have electron installed:

```
npm install --save-dev electron
```

Also in the main folder run:

```
npm install
```

to get all the dependencies. Mainly Express

### Running

As right now you need 3 terminals to run this app. Each command will need to run in a separate terminal window and i assume that you already are in main catalog.

On first one type:

```
cd NodeServer
node server
```

that's our Node JS server


And to run React:
```
npm start
```

On localhost:3000 you should have right now a working app, but we want it to be a desktop application not a web one:

```
electron .
```

## Authors

* **Marcin Aman** - [Github](https://github.com/MarcinAman)

