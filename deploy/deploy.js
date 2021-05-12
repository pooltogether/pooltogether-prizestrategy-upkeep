const chalk = require('chalk');
const { getChainId } = require('hardhat');

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}


module.exports = async (hardhat) => {

    console.log("running deploy script")

    console.log("network id ", await getChainId())

    const { getNamedAccounts, deployments, ethers } = hardhat
    const { deploy } = deployments
    const { deployer, prizePoolRegistry } = await getNamedAccounts()
    const namedSigners = await ethers.getNamedSigners()
    const deployerSigner = namedSigners.deployer

    const batchSize = 3
    const blockInterval = 10;

    dim(`deploying PrizeStrategyUpkeep contract from ${deployer}`)
    console.log("prizePoolRegistry at ", prizePoolRegistry)

    const prizePoolUpkeep = await deploy('PrizeStrategyUpkeep', {
      args: [prizePoolRegistry, batchSize, blockInterval],
      from: deployer,
      skipIfAlreadyDeployed: false
    })
    green(`Deployed PrizeStrategyUpkeep: ${prizePoolUpkeep.address}`)
  
}