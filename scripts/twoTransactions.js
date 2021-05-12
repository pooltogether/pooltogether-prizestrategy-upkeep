const chalk = require('chalk');
const hardhat = require('hardhat')


function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}

async function fireTwoTransactions(){
    dim("running fireTwoTransactions")

    const {ethers } = hardhat
    
    const signer = await hardhat.ethers.getNamedSigner("deployer")

    dim("signer address is", signer._address)

    const prizeStrategyUpkeep = await ethers.getContract("PrizeStrategyUpkeep", signer)
    const { upkeepNeeded, performData } = await prizeStrategyUpkeep.checkUpkeep([])

    dim("prize strategy at ", prizeStrategyUpkeep.address)

    if(upkeepNeeded){
        // fire first performUpkeep()
        dim(`Sending performUpkeep 1`)
        const unsignedTx1 = await prizeStrategyUpkeep.populateTransaction.performUpkeep([])    
        const gasLimit1 = ((await prizeStrategyUpkeep.estimateGas.performUpkeep([])).toNumber() * 2) 
        const gasPrice1 = ((await prizeStrategyUpkeep.gasPrice1.performUpkeep([])).toNumber())
        console.log(`performUpkeep(). Gas limit: ${gasLimit1.toString()}`)
        await relayer.sendTransaction({
          to: unsignedTx1.to,
          data: unsignedTx1.data,
          gasLimit1,
          gasPrice1
        })

        dim(`Sending performUpkeep 2`)
        const unsignedTx = await prizeStrategyUpkeep.populateTransaction.performUpkeep([])    
        const gasLimit = ((await prizeStrategyUpkeep.estimateGas.performUpkeep([])).toNumber() * 2) 
        const gasPrice = ((await prizeStrategyUpkeep.gasPrice.performUpkeep([])).toNumber() * 2) // double the gasPrice vs first tx
        console.log(`performUpkeep(). Gas limit: ${gasLimit.toString()}`)
        await relayer.sendTransaction({
          to: unsignedTx.to,
          data: unsignedTx.data,
          gasLimit,
          gasPrice
        })

    }

}




async function run(){
    while(true){
        await fireTwoTransactions()
    }
}

run()
