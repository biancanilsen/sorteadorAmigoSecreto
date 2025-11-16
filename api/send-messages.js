export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Pega os dados enviados pelo React
    const { pairs } = request.body;

    const { WHATSAPP_TOKEN, WHATSAPP_PHONE_ID } = process.env;

    const TEMPLATE_NAME = 'hello_world'; 

    // --- MUDANÇA 2 ---
    // Corrigindo a URL que estava dentro de uma busca do Google
    const API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

    // Usa Promise.allSettled para tentar enviar todas as mensagens
    const results = await Promise.allSettled(
        pairs.map(pair => {
            
            // --- MUDANÇA 3 ---
            // Este é o payload para o template 'hello_world'
            // Note que ele é muito mais simples!
            const payload = {
                messaging_product: 'whatsapp',
                to: pair.gifterPhone,
                type: 'template',
                template: {
                    name: TEMPLATE_NAME,
                    // --- MUDANÇA 4 ---
                    // O idioma do seu template 'hello_world' é 'en_US'
                    language: { code: 'en_US' },
                    
                    // --- MUDANÇA 5 ---
                    // Como este template não tem variáveis,
                    // o array de componentes fica vazio.
                    components: []
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
        // Tente olhar os logs da Vercel para ver o 'failedMessages'
        console.error('Falhas ao enviar:', failedMessages);
        return response.status(500).json({ error: 'Algumas mensagens falharam ao enviar.' });
    }

    return response.status(200).json({ success: true, message: 'Todas as mensagens enviadas.' });
}