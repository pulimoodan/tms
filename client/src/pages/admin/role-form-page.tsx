import { useRoute, useLocation } from 'wouter';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { RoleForm } from '@/components/forms/role-form';

export default function RoleFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/admin/roles/:id/edit');
  const [newMatch] = useRoute('/admin/roles/new');
  const isEditMode = !!match;
  const roleId = match ? params.id : undefined;

  return (
    <div className="space-y-6 p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/admin/roles')}>
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Role' : 'Create New Role'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Modify role details.' : 'Define a new user role.'}
          </p>
        </div>
      </div>

      <div className="pb-10">
        <RoleForm isEditMode={isEditMode} roleId={roleId} onComplete={() => setLocation('/admin/roles')} />
      </div>
    </div>
  );
}
