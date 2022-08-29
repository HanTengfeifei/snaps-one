// import * as Web3MQ from 'mq-web3'
export const onRpcRequest = async ({ origin, request }) => {
  switch (request.method) {
    case 'web3-mq':
      return new Promise((resolve,reject)=>{
        resolve(
          'Web3MQ'
          )
      })
      
    default:
      throw new Error('Method not found.');
  }
};
