import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clientService } from '../../../services/clientService';
import { Input, Badge, Button } from '../../../shared/components';
import type { Client } from '../../../types';

export function ClientsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    clientService.list().then(setClients);
  }, []);

  const filtered = search.trim()
    ? clients.filter(
        (c) =>
          c.fullName.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          c.contactValue.includes(search)
      )
    : clients;

  const handleExport = async () => {
    const csv = await clientService.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-brand-dark">{t('admin.clients')}</h2>
        <Button size="sm" variant="outline" onClick={handleExport}>
          {t('admin.exportCsv')}
        </Button>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder={t('admin.searchClients')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-brand-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-brand-muted">{t('kiosk.fullName')}</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted">{t('kiosk.email')}</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted">{t('kiosk.contactValue')}</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted">Source</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted">Tags</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(c.id)}>
                  <td className="px-4 py-3 font-medium text-brand-dark">{c.fullName}</td>
                  <td className="px-4 py-3 text-brand-muted">{c.email}</td>
                  <td className="px-4 py-3 text-brand-muted">{c.contactMethod}: {c.contactValue}</td>
                  <td className="px-4 py-3 text-brand-muted">{c.marketingSource}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {c.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-muted">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-brand-muted">
                    {t('common.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
