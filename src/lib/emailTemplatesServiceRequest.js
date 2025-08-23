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
    <div class="email-container" style="margin: 0 auto; padding: 35px 10px; text-align: center;">
        <div style="margin-bottom: 20px;">
            <img src="{{business_profile_image}}" alt="" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="width: 70px; height: 70px; border-radius: 50%; background-color: #f0f0f0; border: 3px solid #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: none; margin: 0 auto; text-align: center; line-height: 80px; font-size: 24px; color: #666; font-weight: bold;">{{business_name_initial}}</div>
        </div>
        <p style="font-size: 16px; margin-bottom: 10px; line-height: 1.2;">{{business_name}}</p>
        <p style="margin-bottom: 20px; font-size: 16px;">Hai ricevuto una nuova richiesta servizio!</p>
        <div style="margin: 0 auto; max-width: 550px; background-color: #ffffff; border: 1px solid gray; padding: 30px 20px; border-radius: 35px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px;">
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
            <a href="{{manage_request_link}}" style=" display: inline-block; padding: 12px 25px; border: 1px solid #fff; background-color: #0d0d0e; color: white; font-size: 13px; border-radius: 25px; text-decoration: none; margin-top: 10px; margin-bottom: 10px;">Gestisci Richiesta</a>
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
    <div class="email-container" style="max-width: 800px; margin: 0 auto; padding: 35px 10px; text-align: center;">
        <div style="margin-bottom: 20px;">
            <img src="{{business_profile_image}}" alt="" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="width: 70px; height: 70px; border-radius: 50%; background-color: #f0f0f0; border: 3px solid #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: none; margin: 0 auto; text-align: center; line-height: 80px; font-size: 24px; color: #666; font-weight: bold;">{{business_name_initial}}</div>
        </div>
        <p style="font-size: 18px; margin-bottom: 10px; line-height: 1.2;">Grazie, {{customer_name}}!</p>
        <p style="font-size: 15px; margin-bottom: 20px;">Ecco il link per controllare tutto ciò che riguarda la tua richiesta.</p>
        <div style="margin: 0 auto; max-width: 550px; background-color: #ffffff; border: 1px solid gray; padding: 30px 20px; border-radius: 35px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px;">
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



export const customerActionNotificationEmail = `<!DOCTYPE html>
<html>
<head>
    <title>Nuova Azione Richiesta - {{business_name}}</title>
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
        .priority-high {
            background-color: #ffebee;
            border-top: 4px solid #f44336!important;
        }
        .priority-medium {
            background-color: #fff3e0;
            border-top: 4px solid #ff9800!important;
        }
        .priority-low {
            background-color: #e8f5e8;
            border-top: 4px solid #4caf50!important;
        }
    </style>
</head>
<body style="line-height: 1.4;">
    <div class="email-container" style="margin: 0 auto; padding: 35px 10px; text-align: center;">
        <div style="margin-bottom: 20px;">
            <img src="{{business_profile_image}}" alt="" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="width: 70px; height: 70px; border-radius: 50%; background-color: #f0f0f0; border: 3px solid #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: none; margin: 0 auto; text-align: center; line-height: 80px; font-size: 24px; color: #666; font-weight: bold;">{{business_name_initial}}</div>
        </div>
        <p style="font-size: 18px; margin-bottom: 10px;">Ciao {{customer_name}},</p>
        <p style="font-size: 16px; margin-bottom: 20px;">C'è un aggiornamento in merito al procedimento per <strong>{{service_name}}</strong>.</p>

        <div class="email-body priority-{{action_priority}}" style="margin: 0 auto; max-width: 550px; background-color: #ffffff; border: 1px solid gray; padding: 35px 20px; border-radius: 35px; box-shadow: 0 1px 5px #e3e3e3; margin-bottom: 20px;">
           
            <h2 style="margin-bottom: 10px; color: #333;">{{action_title}}</h2>
            <p style="margin-bottom: 15px; font-size: 14px;">{{action_description}}</p>
            {{#if due_date}}
            <p style="font-size: 12px; color: #666;"><strong>Scadenza:</strong> {{due_date}}</p>
            {{/if}}

            <p style="margin-top: 20px">Può trovare ogni dettaglio, nel suo fascicolo personale:</p>
            <a href="{{request_link}}" style="display: inline-block; padding: 12px 35px; border: 1px solid #fff; background-color: #0d0d0e; color: white; font-size: 13px; border-radius: 25px; text-decoration: none; margin-top: 10px; margin-bottom: 10px;">Visualizza Board</a>
        
            <p style="font-size: 12px; text-align: center;">
                <strong>N. Board:</strong> {{board_ref}} - <strong>Servizio:</strong> {{service_name}}
            </p>
        </div>
        <p style="margin-top: 20px">Se hai domande o necessiti di assistenza, non esitare a contattarci.</p>
        <p style="margin-top: 10px;">Grazie,<br/>Il Team di {{business_name}}</p>
    </div>
</body>
</html>`; 