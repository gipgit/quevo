// components/landing/SectionFaqs.jsx
'use client'; // Needs client-side interactivity for accordion functionality

import { useState } from 'react';

export default function SectionFaqs() {
    // State to keep track of which accordion item is currently open.
    // We'll store the index of the open item. -1 means no item is open.
    const [openItemIndex, setOpenItemIndex] = useState(-1);

    // Data for your FAQ items. This makes the component more reusable.
    const faqItems = [
        {
            question: "Come posso creare un account?",
            answer: "Puoi creare il tuo account cliccando sul link \"Crea il tuo account\" nella sezione principale o visitando la pagina di registrazione."
        },
        {
            question: "Queva è gratuito?",
            answer: "Sì, offriamo un piano gratuito che ti permette di provare le funzionalità base. Puoi anche provare Queva Premium gratuitamente per un mese senza impegno."
        },
        {
            question: "Come funziona il sistema di punti e premi?",
            answer: "I tuoi clienti guadagnano punti ogni volta che visitano il tuo locale e scannerizzano il loro QR personale. Tu puoi definire i premi che possono riscattare una volta raggiunti determinati punti."
        },
        {
            question: "Posso gestire il menu digitale dal mio cellulare?",
            answer: "Assolutamente sì! Il tuo menu digitale è completamente personalizzabile e può essere gestito comodamente dal tuo cellulare o tablet, aggiornando in tempo reale per i tuoi clienti."
        },
        {
            question: "Offrite supporto per la creazione del profilo?",
            answer: "Certo! Se hai bisogno di aiuto, possiamo creare il tuo profilo, caricare il menu e impostare le promozioni iniziali per te. Offriamo anche formazione per assicurarti di essere autonomo nella gestione."
        },
    ];

    const toggleAccordion = (index) => {
        // If the clicked item is already open, close it.
        // Otherwise, open the clicked item.
        setOpenItemIndex(prevIndex => (prevIndex === index ? -1 : index));
    };

    return (
        <section className="container-x-md py-8 lg:py-8">
            <p className="font-bold text-lg lg:text-lg mb-8 leading-none">Alcune domande e risposte</p>
            <div className="accordion-container">
                {faqItems.map((item, index) => (
                    <div className="accordion-item" key={index}>
                        <button
                            className={`accordion-header ${openItemIndex === index ? 'active' : ''}`}
                            onClick={() => toggleAccordion(index)}
                            aria-expanded={openItemIndex === index ? "true" : "false"}
                        >
                            <p className="text-sm md:text-md">{item.question}</p>
                            <span className="accordion-icon">{openItemIndex === index ? '−' : '+'}</span>
                        </button>
                        {/* Conditionally render content or apply height for animation */}
                        <div
                            className="accordion-content"
                            style={{
                                maxHeight: openItemIndex === index ? '500px' : '0', // Adjust max-height as needed for content
                                opacity: openItemIndex === index ? '1' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
                            }}
                        >
                            <p>{item.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}