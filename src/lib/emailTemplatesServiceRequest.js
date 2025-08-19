// src/lib/emailTemplatesServiceRequest.js

export const businessServiceRequestConfirmationEmail = `<!DOCTYPE html>
<html>
<head>
    <title>Nuova Richiesta Servizio Ricevuta</title>
    <style>
        /* --- Resets --- */
        *{
            box-sizing: border-box;
        }
        body, p, h1, h2, h3, h4, h5, h6 {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f4f4;
            color: #333333;
            font-size: 14px;
            line-height: 1.4;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        a {
            color: #2f14ff;
            text-decoration: none;
        }
    </style>
</head>
<body style="line-height: 1.4;">
    <div class="email-container" style="margin: 0 auto; padding: 35px 15px; text-align: center;">
        <div style="margin-bottom: 20px;">
            <img src="{{business_profile_image}}" alt="{{business_name}}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: block; margin: 0 auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="width: 70px; height: 70px; border-radius: 50%; background-color: #f0f0f0; border: 3px solid #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: none; margin: 0 auto; text-align: center; line-height: 80px; font-size: 24px; color: #666; font-weight: bold;">{{business_name_initial}}</div>
        </div>
        <p style="font-size: 16px; margin-bottom: 10px; line-height: 1.2;">{{business_name}}</p>
        <p style="margin-bottom: 20px; font-size: 16px;">Hai ricevuto una nuova richiesta servizio!</p>
        <div style="margin: 0 auto; max-width: 580px; background-color: #ffffff; border: 1px solid gray; padding: 30px 20px; border-radius: 25px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <ul style="list-style: none; padding-left: 0; margin-left: 0;">
                <li style="font-size: 16px;">{{service_name}} ({{price_subtotal}})</li>
                <li style="font-size: 11px;">N. Richiesta: {{request_reference}}</li>
                <li style="font-size: 11px;">Data Richiesta: {{request_date}}</li>
            </ul>
            <p style="margin-top: 20px;"><strong>Cliente:</strong></p>
            <ul style="list-style: none; padding-left: 0; margin-left: 0;">
                <li style="font-size: 14px;">Nome: {{customer_name}}</li>
                <li style="font-size: 12px;">Email: {{customer_email}}</li>
                <li style="font-size: 12px;">Telefono: {{customer_phone}}</li>
                <li style="font-size: 11px;">Note Cliente: {{customer_notes}}</li>
            </ul>
            <p style="margin-top: 20px">Puoi gestire questa richiesta qui:</p>
            <a href="{{manage_request_link}}" style=" display: inline-block; padding: 12px 25px; border: 1px solid #fff; background-color: #0d0d0e; color: white; font-size: 14px; border-radius: 25px; text-decoration: none; margin-top: 10px; margin-bottom: 10px;">Gestisci Richiesta</a>
        </div>
        <p style="margin-top: 20px">Grazie, il team di Quevo</p>
    </div>
</body>
</html>`;

export const customerServiceRequestConfirmationEmail = `<!DOCTYPE html>
<html>
<head>
    <title>Conferma Richiesta Servizio</title>
    <style>
        /* --- Resets --- */
        *{
            box-sizing: border-box;
        }
        body, p, h1, h2, h3, h4, h5, h6 {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f4f4;
            color: #333333;
            font-size: 14px;
            line-height: 1.4;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        a {
            color: #2f14ff;
            text-decoration: none;
        }
    </style>
</head>
<body style="line-height: 1.4;">
    <div class="email-container" style="margin: 0 auto; padding: 35px 15px; text-align: center;">
        <div style="margin-bottom: 20px;">
            <img src="{{business_profile_image}}" alt="{{business_name}}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: block; margin: 0 auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="width: 70px; height: 70px; border-radius: 50%; background-color: #f0f0f0; border: 3px solid #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: none; margin: 0 auto; text-align: center; line-height: 80px; font-size: 24px; color: #666; font-weight: bold;">{{business_name_initial}}</div>
        </div>
        <p style="font-size: 18px; margin-bottom: 10px; line-height: 1.2;">Grazie, {{customer_name}}!</p>
        <p style="font-size: 15px; margin-bottom: 20px;">Ecco il link per controllare tutto ciò che riguarda la tua richiesta.</p>
        <div style="margin: 0 auto; max-width: 580px; background-color: #ffffff; border: 1px solid gray; padding: 30px 20px; border-radius: 25px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <ul style="list-style: none; padding-left: 0; margin-left: 0;">
                <li style="font-size: 18px;">{{service_name}}</li>
                <li style="font-size: 18px; font-weight: bold;">{{customer_name}}</li>
                <li style="font-size: 11px;">N. Richiesta: {{request_reference}}</li>
            </ul>
            <a href="{{request_link}}" style=" display: inline-block; padding: 12px 25px; border: 1px solid #fff; background-color: #0d0d0e; color: white; font-size: 13px; border-radius: 25px; text-decoration: none; margin-top: 10px; margin-bottom: 10px;">Apri Richiesta</a>
        </div>
        <p style="margin-top: 20px font-size: 13px; margin-bottom: 10px; line-height: 1.1;">In questo unico link personale potrai: consultare lo stato della tua richiesta, confermare e consultare appuntamenti, vedere pagamenti da fare, scaricare documenti e trovare altre risorse utili per il servizio.</p>
        <p style="margin-top: 10px font-size: 11px; margin-bottom: 20px;">Per qualsiasi domanda, non esitare a contattarci.</p>
        <p style="margin-top: 10px; font-size: 12px;">Grazie,<br/>Il Team di {{business_name}}</p>
    </div>
</body>
</html>`;

