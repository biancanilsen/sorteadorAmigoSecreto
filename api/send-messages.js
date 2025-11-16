// Usa a sintaxe 'require' pois é um ambiente Node.js
const fetch = require('node-fetch');

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Pega os dados enviados pelo React
    const { pairs } = request.body;

    const { WHATSAPP_TOKEN, WHATSAPP_PHONE_ID } = process.env;

    const TEMPLATE_NAME = 'amigo_secreto'; 

    const API_URL = `https://graph.facebook.com/v15.0/${WHATSAPP_PHONE_ID}/messages`;

    // Usa Promise.allSettled para tentar enviar todas as mensagens
    const results = await Promise.allSettled(
        pairs.map(pair => {
            const payload = {
                messaging_product: 'whatsapp',
                to: pair.gifterPhone,
                type: 'template',
                template: {
                    name: TEMPLATE_NAME,
                    language: { code: 'pt_BR' },
                    components: [
                        {
                            // COMPONENTE DE CABEÇALHO (IMAGEM)
                            type: 'header',
                            parameters: [
                                {
                                    type: 'image',
                                    image: {
                                        // Hospedar uma imagem de Natal em algum lugar
                                        // (ex: Imgur, S3, ou no próprio Vercel)
                                        link: 'https://i.imgur.com/URL-DA-SUA-IMAGEM.jpg'
                                    }
                                }
                            ]
                        },
                        {
                            // COMPONENTE DE CORPO (TEXTO)
                            type: 'body',
                            parameters: [
                                { type: 'text', text: pair.gifterName },     // {{1}} -> nomeDestinatario
                                { type: 'text', text: pair.gifteeName },     // {{2}} -> nomePesssoaSorteada
                                { type: 'text', text: pair.giftValue },      // {{3}} -> valorPresente
                                { type: 'text', text: pair.eventDate },      // {{4}} -> dataEvento
                                { type: 'text', text: pair.eventAddress }    // {{5}} -> EnderecoEvento
                            ]
                        }
                    ]
                }
            };

            return fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                },
                body: JSON.stringify(payload),
            });
        })
    );

    // Verifica os resultados
    const failedMessages = results.filter(r => r.status === 'rejected' || !r.value.ok);

    if (failedMessages.length > 0) {
        console.error('Falhas ao enviar:', failedMessages);
        return response.status(500).json({ error: 'Algumas mensagens falharam ao enviar.' });
    }

    return response.status(200).json({ success: true, message: 'Todas as mensagens enviadas.' });
}