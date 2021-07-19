import {SiteClient} from 'datocms-client';

export default  async  function  recebedorDeRequests (request, response)  {

    if( request.method === 'POST'){
        const TOKEN = "ffacabb0d757eaf355bc3b0318c8c8";
        const client = new SiteClient(TOKEN);
        const registroCriado = await client.items.create({
            itemType: "976015", //ID do model de "Communities" criado pelo Dato
            ...request.body
        });

        response.json({
            dados: "algum dado qualquer",
            registroCriado: registroCriado
        });
        return;
    }

    response.status(404).json(({
        message: "Ainda não temos nada no GET, mas no POST tem!"
    }));
}