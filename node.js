import { exec } from "node:child_process"
import * as fs from "node:fs/promises"
import util from "node:util"
import os from "node:os"

const IPFS_FOLDER = ".ipfs"
const CONFIG_FILE = "config.json"
const run = util.promisify(exec)

export default class Node {
  constructor(ipfsPath = IPFS_FOLDER) {
    this.networkKeyFileName = "swarm.key"
    this.ipfsPath = ipfsPath
  }

  async init() {
    try {
      console.log("initializing node...")
      await run(`ipfs init`)
      await run(`ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001`)
      await run(`ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080`)
    } catch (e) {
      // console.log("error initializing node")
    }
  }

  async #createNodeSwarmKey(filePath, swarnFileName) {
    try {
      await fs.readFile(`${filePath}/${swarnFileName}`, { encoding: "utf8" })
      console.log("Private key already exists")
    } catch (e) {
      console.log("creating private key")
      await run(`go run ./ipfs-swarm-key-gen/main.go > ${filePath}/${swarnFileName}`)
    }
  }

  async #copyLocalSwarmKey(nodeFolder) {
    try {
      await fs.readFile(this.networkKeyFileName, { encoding: "utf8" })
      console.log("local key already exists")
    } catch (e) {
      try {
        const keyPath = `${nodeFolder}/${this.networkKeyFileName}`

        console.log("copying node key to local dir")
        run(`cp ${keyPath} .`)
      } catch (e) {
        console.log("local key not created", e)
      }
    }
  }

  async #copyNodeSwarmKey(localKeyPath) {
    const nodeFolder = this.#ipfsFolder()
    const keyPath = `${nodeFolder}/${this.networkKeyFileName}`

    try {
      await fs.readFile(keyPath, { encoding: "utf8" })
      console.log("node key already exists")
    } catch (e) {
      try {
        console.log("copying local key to node")
        run(`cp ${localKeyPath} ${keyPath}`)
      } catch (e) {
        console.log("node key not created", e)
      }
    }
  }

  #ipfsFolder() {
    const { homedir } = os.userInfo()
    return `${homedir}/${this.ipfsPath}`
  }

  async createSwarmKey(swarnFileName = "swarm.key") {
    const nodeFolder = this.#ipfsFolder()

    await this.#createNodeSwarmKey(nodeFolder, swarnFileName)
    await this.#copyLocalSwarmKey(nodeFolder)
  }

  async addSwarmKey(localKeyPath) {
    try {
      const filePath = new URL(`${localKeyPath}`, import.meta.url)
      await fs.readFile(filePath, { encoding: "utf8" })

      this.#copyNodeSwarmKey(localKeyPath)
    } catch (e) {
      console.log(`key not found in dir`, e)
    }
  }

  async addNode(peerID, peerIP) {
    try {
      await run("ipfs bootstrap rm all")
      await run(`ipfs bootstrap add /ip4/${peerIP}/tcp/4001/ipfs/${peerID}`)
    } catch (e) {
      console.log(pc.red(`error adding peer ${peerID}`, e))
    }
  }

  async addFile(filePath) {
    try {
      const { _, stdout: CID } = await run(`ipfs add ${filePath}`)
      return CID
    } catch (e) {
      console.log("error adding file", e)
    }
  }

  async readFile(fileCID) {
    try {
      const { _, stdout: message, stderr } = await run(`ipfs cat ${fileCID}`)
      console.log(stderr)
      return message
    } catch (e) {
      console.log("error reading file")
    }
  }

  async getPeerID() {
    const { _, stdout } = await run(`ipfs id`)
    return JSON.parse(stdout)
  }

  async startDaemon() {
    try {
      await run(`export LIBP2P_FORCE_PNET=1 && ipfs daemon`)
    } catch (e) {
      console.log("ipfs daemon failed to start")
    }
  }
}