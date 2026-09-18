import React from 'react';
import AppLayout from '@/components/AppLayout';
import SupplyManagementClient from '@/app/supply-management/components/SupplyManagementClient';

export default function SupplyManagementPage() {
  return (
    <AppLayout>
      <SupplyManagementClient />
    </AppLayout>
  );
}