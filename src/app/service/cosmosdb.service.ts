import { Injectable } from '@angular/core';
import { CosmosClient } from '@azure/cosmos';

@Injectable({
  providedIn: 'root'
})
export class CosmosdbService {

  constructor() { }
}

const endpoint = 'https://innormaxcustomerportal.documents.azure.com/';
const key = 'MJM0z6877dUeOslE4MY0feJ7VzcSEYykZw4NxN3pJMM2yAP7Jsnd24yZ77qnVSOdO3xKvmBUHfVJGRahktVJ9Q==';

const client = new CosmosClient({ endpoint, key });


export async function publishToCosmosDB(order:any) {
  const databaseId = 'SONA';
  const containerId = 'DataContainer';
  const database = client.database(databaseId);
  const container = database.container(containerId);
  order.type = 'order_log';
  //console.log("esta es la orden para cosmos")
  //console.log(order)
  
  try {
    const { resource } = await container.items.create(order);
    //console.log('Documento creado:', resource);
    //console.log(resource.id)
    return resource.id;
  } catch (error) {
    console.error('Error create document:', error);
    return null;
  }
}

export async function PublishToCosmosDB(order:any, type: string) {
  const databaseId = 'SONA';
  const containerId = 'DataContainer';
  const database = client.database(databaseId);
  const container = database.container(containerId);
  order.type = type;
  delete order.id;
  //console.log(order)
  
  try {
    //console.log('Se debe crear el documento:');
    const { resource } = await container.items.create(order);
    //console.log('Documento creado:', resource);
    //console.log(resource.id)
    return resource.id;
  } catch (error) {
    console.error('Error create document:', error);
    return null;
  }
}



export async function editToCosmosDB(order:any) {
  const databaseId = 'SONA';
  const containerId = 'DataContainer';
  const database = client.database(databaseId);
  const container = database.container(containerId);
  order.type = 'order_log';
  //console.log('estoy editando en cosmos')
  //console.log(order.id)

  try {
    const { resource } = await container.item(order.id.toString(), order.type).replace(order);
    //console.log('Documento creado:', resource);
  } catch (error) {
    console.error('Error edit document:', error);
  }
}

export async function EditToCosmosDB(order:any, type:string) {
  const databaseId = 'SONA';
  const containerId = 'DataContainer';
  const database = client.database(databaseId);
  const container = database.container(containerId);
  order.type = type;
  //console.log('estoy editando en cosmos')
  //console.log(order)

  try {
    const { resource } = await container.item(order.id, type).replace(order);
    //console.log('Documento editado:', resource);
    return true;
  } catch (error) {
    console.error('Error edit document:', error);
    return false;
  }
}

export async function getFromCosmosDBByIndexId(idIndex: number, type: string) {
  const databaseId = 'SONA';
  const containerId = 'DataContainer';
  const database = client.database(databaseId);
  const container = database.container(containerId);

  try {

    const querySpec = 'SELECT * FROM c WHERE c.IdIndex = '+ idIndex +' AND c.type = \''+type+'\''

    const { resources } = await container.items.query(querySpec).fetchAll();
    
    if (resources && resources.length > 0) {
      const orderFind = resources[0];
      //console.log('Documento encontrado:', orderFind);
      return orderFind;
    } else {
      return null; 
    }
  } catch (error) {
    console.error('Error get the document:', error);
    throw error; 
  }
}

export async function getFromCosmosDBByDocNum(docNum: any, type: string) {
  const databaseId = 'SONA';
  const containerId = 'DataContainer';
  const database = client.database(databaseId);
  const container = database.container(containerId);

  try {

    const querySpec = 'SELECT * FROM c WHERE c.DocNum = '+  docNum  +' AND c.type = \''+type+'\''
    //console.log(querySpec);
    const { resources } = await container.items.query(querySpec).fetchAll();
    
    if(resources == null)
      return null;

    if (resources && resources.length > 0) {
      const orderFind = resources[0];
      //console.log('Documento encontrado:', orderFind);
      return orderFind;
    } else {
      return null; 
    }
  } catch (error) {
    console.error('Error get the document:', error);
    throw error; 
  }
}

export async function getTradeshowLogs() {
  const databaseId = 'SONA';
  const containerId = 'DataContainer';
  const database = client.database(databaseId);
  const container = database.container(containerId);

  try {
    const querySpec = 'SELECT * FROM c WHERE c.type = \'tradeshow_log\'';
    const { resources } = await container.items.query(querySpec).fetchAll();

    if (!resources) {
      return [];
    }
    return resources;
  } catch(error) {
    console.error('Error getting tradeshow logs', error);
    return [];
  }
}


export async function searchTradeshowLog(tradeshow:any) {
  const databaseId = 'SONA';
  const containerId = 'DataContainer';
  const database = client.database(databaseId);
  const container = database.container(containerId);

  try {
    console.log(tradeshow)
    const querySpec = 'SELECT * FROM c WHERE c.type = \'tradeshow_log\' AND c.name = \''+ tradeshow.name + '\'';
    const { resources } = await container.items.query(querySpec).fetchAll();

    if (!resources) {
      return [];
    }
    return resources;
  } catch(error) {
    console.error('Error getting tradeshow logs', error);
    return [];
  }
}

export async function publishTradeshowToCosmosDB(tradeshow: any): Promise<void> {
  const databaseId = 'SONA';
  const containerId = 'DataContainer';
  const database = client.database(databaseId);
  const container = database.container(containerId);
  try {
    const tradeshowFound = await searchTradeshowLog(tradeshow);
    //console.log(tradeshowFound)
    if(tradeshowFound.length > 0)
      console.log('Tradeshow Found')
    else
    {
      tradeshow.type = 'tradeshow_log';
      const { resource } = await container.items.create(tradeshow);
      console.log('Tradeshow published to Cosmos DB:', resource);
    }
  } catch (error) {
    console.error('Error publishing tradeshow to Cosmos DB:', error);
  }
  
}

