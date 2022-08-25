module.exports.onRpcRequest = async ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
        resolve('1888')
        },1000)
      })
      
    default:
      throw new Error('Method not found.');
  }
};
