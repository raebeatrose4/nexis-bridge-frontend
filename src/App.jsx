import React, { useEffect, useState } from 'react';
import "./App.css"
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Button, Heading,Input,Text ,Select} from '@chakra-ui/react';
import { useToast } from "@chakra-ui/react";
import { ethers } from 'ethers';
import { useNexisBridge } from './hooks/useNexisBridge';
import { parseEther } from 'ethers/lib/utils';
import chainConfig from "./contract/NexisBridgeConfig.json"

function App() {
  const toast = useToast();
  const [fromNw,setFromNw] = useState('nexis-testnet')
  const [toNw,setToNw] = useState('fantom-testnet')
  const [connectedWallet,setConnectedWallet] = useState();
  const [signer,setSigner] = useState();
  const [provider,setProvider] = useState();
  const [userFromBalance,setUserFromBalance] = useState();
  const [userToBalance,setUserToBalance] = useState();
  const [inputAmount,setInputAmount] = useState();

  const [nexisBridge,nexisBridgeRecipient] = useNexisBridge(signer,fromNw,toNw);

  async function connectToMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setConnectedWallet(await signer.getAddress());
        setSigner(signer);
        setProvider(provider);
        console.log(await signer.getAddress())
        return { signer, provider };
      } catch (error) {

        console.error('Error connecting to MetaMask:', error);
        return null;
      }
    } else {
      console.error('MetaMask not detected.');
      return null;
    }
  }
  
    async function changeNetwork(fromNetwork) {
      if (provider && window.ethereum) {
        try {
          console.log(fromNetwork)
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: "0x"+(chainConfig[fromNetwork].chainId).toString(16) }],
          });
          await connectToMetaMask();
        } catch (error) {
          if (error.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: "0x"+chainConfig[fromNetwork].chainId.toString(16),
                  chainName: chainConfig[fromNetwork].chainName,
                  nativeCurrency: {
                    name: chainConfig[fromNetwork].nativeCurrency.name,
                    symbol: chainConfig[fromNetwork].nativeCurrency.symbol,
                    decimals: chainConfig[fromNetwork].nativeCurrency.decimals,
                  },
                  rpcUrls: [chainConfig[fromNetwork].rpc]
                }],
              });
              // Retry switching network after adding it
              await switchNetwork();
            } catch (addChainError) {
              console.error('Error adding chain:', addChainError);
            }
          } else {
            console.error('Error switching network:', error);
          }
        }
      }
      setFromNw(fromNetwork);
      getBalanceOnSelectedNetwork();
    }    

  const getBalanceOnSelectedNetwork = async()=>{
    try {
      if(signer){
        const balFrom = await nexisBridge.balanceOf(connectedWallet);
        const balanceFromInEther = ethers.utils.formatUnits(balFrom.toString(), 'ether');
        setUserFromBalance(balanceFromInEther)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const getToBalanceOnSelectedNetwork = async()=>{
    try {
      if(signer){
        const balTo = await nexisBridgeRecipient.balanceOf(connectedWallet);
        const balanceToInEther = ethers.utils.formatUnits(balTo.toString(), 'ether');
        setUserToBalance(balanceToInEther)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    getBalanceOnSelectedNetwork();
    getToBalanceOnSelectedNetwork();
  },[fromNw,toNw,signer,connectedWallet])

  const addNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x942',
          chainName: 'Nexis Network Testnet',
          nativeCurrency: {
            name: 'Nexis',
            symbol: 'NZT',
            decimals: 18,
          },
          rpcUrls: ['https://evm-testnet.nexis.network'],
          blockExplorerUrls: ['https://evm-testnet.nexscan.io/'], 
        }],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const bridge =async()=>{
    if(nexisBridge){
      await (await nexisBridge.approve(connectedWallet,parseEther(inputAmount))).wait();
      await (await nexisBridge.bridge(chainConfig[toNw].chainId,connectedWallet,parseEther(inputAmount))).wait();
      await getBalanceOnSelectedNetwork()
    }
  }


  return (
    <div className='app-container'>
      <Navbar connectToMetaMask={connectToMetaMask} connectedWallet={connectedWallet}/>
        <div style={{ display: 'flex',flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }} className='glassmorph'>
        <Heading as='h2' size='xl' style={{ borderBottom: '2px solid #ccc' }}>
          
        Nexis <span style={{ backgroundColor: 'black',color:'white',padding:'2px' }}>Bridge</span>
      </Heading>

<div style={{
  display:"flex",
  alignItems:'center',
  width:'50vw',
  height: '10vh'
}}>
<Input bgColor={'white'} maxW={'md'} my={'12'} flex={6} py={2} type='number' value={inputAmount} onChange={(e)=>setInputAmount(e.target.value)} />
<Select placeholder='Select option' bgColor={'white'} flex={1} onChange={(e)=>changeNetwork(e.target.value)} value={fromNw}>
  <option value='nexis-testnet'>Nexis Testnet</option>
  <option value='fantom-testnet'>Fantom Testnet</option>
</Select>
</div>
<Text >
Balance: {userFromBalance}
</Text>

<div style={{
  display:"flex",
  alignItems:'center',
  width:'50vw',
  height: '10vh'
}}>
  <Text>To: </Text>
<Select placeholder='Select option' bgColor={'white'} flex={1} onChange={(e)=>setToNw(e.target.value)} value={toNw}>
  <option value='nexis-testnet'>Nexis Testnet</option>
  <option value='fantom-testnet'>Fantom Testnet</option>
</Select>
</div>
Balance: {userToBalance}
      <Button my={12} onClick={bridge} >Bridge</Button>
        </div>
      <Footer addNetwork={addNetwork} />
    </div>
  );
}

export default App;
