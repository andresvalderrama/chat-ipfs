#!/usr/bin/env node
import yargs from 'yargs';

import User from './user.js';

const user = new User()

yargs(process.argv.slice(2))
  .command({
    command: "createChat",
    describe: "initialize network",
    handler: async function () {
      await user.createChat()
    }
  })
  .command({
    command: 'createChat',
    describe: "create a new chat room in the private network",
    handler: async function () {
      await user.createChat()
    }
  })
  .command({
    command: "joinChat <privateKeyPath>",
    describe: "join the node into another network",
    handler: (args) => {
      const { privateKeyPath } = args
      user.joinChat(privateKeyPath)
    }
  })
  .command({
    command: "myInfo",
    describe: "prints node contact info",
    handler: () => {
      user.myInfo()
    }
  })
  .command({
    command: "addContact <peerId> <peerIp>",
    describe: "add a contact within the chat",
    handler: (args) => {
      const { peerId, peerIp } = args
      user.addContact(peerId, peerIp)
    }
  })
  .command({
    command: "shareMessage <filePath>",
    describe: "send a file to all the nodes in the network",
    handler: ({ filePath }) => {
      user.shareMessage(filePath)
    }
  })
  .command({
    command: "readMessage <fileID>",
    describe: "search for a file in the network",
    handler: ({ fileID }) => {
      user.readMessage(fileID)
    }
  })
  .command({
    command: "connect",
    describe: "connects the node",
    handler: () => {
      user.connect()
    }
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv;