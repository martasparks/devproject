import { auth } from "@lib/auth";
import prisma from "@lib/prisma";
import { redirect } from "next/navigation";
import { UserIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      image: true,
      accounts: {
        select: {
          provider: true,
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  const adminUsers = users.filter(user => user.role === 'ADMIN');
  const regularUsers = users.filter(user => user.role === 'CUSTOMER');
  const verifiedUsers = users.filter(user => user.emailVerified);

  // Helper function to get provider display name
  const getProviderDisplayName = (provider: string) => {
    const providerNames: { [key: string]: string } = {
      'google': 'Google',
      'github': 'GitHub',
      'facebook': 'Facebook',
      'twitter': 'Twitter',
      'discord': 'Discord',
      'credentials': 'E-pasts/Parole',
    };
    return providerNames[provider] || provider;
  };

  // Helper function to get provider badge styling
  const getProviderBadgeStyle = (provider: string) => {
    const styles: { [key: string]: string } = {
      'google': 'bg-green-100 text-gray',
      'github': 'bg-gray-100 text-gray-800',
      'facebook': 'bg-blue-100 text-blue-800',
      'twitter': 'bg-sky-100 text-sky-800',
      'discord': 'bg-indigo-100 text-indigo-800',
      'credentials': 'bg-green-100 text-green-800',
    };
    return styles[provider] || 'bg-gray-100 text-gray-800';
  };

  if (!users || users.length === 0) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center space-y-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <UserIcon className="w-8 h-8 text-gray-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Nav reģistrētu lietotāju</h2>
          <p className="text-gray-600 max-w-md">
            Lietotāji tiks parādīti šeit pēc reģistrēšanās jūsu aplikācijā.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lietotāji</h1>
          <p className="text-gray-600 mt-1">
            Pārvaldiet reģistrētos lietotājus un to lomus
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Kopā lietotāji</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Administratori</p>
              <p className="text-2xl font-bold text-gray-900">{adminUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Parasti lietotāji</p>
              <p className="text-2xl font-bold text-gray-900">{regularUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Apstiprināti</p>
              <p className="text-2xl font-bold text-gray-900">{verifiedUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Visi lietotāji</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lietotājs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-pasts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profila tips
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reģistrēts ar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const provider = user.accounts[0]?.provider || 'credentials';
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.image ? (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src={user.image} alt="" />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || "Nav norādīts"}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProviderBadgeStyle(provider)}`}>
                        {getProviderDisplayName(provider)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}