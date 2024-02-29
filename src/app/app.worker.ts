/// <reference lib="webworker" />

import { BPAddresses, BusinessPartner } from '../app/models/customer';
import { INResponse } from '../app/models/INResponse';
import { DocumentLines, Order } from '../app/models/car';

addEventListener('message', async (event: MessageEvent) => {
  // const response = `worker response to ${data}`;
  // postMessage(response);
  const messageData = event.data.type;
  //console.log(event.data.order)
  //console.log(event.data.tokenAzure)
  const myappurlcosmos = "https://functionhandlecosmosdb.azurewebsites.net/"; 
  const myappurlsap = "https://orderpadfunctions.azurewebsites.net/";
  const myappurlcetos = "https://sonafunctions01.azurewebsites.net/";

  const myapiurl = "api/"

  if (messageData === 'customers') {
    try {
      const response = await fetch(myappurlcetos + myapiurl + 'SearchBusinessPartners',{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${event.data.tokenAzure}`
        },
      }); 
      const data = await response.json();
      const responseIn: INResponse = data;
      const customers: BusinessPartner[] = JSON.parse(responseIn.response!);
      //console.log(customers)
      self.postMessage( responseIn);
    } catch (error) {
      self.postMessage({ error: error });
    }
  }
  else if (messageData === 'items') {
    try {
      const response = await fetch(myappurlcetos + myapiurl + 'RetrieveItems',{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${event.data.tokenAzure}`
        },
      }); 
      const data = await response.json();
      const responseIn: INResponse = data;
      self.postMessage( responseIn);
    } catch (error) {
      self.postMessage({ error: error });
    }
  }
  else if(messageData === 'postOrder')
  {
    try {
      // console.log('pasa la orden en app.worker')
      // console.log(event.data.order)
      const response  = await fetch(myappurlcetos + myapiurl + 'CreateSalesOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${event.data.tokenAzure}`
        },
        body: JSON.stringify(event.data.order),
      });
      const data = await response.json();
      //console.log('este es mi resultado')
      //console.log(data)
      const responseIn: INResponse = data;
      ///const order: Order[] = JSON.parse(responseIn.response!);
      //console.log(order)
      self.postMessage(responseIn);
    } catch (error) {
      self.postMessage({ error: error });
    }
  }
  else if(messageData === 'editOrder')
  {
    try {
      // console.log('pasa la orden en app.worker')
      // console.log(event.data.order)
      const response  = await fetch(myappurlcetos + myapiurl + 'UpdateHeaderOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${event.data.tokenAzure}` 
        },
        body: JSON.stringify(event.data.order),
      });
      const data = await response.json();
      //console.log('este es mi resultado')
      //console.log(data)
      const responseIn: INResponse = data;
      ///const order: Order[] = JSON.parse(responseIn.response!);
      //console.log(order)
      self.postMessage(responseIn);
    } catch (error) {
      self.postMessage({ error: error });
    }
  }
});
