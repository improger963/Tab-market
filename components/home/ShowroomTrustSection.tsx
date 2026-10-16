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
    <section className="bg-ink text-white rounded-panel overflow-hidden border border-ink shadow-e2">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left Column: Information & Trust Points */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/20 text-accent border border-accent/30 text-xs font-bold tracking-wide">
              <Warehouse className="w-3.5 h-3.5 text-accent" />
              <span>Ֆիզիկական Շոուրում & Կենտրոնական Պահեստ</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Այցելեք <span className="text-accent">tab.am</span> Խանութ-Սրահ Մելքումովի 40/1 հասցեում
            </h2>

            <p className="text-on-dark text-sm sm:text-base leading-relaxed font-normal">
              Ավելի քան 500 քմ ցուցասրահ Երևանում, որտեղ ներկայացված են առաջատար եվրոպական և ռուսական
              բրենդների ծորակները, ջեռուցման կաթսաները, ինստալացիաները և սանկերամիկան:
            </p>

            {/* Features List */}
            <ul className="space-y-3.5 pt-2">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-on-dark">
                  <b>Իրական նմուշների մեծ տեսականի</b> տեղում փորձարկելու և ջրի հոսքն ու որակը ստուգելու համար։
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-on-dark">
                  <b>Մասնագիտական խորհրդատվություն</b> սանտեխնիկայի և ջեռուցման փորձառու ինժեներների կողմից։
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-on-dark">
                  <b>Անմիջապես պահեստից բացթողում</b> և արագ բեռնում Ձեր կամ մեր փոխադրամիջոցով։
                </span>
              </li>
            </ul>
          </div>

          {/* Contact and Maps Buttons */}
          <div className="pt-4 border-t border-ink flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <a
              href="https://maps.google.com/?q=Yerevan+Melkumovi+40/1"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-accent hover:bg-accent-hover active:scale-98 text-white font-bold text-xs transition-all shadow-e1 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-white" />
              <span>Բացել Google Maps-ում</span>
              <ExternalLink className="w-3.5 h-3.5 text-accent/80" />
            </a>

            <a
              href="tel:095530435"
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-ink hover:bg-ink text-white font-bold text-xs border border-body hover:border-body transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-accent" />
              <span>Զանգել Սրահ՝ 095 53-04-35</span>
            </a>
          </div>
        </div>

        {/* Right Column: Visual Showroom Snapshot & Address Card */}
        <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-ink overflow-hidden flex flex-col justify-end p-6 sm:p-8">
          <img
            src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
            alt="tab.am Showroom Melkumovi 40/1"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />

          {/* Floating Address Box */}
          <div className="relative z-10 bg-ink/95 backdrop-blur-sm p-5 rounded-panel border border-body/80 space-y-3 shadow-e2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-muted">
                  Հասցե
                </span>
                <div className="text-sm font-bold text-white">ք. Երևան, Մելքումովի 40/1</div>
                <div className="text-xs text-muted">Դավթաշեն / Աջափնյակ հանգույց</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2 border-t border-ink text-xs text-on-dark">
              <Clock className="w-4 h-4 text-muted shrink-0" />
              <span>
                Ամեն օր՝ <b>10:00 - 20:00</b> (առանց հանգստյան օրերի)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
