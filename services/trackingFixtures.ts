/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrackedOrderDetails } from '@/types/api';

/**
 * Client-side order-tracking fixtures.
 *
 * AUTO-GENERATED from the reference handler at app/api/v1/orders/track/route.ts
 * (scripts/_gen_tracking_fixtures.mjs) so the Vite SPA can resolve seeded orders
 * without the (currently unreachable) Next.js /api/v1 backend. Armenian copy is
 * reproduced byte-for-byte to stay homoglyph-safe.
 */
export const TRACKING_FIXTURES: Record<string, TrackedOrderDetails> = {
  'TAB-84920': {
      orderId: 'TAB-84920',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      customerName: 'Արմեն Գասպարյան',
      phone: '+374 (95) 53-04-35',
      deliveryMethod: 'showroom_pickup',
      deliveryAddress: 'ք. Երևան, Մելքումովի 40/1 (Խանութ-Սրահ)',
      paymentMethod: 'Idram / Rocket',
      paymentStatus: 'paid',
      currentStatus: 'ready_for_pickup',
      timeline: [
        {
          id: 'step-1',
          title: 'Պատվերը Ստացված է',
          description: 'Պատվերը հաջողությամբ գրանցվել է համակարգում',
          timestamp: 'Այսօր, 14:20',
          isCompleted: true,
          isCurrent: false,
        },
        {
          id: 'step-2',
          title: 'Ամրագրված է Պահեստում',
          description: 'Ապրանքները անցել են ստուգում և ամրագրվել Մելքումովի 40/1 սրահում',
          timestamp: 'Այսօր, 14:25',
          isCompleted: true,
          isCurrent: false,
        },
        {
          id: 'step-3',
          title: 'Պատրաստ է Ստացման',
          description: 'Ձեր պատվերը հավաքված է և սպասում է ձեզ Մելքումովի 40/1 սրահում',
          timestamp: 'Այսօր, 14:35',
          isCompleted: true,
          isCurrent: true,
        },
        {
          id: 'step-4',
          title: 'Հանձնված է Հաճախորդին',
          description: 'Ստացում սրահում կամ առաքում',
          isCompleted: false,
          isCurrent: false,
        },
      ],
      items: [
        {
          id: 1,
          code: '11496',
          title: 'GANZER GZ44012 Խառնիչ լվացարանի',
          image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
          quantity: 1,
          price: 42200,
        },
        {
          id: 2,
          code: '31195',
          title: 'Անձրևանման Ցնցուղի Ճկափող (Shower Hose 1.5m)',
          image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80',
          quantity: 2,
          price: 8500,
        },
      ],
      totalAmount: 59200,
    },
  'TAB-11496': {
      orderId: 'TAB-11496',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      customerName: 'Տիգրան Մարտիրոսյան',
      phone: '+374 (77) 12-34-56',
      deliveryMethod: 'yerevan_delivery',
      deliveryAddress: 'ք. Երևան, Կոմիտասի պող. 38, բն. 14',
      paymentMethod: 'Բանկային Քարտ',
      paymentStatus: 'paid',
      currentStatus: 'in_transit',
      timeline: [
        {
          id: 'step-1',
          title: 'Պատվերը Ստացված է',
          description: 'Պատվերը հաջողությամբ գրանցվել է',
          timestamp: 'Երեկ, 10:15',
          isCompleted: true,
          isCurrent: false,
        },
        {
          id: 'step-2',
          title: 'Մշակված է Բազայում',
          description: 'Պահեստից փաթեթավորվել է',
          timestamp: 'Երեկ, 11:30',
          isCompleted: true,
          isCurrent: false,
        },
        {
          id: 'step-3',
          title: 'Ճանապարհին (Առաքիչի մոտ)',
          description: 'Առաքիչը շարժվում է դեպի Երևանյան նշված հասցե',
          timestamp: 'Այսօր, 09:00',
          isCompleted: true,
          isCurrent: true,
        },
        {
          id: 'step-4',
          title: 'Հանձնված է',
          description: 'Ստացում և ստորագրություն',
          isCompleted: false,
          isCurrent: false,
        },
      ],
      items: [
        {
          id: 10,
          code: '15260',
          title: 'LEDEME L2280 Լվացարանի Խառնիչ Քրոմ',
          image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
          quantity: 1,
          price: 28900,
        },
      ],
      totalAmount: 28900,
    },
};

/** Clean, user-facing "order not found" message (never a raw JSON parse error). */
export const ORDER_NOT_FOUND_MESSAGE = 'Պատվերը նշված համարով չի գտնվել: Ստուգեք համարը կամ զանգահարեք 095 53-04-35:';

/** Generic in-progress timeline for any valid TAB-XXXXX id not in the fixtures. */
export function buildDynamicFixture(orderId: string, phone: string): TrackedOrderDetails {
  return {
      orderId: orderId,
      createdAt: new Date().toISOString(),
      customerName: phone ? `Հաճախորդ (${phone})` : 'Հարգելի Հաճախորդ',
      phone: phone || '+374 (95) 00-00-00',
      deliveryMethod: 'showroom_pickup',
      deliveryAddress: 'ք. Երևան, Մելքումովի 40/1 (Խանութ-Սրահ)',
      paymentMethod: 'Idram / Կանխիկ',
      paymentStatus: 'pending',
      currentStatus: 'processing',
      timeline: [
        {
          id: 'step-1',
          title: 'Պատվերը Ստացված է',
          description: `Պատվեր ${orderId} հաջողությամբ ուղարկվել է մշակման`,
          timestamp: 'Հենց հիմա',
          isCompleted: true,
          isCurrent: false,
        },
        {
          id: 'step-2',
          title: 'Մշակվում է Մելքումովի 40/1 Սրահում',
          description: ' համակարգը ստուգում է պահեստային մնացորդները',
          timestamp: 'Ընթացքում',
          isCompleted: true,
          isCurrent: true,
        },
        {
          id: 'step-3',
          title: 'Պատրաստ է Ստացման / Առաքման',
          description: 'Սպասեք մենեջերի զանգին',
          isCompleted: false,
          isCurrent: false,
        },
        {
          id: 'step-4',
          title: 'Ավարտված',
          description: 'Հանձնված է',
          isCompleted: false,
          isCurrent: false,
        },
      ],
      items: [
        {
          id: 99,
          code: '99881',
          title: 'Պրեմիում Սանտեխնիկական Կոմպլեկտ (tab.am)',
          image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
          quantity: 1,
          price: 35000,
        },
      ],
      totalAmount: 35000,
    };
}
