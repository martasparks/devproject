import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DynamicIcon from "../../../[locale]/components/DynamicIcon";

export default async function IconsHelpPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Common Heroicons that might be useful for TopBar
  const commonIcons = [
    'HomeIcon', 'UserIcon', 'CogIcon', 'ChartBarIcon', 'DocumentTextIcon',
    'PaperAirplaneIcon', 'PhoneIcon', 'EnvelopeIcon', 'MapPinIcon',
    'InformationCircleIcon', 'QuestionMarkCircleIcon', 'ShoppingBagIcon',
    'HeartIcon', 'StarIcon', 'BellIcon', 'ChatBubbleLeftIcon',
    'NewspaperIcon', 'CalendarIcon', 'ClockIcon', 'CameraIcon',
    'PhotoIcon', 'PlayIcon', 'MusicalNoteIcon', 'VideoCameraIcon',
    'MicrophoneIcon', 'SpeakerWaveIcon', 'GlobeEuropeAfricaIcon',
    'LanguageIcon', 'TranslateIcon', 'AcademicCapIcon', 'BookOpenIcon',
    'BuildingOfficeIcon', 'BuildingStorefrontIcon', 'TruckIcon',
    'CreditCardIcon', 'BanknotesIcon', 'ShieldCheckIcon', 'LockClosedIcon'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pieejamās ikonas</h1>
        <Link 
          href="/admin/topbar-links"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Atpakaļ
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Kā izmantot ikonas</h2>
          <p className="text-gray-600 mb-4">
            Izvēlieties ikonu no saraksta un nokopējiet tās nosaukumu. 
            Iekopējiet to ikonas laukā, izveidojot vai labojot TopBar linku.
          </p>
        </div>

        <div className="mt-6 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Svarīgi:</h3>
          <p className="text-blue-800 text-sm">
            Šī ir tikai daļa no pieejamajām ikonām. Varat izmantot jebkuru ikonu no 
            <a 
              href="https://heroicons.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-600 ml-1"
            >
              heroicons.com
            </a> 
            {" "}(24x24 outline versiju). Nokopējiet ikonas nosaukumu un izmantojiet to mājas lapā.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commonIcons.map((iconName) => (
            <div 
              key={iconName}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <DynamicIcon iconName={iconName} className="w-5 h-5 text-gray-700" />
                <code className="text-sm font-mono text-gray-800 select-all">
                  {iconName}
                </code>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}