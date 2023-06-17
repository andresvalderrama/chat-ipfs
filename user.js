import os from "node:os"

import Node from "./node.js"

export default class User {
  constructor() {
    this.node = new Node();
  }

  #getUserIP() {
    const nets = os.networkInterfaces();
    const results = {};

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }
          results[name].push(net.address);
        }
      }
    }

    return Object.values(results)[0]
  }

  async createChat() {
    try {
      await this.node.init()
      await this.node.createSwarmKey()
    } catch (e) {
      console.log("error creating the chat room", e)
    }
  }

  async joinChat(keyPath) {
    try {
      await this.node.init()
      await this.node.addSwarmKey(keyPath)
      console.log("joined to the network successfuly")
    } catch (e) {
      console.log("failed to join to the network")
    }
  }

  async addContact(peerID, peerIP) {
    try {
      await this.node.addNode(peerID, peerIP)
      console.log("Contact added sucesfully")
    } catch (e) {
      console.log("error adding contact", e)
    }
  }

  async shareMessage(messagePath) {
    try {
      const cid = await this.node.addFile(messagePath)
      console.log(`file id ${cid}`)
    } catch (e) {
      console.log("file not sent", e)
    }
  }

  async readMessage(messageCID) {
    try {
      const message = await this.node.readFile(messageCID)
      console.log("message: ", message)
    } catch (e) {
      console.log("File not found", e)
    }
  }

  async myInfo() {
    const { ID: peerID } = await this.node.getPeerID()
    const [ipAddress] = this.#getUserIP()

    console.log("peerID: ", peerID)
    console.log("IP: ", ipAddress)
    console.log("share your local file swarm.key")
  }

  async connect() {
    try {
      console.log("chat running...")
      await this.node.startDaemon()
    } catch (e) {
      console.log(">>>>", e)
    }
  }
}