import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
const showBalance = document.getElementById("showBalance")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalace
withdrawButton.onclick = withdraw

async function connect() {
   if (typeof window.ethereum != "undefined") {
      try {
         await window.ethereum.request({ method: "eth_requestAccounts" })
      } catch (error) {
         console.log(error)
      }
      connectButton.innerHTML = "Connected!"
   } else {
      connectButton.innerHTML = "Please install Metamask"
   }
}

async function getBalace() {
   if (typeof window.ethereum != "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const balance = await provider.getBalance(contractAddress)

      showBalance.innerHTML = ethers.utils.formatEther(balance)
   }
}
//fund

async function fund(ethAmount) {
   ethAmount = document.getElementById("ethAmount").value
   console.log(`Funding with ${ethAmount}...`)
   if (typeof window.ethereum != "undefined") {
      //provider, signer/wallet, contract,ABI and address
      const provider = new ethers.providers.Web3Provider(window.ethereum) //for metamsk connection
      const signer = provider.getSigner() //current account
      const contract = new ethers.Contract(contractAddress, abi, signer)

      try {
         const transactionResponse = await contract.fund({
            value: ethers.utils.parseEther(ethAmount),
         })
         // listen for tx to be mined or event
         await listenForTranscationMine(transactionResponse, provider)
         console.log("done!")
      } catch (error) {
         console.log(error)
      }
   }
}

function listenForTranscationMine(transactionResponse, provider) {
   console.log(`Mining ${transactionResponse.hash}`)
   return new Promise((resolve, reject) => {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
         console.log(
            `completed with ${transactionReceipt.confirmations} confirmations.`
         )
         resolve()
      })
   })
}
//withdraw

async function withdraw() {
   console.log("Withdrawing...")
   if (typeof window.ethereum != "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      try {
         const transactionResponse = await contract.withdraw()
         await listenForTranscationMine(transactionResponse, provider)
      } catch (error) {
         console.log(error)
      }
      showBalance.innerHTML = ethers.utils.formatEther(balance)
   } else {
      withdrawButton.innerHTML = "Please install Metamask"
   }
}
