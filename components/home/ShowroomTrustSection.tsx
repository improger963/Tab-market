import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Navigation,
  Warehouse,
  ExternalLink,
} from 'lucide-react';

export default function ShowroomTrustSection() {
  return (
    <section className="bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left Column: Information & Trust Points */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold tracking-wide">
              <Warehouse className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ֆիզիկական Շոուրում & Կենտրոնական Պահեստ</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Այցելեք <span className="text-cyan-400">tab.am</span> Խանութ-Սրահ Մելքումովի 40/1 հասցեում
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Ավելի քան 500 քմ ցուցասրահ Երևանում, որտեղ ներկայացված են առաջատար եվրոպական և ռուսական
              բրենդների ծորակները, ջեռուցման կաթսաները, ինստալացիաները և սանկերամիկան:
            </p>

            {/* Features List */}
            <ul className="space-y-3.5 pt-2">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-200">
                  <b>Իրական նմուշների մեծ տեսականի</b> տեղում փորձարկելու և ջրի հոսքն ու որակը ստուգելու համար։
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-200">
                  <b>Մասնագիտական խորհրդատվություն</b> սանտեխնիկայի և ջեռուցման փորձառու ինժեներների կողմից։
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-200">
                  <b>Անմիջապես պահեստից բացթողում</b> և արագ բեռնում Ձեր կամ մեր փոխադրամիջոցով։
                </span>
              </li>
            </ul>
          </div>

          {/* Contact and Maps Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <a
              href="https://maps.google.com/?q=Yerevan+Melkumovi+40/1"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-slate-950" />
              <span>Բացել Google Maps-ում</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950/70" />
            </a>

            <a
              href="tel:095530435"
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>Զանգել Սրահ՝ 095 53-04-35</span>
            </a>
          </div>
        </div>

        {/* Right Column: Visual Showroom Snapshot & Address Card */}
        <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-slate-900 overflow-hidden flex flex-col justify-end p-6 sm:p-8">
          <img
            src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
            alt="tab.am Showroom Melkumovi 40/1"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Floating Address Box */}
          <div className="relative z-10 bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl border border-slate-700/80 space-y-3 shadow-xl">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                  Հասցե
                </span>
                <div className="text-sm font-black text-white">ք. Երևան, Մելքումովի 40/1</div>
                <div className="text-xs text-slate-400">Դավթաշեն / Աջափնյակ հանգույց</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Ամեն օր՝ <b>09:00 - 19:00</b> (առանց հանգստյան օրերի)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
