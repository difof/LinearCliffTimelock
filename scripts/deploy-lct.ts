import { LinearCliffTimelock__factory } from '../typechain'
import { mainDeploy } from './helpers/main'

mainDeploy('LinearCliffTimelock', (signer) =>
    new LinearCliffTimelock__factory(signer).deploy()
)
