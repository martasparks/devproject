'use client';

import { useTranslations } from 'next-intl';

export default function Features() {
  const t = useTranslations('Features');
  
  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-4">🚚</div>
            <h4 className="text-xl font-semibold mb-2">
              {t('fastDeliveryTitle', { default: 'Ātra piegāde' })}
            </h4>
            <p className="text-gray-600">
              {t('fastDeliveryDescription', { default: 'Bezmaksas piegāde pasūtījumiem virs 50€' })}
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">🔒</div>
            <h4 className="text-xl font-semibold mb-2">
              {t('securePaymentTitle', { default: 'Drošs maksājums' })}
            </h4>
            <p className="text-gray-600">
              {t('securePaymentDescription', { default: 'SSL šifrēti maksājumi, pilna drošība' })}
            </p>
          </div>
          <div>
            <div className="text-4xl mb-4">↩️</div>
            <h4 className="text-xl font-semibold mb-2">
              {t('returnPolicyTitle', { default: '30 dienu atgriešana' })}
            </h4>
            <p className="text-gray-600">
              {t('returnPolicyDescription', { default: 'Viegli atgriezt vai apmainīt preces' })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}