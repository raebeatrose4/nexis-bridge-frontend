import React from 'react';
import { Button } from '@chakra-ui/react';

function Navbar(props) {
  return (
    <div style={{display:'flex'}}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
      <div style={{ order: 1 }}>
        <img src="/nexis.png" alt="" className='nexis-logo' />
      </div>
    
    </div>
    <div style={{
      position:'absolute',
      right:'10px',
      top:'20px'
    }}>
    <Button onClick={props.connectToMetaMask} > {props.connectedWallet?? "Connect Wallet"} </Button>
    </div>
    </div>
  )
}

export default Navbar;
