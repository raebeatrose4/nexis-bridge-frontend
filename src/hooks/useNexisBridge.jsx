import { Contract, ethers } from "ethers";
import nexisDeployments from "../contract/NexisBridgeConfig.json";
import nexisBridgeAbi from "../contract/NexisBridge.json";

export const useNexisBridge = (signer,network,toNw)=>{
    if(!signer)return [undefined,undefined];
    return [new Contract(nexisDeployments[network].address,nexisBridgeAbi.abi,signer),new Contract(nexisDeployments[toNw].address,nexisBridgeAbi.abi,new ethers.providers.JsonRpcProvider(nexisDeployments[toNw].rpc))];
}