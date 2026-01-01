import { useRoute, useLocation } from 'wouter';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { UserForm } from '@/components/forms/user-form';

export default function UserFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/admin/users/:id/edit');
  const [newMatch] = useRoute('/admin/users/new');
  const isEditMode = !!match;
  const userId = match ? params.id : undefined;

  return (
    <div className="space-y-6 p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/admin/users')}>
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit User' : 'Add New User'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Update user details and role assignment.' : 'Create a new user account for the system.'}
          </p>
        </div>
      </div>

      <div className="pb-10">
        <UserForm isEditMode={isEditMode} userId={userId} onComplete={() => setLocation('/admin/users')} />
      </div>
    </div>
  );
}
