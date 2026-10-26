'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Wrench, ShieldCheck, Truck, FileCheck2 } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Ինչպե՞ս ճիշտ ընտրել ծորակ (Քարթրիջի տեսակ և նյութ):',
    answer:
      'Կարևոր է ուշադրություն դարձնել կորպուսի նյութին. խորհուրդ է տրվում ընտրել հոծ արույրից (Brass CW617N) կամ SUS304 չժանգոտվող պողպատից ծորակներ, որոնք չեն ենթարկվում կոռոզիայի և ունեն բարձր զանգված: Քարթրիջը պետք է լինի եվրոպական արտադրության կերամիկական սկավառակներով (օր.՝ Sedal կամ Kerox), ինչը երաշխավորում է 500,000+ անխափան բացում-փակում:',
    icon: Wrench,
  },
  {
    id: 'faq-2',
    question: 'Ինչպե՞ս է գործում Մելքումովի 40/1 սրահի գործարանային երաշխիքը:',
    answer:
      'tab.am-ի բոլոր ապրանքները գալիս են պաշտոնական կնքված երաշխիքային կտրոնով: Երաշխիքի ժամկետը կախված է կատեգորիայից՝ ծորակներին տրվում է 5-10 տարի, լվացարաններին՝ 5 տարի, իսկ սանկերամիկային՝ մինչև 15 տարի: Խնդիր առաջանալու դեպքում մեր մասնագետը կատարում է զննում կամ փոխարինում անմիջապես սրահի պահեստից:',
    icon: ShieldCheck,
  },
  {
    id: 'faq-3',
    question: 'Ի՞նչ առավելություն ունի թաքնված մոնտաժը (Concealed System) սովորականի նկատմամբ:',
    answer:
      'Թաքնված մոնտաժի դեպքում (i-Box / Concealed box) բոլոր խողովակները և մեխանիզմը գտնվում են սալիկի ետևում, ինչը ապահովում է մաքուր, մինիմալիստական էսթետիկա և հեշտացնում է մաքրությունը: Մեր բոլոր թաքնված համակարգերը հագեցած են բարձր ճնշման հիդրավլիկ բոքսերով, որոնց սպասարկումը կատարվում է դրսից՝ առանց սալիկները վնասելու:',
    icon: HelpCircle,
  },
  {
    id: 'faq-4',
    question: 'Ինչպե՞ս ձևակերպել B2B անկանխիկ հաշիվ-ապրանքագիր (ՀՎՀՀ-ով):',
    answer:
      'Պատվերի ձևակերպման էջում պարզապես նշեք «Գնում կազմակերպության անունից (B2B)» դաշտը և լրացրեք Ձեր ընկերության անվանումն ու ՀՎՀՀ-ն: Մեր հաշվապահությունը 15 րոպեում կձևակերպի էլեկտրոնային հաշիվ-ապրանքագիր (e-Invoicing)   համակարգում:',
    icon: FileCheck2,
  },
  {
    id: 'faq-5',
    question: 'Ինչպե՞ս է իրականացվում առաքումը Երևանում և ՀՀ մարզերում:',
    answer:
      'Երևան քաղաքում 30,000 ֏ և ավելի պատվերների առաքումն անվճար է (կամ FREE պրոմոկոդով), առաքվում է 24 ժամում: Մարզեր առաքումը տևում է 2-3 աշխատանքային օր: Նաև գործում է արագ ինքնարտահանում Մելքումովի 40/1 սրահից՝ պատվիրելուց 15 րոպե անց:',
    icon: Truck,
  },
];

export default function PlumberFaqSection() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="space-y-6 pt-4">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/5 border border-accent/15 text-accent-hover text-xs font-semibold ">
          <Wrench className="w-3.5 h-3.5 text-accent" />
          <span>Մասնագիտական Խորհրդատվություն</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Հաճախ Տրվող Հարցեր և Վարպետի Խորհուրդներ
        </h2>
        <p className="text-xs sm:text-sm text-muted">
          Մելքումովի 40/1 սրահի փորձառու ինժեներների պատասխանները սանտեխնիկայի ընտրության և տեղադրման մասին
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          const Icon = faq.icon;
          return (
            <div
              key={faq.id}
              className="border border-line rounded-panel overflow-hidden bg-white shadow-e1 transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-line/60 transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-control flex items-center justify-center shrink-0 transition-colors ${
 isOpen ? 'bg-accent text-white' : 'bg-canvas text-body'
 }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-ink leading-snug">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
 isOpen ? 'rotate-180 text-accent' : ''
 }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-body leading-relaxed border-t border-canvas bg-canvas">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