export const customerServiceRequestMessageEmail = `<!DOCTYPE html>
<html>
<head>
    <title>Nuovo Messaggio per la Tua Richiesta Servizio</title>
    <style>
        /* --- Resets --- */
        *{
            box-sizing: border-box;
        }
        body, p, h1, h2, h3, h4, h5, h6 {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f4f4;
            color: #333333;
            font-size: 14px;
            line-height: 1.4;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        a {
            color: #2f14ff;
            text-decoration: none;
        }
    </style>
</head>
<body style="line-height: 1.4;">
    <div class="email-container" style="margin: 0 auto; padding: 35px 15px; text-align: center;">
        <h1 style="margin-bottom: 15px; line-height: 1.2;">Hai un nuovo messaggio per la tua richiesta servizio!</h1>
        <p style="margin-bottom: 10px;">Ciao {{customer_name}},</p>
        <p style="margin-bottom: 20px;">Il team di <strong>{{business_name}}</strong> ti ha inviato un messaggio relativo alla tua richiesta servizio <strong>{{request_reference}}</strong>.</p>

        <div class="email-body" style="margin: 0 auto; max-width: 580px; background-color: #ffffff; padding: 35px 20px; border-radius: 15px; box-shadow: 0 1px 5px #e3e3e3; margin-bottom: 20px;">
            <p style="text-align: center;"><strong>Messaggio:</strong></p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 10px; text-align: left;">
                <p style="font-style: italic; color: #555;">"{{message_text}}"</p>
            </div>
            <p style="font-size: 12px; color: #777; margin-top: 5px; text-align: center;">Inviato il: {{message_sent_at}}</p>

            <p style="margin-top: 30px;"><strong>Dettagli Richiesta:</strong></p>
            <ul style="list-style: none; padding-left: 0; margin-left: 0; text-align: center;">
                <li><strong>N. Richiesta:</strong> {{request_reference}}</li>
                <li><strong>Servizio:</strong> {{service_name}}</li>
                <li><strong>Data:</strong> {{request_date}}</li>
                <li><strong>Prezzo:</strong> {{price_subtotal}}</li>
                <li><strong>Note Cliente:</strong> {{customer_notes}}</li>
            </ul>

            <p style="margin-top: 20px">Puoi visualizzare tutti i messaggi e i dettagli completi della tua richiesta servizio cliccando qui:</p>
            <a href="{{request_link}}" style="display: inline-block; padding: 15px 35px; border: 1px solid #fff; background-color: #0d0d0e; color: white; font-size: 14px; border-radius: 25px; text-decoration: none; margin-top: 10px; margin-bottom: 10px;">Visualizza Richiesta</a>
        </div>
        <p style="margin-top: 20px">Se hai domande o necessiti di assistenza, non esitare a contattarci.</p>
        <p style="margin-top: 10px;">Grazie,<br/>Il Team di {{business_name}}</p>
    </div>
</body>
</html>`;

export const customerServiceRequestStatusUpdateEmail = `<!DOCTYPE html>
<html>
<head>
    <title>Aggiornamento Stato Richiesta Servizio</title>
    <style>
        /* --- Resets --- */
        *{
            box-sizing: border-box;
        }
        body, p, h1, h2, h3, h4, h5, h6 {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f4f4;
            color: #333333;
            font-size: 14px;
            line-height: 1.4;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        a {
            color: #2f14ff;
            text-decoration: none;
        }
    </style>
</head>
<body style="line-height: 1.4;">
    <div class="email-container" style="margin: 0 auto; padding: 35px 15px; text-align: center;">
        <h1 style="margin-bottom: 10px; line-height: 1.2;">Richiesta Servizio {{new_status}}</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">Ciao {{customer_name}}, la tua richiesta servizio per <strong>{{service_name}}</strong> presso <strong>{{business_name}}</strong> è {{new_status}}.</p>
        <div class="email-body" style="margin: 0 auto; max-width: 580px; background-color: #ffffff; padding: 35px 20px; border-radius: 15px; box-shadow: 0 1px 5px #e3e3e3; margin-bottom: 20px;">
            <p style="font-size: 14px;"><strong>Dettagli Richiesta:</strong></p>
            <ul style="list-style: none; padding-left: 0; margin-left: 0;">
                <li><strong>N. Richiesta:</strong> {{request_reference}}</li>
                <li><strong>Servizio:</strong> {{service_name}}</li>
                <li><strong>Data:</strong> {{request_date}}</li>
            </ul>
            <p style="margin-top: 20px">Puoi visualizzare i dettagli completi e lo stato aggiornato della tua richiesta servizio qui:</p>
            <a href="{{request_link}}" style="display: inline-block; padding: 15px 35px; border: 1px solid #fff; background-color: #0d0d0e; color: white; font-size: 14px; border-radius: 25px; text-decoration: none; margin-top: 10px; margin-bottom: 10px;">Visualizza Richiesta</a>
        </div>
        <p style="margin-top: 20px">Se hai domande o necessiti di assistenza, non esitare a contattarci.</p>
        <p style="margin-top: 10px;">Grazie,<br/>Il Team di {{business_name}}</p>
    </div>
</body>
</html>`; 