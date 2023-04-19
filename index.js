import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectBtn = document.getElementById("connectBtn")
const fundBtn = document.getElementById("fundBtn")
const balanceBtn = document.getElementById("balanceBtn")
const showBalance = document.getElementById("showBalance")
const withdrawBtn = document.getElementById("withdrawBtn")

connectBtn.onclick = connect
fundBtn.onclick = fund
balanceBtn.onclick = getBalance
withdrawBtn.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        connectBtn.innerHTML = "Connected!"
    } else {
        connectBtn.innerHTML = "Please install Metamask"
    }
}
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
        showBalance.innerHTML = `${ethers.utils.formatEther(balance)} ETH`
    }
}

// fund

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount} ETH...`)
    if (typeof window.ethereum !== "undefined") {
        // list of things you need to interact
        // provider / connection to blockchain
        // signer / wallet / someone with some gas
        // contract that we are interacting with(but we need the address and ABI of the contract to interact with it )
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // wait for transaction to be mined
            await listenForTransactionMined(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMined(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
    // listen for transaction to finish
}

// withdraw

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const balance = await provider.getBalance(contractAddress)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        console.log(`Withdrawing ${ethers.utils.formatEther(balance)} ETH`)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMined(transactionResponse, provider)
            console.log("Withdrawn")
        } catch (error) {
            console.log(error)
        }
    }
}

// for frontend javascript we use the import keyword
// for nodejs(backend) we use the require keyword
